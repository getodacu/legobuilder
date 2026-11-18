<script lang="ts">
  import { onMount } from 'svelte';
  import { compileSimulation, createSimulationFrame, sampleSimulation } from '#lib/simulation/kinematics.ts';
  import type { CompiledAssembly, CompiledSimulation, Evidence, MotorCommand, MotorDefinition, SensorSignal, SimulationFrame, SimulationScenario } from '#lib/types/model.ts';

  let { assembly, disabled, guided, onFrame, onExit, onStatus }: {
    assembly: CompiledAssembly; disabled: boolean; guided: boolean;
    onFrame: (frame: SimulationFrame) => void; onExit: () => void; onStatus: (message: string) => void;
  } = $props();
  const model = $derived(assembly.model);
  const prompts: Record<string, string> = {
    'robotic-hand': 'Watch both jaws close around the block, then let it go.',
    'advanced-driving-base': 'Watch how it rolls and turns.',
    'quality-check': 'Watch the head react to a simulated color.',
    'package-sorter': 'Watch the motors turn. This demo does not pick up or sort packages.'
  };
  let scenarioId = $state('');
  let scenario = $state.raw<SimulationScenario | null>(null);
  let compiled = $state.raw<CompiledSimulation | null>(null);
  let frame = $state.raw<SimulationFrame | null>(null);
  let timeMs = $state(0);
  let revision = $state(0);
  let running = $state(false);
  let direction = $state(1);
  let speed = $state(1);
  let error = $state('');
  let notice = $state('');
  let collisionNotice = $state('');
  let technicalOpen = $state(false);
  let animation = 0;
  let lastTick = 0;
  let motorId = $state('');
  let commandMode = $state<'speed' | 'position'>('speed');
  let commandValue = $state(0);
  let durationMs = $state(2000);
  let sensorId = $state('');
  let colorValue = $state('white');
  let history = $state<string[]>([]);
  const controllableMotors = $derived(model.motors.filter((motor) => {
    const joint = jointFor(motor);
    return motor.assignmentEvidence.category !== 'unknown' && joint && joint.type !== 'fixed' && !joint.coupling && !model.linkageConstraints.some((loop) => loop.dependentJointIds.includes(joint.id));
  }));
  const selectedMotor = $derived(controllableMotors.find((motor) => motor.id === motorId));
  const selectedJoint = $derived(selectedMotor ? jointFor(selectedMotor) : undefined);
  const unit = $derived(selectedJoint?.type === 'prismatic' ? 'mm' : 'rad');
  const colorSensors = $derived([...new Map((scenario?.sensorSignals ?? []).filter((signal) => signal.type === 'color' && signal.basis === 'scripted-input').map((signal) => [signal.sensorPartInstanceId, signal])).values()]);
  const colors = $derived([...new Set(['white', 'black', 'red', 'green', 'blue', 'yellow', 'none', ...(scenario?.sensorSignals.filter((signal) => signal.type === 'color' && typeof signal.value === 'string').map((signal) => String(signal.value)) ?? [])])]);
  const readings = $derived.by(() => {
    revision;
    return compiled?.sensorPartIds.map((id, index) => ({ id, value: frame?.sensorValues[index] ?? null })) ?? [];
  });
  const motors = $derived.by(() => {
    revision;
    return model.motors.map((motor) => {
      const joint = jointFor(motor);
      const index = joint ? compiled?.jointIds.indexOf(joint.id) ?? -1 : -1;
      const command = compiled?.scenario.motorCommands.find((command) => command.motorId === motor.id && command.startMs <= timeMs && timeMs < command.startMs + command.durationMs);
      let value: number | null = null;
      if (command) {
        let u = (timeMs - command.startMs) / command.durationMs;
        if (command.easing === 'smoothstep') u = u * u * (3 - 2 * u);
        value = command.from + (command.to - command.from) * u;
      }
      return { motor, joint, angle: index >= 0 ? frame?.jointValues[index] : undefined, command, value };
    });
  });
  const drive = $derived(model.scenarios[0]?.differentialDrive);
  const defaultRadius = $derived(drive ? Math.ceil(Math.max(drive.trackWidthMm / 2 + drive.wheelRadiusMm, ...model.parts.filter((part) => part.inventoryScope === 'robot').map((part) => Math.hypot(part.finalTransform.position[0] - drive.axleCenterInRoot[0], part.finalTransform.position[2] - drive.axleCenterInRoot[2]) + drive.wheelRadiusMm))) : 150);
  let clearanceRadius = $state(150);
  const authored = (note: string): Evidence => ({ category: 'app-authored', confidence: 1, sources: [], note });
  const timestamp = (time: number) => `${(time / 1000).toFixed(2)} s`;
  function jointFor(motor: MotorDefinition) { return model.joints.find((joint) => joint.id === motor.jointId || joint.drivenByMotorId === motor.id); }
  export function pause() { running = false; cancelAnimationFrame(animation); }
  function pausePlayback() {
    pause();
    onStatus('Movement demo paused.');
  }
  const ended = $derived(!!compiled && timeMs === compiled.scenario.durationMs);
  function togglePlayback() {
    if (running) { pausePlayback(); return; }
    if (ended) seek(0);
    play();
  }
  function sample(time: number) {
    if (!compiled || !frame || !Number.isFinite(time)) return;
    try {
      sampleSimulation(compiled, time, frame);
      timeMs = frame.timeMs;
      revision++;
      onFrame(frame);
    } catch (cause) { pause(); error = cause instanceof Error ? cause.message : String(cause); }
  }
  function seek(time: number) { pause(); sample(time); }
  function tick(now: number) {
    if (!running || !compiled || disabled) { pause(); return; }
    const next = Math.min(compiled.scenario.durationMs, Math.max(0, timeMs + Math.max(0, now - lastTick) * speed * direction));
    lastTick = now;
    sample(next);
    if (running && next === (direction > 0 ? compiled.scenario.durationMs : 0)) {
      pause(); onStatus('Movement demo finished.');
    } else if (running) animation = requestAnimationFrame(tick);
  }
  function play(reverse = false) {
    if (disabled || !compiled || error) return;
    pause(); direction = reverse ? -1 : 1;
    if (reverse ? timeMs <= 0 : timeMs >= compiled.scenario.durationMs) return;
    running = true; lastTick = performance.now(); animation = requestAnimationFrame(tick);
  }
  export function keyboard(key: string): boolean {
    if (guided) { if (key !== ' ') return false; togglePlayback(); return true; }
    if (key === ' ') { if (running) pausePlayback(); else play(direction < 0); }
    else if (key === '[') seek(timeMs - 1000);
    else if (key === ']') seek(timeMs + 1000);
    else if (key === 'Home') seek(0);
    else if (key === 'End' && compiled) seek(compiled.scenario.durationMs);
    else return false;
    return true;
  }
  function guarded(input: SimulationScenario): CompiledSimulation {
    const original = compileSimulation(assembly, input);
    const drive = input.differentialDrive;
    const markers = (model.simulationObjects ?? []).map((object, index) => ({ object, index })).filter(({ object }) => object.geometryId === 'robobuild-course-marker');
    collisionNotice = '';
    if (!drive || !markers.length) return original;
    const probe = createSimulationFrame(original);
    const rootIndex = assembly.subassemblyIds.indexOf(drive.rootSubassemblyId) * 10;
    if (rootIndex < 0) throw new Error('Course root is absent from the completed assembly.');
    const wheelMotorIds = model.motors.filter((motor) => {
      const joint = jointFor(motor);
      return joint && [drive.leftJointId, drive.rightJointId].includes(joint.id);
    }).map((motor) => motor.id);
    let previousX = 0, previousZ = 0;
    // ponytail: 20 ms swept-disk course guard, not rigid-body physics; replace with physical collision shapes only when calibrated dynamics are required.
    for (let time = 0; ; time = Math.min(input.durationMs, time + 20)) {
      sampleSimulation(original, time, probe);
      const root = probe.assembly.subassemblyTransforms;
      const [ax, ay, az] = drive.axleCenterInRoot;
      const qx = root[rootIndex + 3], qy = root[rootIndex + 4], qz = root[rootIndex + 5], qw = root[rootIndex + 6];
      const tx = 2 * (qy * az - qz * ay), ty = 2 * (qz * ax - qx * az), tz = 2 * (qx * ay - qy * ax);
      const x = root[rootIndex] + ax + qw * tx + qy * tz - qz * ty;
      const z = root[rootIndex + 2] + az + qw * tz + qx * ty - qy * tx;
      if (time === 0) { previousX = x; previousZ = z; }
      for (const { object, index } of markers) {
        if (!probe.assembly.environmentVisible[index]) continue;
        const px = probe.assembly.environmentTransforms[index * 10], pz = probe.assembly.environmentTransforms[index * 10 + 2];
        const dx = x - previousX, dz = z - previousZ;
        const u = dx * dx + dz * dz ? Math.max(0, Math.min(1, ((px - previousX) * dx + (pz - previousZ) * dz) / (dx * dx + dz * dz))) : 0;
        if (Math.hypot(px - previousX - u * dx, pz - previousZ - u * dz) > clearanceRadius + 16) continue;
        let cutoff = Math.max(0, time - 20);
        let changed = true;
        while (changed) {
          changed = false;
          for (const command of input.motorCommands) if (wheelMotorIds.includes(command.motorId) && command.easing !== 'linear' && command.startMs < cutoff && command.startMs + command.durationMs > cutoff) { cutoff = command.startMs; changed = true; }
        }
        const commands = input.motorCommands.flatMap((command): MotorCommand[] => {
          if (!wheelMotorIds.includes(command.motorId) || command.startMs + command.durationMs <= cutoff) return [command];
          if (command.startMs >= cutoff) return [];
          const fraction = (cutoff - command.startMs) / command.durationMs;
          return [{ ...command, durationMs: cutoff - command.startMs, to: command.from + (command.to - command.from) * fraction, evidence: authored('Simplified geometric course stop truncates this linear wheel command before marker clearance is violated; no contact physics.') }];
        });
        collisionNotice = `Simplified collision stop, no physics: ${object.name} enters the modeled clearance disk near ${timestamp(time)}. Both wheel plans stop safely at ${timestamp(cutoff)}; independent tool commands continue. Nonlinear wheel ramps stop at their preceding command boundary.`;
        return compileSimulation(assembly, { ...input, motorCommands: commands });
      }
      previousX = x; previousZ = z;
      if (time === input.durationMs) break;
    }
    collisionNotice = 'Simplified collision stop, no physics: no marker crosses the modeled clearance disk on this plan.';
    return original;
  }
  function recompile(next: SimulationScenario, at = 0): boolean {
    pause();
    try {
      const result = guarded(next);
      const output = createSimulationFrame(result);
      scenario = next; compiled = result; frame = output; error = '';
      sample(at);
      return true;
    } catch (cause) { error = cause instanceof Error ? cause.message : String(cause); return false; }
  }
  function selectScenario(id: string) {
    const source = model.scenarios.find((candidate) => candidate.id === id);
    if (!source) return;
    if (recompile(structuredClone(source))) { scenarioId = id; history = []; notice = 'Original authored scenario loaded; manual edits cleared.'; sensorId = source.sensorSignals.find((signal) => signal.type === 'color' && signal.basis === 'scripted-input')?.sensorPartInstanceId ?? ''; }
  }
  function commandMotor(event: SubmitEvent) {
    event.preventDefault(); pause();
    if (!scenario || !selectedMotor || !selectedJoint || !Number.isFinite(commandValue) || !Number.isFinite(durationMs) || durationMs <= 0 || durationMs > scenario.durationMs) { error = 'Select an assigned motor and a finite value/duration within the scenario.'; return; }
    const command: MotorCommand = { motorId, startMs: 0, durationMs, mode: commandMode, from: commandMode === 'position' ? selectedJoint.zero : commandValue, to: commandValue, unit: commandMode === 'position' ? unit : unit === 'mm' ? 'mm/s' : 'rad/s', easing: 'linear', evidence: authored('Manual motor plan replaces this motor’s entire scheduled plan and resets the replay; other motor and sensor plans are preserved. Modeled values, not physical calibration.') };
    const next = { ...scenario, motorCommands: [...scenario.motorCommands.filter((command) => command.motorId !== motorId), command] };
    if (recompile(next)) {
      notice = `Paused and reset to zero. Replaced only ${selectedMotor.port ? `port ${selectedMotor.port}` : motorId}’s plan; other motor commands and sensor history preserved. No overlapping commands.`;
      history = [...history, `${motorId}: ${commandMode} ${commandValue} ${command.unit}, 0–${durationMs} ms (replaces target plan)`];
    }
  }
  function setColor(event: SubmitEvent) {
    event.preventDefault(); pause();
    if (!scenario) return;
    const sensor = colorSensors.find((sensor) => sensor.sensorPartInstanceId === sensorId);
    if (!sensor || !colors.includes(colorValue)) { error = 'Select a declared color input and color.'; return; }
    const signal: SensorSignal = { sensorPartInstanceId: sensorId, port: sensor.port, timeMs, type: 'color', value: colorValue, basis: 'scripted-input', evidence: authored('User-authored simulated color input at the replay timestamp, not a real optical sensor measurement.') };
    const next = { ...scenario, sensorSignals: [...scenario.sensorSignals.filter((old) => !(old.sensorPartInstanceId === sensorId && old.type === 'color' && old.timeMs === timeMs)), signal] };
    if (recompile(next, timeMs)) { notice = `Recorded ${colorValue} at ${timestamp(timeMs)}; seeking restores this typed input log.`; history = [...history, `${sensor.port ?? sensorId}: color ${colorValue} at ${timestamp(timeMs)}`]; }
  }
  onMount(() => { motorId = controllableMotors[0]?.id ?? ''; clearanceRadius = defaultRadius; selectScenario(model.scenarios[0]?.id ?? ''); return pause; });
