<script lang="ts">
  import type { RobotModel, SimulationFrame } from '#lib/types/model.ts';

  let { model, simulationFrame, revision, stepIndex, selectedPartId, onSelect, onStep }: {
    model: RobotModel; simulationFrame: SimulationFrame | null; revision: number;
    stepIndex: number; selectedPartId: string | null;
    onSelect: (id: string) => void; onStep: (id: string) => void;
  } = $props();
  let topic = $state('joints');
  const topics = [
    ['joints', 'Joint axes'], ['motors', 'Motor rotation'], ['gears', 'Gear motion'],
    ['transmission', 'Transmission direction'], ['grip', 'Gripping mechanism'],
    ['sensors', 'Sensor operation'], ['structure', 'Structural support'], ['dependencies', 'Assembly dependencies']
  ];
  const gears = $derived(model.parts.filter((part) => part.category === 'gear'));
  const sensors = $derived(model.parts.filter((part) => part.category === 'sensor'));
  const structuralPart = $derived(model.parts.find((part) => part.id === selectedPartId && part.category === 'structure') ?? model.parts.find((part) => part.category === 'structure'));
  const supports = $derived(model.connections.filter((connection) => connection.type !== 'electrical' && (connection.a.partInstanceId === structuralPart?.id || connection.b.partInstanceId === structuralPart?.id)));
  const stepOperations = $derived(model.operations.filter((operation) => operation.stepId === model.steps[stepIndex]?.id));
  const dependencies = $derived([...new Set(stepOperations.flatMap((operation) => operation.dependencies))].map((id) => model.operations.find((operation) => operation.id === id)!));
  const motorStates = $derived.by(() => {
    revision;
    if (topic !== 'motors') return [];
    const snapshot = simulationFrame;
    return model.motors.map((motor) => {
      const joint = model.joints.find((joint) => joint.id === motor.jointId || joint.drivenByMotorId === motor.id);
      const index = joint ? snapshot?.compiled.jointIds.indexOf(joint.id) ?? -1 : -1;
      const command = snapshot?.compiled.scenario.motorCommands.find((command) => command.motorId === motor.id && command.startMs <= snapshot.timeMs && snapshot.timeMs < command.startMs + command.durationMs);
      const delta = command ? command.mode === 'speed' ? command.to : command.to - command.from : 0;
      return { motor, joint, coordinate: index >= 0 ? snapshot!.jointValues[index] : null, direction: command ? delta > 0 ? 'positive local axis' : delta < 0 ? 'negative local axis' : 'holding' : 'no active command' };
    });
  });
  const sensorStates = $derived.by(() => {
    revision;
    if (topic !== 'sensors') return [];
    const snapshot = simulationFrame;
    return sensors.map((part) => {
      const index = snapshot?.compiled.sensorPartIds.indexOf(part.id) ?? -1;
      const signal = snapshot?.compiled.scenario.sensorSignals.filter((signal) => signal.sensorPartInstanceId === part.id && signal.timeMs <= snapshot.timeMs).at(-1);
      return { part, value: index >= 0 ? snapshot!.sensorValues[index] : null, signal };
    });
  });
  function jointPart(id: string): string | undefined {
    const joint = model.joints.find((joint) => joint.id === id);
    if (!joint) return undefined;
    if (joint.internalBinding) return joint.internalBinding.partInstanceId;
    if (joint.child.kind === 'part') return joint.child.id;
    return model.parts.find((part) => part.subassemblyId === joint.child.id)?.id;
  }
</script>

