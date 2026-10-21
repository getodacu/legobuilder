<script lang="ts">
  import { onMount, tick } from 'svelte';
  import RobotScene from '#lib/components/RobotScene.svelte';
  import Timeline from '#lib/components/Timeline.svelte';
  import SimulationControls from '#lib/components/SimulationControls.svelte';
  import MechanismGuide from '#lib/components/MechanismGuide.svelte';
  import { groupParts } from './part-groups.ts';
  import { compileAssembly, createFrame, sampleAssembly, getStepTime } from '#lib/assembly/engine.ts';
  import type { AssemblyFrame, CatalogEntry, CompiledAssembly, RendererController, RobotModel, SimulationFrame, SourceReference, ViewOptions, PartInstance } from '#lib/types/model.ts';

  let { entry, initialTimeMs = 0, onBack }: { entry: Extract<CatalogEntry, { status: 'available' }>; initialTimeMs?: number; onBack: (progress?: { timeMs: number; installed: number; total: number; steps: number; complete: boolean }) => void } = $props();
  let model = $state.raw<RobotModel | null>(null);
  let compiled = $state.raw<CompiledAssembly | null>(null);
  let frame = $state.raw<AssemblyFrame | null>(null);
  let controller: RendererController | null = null;
  let simulationActive = $state(false);
  let simulationFrame = $state.raw<SimulationFrame | null>(null);
  let simulationControls: { pause: () => void; keyboard: (key: string) => boolean } | undefined = $state();
  let assemblyAutoCamera = true;
  let assemblyPanels = { left: false, right: false };
  let partIndex = new Map<string, number>();
  let revision = $state(0);
  let timeMs = $state(0);
  let stepIndex = $state(-1);
  let running = $state(false);
  let resumable = $state(false);
  let scope = $state<'step' | 'all' | 'reverse'>('step');
  let endpoint = 0;
  let speed = $state(1);
  let animation = 0;
  let lastTick = 0;
  let reducedMotion = $state(false);
  let ready = $state(false);
  let loading = $state(true);
  let loadError = $state('');
  let sceneError = $state('');
  let sceneAttempt = $state(0);
  let selectedPartId = $state<string | null>(null);
  let autoCamera = $state(true);
  let view = $state<ViewOptions>({ mode: 'studio', explodedFactor: 0, labels: false, showJoints: false, showConnections: false, isolatedPartIds: [] });
  let showEducation = $state(false);
  let wide = $state(false);
  let leftOpen = $state(true);
  let rightOpen = $state(false);
  let rightTab = $state<'inventory' | 'inspection'>('inventory');
  let search = $state('');
  let inventoryScope = $state('all');
  let sourceDocumentId = $state('');
  let sourcePage = $state(1);
  let announcement = $state('');
  let instructionsTrigger: HTMLButtonElement;
  let inventoryTrigger: HTMLButtonElement;
  let sceneColumn: HTMLElement;
  let instructionsHeading: HTMLHeadingElement;
  let instructionsPanel: HTMLElement;
  let inventoryHeading: HTMLHeadingElement;
  let helpDialog: HTMLDialogElement;
  let helpReturnFocus: HTMLElement | null = null;
  let referenceDialog: HTMLDialogElement;
  let referenceReturnFocus: HTMLElement | null = null;
  let fetchController: AbortController | null = null;
  let disposed = false;
  let stats = $state({ robotInstalled: 0, robotTotal: 0, sampleInstalled: 0, sampleTotal: 0, fastenersInstalled: 0, fastenersTotal: 0, stepsComplete: 0, stepsTotal: 0 });

  const currentStep = $derived(model?.steps[stepIndex] ?? null);
  const selectedPart = $derived(model?.parts.find((part) => part.id === selectedPartId) ?? null);
  const selectedModule = $derived(model?.subassemblies.find((module) => module.id === selectedPart?.subassemblyId) ?? null);
  const currentModule = $derived(model?.subassemblies.find((module) => currentStep?.requiredPartInstanceIds.some((id) => module.partInstanceIds.includes(id))) ?? null);
  const allPartGroups = $derived(groupParts(model?.parts ?? [], model?.geometryAssets ?? []));
  const filteredParts = $derived(allPartGroups.flatMap((group) => group.parts.filter((part) => (inventoryScope === 'all' || part.inventoryScope === inventoryScope) && `${group.name} ${part.name} ${part.id} ${part.geometryId} ${part.partNumber ?? ''} ${part.category} ${model?.materials.find((material) => material.id === part.materialId)?.name ?? ''}`.toLowerCase().includes(search.toLowerCase()))));
  const requiredParts = $derived(model?.parts.filter((part) => currentStep?.requiredPartInstanceIds.includes(part.id)) ?? []);
  const requiredGroups = $derived(groupParts(requiredParts, model?.geometryAssets ?? []));
  const inventoryGroups = $derived(groupParts(filteredParts, model?.geometryAssets ?? []));
  const selectedConnections = $derived(model?.connections.filter((connection) => connection.a.partInstanceId === selectedPartId || connection.b.partInstanceId === selectedPartId) ?? []);
  const manualDocuments = $derived(model?.sourceDocuments.filter((document) => document.pageCount !== undefined) ?? []);
  const sourceDocument = $derived(manualDocuments.find((document) => document.id === sourceDocumentId));
  const pageMappings = $derived.by(() => {
    const mappings = model?.sourceMappings.filter((mapping) => mapping.source.documentId === sourceDocumentId && mapping.source.page === sourcePage) ?? [];
    return [...new Map(mappings.map((mapping) => {
      const step = mapping.stepId ?? model?.operations.find((operation) => operation.id === mapping.operationId)?.stepId;
      return [`${step}:${mapping.source.figure ?? mapping.source.instructionId ?? ''}`, mapping] as const;
    })).values()];
  });
  const blocked = $derived(!ready || !!loadError || !!sceneError);
  const coverage = $derived(model?.coverage ?? entry.coverage);
  const sourceComplete = $derived(!!model && coverage.implementedSteps === coverage.documentedSteps && model.steps.filter((step) => step.kind === 'numbered-instruction').length === coverage.documentedSteps);
  const assemblyComplete = $derived(!!compiled && timeMs === compiled.durationMs && stats.robotInstalled === stats.robotTotal && stats.sampleInstalled === stats.sampleTotal && stats.stepsComplete === stats.stepsTotal);
  const simulationAvailable = $derived(sourceComplete && assemblyComplete && !!model?.scenarios.length);
  const simulationLock = $derived(!model ? 'Loading your guide…' : !sourceComplete ? 'This guide is incomplete; a full demonstration is unavailable.' : !model.scenarios.length ? 'No demonstration is available for this robot.' : !assemblyComplete ? 'Available after the last building step.' : 'A simulated preview of movement; physical fit and performance remain unverified.');
  const activeOperation = $derived.by(() => {
    if (!compiled || !model || !currentStep) return null;
    const localTime = timeMs - compiled.stepTimes[stepIndex].startMs;
    return model.operations.find((operation) => operation.stepId === currentStep.id && localTime >= operation.startMs && localTime < operation.startMs + operation.durationMs) ?? null;
  });

  const moduleInstalled = $derived.by(() => {
    revision;
    if (!frame || !currentModule) return 0;
    let installed = 0;
    for (const id of currentModule.partInstanceIds) {
      const index = partIndex.get(id);
      if (index !== undefined && frame.installed[index]) installed++;
    }
    return installed;
  });
  async function enterSimulation() {
    if (!simulationAvailable || blocked) return;
    pause(true);
    assemblyAutoCamera = autoCamera;
    assemblyPanels = { left: leftOpen, right: rightOpen };
    autoCamera = false; controller?.setAutoCamera(false);
    view = { ...view, explodedFactor: 0, isolatedPartIds: [] };
    simulationFrame = null; simulationActive = true; revision++;
    leftOpen = false; rightOpen = false;
    await tick();
    if (!simulationActive || disposed) return;
    sceneColumn.scrollTop = 0;
    sceneColumn.scrollIntoView({ block: 'start', behavior: 'auto' });
    controller?.resetCamera();
    announcement = 'Post-assembly demonstration. Robot-focused camera; Fit whole frames visible model and props. The scenario distinguishes documented motions from RoboBuild extensions. Unverified placement remains unverified.';
  }
  function exitSimulation() {
    simulationControls?.pause();
    simulationActive = false; simulationFrame = null;
    if (compiled) sample(compiled.durationMs);
    leftOpen = assemblyPanels.left; rightOpen = assemblyPanels.right;
    autoCamera = assemblyAutoCamera; controller?.setAutoCamera(autoCamera);
    announcement = 'Returned to the paused assembly end. All installed units retained.';
  }
  function showSimulationFrame(output: SimulationFrame) { simulationFrame = output; revision++; }
  function pause(clear = false) {
    running = false;
    cancelAnimationFrame(animation);
    if (clear) resumable = false;
  }
  function sample(time: number) {
    if (!compiled || !frame || !Number.isFinite(time)) return;
    const previousStep = stepIndex;
    timeMs = Math.min(compiled.durationMs, Math.max(0, time));
    sampleAssembly(compiled, timeMs, frame);
    stepIndex = frame.stepIndex;
    stats.robotInstalled = frame.counts.robotInstalled;
    stats.robotTotal = frame.counts.robotTotal;
    stats.sampleInstalled = frame.counts.sampleInstalled;
    stats.sampleTotal = frame.counts.sampleTotal;
    stats.fastenersInstalled = frame.counts.fastenersInstalled;
    stats.fastenersTotal = frame.counts.fastenersTotal;
    stats.stepsComplete = frame.counts.stepsComplete;
    stats.stepsTotal = frame.counts.stepsTotal;
    revision++;
    if (previousStep !== stepIndex) {
      if (instructionsPanel) instructionsPanel.scrollTop = 0;
      const step = model?.steps[stepIndex];
      const source = step?.sourceReferences[0];
      if (source?.page !== undefined && manualDocuments.some((document) => document.id === source.documentId)) { sourceDocumentId = source.documentId; sourcePage = source.page; }
      announcement = step ? `${step.title}. ${step.action === 'view' ? 'Turn the model to check this view; no parts are added.' : step.description}` : 'Staged inventory';
    }
  }
  function seek(time: number) { if (simulationActive) exitSimulation(); pause(true); sample(time); }
  function clock(now: number) {
    if (!running) return;
    const delta = Math.max(0, now - lastTick) * speed;
    lastTick = now;
    const next = scope === 'reverse' ? Math.max(endpoint, timeMs - delta) : Math.min(endpoint, timeMs + delta);
    sample(next);
    if (next === endpoint) { running = false; resumable = false; return; }
    animation = requestAnimationFrame(clock);
  }
  function begin(mode: 'step' | 'all' | 'reverse') {
    if (!compiled || blocked || simulationActive) return;
    pause(true);
    scope = mode;
    if (mode === 'reverse') endpoint = 0;
    else if (mode === 'all') endpoint = compiled.durationMs;
    else endpoint = compiled.stepTimes.find((step) => step.endMs > timeMs)?.endMs ?? compiled.durationMs;
    if (endpoint === timeMs) return;
    if (reducedMotion) { sample(endpoint); return; }
    resumable = true;
    running = true;
    lastTick = performance.now();
    animation = requestAnimationFrame(clock);
  }
  function resume() {
    if (!resumable || blocked || simulationActive || timeMs === endpoint) return;
    running = true;
    lastTick = performance.now();
    cancelAnimationFrame(animation);
    animation = requestAnimationFrame(clock);
  }
  function previous() {
    if (!compiled) return;
    let target = 0;
    for (const step of compiled.stepTimes) if (step.startMs < timeMs) target = step.startMs;
    seek(target);
  }
  function next() { if (compiled) seek(compiled.stepTimes.find((step) => step.endMs > timeMs)?.endMs ?? compiled.durationMs); }
  function selectStep(stepId: string) {
    if (!compiled || blocked) return;
    seek(getStepTime(compiled, stepId).startMs);
    const step = model?.steps.find((candidate) => candidate.id === stepId);
    selectPart(step?.requiredPartInstanceIds[0] ?? null, false);
  }
  function partColor(part: PartInstance) { return model?.materials.find((material) => material.id === part.materialId); }
  function placedIn(parts: PartInstance[]) {
    revision;
    return parts.filter((part) => { const index = partIndex.get(part.id); return index !== undefined && !!frame?.installed[index]; }).length;
  }
  function partState(id: string) {
    revision;
    const index = partIndex.get(id);
    return frame && index !== undefined ? frame.active[index] ? (frame.installed[index] ? 'Placed · active' : 'Moving into place') : frame.installed[index] ? 'Placed' : 'In the parts tray' : 'Unknown';
  }
  function selectPart(id: string | null, reveal = true) {
    selectedPartId = id;
    if (id && reveal) {
      rightTab = 'inspection'; rightOpen = true;
      void tick().then(() => { if (rightOpen) inventoryHeading?.focus(); });
    }
    const part = model?.parts.find((candidate) => candidate.id === id);
    announcement = part ? `${part.name}. ${partState(part.id)}.` : 'Selection cleared.';
  }
  function changeMode(mode: ViewOptions['mode']) { view = { ...view, mode }; }
  function explode() { view = { ...view, explodedFactor: view.explodedFactor ? 0 : 1 }; }
  function toggleOverlay(key: 'labels' | 'showJoints' | 'showConnections') { view = { ...view, [key]: !view[key] }; }
  function isolate() { if (selectedPartId) view = { ...view, mode: 'inspection', isolatedPartIds: [selectedPartId] }; }
  function resumeCamera() { if (simulationActive) return; autoCamera = true; controller?.setAutoCamera(true); }
  async function openPanel(panel: 'instructions' | 'inventory') {
    if (panel === 'instructions') { leftOpen = !leftOpen; if (!wide) rightOpen = false; }
    else { rightOpen = !rightOpen; }
    await tick();
    if (panel === 'instructions' && leftOpen) instructionsHeading?.focus();
    else if (panel === 'inventory' && rightOpen) inventoryHeading?.focus();
  }
  function closePanel(panel: 'instructions' | 'inventory') {
    if (panel === 'instructions') { leftOpen = false; instructionsTrigger?.focus(); }
    else { rightOpen = false; inventoryTrigger?.focus(); }
  }
  function openHelp() { helpReturnFocus = document.activeElement as HTMLElement; helpDialog.showModal(); }
  function openReference() { referenceReturnFocus = document.activeElement as HTMLElement; referenceDialog.showModal(); }
  function keyboard(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || helpDialog?.open || referenceDialog?.open) return;
    const target = event.target as HTMLElement;
    if (event.key === 'Tab' && rightOpen && !wide) {
      const controls = [...document.querySelectorAll<HTMLElement>('#inventory-panel button, #inventory-panel input, #inventory-panel select, #inventory-panel summary, #inventory-panel a')].filter((element) => !element.hasAttribute('disabled') && element.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (first && last && (!controls.includes(target) || target === (event.shiftKey ? first : last))) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      }
      return;
    }
    if (target.isContentEditable || target.closest('input, textarea, select, [contenteditable], [role="slider"], dialog, canvas')) return;
    if (event.key === ' ' && target.closest('button, a, summary')) return;
    if (event.key === 'Escape') {
      const popup = document.querySelector<HTMLDetailsElement>('.view-options[open], .playback-options[open], .step-picker[open]');
      if (popup && !rightOpen) { popup.open = false; popup.querySelector<HTMLElement>('summary')?.focus(); event.preventDefault(); return; }
      if (rightOpen) closePanel('inventory'); else if (leftOpen) closePanel('instructions'); else if (view.isolatedPartIds.length) view = { ...view, isolatedPartIds: [] }; else if (simulationActive) exitSimulation(); else return;
      event.preventDefault(); return;
    }
    if (event.key === '?') { event.preventDefault(); openHelp(); return; }
    if (blocked) return;
    if (simulationActive && simulationControls?.keyboard(event.key)) { event.preventDefault(); return; }
    const key = event.key.toLowerCase();
    if (key === '[') previous(); else if (key === ']') next();
    else if (key === ' ') { if (running) pause(); else if (resumable) resume(); else begin('step'); }
    else if (key === 'r') controller?.resetCamera(); else if (key === 'f') controller?.fit('all');
    else if (key === 'x') explode(); else if (key === 'l') toggleOverlay('labels');
    else if (key === 't') changeMode(view.mode === 'technical' ? 'studio' : 'technical');
    else if (key === 'i') { changeMode('inspection'); rightTab = 'inspection'; rightOpen = true; }
    else return;
    event.preventDefault();
  }
  const sourceHref = (source: SourceReference) => source.page !== undefined && manualDocuments.some((document) => document.id === source.documentId) ? `${source.sourceUrl.split('#')[0]}#page=${source.page}` : source.sourceUrl;
  function reportSceneError(error: Error) { pause(true); simulationControls?.pause(); ready = false; sceneError = error.message; }
  async function load() {
    pause(true);
    simulationControls?.pause(); simulationActive = false; simulationFrame = null;
    fetchController?.abort();
    const request = new AbortController();
    fetchController = request;
    loading = true; ready = false; loadError = ''; sceneError = '';
    try {
      const response = await fetch(entry.modelUrl, { signal: request.signal });
      if (!response.ok) throw new Error(`Manifest ${entry.modelUrl}: HTTP ${response.status}`);
      const candidate = await response.json() as RobotModel;
      if (!candidate || candidate.id !== entry.identity.id || candidate.schemaVersion !== 1) throw new Error('Manifest identity or schema version does not match this build.');
      const assembly = compileAssembly(candidate);
      const output = createFrame(assembly);
      if (disposed || request.signal.aborted) return;
      partIndex = new Map(assembly.partIds.map((id, index) => [id, index]));
      model = candidate; compiled = assembly; frame = output;
      stepIndex = -1;
      sample(initialTimeMs);
      if (!candidate.sourceDocuments.some((document) => document.id === sourceDocumentId && document.pageCount !== undefined)) sourceDocumentId = candidate.sourceDocuments.find((document) => document.pageCount !== undefined)?.id ?? '';
    } catch (error) {
      if (!request.signal.aborted && !disposed) loadError = error instanceof Error ? error.message : String(error);
    } finally { if (!request.signal.aborted && !disposed) loading = false; }
  }
  onMount(() => {
    const layout = matchMedia('(min-width: 1200px)');
    const layoutChanged = () => { wide = layout.matches; leftOpen = true; rightOpen = false; };
    layoutChanged();
    layout.addEventListener('change', layoutChanged);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = media.matches;
    const motionChanged = () => { reducedMotion = media.matches; if (media.matches) { pause(true); simulationControls?.pause(); autoCamera = false; controller?.setAutoCamera(false); } };
    media.addEventListener('change', motionChanged);
    void load();
    return () => { disposed = true; fetchController?.abort(); cancelAnimationFrame(animation); media.removeEventListener('change', motionChanged); layout.removeEventListener('change', layoutChanged); };
  });
