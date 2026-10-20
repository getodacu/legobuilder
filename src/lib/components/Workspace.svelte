<script lang="ts">
  import { onMount, tick } from 'svelte';
  import RobotScene from '#lib/components/RobotScene.svelte';
  import Timeline from '#lib/components/Timeline.svelte';
  import SimulationControls from '#lib/components/SimulationControls.svelte';
  import { compileAssembly, createFrame, sampleAssembly, getStepTime } from '#lib/assembly/engine.ts';
  import type { AssemblyFrame, CatalogEntry, CompiledAssembly, RendererController, RobotModel, SimulationFrame, SourceReference, ViewOptions } from '#lib/types/model.ts';

  let { entry, onBack }: { entry: Extract<CatalogEntry, { status: 'available' }>; onBack: () => void } = $props();
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
  let wide = $state(false);
  let leftOpen = $state(false);
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
  let inventoryHeading: HTMLHeadingElement;
  let helpDialog: HTMLDialogElement;
  let helpTrigger: HTMLButtonElement;
  let helpReturnFocus: HTMLElement | null = null;
  let fetchController: AbortController | null = null;
  let disposed = false;
  let stats = $state({ robotInstalled: 0, robotTotal: 0, sampleInstalled: 0, sampleTotal: 0, fastenersInstalled: 0, fastenersTotal: 0, stepsComplete: 0, stepsTotal: 0 });

  const currentStep = $derived(model?.steps[stepIndex] ?? null);
  const selectedPart = $derived(model?.parts.find((part) => part.id === selectedPartId) ?? null);
  const selectedModule = $derived(model?.subassemblies.find((module) => module.id === selectedPart?.subassemblyId) ?? null);
  const currentModule = $derived(model?.subassemblies.find((module) => currentStep?.requiredPartInstanceIds.some((id) => module.partInstanceIds.includes(id))) ?? null);
  const filteredParts = $derived(model?.parts.filter((part) => (inventoryScope === 'all' || part.inventoryScope === inventoryScope) && `${part.name} ${part.id} ${part.geometryId} ${part.partNumber ?? ''} ${part.category}`.toLowerCase().includes(search.toLowerCase())) ?? []);
  const requiredParts = $derived(model?.parts.filter((part) => currentStep?.requiredPartInstanceIds.includes(part.id)) ?? []);
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
  const simulationLock = $derived(!model ? 'Load the assembly first.' : !sourceComplete ? `Full implemented source manifest required: ${coverage.implementedSteps}/${coverage.documentedSteps} steps implemented, ${coverage.verifiedSteps} verified. Completing this partial build does not unlock a full-robot demonstration.` : !model.scenarios.length ? 'No source-bound mechanism scenario is declared for this model.' : !assemblyComplete ? 'Complete the entire implemented assembly before entering the demonstration.' : `${coverage.verifiedSteps}/${coverage.documentedSteps} source steps verified. ${coverage.verifiedSteps < coverage.documentedSteps ? 'Placement remains unchecked; demonstration availability is not a verified-robot seal.' : 'See source coverage for fit and measurement limitations.'}`);
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
      const step = model?.steps[stepIndex];
      const source = step?.sourceReferences[0];
      if (source?.page !== undefined && manualDocuments.some((document) => document.id === source.documentId)) { sourceDocumentId = source.documentId; sourcePage = source.page; }
      announcement = step ? `${step.title}. ${step.action === 'view' ? 'Source view-only instruction; no parts added.' : step.description}` : 'Staged inventory';
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
  function partState(id: string) {
    revision;
    const index = partIndex.get(id);
    return frame && index !== undefined ? frame.active[index] ? (frame.installed[index] ? 'Installed · active' : 'In motion · pending') : frame.installed[index] ? 'Installed' : 'Staged · pending' : 'Unknown';
  }
  function selectPart(id: string | null, reveal = true) {
    selectedPartId = id;
    if (id && reveal) { rightTab = 'inspection'; rightOpen = true; if (!wide) leftOpen = false; }
    const part = model?.parts.find((candidate) => candidate.id === id);
    announcement = part ? `${part.name}, ${part.id}. ${partState(part.id)}.` : 'Selection cleared.';
  }
  function changeMode(mode: ViewOptions['mode']) { view = { ...view, mode }; }
  function explode() { view = { ...view, explodedFactor: view.explodedFactor ? 0 : 1 }; }
  function toggleOverlay(key: 'labels' | 'showJoints' | 'showConnections') { view = { ...view, [key]: !view[key] }; }
  function isolate() { if (selectedPartId) view = { ...view, mode: 'inspection', isolatedPartIds: [selectedPartId] }; }
  function resumeCamera() { if (simulationActive) return; autoCamera = true; controller?.setAutoCamera(true); }
  async function openPanel(panel: 'instructions' | 'inventory') {
    if (panel === 'instructions') { leftOpen = !leftOpen; if (!wide) rightOpen = false; }
    else { rightOpen = !rightOpen; if (!wide) leftOpen = false; }
    await tick();
    if (panel === 'instructions' && leftOpen) instructionsHeading?.focus();
    else if (panel === 'inventory' && rightOpen) inventoryHeading?.focus();
  }
  function closePanel(panel: 'instructions' | 'inventory') {
    if (panel === 'instructions') { leftOpen = false; instructionsTrigger?.focus(); }
    else { rightOpen = false; inventoryTrigger?.focus(); }
  }
  async function revealWarnings() {
    leftOpen = true;
    if (!wide) rightOpen = false;
    await tick();
    const warnings = document.getElementById('step-warnings');
    warnings?.focus();
    warnings?.scrollIntoView({ block: 'nearest' });
  }
  function openHelp() { helpReturnFocus = document.activeElement as HTMLElement; helpDialog.showModal(); }
  function keyboard(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || helpDialog?.open) return;
    const target = event.target as HTMLElement;
    if (target.isContentEditable || target.closest('input, textarea, select, [contenteditable], [role="slider"], dialog, canvas')) return;
    if (event.key === ' ' && target.closest('button, a, summary')) return;
    if (event.key === 'Escape') {
      if (leftOpen) closePanel('instructions'); else if (rightOpen) closePanel('inventory'); else if (view.isolatedPartIds.length) view = { ...view, isolatedPartIds: [] }; else if (simulationActive) exitSimulation(); else return;
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
    else if (key === 'i') { changeMode('inspection'); rightTab = 'inspection'; }
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
      sample(0);
      if (!candidate.sourceDocuments.some((document) => document.id === sourceDocumentId && document.pageCount !== undefined)) sourceDocumentId = candidate.sourceDocuments.find((document) => document.pageCount !== undefined)?.id ?? '';
    } catch (error) {
      if (!request.signal.aborted && !disposed) loadError = error instanceof Error ? error.message : String(error);
    } finally { if (!request.signal.aborted && !disposed) loading = false; }
  }
  onMount(() => {
    const layout = matchMedia('(min-width: 1200px)');
    const layoutChanged = () => { wide = layout.matches; leftOpen = wide; rightOpen = wide; };
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
<div class="workspace-shell">
  <header class="workspace-header">
    <button class="wordmark wordmark-button" onclick={() => { pause(true); simulationControls?.pause(); onBack(); }} aria-label="Back to build catalog"><span class="alignment-mark" aria-hidden="true"></span>RoboBuild</button>
    <div class="workspace-identity"><span class="eyebrow">{entry.identity.manufacturer} / {entry.identity.category}</span><h1>{entry.identity.name}</h1></div>
    <span class="coverage-badge header-coverage">{coverage.implementedSteps}/{coverage.documentedSteps} authored{coverage.implementedSteps < coverage.documentedSteps ? ' · partial source coverage' : coverage.verifiedSteps < coverage.documentedSteps || coverage.dimensions.placement.status !== 'complete' ? ' · new fits unverified' : ' source steps'}</span>
    <button bind:this={helpTrigger} onclick={openHelp} aria-haspopup="dialog">Keyboard help <kbd>?</kbd></button>
  </header>
  <div class="workspace-subheader"><span class="small">{entry.identity.edition}</span><div class="panel-buttons"><button bind:this={instructionsTrigger} aria-expanded={leftOpen} aria-controls="instructions-panel" onclick={() => openPanel('instructions')}>Instructions</button><button bind:this={inventoryTrigger} aria-expanded={rightOpen} aria-controls="inventory-panel" onclick={() => openPanel('inventory')}>Inventory & inspection</button></div></div>
  <main id="main" tabindex="-1" class="workspace-main" class:left-open={leftOpen} class:right-open={rightOpen}>
    {#if leftOpen || rightOpen}<button class="drawer-backdrop" aria-label="Close open panel" onclick={() => closePanel(leftOpen ? 'instructions' : 'inventory')}></button>{/if}
    <aside id="instructions-panel" class="work-panel instructions-panel" class:panel-open={leftOpen} aria-label="Instructions and sources">
      <div class="panel-heading"><h2 bind:this={instructionsHeading} tabindex="-1">Instructions</h2><button onclick={() => closePanel('instructions')} aria-label="Collapse instructions">×</button></div>
      {#if model && compiled && currentStep}
        <div class="panel-content">
          <p class="eyebrow">{currentModule?.name ?? 'Current module'} · {currentStep.action}</p>
          <label class="stacked-label">Implemented source steps<select value={currentStep.id} disabled={blocked} onchange={(event) => selectStep(event.currentTarget.value)}>{#each model.steps as step}<option value={step.id}>{step.title}</option>{/each}</select></label>
          <h3 class="instruction-title">{currentStep.title}</h3><p>{currentStep.description}</p>
          {#if currentStep.action === 'view'}<div class="notice">Source view-only step. Camera guidance changes; physical parts and counts do not.</div>{/if}
          {#if activeOperation}<p class="operation-label">{activeOperation.operationType} <span>· {activeOperation.evidence.placement}</span></p><p class="small">{activeOperation.evidence.relationship.note}</p>{/if}
          <div class="cad-figure"><span class="eyebrow">Original CAD instruction view</span><p>The live center view shows the actual components for this instruction. No official manual images are reproduced.</p><button disabled={blocked} onclick={() => controller?.fit('active')}>Frame active operation ↗</button></div>
          <h3>Required hardware <span class="mono">{requiredParts.length}</span></h3>
          {#if requiredParts.length}<ul class="required-list">{#each requiredParts as part}<li><button onclick={() => selectPart(part.id)}><strong>{part.name}</strong><span class="mono">1 × {part.id}</span><span>Geometry (LDraw): {part.geometryId}</span></button></li>{/each}</ul>{:else}<p class="small">No additional hardware in this instruction.</p>{/if}
          {#if currentStep.warnings.length}<div id="step-warnings" tabindex="-1">{#each currentStep.warnings as warning}<div class="notice warning"><strong>Warning / uncertainty</strong><p>{warning}</p></div>{/each}</div>{/if}
          <h3>Instruction evidence</h3><ul class="source-list">{#each currentStep.sourceReferences as source}<li><a href={sourceHref(source)} target="_blank" rel="noreferrer">{model.sourceDocuments.find((document) => document.id === source.documentId)?.title ?? source.documentId} ↗</a><span>PDF page {source.page ?? 'unknown'} · printed instruction {source.instructionId ?? 'not numbered'}{source.figure ? ` · figure ${source.figure}` : ''}</span><span>Source confidence {Math.round(source.confidence * 100)}% · evidence rating, not accuracy</span></li>{/each}</ul>
          <details class="source-browser" open><summary>Browse original manuals</summary><label class="stacked-label">Document<select bind:value={sourceDocumentId} onchange={() => sourcePage = 1}>{#each manualDocuments as document}<option value={document.id}>{document.title}</option>{/each}</select></label><label class="stacked-label">One-based PDF page<input type="number" min="1" max={sourceDocument?.pageCount} value={sourcePage} oninput={(event) => { const value = Number(event.currentTarget.value); if (Number.isInteger(value) && value >= 1 && sourceDocument?.pageCount !== undefined && value <= sourceDocument.pageCount) sourcePage = value; }} /></label>
            {#if sourceDocument}<a class="button-link" href={`${sourceDocument.sourceUrl.split('#')[0]}#page=${sourcePage}`} target="_blank" rel="noreferrer">Open official page {sourcePage} ↗</a>{/if}
            <p class="small">Reading a page does not seek. Only an explicitly mapped figure below changes the assembly.</p>
            {#each pageMappings as mapping}{@const mappedStep = mapping.stepId ?? model.operations.find((operation) => operation.id === mapping.operationId)?.stepId}{#if mappedStep}<button class="source-mapping" disabled={blocked} onclick={() => selectStep(mappedStep)}>Seek {mapping.source.figure ? `figure ${mapping.source.figure}` : `instruction ${mapping.source.instructionId ?? mappedStep}`} →</button>{:else}<p class="small">Reference-only page; no assembly state mapped.</p>{/if}{/each}
            {#if !pageMappings.length}<p class="small">No implemented assembly mapping for this page. Reference reading only.</p>{/if}
          </details>
          <details>
            <summary>Assembly status & viewing</summary>
            <p>{stats.robotInstalled}/{stats.robotTotal} tracked robot units installed · {stats.robotTotal - stats.robotInstalled} remaining. {stats.stepsComplete}/{stats.stepsTotal} timeline stages complete; the separate source-step count above excludes non-numbered stages.</p>
            {#if stats.sampleTotal}<p>{stats.sampleInstalled}/{stats.sampleTotal} sample units installed (separate from robot units).</p>{/if}
            {#if stats.fastenersTotal}<p>{stats.fastenersInstalled}/{stats.fastenersTotal} fasteners installed.</p>{/if}
            {#if currentModule}<p>Current module: <strong>{currentModule.name}</strong> · {moduleInstalled}/{currentModule.partInstanceIds.length} tracked direct units installed. No reused component is counted twice.</p>{/if}
            <p>Staged = pending · moving = active · seated = installed. Counts commit only at seating events.</p>
            <p>Explode is presentation-only; source time and counts are unchanged. Reduced motion jumps playback to the requested endpoint and disables camera flights.</p>
            <p>Post-assembly demonstration availability and limitations appear below the live scene. Full implemented coverage is required; authored coverage never establishes verified fit.</p>
          </details>
          <details><summary>Whole-source coverage & limitations</summary><p>{model.coverage.implementedSteps}/{model.coverage.documentedSteps} steps implemented · {model.coverage.verifiedSteps} verified</p><p>{model.coverage.dimensions.inventory.note}</p>{#each Object.entries(model.coverage.dimensions) as [name, dimension]}<p class="small"><strong>{name}: {dimension.status}.</strong> {dimension.note}</p>{/each}<ul>{#each model.coverage.outstandingDeviations as deviation}<li>{deviation}</li>{/each}</ul></details>
          <details><summary>Geometry attribution & licenses</summary>{#each model.geometryAssets as asset}<h4>{asset.id}</h4><ul class="source-list">{#each asset.attribution as attribution}<li><a href={attribution.sourceUrl} target="_blank" rel="noreferrer">{attribution.sourcePath} ↗</a><span>{attribution.authors.join(', ')}</span><span>{attribution.licenseIds.join(' · ')}</span>{#each attribution.licenseUrls as url}<a href={url} target="_blank" rel="noreferrer">License ↗</a>{/each}{#if attribution.modifications.length}<span>Changes: {attribution.modifications.join('; ')}</span>{/if}</li>{/each}</ul>{/each}</details>
          <details><summary>Material evidence</summary>{#each model.materials as material}<h4>{material.name}</h4><p class="small">{material.evidence.note}</p><ul class="source-list">{#each material.evidence.sources as source}<li><a href={sourceHref(source)} target="_blank" rel="noreferrer">{model.sourceDocuments.find((document) => document.id === source.documentId)?.title ?? source.documentId} ↗</a></li>{/each}</ul>{/each}</details>
          <p class="small">Independent educational reconstruction. Not affiliated with or endorsed by the manufacturer. Source documents are linked, not redistributed.</p>
        </div>
      {:else}<p class="panel-content">{loadError ? 'Instructions could not load. Retry the manifest below.' : 'Loading source-linked instructions…'}</p>{/if}
    </aside>
    <section bind:this={sceneColumn} class="scene-column" aria-label="3D assembly workbench">
      <div class="scene-toolbar">
        <div class="mode-buttons" role="group" aria-label="View mode"><button aria-pressed={view.mode === 'studio'} onclick={() => changeMode('studio')}>Studio</button><button aria-pressed={view.mode === 'technical'} onclick={() => changeMode('technical')}>Technical</button><button aria-pressed={view.explodedFactor > 0} onclick={explode}>Explode</button><button aria-pressed={view.mode === 'inspection'} onclick={() => { changeMode('inspection'); rightTab = 'inspection'; }}>Inspection</button></div>
        <details class="view-options">
          <summary>View options</summary>
          <div class="view-options-content">
            <p class="eyebrow">Millimeters · Y-up</p>
            <div class="overlay-toolbar"><label><input type="checkbox" checked={view.labels} onchange={() => toggleOverlay('labels')} /> Labels</label><label><input type="checkbox" checked={view.showJoints} disabled={!model?.joints.length} onchange={() => toggleOverlay('showJoints')} /> Joint axes{!model?.joints.length ? ' (none recorded)' : ''}</label><label><input type="checkbox" checked={view.showConnections} disabled={!model?.connections.length && !model?.parts.some((part) => part.connectionPoints.length)} onchange={() => toggleOverlay('showConnections')} /> Connections / mounts</label></div>
            <p class="small">Explode changes presentation only, never source time or installed counts.</p>
          </div>
        </details>
      </div>
      <div class="scene-stage">
        {#if model && frame}
          {#key sceneAttempt}<RobotScene {model} frame={simulationActive && simulationFrame ? simulationFrame.assembly : frame} {revision} {view} {selectedPartId} onController={(value) => { controller = value; if (value && (reducedMotion || simulationActive)) { autoCamera = false; value.setAutoCamera(false); } }} onReady={() => { ready = true; sceneError = ''; }} onError={reportSceneError} onSelect={(id) => selectPart(id)} onCameraOverride={() => autoCamera = false} />{/key}
        {/if}
        {#if loading || (!ready && !loadError && !sceneError)}<div class="scene-status" role="status"><span class="eyebrow">Preparing workbench</span><h2>{loading ? 'Loading source-backed model' : 'Loading genuine component geometry'}</h2><p>Transport unlocks when all required assets are ready.</p></div>{/if}
        {#if loadError || sceneError}<div class="scene-status error-state" role="alert"><span class="eyebrow">Workbench unavailable</span><h2>{loadError ? 'Model could not load' : '3D assets or WebGL could not initialize'}</h2><p>{loadError || sceneError}</p><button class="primary" onclick={() => { if (loadError) void load(); else { sceneError = ''; ready = false; sceneAttempt++; } }}>Retry {loadError ? 'manifest' : '3D workbench'}</button><p class="small">Sources and loaded inventory remain accessible in the side panels. No substitute model is shown.</p></div>{/if}
        <div class="scene-corner-label"><span class="eyebrow">{simulationActive ? 'Post-assembly · RoboBuild extension' : currentModule?.name ?? 'Source-backed assembly'}</span><strong>{simulationActive ? simulationFrame?.compiled.scenario.title ?? 'Preparing deterministic scenario' : currentStep?.title ?? 'Staged inventory'}</strong></div>
      </div>
      <div class="camera-toolbar"><div class="camera-actions"><button disabled={blocked} onclick={() => controller?.resetCamera()}>Reset view</button><button disabled={blocked} onclick={() => controller?.fit('all')}>Fit whole</button><button disabled={blocked} onclick={() => controller?.fit('active')}>Focus active</button><button disabled={blocked || !selectedModule} onclick={() => { if (selectedModule) controller?.fit({ subassemblyId: selectedModule.id }); }}>Fit module</button></div><div class="camera-status">{#if simulationActive}<span>Simulation camera · manual orbit</span>{:else if autoCamera}<span>Auto camera</span>{:else}<span>Manual camera</span><button disabled={blocked} onclick={resumeCamera}>Resume auto camera</button>{/if}</div></div>
      <div class="assembly-summary" aria-label="Assembly counts"><span><strong class="mono">{stats.robotInstalled}/{stats.robotTotal}</strong> units installed</span><span><strong class="mono">{stats.robotTotal - stats.robotInstalled}</strong> remaining</span><span><strong class="mono">{stats.stepsComplete}/{stats.stepsTotal}</strong> {stats.stepsTotal === coverage.documentedSteps ? 'source steps' : 'timeline stages'}</span>{#if reducedMotion}<span>Reduced motion</span>{/if}{#if view.explodedFactor}<span>Exploded view</span>{/if}{#if view.isolatedPartIds.length}<button onclick={() => view = { ...view, isolatedPartIds: [] }}>Exit isolate</button>{/if}</div>
      {#if !simulationActive}<section class="simulation-gate" aria-label="Post-assembly demonstration"><button class:primary={simulationAvailable} disabled={blocked || !simulationAvailable} aria-describedby="simulation-lock" onclick={enterSimulation}>{simulationAvailable ? 'Enter post-assembly demonstration' : 'Simulation locked'}</button><p id="simulation-lock">{simulationLock}</p></section>{/if}
      {#if currentStep?.warnings.length}<div class="compact-warning"><span title={currentStep.warnings[0]}><strong>Step warning:</strong> {currentStep.warnings[0]}</span><button onclick={() => void revealWarnings()}>Read {currentStep.warnings.length > 1 ? 'warnings' : 'warning'}</button></div>{/if}
    </section>
    <aside id="inventory-panel" class="work-panel inventory-panel" class:panel-open={rightOpen} aria-label="Inventory and inspection">
      <div class="panel-heading"><h2 bind:this={inventoryHeading} tabindex="-1">Parts & evidence</h2><button onclick={() => closePanel('inventory')} aria-label="Collapse inventory">×</button></div>
      <div class="panel-tabs" role="group" aria-label="Parts panel"><button aria-pressed={rightTab === 'inventory'} onclick={() => rightTab = 'inventory'}>Inventory</button><button aria-pressed={rightTab === 'inspection'} onclick={() => rightTab = 'inspection'}>Inspection</button></div>
      <div class="panel-content">
        {#if rightTab === 'inventory'}
          <label class="stacked-label">Search family, geometry or instance<input type="search" placeholder="e.g. pin, 32054, instance ID" bind:value={search} /></label><label class="stacked-label">Inventory scope<select bind:value={inventoryScope}><option value="all">Robot & samples (separate scopes)</option><option value="robot">Robot only</option><option value="sample">Samples only</option></select></label>
          <p class="small">{filteredParts.length} individual instances shown.{coverage.dimensions.inventory.status !== 'complete' ? ' Inventory coverage is incomplete; this is not the complete official inventory.' : ''}{coverage.dimensions.placement.status !== 'complete' ? ' Placement verification remains incomplete, independently of inventory coverage.' : ''} Select a row to inspect its actual CAD instance.</p>
          <ul class="inventory-list">{#each filteredParts as part}<li><button class:selected={selectedPartId === part.id} aria-pressed={selectedPartId === part.id} onclick={() => selectPart(part.id)}><span class="part-row-heading"><strong>{part.name}</strong><span class="mono">×1</span></span><span class="mono">{part.id}</span><span>Geometry (LDraw): {part.geometryId}</span><span class="part-state">{partState(part.id)} · {part.inventoryScope}</span></button></li>{/each}</ul>
          {#if !filteredParts.length}<p>No matching instances. Try a family name or clear the search.</p>{/if}
          {#if model}<details><summary>Source inventory accounting</summary>{#each model.inventory as line}<div class="inventory-evidence"><strong>{line.name} · {line.quantity}</strong><p class="small">{line.scope} · {line.basis} · {line.accounting}{line.discrepancy ? ` · ${line.discrepancy}` : ''}</p></div>{/each}</details>{/if}
        {:else if selectedPart}
          <p class="eyebrow">Actual part instance</p><h3 class="instruction-title">{selectedPart.name}</h3><p class="state-tag">{partState(selectedPart.id)}</p><div class="inspection-actions"><button disabled={blocked} onclick={isolate}>Isolate part</button>{#if view.isolatedPartIds.length}<button onclick={() => view = { ...view, isolatedPartIds: [] }}>Exit isolate</button>{/if}<button onclick={() => selectPart(null)}>Clear selection</button></div>
          <dl class="inspector-facts"><div><dt>Instance</dt><dd class="mono">{selectedPart.id}</dd></div><div><dt>Manufacturer ID</dt><dd>{selectedPart.partNumber ?? 'Unknown / not asserted'}</dd></div><div><dt>Geometry (LDraw)</dt><dd class="mono">{selectedPart.geometryId}</dd></div><div><dt>Material</dt><dd>{model?.materials.find((material) => material.id === selectedPart.materialId)?.name ?? selectedPart.materialId}</dd></div><div><dt>Scope / family</dt><dd>{selectedPart.inventoryScope} / {selectedPart.category}</dd></div><div><dt>Module / parent</dt><dd>{selectedModule?.name ?? selectedPart.subassemblyId ?? 'No structural parent recorded'}</dd></div><div><dt>Current operation</dt><dd>{activeOperation?.partInstanceIds.includes(selectedPart.id) ? `${activeOperation.operationType} · ${activeOperation.id}` : 'Not active in this operation'}</dd></div><div><dt>Identity evidence</dt><dd>{selectedPart.identityEvidence.category}: {selectedPart.identityEvidence.note}</dd></div><div><dt>Geometry confidence</dt><dd>{Math.round(selectedPart.geometryConfidence * 100)}% evidence rating; not dimensional certification</dd></div><div><dt>Placement</dt><dd>{selectedPart.placementEvidence.placement} · fit {selectedPart.placementEvidence.fit}. {selectedPart.placementEvidence.evidence.note}</dd></div></dl>
          <h3>Mounting points ({selectedPart.connectionPoints.length})</h3><ul class="mount-list">{#each selectedPart.connectionPoints as point}<li><strong>{point.id}</strong><span>{point.type} · {point.evidence.placement} · fit {point.evidence.fit}</span><span class="mono">Local mm: {point.localTransform.position.join(', ')}</span></li>{/each}</ul>{#if !selectedPart.connectionPoints.length}<p class="small">No source-backed mounting frames recorded.</p>{/if}
          <h3>Relationships ({selectedConnections.length})</h3><ul class="relationship-list">{#each selectedConnections as connection}{@const otherId = connection.a.partInstanceId === selectedPart.id ? connection.b.partInstanceId : connection.a.partInstanceId}<li><button onclick={() => selectPart(otherId)}>{connection.type} → {otherId}</button><span>{connection.evidence.relationship.category} · fit {connection.evidence.fit}</span><p class="small">{connection.evidence.relationship.note}</p></li>{/each}</ul>{#if !selectedConnections.length}<p class="small">No recorded relationship for this instance.</p>{/if}
          {#if selectedPart.sourceReference}<a class="button-link" href={sourceHref(selectedPart.sourceReference)} target="_blank" rel="noreferrer">Original instance source ↗</a>{/if}
        {:else}<div class="inspection-empty"><span class="preview-cross" aria-hidden="true">+</span><h3>Select a real component</h3><p>Pick a component in the scene or select an individual inventory row. Staged parts can be inspected without installing them.</p><button onclick={() => rightTab = 'inventory'}>Browse inventory</button></div>{/if}
      </div>
    </aside>
  </main>
  {#if simulationActive && compiled}{#key compiled}<SimulationControls bind:this={simulationControls} assembly={compiled} disabled={blocked} onFrame={showSimulationFrame} onExit={exitSimulation} />{/key}{:else if compiled}<Timeline {compiled} {timeMs} {running} {resumable} {speed} disabled={blocked} onSeek={seek} onPlayStep={() => begin('step')} onPlayAll={() => begin('all')} onPause={() => pause()} onResume={resume} onReverse={() => begin('reverse')} onPrevious={previous} onNext={next} onSpeed={(value) => speed = value} onMilestone={selectStep} />{:else}<div class="timeline"><p>{loadError ? 'Assembly transport is unavailable until the manifest loads.' : 'Preparing assembly timeline…'}</p>{#if loadError}<button onclick={() => void load()}>Retry manifest</button>{/if}</div>{/if}
</div>
<div class="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
<dialog bind:this={helpDialog} class="help-dialog" aria-labelledby="help-title" onclose={() => helpReturnFocus?.focus()}>
  <div class="dialog-heading"><span class="eyebrow">Workbench reference</span><button onclick={() => helpDialog.close()}>Close ×</button></div>
  <h2 id="help-title">Keyboard & camera</h2>
  <dl class="shortcut-list">
    <div><dt><kbd>[</kbd> / <kbd>]</kbd></dt><dd>Previous / next source-step boundary; in simulation, seek − / + one second</dd></div>
    <div><dt><kbd>Space</kbd></dt><dd>Pause / resume; when idle, play one assembly step or the simulation in its current direction</dd></div>
    <div><dt><kbd>R</kbd> / <kbd>F</kbd></dt><dd>Reset view / fit whole assembly</dd></div>
    <div><dt><kbd>X</kbd></dt><dd>Toggle presentation explode</dd></div>
    <div><dt><kbd>L</kbd></dt><dd>Toggle instance labels</dd></div>
    <div><dt><kbd>T</kbd> / <kbd>I</kbd></dt><dd>Technical / Inspection mode</dd></div>
    <div><dt><kbd>?</kbd></dt><dd>Open this reference</dd></div>
    <div><dt><kbd>Escape</kbd></dt><dd>Close help or active drawer; otherwise exit isolation or return from simulation to assembly end</dd></div>
  </dl>
  <h3>Camera interaction</h3>
  <p>Drag to orbit; use the wheel or pinch to zoom; secondary drag to pan. Focus the scene for arrow-key orbit, Shift + arrow-key pan and + / − zoom. Visible Reset, Fit whole and Focus active buttons provide framing alternatives. Touch: one finger orbits, two fingers pan / zoom.</p>
  <h3>Timeline</h3>
  <p>The native seek range supports arrow keys for one-millisecond changes and Home / End for endpoints. Manual seeking pauses. Play step, Play all and Reverse have independent visible buttons. Speed changes preserve position and endpoint.</p>
  <p>Shortcuts do not capture typing, IME composition, native button Space, range keys or dialog keys. Manual camera movement stops automatic framing until Resume auto camera.</p>
  <p>View options contains labels, joint axes and connection overlays. Instructions → Assembly status & viewing contains module accounting and separate sample/fastener counts. Below the scene, demonstration entry requires the complete implemented manifest and assembly end, with an available mechanism scenario. Placement verification remains separately disclosed. In simulation, Home / End seek its endpoints; manual motor edits pause and reset the selected motor plan without overwriting other motors. A step warning’s Read warning button opens its full text in Instructions.</p>
  <p class="small">Reduced motion makes assembly playback jump to its requested endpoint and disables automatic camera flights. Simulation starts paused and moves only with explicit playback or seeking. Counts change only at source-backed instance installation events.</p>
</dialog>