</script>

<section class="timeline simulation-controls" aria-label="Post-assembly simulation">
  {#if guided}
    <h2 id="movement-demo-title" tabindex="-1">Movement demo</h2>
    <div class="guided-demo-actions">
      <button class="control-key control-key-primary" disabled={!running && (disabled || !compiled || !!error)} onclick={togglePlayback}>
        <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          {#if running}<path d="M9 6v12m6-12v12" />
          {:else if ended}<path d="M5 11a7 7 0 1 1 1.9 6.2M5 6v5h5" />
          {:else}<path d="m9 6 9 6-9 6Z" fill="currentColor" />{/if}
        </svg>
        {running ? 'Pause' : ended ? 'Play again' : 'Play'}
      </button>
      <button class="control-key" onclick={onExit}>Back to build</button>
    </div>
    <p class="demo-prompt">{prompts[model.id]} <span>This is a simulation. A real robot may move differently.</span></p>
    {#if error}<p role="alert">The movement demo couldn’t play. See the technical notes or go back to the build.</p>{/if}
    <details class="simulation-details" bind:open={technicalOpen}>
      <summary>More controls and technical notes</summary>
      {#if technicalOpen}
        {@render technicalTransport()}
        {@render evidenceAndEditors()}
      {/if}
    </details>
  {:else}
    <div class="simulation-heading"><h2 id="movement-demo-title" tabindex="-1">Movement demo</h2><button class="control-key" onclick={onExit}>Return to assembly end</button></div>
    {@render technicalTransport()}
    <details class="simulation-details"><summary>Motor controls & technical notes</summary>
      {@render evidenceAndEditors()}
    </details>
  {/if}
</section>

{#snippet technicalTransport()}
  <p class="simulation-limits">{scenario?.description} Physical fit and real-world performance are unverified. Sensor readings are simulated inputs.</p>
  {#if !guided && scenario?.differentialDrive && model.simulationObjects?.some((object) => object.geometryId === 'robobuild-course-marker')}<p class="small">Entry frames the robot, not the entire course. Some course markers may be outside the current view; use <strong>Fit whole</strong> to frame the full course, or <strong>Reset view</strong> for robot-focused inspection.</p>{/if}
  <div class="simulation-transport">
    <label>Scenario<select value={scenarioId} disabled={disabled} onchange={(event) => selectScenario(event.currentTarget.value)}>{#each model.scenarios as source}<option value={source.id}>{source.title}</option>{/each}</select></label>
    {#if !guided}<button class="control-key control-key-primary" disabled={disabled || !compiled || !!error || ended} onclick={() => play()}>Play demonstration</button><button class="control-key" disabled={!running} onclick={pausePlayback}>Pause</button>{/if}
    <button class="control-key" disabled={disabled || !compiled || !!error || timeMs <= 0} onclick={() => play(true)}>Reverse</button>
    <button class="control-key" disabled={disabled || !compiled} onclick={() => seek(0)}>Reset time</button>
    <button class="control-key" disabled={disabled} onclick={() => selectScenario(scenarioId)}>Restore scenario</button>
    <label>Speed<select bind:value={speed}><option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
  </div>
  {#if compiled}<label class="simulation-position" for="simulation-seek">Simulation position <output>{timestamp(timeMs)} / {timestamp(compiled.scenario.durationMs)} · {running ? direction > 0 ? 'playing forward' : 'playing backward' : 'paused'}</output></label><input id="simulation-seek" class="seek-range" type="range" min="0" max={compiled.scenario.durationMs} step="1" value={timeMs} disabled={disabled} aria-valuetext={`${timestamp(timeMs)}; manual seeking pauses playback`} oninput={(event) => seek(Number(event.currentTarget.value))} />{/if}
  {#if error}<p class="notice warning" role="alert">{error} The last accepted plan is retained; correct the input or restore the scenario.</p>{/if}
  {#if notice}<p class="small" role="status">{notice}</p>{/if}
  <div class="simulation-live-state" aria-label="Sampled motor angles and sensor readings">{#each motors as state}<span>{state.motor.port ? `Port ${state.motor.port}` : state.motor.id}: {state.angle !== undefined ? `${state.angle.toFixed(3)} ${state.joint?.type === 'prismatic' ? 'mm' : 'rad'}` : 'axis unassigned'}</span>{/each}{#each readings as reading}<span>Sensor {scenario?.sensorSignals.find((signal) => signal.sensorPartInstanceId === reading.id)?.port ?? reading.id}: {reading.value === null ? 'no signal' : String(reading.value)}</span>{/each}</div>
  {#if collisionNotice}<p class="small simulation-collision">{collisionNotice}</p>{/if}
{/snippet}

{#snippet evidenceAndEditors()}
    <div class="simulation-editors">
      <form onsubmit={commandMotor}><h3>Independent assigned motor</h3><label>Motor / physical output<select bind:value={motorId} disabled={disabled || !controllableMotors.length}>{#each controllableMotors as motor}<option value={motor.id}>{motor.port ? `Port ${motor.port} · ` : ''}{jointFor(motor)?.name ?? motor.id}</option>{/each}</select></label><label>Command<select bind:value={commandMode}><option value="speed">Speed</option><option value="position">Position</option></select></label><label>Target ({unit}{commandMode === 'speed' ? '/s' : ''})<input type="number" step="any" required bind:value={commandValue} min={commandMode === 'position' ? selectedJoint?.limits?.min : selectedJoint?.maxSpeed ? -selectedJoint.maxSpeed.value : undefined} max={commandMode === 'position' ? selectedJoint?.limits?.max : selectedJoint?.maxSpeed?.value} /></label><label>Duration (ms)<input type="number" min="1" max={scenario?.durationMs} step="1" required bind:value={durationMs} /></label><p class="small">{selectedJoint?.limits ? `${selectedJoint.limits.basis} position range: ${selectedJoint.limits.min} to ${selectedJoint.limits.max} ${unit}.` : 'Physical travel limits unknown; no certified position range asserted.'} {selectedJoint?.maxSpeed ? `${selectedJoint.maxSpeed.basis} max speed: ${selectedJoint.maxSpeed.value} ${unit}/s.` : 'Physical speed limit unknown.'} Applying pauses, replaces only this motor’s complete plan, and resets time to zero. Coupled/passive or unknown-axis motors are not independently commandable.</p><button disabled={disabled || !selectedMotor}>Replace motor plan & reset</button></form>
      <form onsubmit={setColor}><h3>Declared simulated color input</h3>{#if colorSensors.length}<label>Sensor<select bind:value={sensorId}>{#each colorSensors as signal}<option value={signal.sensorPartInstanceId}>{signal.port ? `Port ${signal.port} · ` : ''}{model.parts.find((part) => part.id === signal.sensorPartInstanceId)?.name ?? signal.sensorPartInstanceId}</option>{/each}</select></label><label>Color<select bind:value={colorValue}>{#each colors as color}<option value={color}>{color}</option>{/each}</select></label><p class="small">Records a typed scripted input at {timestamp(timeMs)}. Replaces an event at the same timestamp only; later planned inputs remain. No optical, distance, light or hardware readings are invented.</p><button disabled={disabled || !compiled}>Record color event</button>{:else}<p>No scripted color inputs declared for this scenario.</p>{/if}</form>
    </div>
    <h3>Sampled mechanism & sensor state</h3><div class="simulation-state">{#each motors as state}<p><strong>{state.motor.port ? `Port ${state.motor.port}` : state.motor.id}</strong> · {state.joint?.name ?? 'Unknown physical axis'}<br />{state.angle !== undefined ? `${state.angle.toFixed(4)} ${state.joint?.type === 'prismatic' ? 'mm' : 'rad'}` : 'Unassigned; no fabricated angle'} · {state.command && state.value !== null ? `${state.command.mode} command ${state.value.toFixed(3)} ${state.command.unit}` : 'No active command; holding position'}</p>{/each}{#each readings as reading}<p><strong>{scenario?.sensorSignals.find((signal) => signal.sensorPartInstanceId === reading.id)?.port ?? reading.id}</strong> · {reading.value === null ? 'No declared signal at this time' : String(reading.value)} <span class="small">(sampled simulated input)</span></p>{/each}</div>
    {#if scenario?.differentialDrive}<h3>Course clearance</h3><label>Modeled robot clearance radius (mm)<input type="number" min={defaultRadius} step="1" value={clearanceRadius} disabled={disabled} onchange={(event) => { const radius = Number(event.currentTarget.value); if (Number.isFinite(radius) && radius >= defaultRadius && scenario) { clearanceRadius = radius; recompile(scenario); } }} /></label><p class="small">Conservative authored disk around the sampled axle center, minimum {defaultRadius} mm; original marker base radius 16 mm. Increase for clearance calibration. This is not a measured robot collision hull. Linear wheel commands are truncated before contact; nonlinear ramps stop at a safe preceding command boundary. Tool and color plans continue.</p>{/if}
    <h3>Accepted manual edit history</h3>{#if history.length}<ol>{#each history as item}<li>{item}</li>{/each}</ol>{:else}<p class="small">No manual edits. Restore scenario clears edits; Reset time preserves them.</p>{/if}
    <h3>Typed sensor event log</h3><ul>{#each [...(scenario?.sensorSignals ?? [])].sort((a, b) => a.timeMs - b.timeMs) as signal}<li>{timestamp(signal.timeMs)} · {signal.port ?? signal.sensorPartInstanceId} · {signal.type}: {String(signal.value)} · {signal.basis}</li>{/each}</ul>
    <h3>Source and fit limitations</h3><ul>{#each scenario?.limitations ?? [] as limitation}<li>{limitation}</li>{/each}{#each model.coverage.outstandingDeviations as deviation}<li>{deviation}</li>{/each}</ul><p>{model.coverage.dimensions.placement.note}</p><ul class="source-list">{#each scenario?.sourceReferences ?? [] as source}<li><a href={source.sourceUrl} target="_blank" rel="noreferrer">{model.sourceDocuments.find((document) => document.id === source.documentId)?.title ?? source.documentId} · page {source.page ?? 'unknown'} ↗</a></li>{/each}</ul>
{/snippet}