<section class="mechanism-guide" aria-label="How it works">
  <div class="mechanism-guide-heading"><h2>How it works</h2><label>Explain<select bind:value={topic}>{#each topics as [id, title]}<option value={id}>{title}</option>{/each}</select></label></div>
  <p class="small">Explore how the parts connect and move. Use View options to show joint axes and connections. These explanations do not verify physical fit.</p>
  {#if topic === 'joints'}
    <p class="small">Axes are in each joint's local parent frame; positive rotation follows the right-hand rule. Prismatic coordinates use millimeters, revolute coordinates radians.</p>
    <ul class="relationship-list">{#each model.joints as joint}
      {@const part = jointPart(joint.id)}
      <li><strong>{joint.name}</strong><span class="mono">{joint.type} · axis [{joint.axis.join(', ')}]</span>
        {#if joint.limits}<span>{joint.limits.min.toFixed(3)}…{joint.limits.max.toFixed(3)} {joint.type === 'prismatic' ? 'mm' : 'rad'} · {joint.limits.basis} limits</span>{/if}
        <p class="small">{joint.evidence.relationship.note}</p>
        {#if part}<button onclick={() => onSelect(part)}>Inspect joint geometry</button>{/if}
      </li>
    {/each}</ul>
    {#if !model.joints.length}<p>No joint axes are recorded for this assembly.</p>{/if}
  {:else if topic === 'motors'}
    <p class="small">A command rotates the installed motor output or its attached body according to its real hierarchy, not a replacement model. Direction below is local-axis sign, not an assumed camera-facing clockwise direction.</p>
    <ul class="relationship-list">{#each motorStates as { motor, joint, coordinate, direction }}
      <li><button onclick={() => onSelect(motor.partInstanceId)}>Inspect {motor.id}{motor.port ? ` · port ${motor.port}` : ''}</button>
        <span>{joint?.name ?? 'No assigned joint'} · {direction}</span>
        {#if coordinate !== null}<output aria-label={`${motor.id} guide coordinate`}>{coordinate.toFixed(3)} {joint?.type === 'prismatic' ? 'mm' : 'rad'}</output>{:else}<span>Enter a post-assembly demonstration for live coordinates.</span>{/if}
        <p class="small">{motor.assignmentEvidence.category}: {motor.assignmentEvidence.note}</p>
      </li>
    {/each}</ul>
    {#if !motorStates.length}<p>No motor assignments are recorded.</p>{/if}
  {:else if topic === 'gears'}
    <p class="small">Inspect the actual toothed component and its shaft. The presence of two gears alone does not establish a meshing contact or transmission ratio.</p>
    <ul class="relationship-list">{#each gears as gear}<li><button onclick={() => onSelect(gear.id)}>{gear.name}</button><span class="mono">{gear.id} · LDraw {gear.geometryId}</span><p class="small">{gear.placementEvidence.relationship.note}</p></li>{/each}</ul>
    {#if !gears.length}<p>No source gear components belong to this build; no decorative gear train is added.</p>{/if}
  {:else if topic === 'transmission'}
    <p class="small">A negative recorded ratio reverses coordinate direction; a positive ratio preserves it. Closed linkages instead solve their passive coordinates from geometry.</p>
    <ul class="relationship-list">{#each model.joints.filter((joint) => joint.coupling) as joint}<li><strong>{joint.name}</strong><span class="mono">q = {joint.coupling!.ratio} × {joint.coupling!.driverJointId} + {joint.coupling!.offset}</span><p class="small">{joint.coupling!.evidence.note}</p></li>{/each}
      {#each model.linkageConstraints as loop}<li><strong>{loop.id}</strong><span>{loop.driverJointId} → {loop.dependentJointIds.join(', ')}</span><p class="small">{loop.evidence.relationship.note}</p></li>{/each}</ul>
    {#if !model.joints.some((joint) => joint.coupling) && !model.linkageConstraints.length}<p>No transmission ratio or closed passive linkage is established in this manifest. Direct motor-output replay does not prove the missing mechanism.</p>{/if}
  {:else if topic === 'grip'}
    <p class="small">The constraints below use the installed components' anchor points. A closed kinematic loop is not a force, friction, payload or collision model.</p>
    <ul class="relationship-list">{#each model.linkageConstraints as loop}{@const part = jointPart(loop.driverJointId)}<li><strong>{loop.id}</strong><span>Driver {loop.driverJointId}; {loop.dependentJointIds.length} dependent coordinates</span><span>Fixed spans: {loop.links.map((link) => `${link.lengthMm.toFixed(2)} mm`).join(' · ')}</span><p class="small">{loop.evidence.relationship.note}</p>{#if part}<button onclick={() => onSelect(part)}>Inspect linkage driver</button>{/if}</li>{/each}</ul>
    {#if !model.linkageConstraints.length}<p>No closed gripping linkage has been established for this build. A disabled pickup is not presented as a completed grasp.</p>{/if}
  {:else if topic === 'sensors'}
    <ul class="relationship-list">{#each sensorStates as { part, value, signal }}<li><button onclick={() => onSelect(part.id)}>{part.name}</button><span class="mono">{part.id}</span>
      {#if signal}<span>Port {signal.port ?? 'not asserted'} · {signal.type} · {signal.basis}</span><output aria-label={`${part.id} guide reading`}>{String(value ?? 'no reading')}</output><p class="small">{signal.evidence.note}</p>{:else}<p class="small">No active signal yet. Source geometry does not alone calibrate a sensor reading. Demonstration inputs are identified by their own evidence.</p>{/if}
    </li>{/each}</ul>
    {#if !sensors.length}<p>No source sensor belongs to this build.</p>{/if}
  {:else if topic === 'structure'}
    {#if structuralPart}<button onclick={() => onSelect(structuralPart.id)}>Inspect support: {structuralPart.name}</button><p class="small">Select another structural component to inspect its recorded load-path topology. These connections do not certify strength or clearance.</p>
      <ul class="relationship-list">{#each supports as connection}{@const other = connection.a.partInstanceId === structuralPart.id ? connection.b.partInstanceId : connection.a.partInstanceId}<li><button onclick={() => onSelect(other)}>{connection.type} → {other}</button><span>Fit {connection.evidence.fit} · {connection.evidence.relationship.category}</span><p class="small">{connection.evidence.relationship.note}</p></li>{/each}</ul>
      {#if !supports.length}<p>No mechanical support connection has been established for this component.</p>{/if}
    {:else}<p>No structural component is recorded.</p>{/if}
  {:else if topic === 'dependencies'}
    <p class="small">{model.steps[stepIndex]?.title ?? 'Select a source step'}. These are the current operations' declared prerequisite edges. The source timeline also enforces manual order; an empty edge list does not mean physical independence.</p>
    <ul class="relationship-list">{#each dependencies as operation}<li><button onclick={() => onStep(operation.stepId)}>Review {model.steps.find((step) => step.id === operation.stepId)?.title ?? operation.stepId}</button><span class="mono">{operation.id}</span><p class="small">{operation.evidence.relationship.note}</p></li>{/each}</ul>
    {#if !dependencies.length}<p>No explicit prerequisite operation is declared at this step.</p>{/if}
  {/if}
</section>

<style>
  .mechanism-guide{padding:14px 0;border-top:1px solid var(--rule);max-height:38dvh;overflow:auto;overscroll-behavior:contain}
  .mechanism-guide-heading{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.mechanism-guide h2{font-size:16px;margin:0 auto 0 0}.mechanism-guide label{display:flex;align-items:center;gap:8px;font-size:12px}.mechanism-guide select{max-width:100%;min-width:0}.mechanism-guide p,.mechanism-guide li{overflow-wrap:anywhere}.mechanism-guide button{font-size:12px}.mechanism-guide output{font:12px/1.6 ui-monospace,monospace}.mechanism-guide .relationship-list{margin-bottom:0}
  @media(max-width:767px){.mechanism-guide{max-height:none}.mechanism-guide-heading{align-items:flex-start}.mechanism-guide label{max-width:100%;flex-wrap:wrap}}
</style>