</script>

<svelte:window onkeydown={keyboard} />
<div class="workspace-shell" class:simulation-active={simulationActive}>
  <header class="workspace-header">
    <button class="wordmark wordmark-button" onclick={() => { pause(true); simulationControls?.pause(); onBack(compiled && model ? { timeMs, installed: stats.robotInstalled, total: stats.robotTotal, steps: model.steps.filter((step, index) => step.kind === 'numbered-instruction' && compiled!.stepTimes[index].endMs <= timeMs).length, complete: assemblyComplete } : undefined); }} aria-label="Back to build catalog"><span aria-hidden="true">←</span><span class="brand-name">RoboBuild</span></button>
    <div class="workspace-identity"><span class="eyebrow">Building guide</span><h1>{entry.identity.name}</h1></div>
    <div class="workspace-actions">
      <button bind:this={instructionsTrigger} aria-expanded={leftOpen} aria-controls="instructions-panel" onclick={() => openPanel('instructions')}>Instructions</button>
      <button bind:this={inventoryTrigger} aria-expanded={rightOpen} aria-controls="inventory-panel" onclick={() => openPanel('inventory')}>Parts</button>
      <button class="reference-trigger" onclick={openReference} aria-haspopup="dialog">Reference & credits</button>
      <button class="help-trigger" onclick={openHelp} aria-label="Keyboard help" aria-haspopup="dialog">?</button>
    </div>
  </header>
  <main id="main" tabindex="-1" class="workspace-main" class:left-open={leftOpen} class:right-open={rightOpen}>
    {#if rightOpen}<button class="drawer-backdrop" aria-label="Close parts panel" onclick={() => closePanel('inventory')}></button>{/if}
    <aside bind:this={instructionsPanel} id="instructions-panel" class="work-panel instructions-panel" class:panel-open={leftOpen} aria-label="Build instructions">
      <div class="panel-heading"><h2 bind:this={instructionsHeading} tabindex="-1">Instructions</h2><button onclick={() => closePanel('instructions')} aria-label="Collapse instructions">×</button></div>
      {#if model && compiled && currentStep}
        <div class="panel-content">
          <div class="step-heading"><span class="eyebrow">Step {stepIndex + 1} of {model.steps.length}</span><details class="step-picker"><summary>Jump to step</summary><label class="stacked-label">Building step<select value={currentStep.id} disabled={blocked} onchange={(event) => selectStep(event.currentTarget.value)}>{#each model.steps as step, index}<option value={step.id}>{index + 1}. {step.title}</option>{/each}</select></label></details></div>
          <h3 class="instruction-title">{currentStep.title}</h3><p class="instruction-description">{currentStep.description}</p>
          {#if currentStep.action === 'view'}<p class="step-hint">Rotate the model to check this view. No parts are added.</p>{/if}
          <section class="step-parts" aria-label="Parts for this step">
            <h3>{requiredParts.length ? 'Gather these parts' : currentStep.action === 'wiring' ? 'Use the existing cables' : 'Use your assembled parts'}</h3>
            {#if requiredParts.length}
              <ul class="required-list">{#each requiredGroups as group (group.key)}{@const part = group.parts[0]}{@const color = partColor(part)}<li><button onclick={() => selectPart(part.id)} aria-label={`Inspect ${group.parts.length} ${color?.name ?? ''} ${group.name}`}><span class="part-swatch" style:background={color?.color} aria-hidden="true"></span><span><strong>{group.name}</strong><span class="small">{color?.name}</span></span><span class="part-quantity">×{group.parts.length}</span></button></li>{/each}</ul>
            {:else}<p class="small">No additional hardware in this instruction.</p>{/if}
          </section>
          {#if currentStep.warnings.length}<div id="step-warnings" class="step-warnings" tabindex="-1">{#each currentStep.warnings as warning}<div class="notice warning"><strong>Before you continue</strong><p>{warning}</p></div>{/each}</div>{/if}
          <div class="step-reference">{#each currentStep.sourceReferences as source}<a href={sourceHref(source)} target="_blank" rel="noreferrer">Official instructions{source.page !== undefined ? ` · page ${source.page}` : ''} ↗</a>{/each}</div>
          <p class="guide-caution small">Some 3D fits are unverified. Check connections against the official instructions and never force parts together.</p>
        </div>
      {:else}<p class="panel-content">{loadError ? 'Instructions could not load. Use Retry to try again.' : 'Loading building instructions…'}</p>{/if}
    </aside>
    <section bind:this={sceneColumn} class="scene-column" class:demo-ready={simulationAvailable && !simulationActive} aria-label="3D assembly workbench">
      <div class="scene-toolbar">
        <span class="eyebrow">{simulationActive ? 'Movement preview' : 'Your build in 3D'}</span>
        <details class="view-options">
          <summary>View options</summary>
          <div class="view-options-content">
            <div class="mode-buttons" role="group" aria-label="View mode"><button aria-pressed={view.mode === 'studio'} onclick={() => changeMode('studio')}>Studio</button><button aria-pressed={view.mode === 'technical'} onclick={() => changeMode('technical')}>Technical</button><button aria-pressed={view.explodedFactor > 0} onclick={explode}>Explode</button><button aria-pressed={view.mode === 'inspection'} onclick={() => { changeMode('inspection'); rightTab = 'inspection'; rightOpen = true; }}>Inspection</button></div>
            <div class="overlay-toolbar"><label><input type="checkbox" checked={view.labels} onchange={() => toggleOverlay('labels')} /> Part labels</label><label><input type="checkbox" checked={view.showJoints} disabled={!model?.joints.length} onchange={() => toggleOverlay('showJoints')} /> Joint axes</label><label><input type="checkbox" checked={view.showConnections} disabled={!model?.connections.length && !model?.parts.some((part) => part.connectionPoints.length)} onchange={() => toggleOverlay('showConnections')} /> Connections</label><label><input type="checkbox" bind:checked={showEducation} /> How it works</label></div>
            <button disabled={blocked || !selectedModule} onclick={() => { if (selectedModule) controller?.fit({ subassemblyId: selectedModule.id }); }}>Fit module</button>
            <button disabled={blocked} onclick={() => controller?.resetCamera()}>Reset view</button>
            {#if !simulationActive}<label class="auto-camera"><input type="checkbox" checked={autoCamera} disabled={blocked} onchange={(event) => { autoCamera = event.currentTarget.checked; controller?.setAutoCamera(autoCamera); }} /> Follow building steps</label>{/if}
            <p class="small">Explode separates parts for viewing. It does not change your guide progress.</p>
          </div>
        </details>
      </div>
      <div class="scene-stage">
        {#if model && frame}
          {#key sceneAttempt}<RobotScene {model} frame={simulationActive && simulationFrame ? simulationFrame.assembly : frame} {revision} {view} {selectedPartId} onController={(value) => { controller = value; if (value && (reducedMotion || simulationActive)) { autoCamera = false; value.setAutoCamera(false); } }} onReady={() => { ready = true; sceneError = ''; }} onError={reportSceneError} onSelect={(id) => selectPart(id)} onCameraOverride={() => autoCamera = false} />{/key}
        {/if}
        {#if loading || (!ready && !loadError && !sceneError)}<div class="scene-status" role="status"><span class="eyebrow">Getting ready</span><h2>{loading ? 'Loading your building guide' : 'Preparing the 3D parts'}</h2><p>Building controls will be ready in a moment.</p></div>{/if}
        {#if loadError || sceneError}<div class="scene-status error-state" role="alert"><h2>{loadError ? 'Building guide could not load' : '3D view could not start'}</h2><p>{loadError || sceneError}</p><button class="primary" onclick={() => { if (loadError) void load(); else { sceneError = ''; ready = false; sceneAttempt++; } }}>Retry</button><p class="small">You can still use any loaded instructions, parts and manual links.</p></div>{/if}
        {#if view.isolatedPartIds.length}<button class="exit-isolate" onclick={() => view = { ...view, isolatedPartIds: [] }}>Show all parts</button>{/if}
      </div>
      <div class="camera-toolbar"><div class="camera-actions"><button disabled={blocked} onclick={() => controller?.fit('active')}>Focus active</button><button disabled={blocked} onclick={() => controller?.fit('all')}>Fit whole</button></div><div class="camera-status">{#if simulationActive}<span>Simulation camera · manual orbit</span>{:else if !autoCamera}<button disabled={blocked} onclick={resumeCamera}>Resume auto camera</button>{/if}</div></div>

      {#if showEducation && model}<div class="mechanism-panel"><button class="mechanism-close" onclick={() => showEducation = false}>Close explanation ×</button><MechanismGuide {model} simulationFrame={simulationActive ? simulationFrame : null} {revision} {stepIndex} {selectedPartId} onSelect={(id) => selectPart(id)} onStep={selectStep} /></div>{/if}
      {#if !simulationActive}<section class="simulation-gate" class:available={simulationAvailable} aria-label="Post-assembly demonstration">{#if simulationAvailable}<button class="primary" disabled={blocked} aria-describedby="simulation-lock" onclick={enterSimulation}>Try the movement demo →</button>{:else}<span class="demo-later">Movement demo</span>{/if}<p id="simulation-lock">{simulationLock}</p></section>{/if}
    </section>
    <aside id="inventory-panel" class="work-panel inventory-panel" class:panel-open={rightOpen} aria-label="Parts and inspection">
      <div class="panel-heading"><h2 bind:this={inventoryHeading} tabindex="-1">Parts</h2><button onclick={() => closePanel('inventory')} aria-label="Collapse parts">×</button></div>
      <div class="panel-tabs" role="group" aria-label="Parts panel"><button aria-pressed={rightTab === 'inventory'} onclick={() => rightTab = 'inventory'}>All parts</button><button aria-pressed={rightTab === 'inspection'} onclick={() => rightTab = 'inspection'}>Selected part</button></div>
      <div class="panel-content">
        {#if rightTab === 'inventory'}
          <label class="stacked-label">Find a part<input type="search" placeholder="Name, color or part number" bind:value={search} /></label>
          {#if stats.sampleTotal}<label class="stacked-label">Show<select bind:value={inventoryScope}><option value="all">Robot and sample parts</option><option value="robot">Robot parts</option><option value="sample">Sample parts</option></select></label>{/if}
          <p class="small">{filteredParts.length} components · {inventoryGroups.length} types{coverage.dimensions.inventory.status !== 'complete' ? '. Check the official manual for the complete inventory' : ''}. Expand a type to select an individual piece.</p>
          <ul class="inventory-list">{#each inventoryGroups as group (group.key)}{@const part = group.parts[0]}{@const color = partColor(part)}<li><details class="part-group" open={!!search.trim()}><summary><span class="part-swatch" style:background={color?.color} aria-hidden="true"></span><span class="part-group-name"><strong>{group.name}</strong><span>{color?.name}{stats.sampleTotal ? ` · ${part.inventoryScope === 'sample' ? 'Sample' : 'Robot'}` : ''} · {placedIn(group.parts)}/{group.parts.length} placed</span></span><span class="part-quantity">×{group.parts.length}</span></summary><ul class="instance-list">{#each group.parts as instance}<li><button class:selected={selectedPartId === instance.id} aria-pressed={selectedPartId === instance.id} onclick={() => selectPart(instance.id)}><strong>{instance.name}</strong><span class="mono">{instance.id}</span><span class="part-state">{partState(instance.id)}</span></button></li>{/each}</ul></details></li>{/each}</ul>
          {#if !filteredParts.length}<p>No matching parts. Try another name or color.</p><button onclick={() => search = ''}>Clear search</button>{/if}
        {:else if selectedPart}
          <h3 class="instruction-title">{selectedPart.name}</h3><p class="state-tag">{partState(selectedPart.id)}</p>
          <div class="inspection-actions"><button disabled={blocked} onclick={() => controller?.fit('active')}>Focus part</button><button disabled={blocked} onclick={isolate}>Isolate part</button><button onclick={() => selectPart(null)}>Clear selection</button></div>
          <dl class="part-facts"><div><dt>Color</dt><dd>{partColor(selectedPart)?.name ?? 'Not recorded'}</dd></div><div><dt>Part number</dt><dd>{selectedPart.partNumber ?? 'Not confirmed; see technical details'}</dd></div>{#if selectedModule}<div><dt>Assembly</dt><dd>{selectedModule.name}</dd></div>{/if}</dl>
          {#if selectedPart.sourceReference}<a class="button-link" href={sourceHref(selectedPart.sourceReference)} target="_blank" rel="noreferrer">View in original instructions ↗</a>{/if}
          <details class="part-technical"><summary>Technical details</summary>
            <dl class="inspector-facts"><div><dt>Instance</dt><dd class="mono">{selectedPart.id}</dd></div><div><dt>Geometry (LDraw)</dt><dd class="mono">{selectedPart.geometryId}</dd></div><div><dt>Scope / family</dt><dd>{selectedPart.inventoryScope} / {selectedPart.category}</dd></div><div><dt>Current operation</dt><dd>{activeOperation?.partInstanceIds.includes(selectedPart.id) ? `${activeOperation.operationType} · ${activeOperation.id}` : 'Not active in this operation'}</dd></div><div><dt>Identity evidence</dt><dd>{selectedPart.identityEvidence.category}: {selectedPart.identityEvidence.note}</dd></div><div><dt>Geometry confidence</dt><dd>{Math.round(selectedPart.geometryConfidence * 100)}% evidence rating; not dimensional certification</dd></div><div><dt>Placement</dt><dd>{selectedPart.placementEvidence.placement} · fit {selectedPart.placementEvidence.fit}. {selectedPart.placementEvidence.evidence.note}</dd></div></dl>
            <h3>Mounting points ({selectedPart.connectionPoints.length})</h3><ul class="mount-list">{#each selectedPart.connectionPoints as point}<li><strong>{point.id}</strong><span>{point.type} · {point.evidence.placement} · fit {point.evidence.fit}</span><span class="mono">Local mm: {point.localTransform.position.join(', ')}</span></li>{/each}</ul>{#if !selectedPart.connectionPoints.length}<p class="small">No mounting frames recorded.</p>{/if}
            <h3>Connections ({selectedConnections.length})</h3><ul class="relationship-list">{#each selectedConnections as connection}{@const otherId = connection.a.partInstanceId === selectedPart.id ? connection.b.partInstanceId : connection.a.partInstanceId}<li><button onclick={() => selectPart(otherId)}>{connection.type} → {otherId}</button><span>{connection.evidence.relationship.category} · fit {connection.evidence.fit}</span><p class="small">{connection.evidence.relationship.note}</p></li>{/each}</ul>
          </details>
        {:else}<div class="inspection-empty"><span class="preview-cross" aria-hidden="true">+</span><h3>Take a closer look</h3><p>Select a part in the model or parts list to focus on it, check its color or see where it belongs.</p><button onclick={() => rightTab = 'inventory'}>Browse parts</button></div>{/if}
      </div>
    </aside>
  </main>
  <div class="assembly-summary" aria-label="Assembly counts"><span class="guide-step-count"><strong class="mono">{stats.stepsComplete}/{stats.stepsTotal}</strong> guide steps completed</span><span class="guide-part-count"><strong class="mono">{stats.robotInstalled}/{stats.robotTotal}</strong> robot parts shown in place</span>{#if stats.sampleTotal}<span><strong>{stats.sampleInstalled}/{stats.sampleTotal}</strong> sample parts</span>{/if}</div>
  {#if simulationActive && compiled}{#key compiled}<SimulationControls bind:this={simulationControls} assembly={compiled} disabled={blocked} onFrame={showSimulationFrame} onExit={exitSimulation} />{/key}{:else if compiled}<Timeline {compiled} {timeMs} {running} {resumable} {speed} disabled={blocked} onSeek={seek} onPlayStep={() => begin('step')} onPlayAll={() => begin('all')} onPause={() => pause()} onResume={resume} onReverse={() => begin('reverse')} onPrevious={previous} onNext={next} onSpeed={(value) => speed = value} onMilestone={selectStep} />{:else}<div class="timeline"><p>{loadError ? 'Building controls are unavailable until the guide loads.' : 'Preparing building controls…'}</p>{#if loadError}<button onclick={() => void load()}>Retry</button>{/if}</div>{/if}
</div>
<div class="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
<dialog bind:this={referenceDialog} class="reference-dialog" aria-labelledby="reference-title" onclose={() => referenceReturnFocus?.focus()}>
  <div class="dialog-heading"><div><p class="eyebrow">{entry.identity.name}</p><h2 id="reference-title">Reference & credits</h2></div><button onclick={() => referenceDialog.close()} aria-label="Close reference">Close ×</button></div>
  {#if model}
    <p>{entry.identity.edition}</p>
    <p class="notice">This independent 3D guide has not been fully verified on a physical robot. Use the official instructions to check fit, cable routing and connections.</p>
    <details class="source-browser" open><summary>Browse original manuals</summary><label class="stacked-label">Document<select bind:value={sourceDocumentId} onchange={() => sourcePage = 1}>{#each manualDocuments as document}<option value={document.id}>{document.title}</option>{/each}</select></label><label class="stacked-label">PDF page<input type="number" min="1" max={sourceDocument?.pageCount} value={sourcePage} oninput={(event) => { const value = Number(event.currentTarget.value); if (Number.isInteger(value) && value >= 1 && sourceDocument?.pageCount !== undefined && value <= sourceDocument.pageCount) sourcePage = value; }} /></label>
      {#if sourceDocument}<a class="button-link" href={`${sourceDocument.sourceUrl.split('#')[0]}#page=${sourcePage}`} target="_blank" rel="noreferrer">Open official page {sourcePage} ↗</a>{/if}
      <p class="small">Browsing a manual keeps your current build position. Choose a mapped step below to move the guide.</p>
      {#each pageMappings as mapping}{@const mappedStep = mapping.stepId ?? model.operations.find((operation) => operation.id === mapping.operationId)?.stepId}{#if mappedStep}<button class="source-mapping" disabled={blocked} onclick={() => { selectStep(mappedStep); referenceDialog.close(); }}>Go to {mapping.source.figure ? `figure ${mapping.source.figure}` : `instruction ${mapping.source.instructionId ?? mappedStep}`} →</button>{:else}<p class="small">Reference page; no building step mapped.</p>{/if}{/each}
      {#if !pageMappings.length}<p class="small">No building step mapped to this page.</p>{/if}
    </details>
    <details><summary>Current step evidence</summary>
      {#if activeOperation}<p class="operation-label">{activeOperation.operationType} · {activeOperation.evidence.placement}</p><p>{activeOperation.evidence.relationship.note}</p>{/if}
      <ul class="source-list">{#each currentStep?.sourceReferences ?? [] as source}<li><a href={sourceHref(source)} target="_blank" rel="noreferrer">{model.sourceDocuments.find((document) => document.id === source.documentId)?.title ?? source.documentId} ↗</a><span>PDF page {source.page ?? 'unknown'} · printed instruction {source.instructionId ?? 'not numbered'}{source.figure ? ` · figure ${source.figure}` : ''}</span><span>Source confidence {Math.round(source.confidence * 100)}% · evidence rating, not accuracy</span></li>{/each}</ul>
    </details>
    <details><summary>Guide progress & counting</summary>
      <p>Progress follows the animation; it does not confirm that you have assembled a physical robot. Animation duration is not an estimate of building time.</p>
      <p>{stats.robotTotal - stats.robotInstalled} robot components remain in the tray. Parts count as placed only when they reach their connection in the animation.</p>
      {#if stats.sampleTotal}<p>Sample components are counted separately from the robot.</p>{/if}
      {#if stats.fastenersTotal}<p>{stats.fastenersInstalled}/{stats.fastenersTotal} fasteners placed.</p>{/if}
      {#if currentModule}<p>Current module: {currentModule.name} · {moduleInstalled}/{currentModule.partInstanceIds.length} components placed.</p>{/if}
      <p>Reverse is an animation, not a safe disassembly procedure. Explode changes the view only. Reduced motion jumps to the requested step endpoint.</p>
    </details>
    <details><summary>Coverage & limitations</summary><p>{model.coverage.implementedSteps}/{model.coverage.documentedSteps} steps implemented · {model.coverage.verifiedSteps} verified</p>{#each Object.entries(model.coverage.dimensions) as [name, dimension]}<p class="small"><strong>{name}: {dimension.status}.</strong> {dimension.note}</p>{/each}<ul>{#each model.coverage.outstandingDeviations as deviation}<li>{deviation}</li>{/each}</ul></details>
    <details><summary>Source inventory accounting</summary>{#each model.inventory as line}<div class="inventory-evidence"><strong>{line.name} · {line.quantity}</strong><p class="small">{line.scope} · {line.basis} · {line.accounting}{line.discrepancy ? ` · ${line.discrepancy}` : ''}</p></div>{/each}</details>
    <details><summary>Geometry attribution & licenses</summary>{#each model.geometryAssets as asset}<h4>{asset.id}</h4><ul class="source-list">{#each asset.attribution as attribution}<li><a href={attribution.sourceUrl} target="_blank" rel="noreferrer">{attribution.sourcePath} ↗</a><span>{attribution.authors.join(', ')}</span><span>{attribution.licenseIds.join(' · ')}</span>{#each attribution.licenseUrls as url}<a href={url} target="_blank" rel="noreferrer">License ↗</a>{/each}{#if attribution.modifications.length}<span>Changes: {attribution.modifications.join('; ')}</span>{/if}</li>{/each}</ul>{/each}</details>
    <details><summary>Material evidence</summary>{#each model.materials as material}<h4>{material.name}</h4><p class="small">{material.evidence.note}</p><ul class="source-list">{#each material.evidence.sources as source}<li><a href={sourceHref(source)} target="_blank" rel="noreferrer">{model.sourceDocuments.find((document) => document.id === source.documentId)?.title ?? source.documentId} ↗</a></li>{/each}</ul>{/each}</details>
    <p class="small">Not affiliated with or endorsed by the manufacturer. Original manuals are linked, not redistributed. <a href="/models/library/CREDITS.txt" target="_blank" rel="noreferrer">Geometry & preview credits ↗</a></p>
  {:else}<p>Reference material will appear when the building guide loads.</p>{/if}
</dialog>
<dialog bind:this={helpDialog} class="help-dialog" aria-labelledby="help-title" onclose={() => helpReturnFocus?.focus()}>
  <div class="dialog-heading"><h2 id="help-title">Keyboard & camera</h2><button onclick={() => helpDialog.close()}>Close ×</button></div>
  <dl class="shortcut-list">
    <div><dt><kbd>[</kbd> / <kbd>]</kbd></dt><dd>Previous / next step. In the demo, move back / forward one second.</dd></div>
    <div><dt><kbd>Space</kbd></dt><dd>Play, pause or resume the current step.</dd></div>
    <div><dt><kbd>R</kbd> / <kbd>F</kbd></dt><dd>Reset the view / fit the whole model.</dd></div>
    <div><dt><kbd>X</kbd> / <kbd>L</kbd></dt><dd>Exploded view / part labels.</dd></div>
    <div><dt><kbd>T</kbd> / <kbd>I</kbd></dt><dd>Technical view / part inspection.</dd></div>
    <div><dt><kbd>?</kbd></dt><dd>Open this help.</dd></div>
    <div><dt><kbd>Escape</kbd></dt><dd>Close a dialog or panel, leave isolation, or return to building.</dd></div>
  </dl>
  <h3>Move around the model</h3><p>Drag to rotate; scroll or pinch to zoom; right-drag to pan. On touch screens, use one finger to rotate and two to pan or zoom.</p>
  <p>With the model focused, use arrow keys to rotate, Shift + arrows to pan, and + / − to zoom. Manual movement stops the camera following building steps; choose Resume auto camera to follow again.</p>
  <h3>Building controls</h3><p>Next completes the current step. Previous returns to a step boundary. Drag the progress slider to replay any point; Home / End go to the beginning / end. Playback options contains animation speed, Play all, Reverse and milestones.</p>
  <p>View options contains display styles, part labels, connection overlays and How it works. Reference & credits contains original manuals and technical notes. Guide progress records the animation, not a completed physical build.</p>
  <p class="small">Reduced motion jumps assembly playback to the requested endpoint and disables camera flights. Demonstrations start paused. Keyboard shortcuts leave typing, sliders and native controls alone.</p>
</dialog>
