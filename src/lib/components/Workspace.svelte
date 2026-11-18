<script lang="ts">
  import { onMount, tick } from 'svelte';
  import RobotScene from '#lib/components/RobotScene.svelte';
  import Timeline from '#lib/components/Timeline.svelte';
  import SimulationControls from '#lib/components/SimulationControls.svelte';
  import MechanismGuide from '#lib/components/MechanismGuide.svelte';
  import GuideOpenError from './GuideOpenError.svelte';
  import { groupParts } from './part-groups.ts';
  import { learnerPartNames } from './learner-parts.ts';
  import { compileAssembly, createFrame, sampleAssembly, getStepTime } from '#lib/assembly/engine.ts';
  import type { AssemblyFrame, CatalogEntry, CompiledAssembly, RendererController, RobotModel, SimulationFrame, SourceReference, ViewOptions, PartInstance } from '#lib/types/model.ts';

  import type { GuideProgress } from './guide-progress.ts';

  let { entry, initialProgress, persistenceFailed, onProgress, onReset, onBack }: {
    entry: CatalogEntry; initialProgress?: GuideProgress; persistenceFailed: boolean;
    onProgress: (progress: GuideProgress | null) => void; onReset: () => boolean; onBack: () => void;
  } = $props();
  let timelineSignature = '';
  let changedGuide = $state(false);
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
  let heldStepIndex = $state<number | null>(null);
  let finalHold: number | null = null;
  let workshop = $state(false);
  let running = $state(false);
  let resumable = $state(false);
  let scope = $state<'step' | 'all' | 'reverse'>('step');
  let endpoint = 0;
  let speed = $state(1);
  let animation = 0;
  let lastTick = 0;
  let reducedMotion = $state(false);
  let ready = $state(false);
  let loadError = $state('');
  let sceneError = $state('');
  let sceneAttempt = $state(0);
  let sceneErrorHeading = $state<HTMLHeadingElement>();
  let retryHadFocus = false;
  let selectedPartId = $state<string | null>(null);
  let autoCamera = $state(true);
  const studio: ViewOptions = { mode: 'studio', explodedFactor: 0, labels: false, showJoints: false, showConnections: false, isolatedPartIds: [] };
  let view = $state<ViewOptions>(studio);
  const guidedView = $derived(view.isolatedPartIds.length ? { ...studio, isolatedPartIds: view.isolatedPartIds } : studio);
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
  let instructionsTrigger = $state<HTMLButtonElement>();
  let inventoryTrigger = $state<HTMLButtonElement>();
  let sceneColumn = $state<HTMLElement>();
  let viewArea = $state<HTMLElement>();
  let sheetOpen = $state(false);
  let launchControl = $state<HTMLButtonElement>();
  let instructionsHeading = $state<HTMLHeadingElement>();
  let instructionBody = $state<HTMLElement>();
  let inventoryHeading = $state<HTMLHeadingElement>();
  let inventoryDialog = $state<HTMLDialogElement>();
  let inventoryReturnFocus: HTMLElement | null = null;
  let helpDialog: HTMLDialogElement;
  let helpReturnFocus: HTMLElement | null = null;
  let referenceDialog: HTMLDialogElement;
  let referenceReturnFocus: HTMLElement | null = null;
  let resetDialog: HTMLDialogElement;
  let resetTrigger = $state<HTMLButtonElement>();
  let resetError = $state('');
  let fetchController: AbortController | null = null;
  let disposed = false;
  let stats = $state({ robotInstalled: 0, robotTotal: 0, sampleInstalled: 0, sampleTotal: 0, fastenersInstalled: 0, fastenersTotal: 0, stepsComplete: 0, stepsTotal: 0 });

  const displayedIndex = $derived(heldStepIndex ?? stepIndex);
  const currentStep = $derived(model?.steps[displayedIndex] ?? null);
  const stepNumbers = $derived.by(() => {
    let count = 0;
    return model?.steps.map((step) => step.kind === 'numbered-instruction' ? ++count : 0) ?? [];
  });
  const stepLabel = $derived(!currentStep ? '' : workshop ? `Step ${displayedIndex + 1} of ${model?.steps.length}`
    : stepNumbers[displayedIndex] ? `Step ${stepNumbers[displayedIndex]} of ${model?.coverage.implementedSteps}`
    : currentStep.id === 'hand-wiring' ? 'Wiring · last stage' : currentStep.kind === 'presentation' ? 'Check the view' : 'Get ready');
  const watchAgain = $derived(heldStepIndex !== null && timeMs === compiled?.stepTimes[heldStepIndex].endMs);
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
  const simulationLock = $derived(!model ? '' : !sourceComplete ? 'This guide is incomplete; a full demonstration is unavailable.' :
    !model.scenarios.length ? 'No movement demo is available for this robot.' : sceneError ? 'The movement demo needs 3D.' :
    !assemblyComplete ? 'Available after the last building step.' : 'A simulated preview of movement; physical fit and performance remain unverified.');
  const activeOperation = $derived.by(() => {
    if (!compiled || !model || !currentStep) return null;
    const localTime = timeMs - compiled.stepTimes[displayedIndex].startMs;
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
    saveProgress();
    assemblyAutoCamera = autoCamera;
    assemblyPanels = { left: leftOpen, right: rightOpen };
    autoCamera = false; controller?.setAutoCamera(false);
    view = { ...view, explodedFactor: 0, isolatedPartIds: [] };
    finalHold = heldStepIndex;
    heldStepIndex = null;
    simulationFrame = null; simulationActive = true; revision++;
    leftOpen = false; rightOpen = false;
    await tick();
    if (!simulationActive || disposed) return;
    if (!workshop && model?.id === 'advanced-driving-base') controller?.fit('all');
    else controller?.resetCamera();
    document.getElementById('movement-demo-title')?.focus();
    announcement = 'Movement demo paused.';
  }
  async function exitSimulation() {
    simulationControls?.pause();
    simulationActive = false; simulationFrame = null;
    heldStepIndex = finalHold;
    if (compiled) sample(compiled.durationMs);
    leftOpen = assemblyPanels.left; rightOpen = assemblyPanels.right && wide;
    autoCamera = assemblyAutoCamera;
    announcement = 'Back to the end of the guide.';
    await tick();
    if (simulationActive || disposed) return;
    controller?.setAutoCamera(autoCamera);
    if (!blocked && assemblyComplete) launchControl?.focus();
  }
  function saveProgress() {
    if (!compiled) return;
    if (timeMs === 0 && !assemblyComplete) { onProgress(null); return; }
    let reached = 0;
    for (const step of compiled.stepTimes) {
      if (step.endMs > timeMs) break;
      reached = stepNumbers[step.index] || reached;
    }
    const hold = simulationActive ? finalHold : heldStepIndex;
    onProgress({ timeline: timelineSignature, timeMs, heldStepId: hold === null ? null : compiled.stepTimes[hold].stepId,
      steps: reached, complete: assemblyComplete });
  }
  function pausePlayback() {
    pause();
    saveProgress();
    announcement = 'Step playback paused.';
  }
  function showSimulationFrame(output: SimulationFrame) { simulationFrame = output; revision++; }
  function pause(clear = false) {
    running = false;
    cancelAnimationFrame(animation);
    if (clear) resumable = false;
  }
  function syncStepSource() {
    const source = currentStep?.sourceReferences[0];
    if (source?.page !== undefined && manualDocuments.some((document) => document.id === source.documentId)) {
      sourceDocumentId = source.documentId; sourcePage = source.page;
    }
  }
  function announceStep() {
    changedGuide = false;
    syncStepSource();
    if (currentStep) announcement = assemblyComplete ? 'You reached the end of the guide.' : `${stepLabel}. ${currentStep.description}`;
  }
  function sample(time: number) {
    if (!compiled || !frame || !Number.isFinite(time)) return;
    const previousStep = displayedIndex;
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
    if (previousStep !== displayedIndex) {
      if (instructionBody) instructionBody.scrollTop = 0;
      syncStepSource();
    }
  }
  function seek(time: number, settled = true) {
    if (simulationActive) exitSimulation();
    pause(true); heldStepIndex = null; sample(time);
    if (settled) { announceStep(); saveProgress(); }
  }
  function toggleWorkshop() {
    pause(true); heldStepIndex = null;
    workshop = !workshop; leftOpen = true; syncStepSource();
    if (view.isolatedPartIds.length) view = { ...view, isolatedPartIds: [] };
    saveProgress();
  }
  async function lookAtStep() {
    if (view.isolatedPartIds.length) view = { ...view, isolatedPartIds: [] };
    selectedPartId = null;
    await tick();
    controller?.fit('step');
  }
  async function seeWholeBuild() {
    if (view.isolatedPartIds.length) {
      view = { ...view, isolatedPartIds: [] };
      await tick();
    }
    controller?.fit('all');
  }
  function resetStepInspection() {
    selectedPartId = null;
    if (view.isolatedPartIds.length) view = { ...view, isolatedPartIds: [] };
    if (instructionBody) instructionBody.scrollTop = 0;
  }
  function guidedBack() {
    if (compiled) { seek(compiled.stepTimes[Math.max(0, displayedIndex - 1)].startMs); resetStepInspection(); }
  }
  function guidedNext() {
    if (!compiled || assemblyComplete) return;
    const index = displayedIndex;
    const end = compiled.stepTimes[index].endMs;
    pause(true);
    if (timeMs !== end) sample(end);
    heldStepIndex = assemblyComplete ? index : null;
    announceStep();
    saveProgress();
    resetStepInspection();
    if (!assemblyComplete) watchStep();
  }
  function watchStep() {
    if (!compiled || blocked) return;
    if (running) { pausePlayback(); return; }
    if (resumable) { resume(); return; }
    const step = compiled.stepTimes[displayedIndex];
    heldStepIndex = step.index;
    sample(step.startMs);
    startPlayback('step', step.endMs);
  }
  function clock(now: number) {
    if (!running) return;
    const delta = Math.max(0, now - lastTick) * (workshop ? speed : 1);
    lastTick = now;
    const next = scope === 'reverse' ? Math.max(endpoint, timeMs - delta) : Math.min(endpoint, timeMs + delta);
    sample(next);
    if (next === endpoint) { finishPlayback(); return; }
    animation = requestAnimationFrame(clock);
  }
  function finishPlayback() {
    running = false; resumable = false;
    if (assemblyComplete) announcement = 'You reached the end of the guide.';
    else if (!workshop) announcement = `${stepLabel}. Finished watching.`;
    saveProgress();
  }
  function begin(mode: 'step' | 'all' | 'reverse') {
    if (!compiled || blocked || simulationActive) return;
    startPlayback(mode, mode === 'reverse' ? 0 : mode === 'all' ? compiled.durationMs : compiled.stepTimes.find((step) => step.endMs > timeMs)?.endMs ?? compiled.durationMs);
  }
  function startPlayback(mode: typeof scope, end: number) {
    pause(true);
    scope = mode; endpoint = end;
    if (endpoint === timeMs) return;
    if (reducedMotion) { sample(endpoint); finishPlayback(); return; }
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
    if (!compiled) return;
    seek(getStepTime(compiled, stepId).startMs);
    if (workshop) selectedPartId = model?.steps[displayedIndex]?.requiredPartInstanceIds[0] ?? null;
    else resetStepInspection();
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
  function selectPart(id: string | null, reveal = true, opener?: HTMLElement) {
    selectedPartId = id;
    if (id && reveal) {
      rightTab = 'inspection';
      void openParts(opener);
    }
    const part = model?.parts.find((candidate) => candidate.id === id);
    announcement = part ? `${part.name}. ${partState(part.id)}.` : 'Selection cleared.';
  }
  function changeMode(mode: ViewOptions['mode']) { view = { ...view, mode }; }
  function explode() { view = { ...view, explodedFactor: view.explodedFactor ? 0 : 1 }; }
  function toggleOverlay(key: 'labels' | 'showJoints' | 'showConnections') { view = { ...view, [key]: !view[key] }; }
  function isolate() { if (selectedPartId) view = { ...view, mode: workshop ? 'inspection' : view.mode, isolatedPartIds: [selectedPartId] }; }
  function resumeCamera() { if (simulationActive) return; autoCamera = true; controller?.setAutoCamera(true); }
  async function openParts(opener = document.activeElement instanceof HTMLElement ? document.activeElement : inventoryTrigger) {
    if (!rightOpen) inventoryReturnFocus = opener ?? null;
    rightOpen = true;
    await tick();
    if (!rightOpen) return;
    if (inventoryDialog && !inventoryDialog.open) inventoryDialog.showModal();
    inventoryHeading?.focus();
  }
  function inventoryClosed() {
    if (!rightOpen) return;
    rightOpen = false;
    (inventoryReturnFocus?.isConnected && inventoryReturnFocus !== document.body ? inventoryReturnFocus : inventoryTrigger)?.focus();
  }
  async function toggleInstructions() {
    leftOpen = !leftOpen;
    await tick();
    if (leftOpen) instructionsHeading?.focus();
  }
  function closePanel(panel: 'instructions' | 'inventory') {
    if (panel === 'instructions') { leftOpen = false; instructionsTrigger?.focus(); }
    else if (inventoryDialog?.open) inventoryDialog.close();
    else inventoryClosed();
  }
  function backToCatalog() {
    pause(true);
    simulationControls?.pause();
    saveProgress();
    onBack();
  }
  function openHelp() { helpReturnFocus = document.activeElement as HTMLElement; helpDialog.showModal(); }
  function openReference() { referenceReturnFocus = document.activeElement as HTMLElement; referenceDialog.showModal(); }
  function confirmReset() {
    resetError = '';
    resetDialog.showModal();
  }
  async function startOver() {
    if (!onReset()) {
      resetError = 'This saved place couldn’t be cleared. Try again or keep building.';
      return;
    }
    seek(0, false);
    resetStepInspection();
    announceStep();
    resetDialog.close();
    await tick();
    controller?.resetCamera();
  }
  function keyboard(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || inventoryDialog?.open || helpDialog?.open || referenceDialog?.open || resetDialog?.open) return;
    const target = event.target as HTMLElement;
    if (target.isContentEditable || target.closest('input, textarea, select, [contenteditable], [role="slider"], dialog, canvas')) return;
    if (event.key === ' ' && target.closest('button, a, summary')) return;
    if (event.key === 'Escape') {
      const popup = document.querySelector<HTMLDetailsElement>('.view-options[open], .playback-options[open], .step-picker[open], .guided .simulation-details[open]');
      if (popup && !rightOpen) { popup.open = false; popup.querySelector<HTMLElement>('summary')?.focus(); event.preventDefault(); return; }
      if (rightOpen) closePanel('inventory'); else if (simulationActive) exitSimulation(); else if (workshop && leftOpen) closePanel('instructions'); else if (view.isolatedPartIds.length) view = { ...view, isolatedPartIds: [] }; else return;
      event.preventDefault(); return;
    }
    if (event.key === '?' && workshop) { event.preventDefault(); openHelp(); return; }
    if (!workshop && !simulationActive) {
      if (event.key === '[') guidedBack(); else if (event.key === ']') guidedNext(); else if (event.key === ' ') watchStep(); else return;
      event.preventDefault(); return;
    }
    if (!compiled) return;
    if (simulationActive && simulationControls?.keyboard(event.key)) { event.preventDefault(); return; }
    if (!workshop) return;
    const key = event.key.toLowerCase();
    if (key === '[') previous(); else if (key === ']') next();
    else if (key === ' ') { if (blocked) return; if (running) pausePlayback(); else if (resumable) resume(); else begin('step'); }
    else if (key === 'r') controller?.resetCamera(); else if (key === 'f') controller?.fit('all');
    else if (key === 'x') explode(); else if (key === 'l') toggleOverlay('labels');
    else if (key === 't') changeMode(view.mode === 'technical' ? 'studio' : 'technical');
    else if (key === 'i') { changeMode('inspection'); rightTab = 'inspection'; void openParts(); }
    else return;
    event.preventDefault();
  }
  const sourceHref = (source: SourceReference) => source.page !== undefined && manualDocuments.some((document) => document.id === source.documentId) ? `${source.sourceUrl.split('#')[0]}#page=${source.page}` : source.sourceUrl;
  function clearIsolation() { view = { ...view, isolatedPartIds: [] }; }
  function reportSceneError(error: Error) {
    if (running) saveProgress();
    pause(true);
    ready = false; sceneError = error.message;
    sheetOpen = true;
    if (simulationActive) exitSimulation();
    if (retryHadFocus) {
      retryHadFocus = false;
      void tick().then(() => { if (document.activeElement === document.body) sceneErrorHeading?.focus(); });
    }
  }
  function retryScene(event: MouseEvent) {
    retryHadFocus = document.activeElement === event.currentTarget;
    sceneError = ''; sceneAttempt++;
  }
  async function load() {
    pause(true);
    simulationControls?.pause(); simulationActive = false; simulationFrame = null;
    fetchController?.abort();
    const request = new AbortController();
    fetchController = request;
    ready = false; loadError = ''; sceneError = '';
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
      timelineSignature = JSON.stringify(assembly.stepTimes.map(({ stepId, endMs }) => [stepId, endMs]));
      const checkpoint = initialProgress;
      const hold = checkpoint?.heldStepId == null ? undefined : assembly.stepTimes.find((step) => step.stepId === checkpoint.heldStepId);
      const compatible = checkpoint && checkpoint.timeline === timelineSignature && checkpoint.timeMs <= assembly.durationMs &&
        (checkpoint.heldStepId === null || (hold && checkpoint.timeMs >= hold.startMs && checkpoint.timeMs <= hold.endMs));
      heldStepIndex = compatible ? hold?.index ?? null : null;
      sample(compatible ? checkpoint.timeMs : 0);
      syncStepSource();
      if (checkpoint && !compatible) {
        changedGuide = true;
        announcement = 'This guide changed. Start again at the first step.';
        onProgress(null);
      }
      if (!candidate.sourceDocuments.some((document) => document.id === sourceDocumentId && document.pageCount !== undefined)) sourceDocumentId = candidate.sourceDocuments.find((document) => document.pageCount !== undefined)?.id ?? '';
    } catch (error) {
      if (!request.signal.aborted && !disposed) loadError = error instanceof Error ? error.message : String(error);
    }
  }
  onMount(() => {
    const layout = matchMedia('(min-width: 1200px) and (min-height: 540px)');
    const layoutChanged = () => {
      if (rightOpen) {
        inventoryDialog?.close();
        rightOpen = false; inventoryTrigger?.focus();
      }
      wide = layout.matches;
    };
    layoutChanged();
    layout.addEventListener('change', layoutChanged);
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = media.matches;
    const motionChanged = () => { reducedMotion = media.matches; if (media.matches && running) pausePlayback(); };
    media.addEventListener('change', motionChanged);
    const hidden = () => { if (document.hidden) saveProgress(); };
    document.addEventListener('visibilitychange', hidden);
    void load();
    return () => {
      disposed = true; fetchController?.abort(); cancelAnimationFrame(animation);
      media.removeEventListener('change', motionChanged); layout.removeEventListener('change', layoutChanged);
      document.removeEventListener('visibilitychange', hidden);
    };
  });
</script>

<svelte:window onkeydown={keyboard} onpagehide={saveProgress} />
<div class="workspace-shell" class:guided={!workshop} class:simulation-active={simulationActive}>
  <header class="workspace-header">
    <button class="wordmark wordmark-button" onclick={backToCatalog} aria-label="Back to build catalog"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg><span class="brand-name">All builds</span></button>
    <div class="workspace-identity"><h1>{entry.identity.name}</h1></div>
    {#if compiled}<button class="workspace-reset control-key" bind:this={resetTrigger} aria-haspopup="dialog" onclick={confirmReset}>Start over</button>{/if}
    <div class="workspace-actions">
      {#if compiled}
        {#if !simulationActive}<button class="control-key" aria-pressed={workshop} onclick={toggleWorkshop}>Workshop tools</button>{/if}
        {#if workshop}<button class="control-key" bind:this={instructionsTrigger} aria-expanded={leftOpen} aria-controls="instructions-panel" onclick={toggleInstructions}>Instructions</button>{/if}
        <button class="control-key" bind:this={inventoryTrigger} aria-expanded={rightOpen} aria-controls="inventory-panel" aria-haspopup={wide ? undefined : 'dialog'} onclick={(event) => rightOpen ? closePanel('inventory') : void openParts(event.currentTarget)}>Parts</button>
        <button class="reference-trigger control-key" onclick={openReference} aria-label="Reference & credits" aria-haspopup="dialog"><span>Reference<span class="reference-extra">{' & credits'}</span></span></button>
        {#if workshop}<button class="help-trigger control-key" onclick={openHelp} aria-label="Keyboard help" aria-haspopup="dialog">?</button>{/if}
      {/if}
    </div>
  </header>
  <main id="main" tabindex="-1" class="workspace-main" class:left-open={leftOpen && !!compiled && !simulationActive} class:right-open={rightOpen && wide}>
    {#if persistenceFailed || changedGuide}
      <div class="guide-notices">
        {#if persistenceFailed}<p>Your place is kept while this page stays open.</p>{/if}
        {#if changedGuide}<p>This guide changed. Start again at the first step.</p>{/if}
      </div>
    {/if}
    {#if loadError}
      <GuideOpenError error={loadError} onRetry={() => void load()} onBack={backToCatalog} />
    {:else}
    {#if model && compiled && currentStep && !simulationActive}
    <aside id="instructions-panel" class="work-panel instructions-panel" class:panel-open={leftOpen} class:sheet-open={sheetOpen} aria-label="Build instructions">
      {#if workshop}<div class="panel-heading"><h2 bind:this={instructionsHeading} tabindex="-1">Instructions</h2><button onclick={() => closePanel('instructions')} aria-label="Collapse instructions">×</button></div>{/if}
        {#if !workshop}
          <h2 class="guided-step-number" aria-label={stepLabel}>
            <span class="desktop-step-number">{stepLabel}</span>
            <button class="step-sheet-toggle" aria-expanded={sheetOpen} aria-controls="instruction-body" onclick={() => sheetOpen = !sheetOpen}>
              <span>{stepLabel}</span>
              {#if currentStep.warnings.length}<span class="sheet-warning">Read before building</span>{/if}
              <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
            </button>
          </h2>
        {/if}
        <div id="instruction-body" class="panel-content" bind:this={instructionBody}>
          {#if workshop}
            <div class="step-heading"><span class="step-number">{stepLabel}</span><details class="step-picker" name="workspace-options"><summary>Jump to step</summary><label class="stacked-label">Building step<select value={currentStep.id} onchange={(event) => selectStep(event.currentTarget.value)}>{#each model.steps as step, index}<option value={step.id}>{index + 1}. {step.title}</option>{/each}</select></label></details></div>
            <h3 class="instruction-title">{currentStep.title}</h3><p class="instruction-description">{currentStep.description}</p>
            {#if currentStep.action === 'view'}<p class="step-hint">Rotate the model to check this view. No parts are added.</p>{/if}
          {:else}
            <p class="instruction-description">{currentStep.description}</p>
            {#if currentStep.warnings.length}
              {@const manual = currentStep.sourceReferences.find((source) => manualDocuments.some((document) => document.id === source.documentId))}
              <div id="step-warnings" class="step-warnings">
                {#each [...new Set(currentStep.warnings)] as warning (warning)}
                  <div class="notice warning">
                    {#if currentStep.id === 'hand-step-1' && manual && warning === 'Prepare the hub battery as shown on page 3 before starting. The hub is counted as one prepared component.'}
                      Ask an adult to prepare the hub battery. See <a href={sourceHref({ ...manual, page: 3 })} target="_blank" rel="noreferrer">page 3 of the official instructions</a>.
                    {:else}{warning}{/if}
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
          <section class="step-parts" aria-label="Parts for this step">
            <h3>{requiredParts.length ? 'Gather these parts' : workshop ? currentStep.action === 'wiring' ? 'Use the existing cables' : 'Use your assembled parts' : currentStep.action === 'view' ? 'No new pieces' : currentStep.action === 'wiring' ? 'Use the cable already attached' : 'Use the pieces you already built'}</h3>
            {#if requiredParts.length}
              <ul class="required-list">
                {#each requiredGroups as group (group.key)}
                  {@const part = group.parts[0]}
                  {@const color = partColor(part)}
                  <li>
                    {#if workshop}
                      <button onclick={() => selectPart(part.id)} aria-label={`Inspect ${group.parts.length} ${color?.name ?? ''} ${group.name}`}>
                        {@render partThumbnail(part, 48)}
                        <span><strong>{group.name}</strong><span class="small">{color?.name}</span></span>
                        <span class="part-quantity">×{group.parts.length}</span>
                      </button>
                    {:else}
                      {@render partThumbnail(part, 56)}
                      <span><strong>{Object.hasOwn(learnerPartNames, part.geometryId) ? learnerPartNames[part.geometryId] : group.name}</strong><span class="learner-color">{color?.name}</span></span>
                      <strong class="part-quantity">×{group.parts.length}</strong>
                    {/if}
                  </li>
                {/each}
              </ul>
            {:else if workshop}<p class="small">No additional hardware in this instruction.</p>{/if}
          </section>
          {#if workshop && currentStep.warnings.length}<div id="step-warnings" class="step-warnings" tabindex="-1">{#each [...new Set(currentStep.warnings)] as warning (warning)}<div class="notice warning"><strong>Before you continue</strong><p>{warning}</p></div>{/each}</div>{/if}
          {#if workshop && timeMs === 0}<p class="build-tip">Choose <strong>Play step</strong> to watch the connections. Choose <strong>Next</strong> when you’re ready to move on.</p>{/if}
          <div class="step-reference">{#each currentStep.sourceReferences as source}<a href={sourceHref(source)} target="_blank" rel="noreferrer">Official instructions{source.page !== undefined ? ` · page ${source.page}` : ''} ↗</a>{/each}</div>
          <p class="guide-caution small">{workshop ? 'Some 3D fits are unverified. Check connections against the official instructions and never force parts together.' : 'Use the official instructions for the real build. Don’t force pieces.'}</p>
          {#if !workshop}
            {#if assemblyComplete}<p class="guide-end">You reached the end of the guide</p>{/if}
            {#if !sourceComplete || !model.scenarios.length || sceneError}
              <p class="guide-demo-cue">{simulationLock}</p>
            {:else if !assemblyComplete}
              <p class="guide-demo-cue">Finish the guide to watch it move.</p>
            {/if}
          {/if}
        </div>
    </aside>
    {/if}
    <section bind:this={sceneColumn} class="scene-column" aria-label="3D assembly workbench">
      {#if workshop && compiled}<div class="scene-toolbar">
        <div class="camera-toolbar" role="group" aria-label="Camera controls">
          <div class="camera-actions camera-keys">
            <button class="control-key" disabled={blocked} onclick={() => controller?.fit('active')}>{@render cameraIcon(false)}Focus active</button>
            <button class="control-key" disabled={blocked} onclick={() => controller?.fit('all')}>{@render cameraIcon(true)}Fit whole</button>
          </div>
          <div class="camera-status">
            {#if simulationActive}<span>Simulation camera · manual orbit</span>
            {:else if !autoCamera}<button class="control-key" disabled={blocked} onclick={resumeCamera}>Resume auto camera</button>
            {:else}<span class="auto-camera-status">Camera follows steps</span>{/if}
          </div>
          {#if view.isolatedPartIds.length}<button class="control-key" onclick={clearIsolation}>Show all parts</button>{/if}
        </div>
        <details class="view-options" name="workspace-options">
          <summary class="control-key">
            <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h9m4 0h3M4 17h3m4 0h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></svg>
            View options
          </summary>
          <div class="view-options-content">
            <div class="mode-buttons" role="group" aria-label="View mode"><button class="control-key" aria-pressed={view.mode === 'studio'} onclick={() => changeMode('studio')}>Studio</button><button class="control-key" aria-pressed={view.mode === 'technical'} onclick={() => changeMode('technical')}>Technical</button><button class="control-key" aria-pressed={view.explodedFactor > 0} onclick={explode}>Explode</button><button class="control-key" aria-pressed={view.mode === 'inspection'} onclick={(event) => { changeMode('inspection'); rightTab = 'inspection'; void openParts(event.currentTarget); }}>Inspection</button></div>
            <div class="overlay-toolbar"><label><input type="checkbox" checked={view.labels} onchange={() => toggleOverlay('labels')} /> Part labels</label><label><input type="checkbox" checked={view.showJoints} disabled={!model?.joints.length} onchange={() => toggleOverlay('showJoints')} /> Joint axes</label><label><input type="checkbox" checked={view.showConnections} disabled={!model?.connections.length && !model?.parts.some((part) => part.connectionPoints.length)} onchange={() => toggleOverlay('showConnections')} /> Connections</label><label><input type="checkbox" bind:checked={showEducation} /> How it works</label></div>
            <button class="control-key" disabled={blocked || !selectedModule} onclick={() => { if (selectedModule) controller?.fit({ subassemblyId: selectedModule.id }); }}>Fit module</button>
            <button class="control-key" disabled={blocked} onclick={() => controller?.resetCamera()}>Reset view</button>
            {#if !simulationActive}<label class="auto-camera"><input type="checkbox" checked={autoCamera} disabled={blocked} onchange={(event) => { autoCamera = event.currentTarget.checked; controller?.setAutoCamera(autoCamera); }} /> Follow building steps</label>{/if}
            <p class="small">Explode separates parts for viewing. It does not change your guide progress.</p>
          </div>
        </details>
      </div>{/if}
      <div class="scene-aperture" bind:this={viewArea}>
        {#if !workshop && view.isolatedPartIds.length}<button class="exit-isolate control-key" onclick={clearIsolation}>Show all parts</button>{/if}
      </div>
      <div class="scene-stage" hidden={!!sceneError}>
        {#if model && frame}
          {#key sceneAttempt}
            <RobotScene {model} frame={simulationActive && simulationFrame ? simulationFrame.assembly : frame} {revision}
              view={workshop ? view : guidedView} {viewArea} {selectedPartId} guidedStepIndex={!workshop && !simulationActive ? displayedIndex : undefined}
              onController={(value) => { controller = value; value?.setAutoCamera(autoCamera && !simulationActive); }}
              onReady={() => { ready = true; retryHadFocus = false; if (!changedGuide) announcement = '3D ready.'; }}
              onError={reportSceneError} onSelect={(id) => selectPart(id, workshop, sceneColumn?.querySelector('canvas') ?? undefined)} onCameraOverride={() => autoCamera = false} />
          {/key}
        {/if}
        {#if !ready && !sceneError}<div class="scene-status" role="status">Opening your building guide…</div>{/if}
      </div>
      {#if sceneError}
        <div class="guide-error">
          <h2 bind:this={sceneErrorHeading} role="alert" aria-live="polite" tabindex="-1">3D isn’t available. You can still read each step or open the official instructions.</h2>
          <button class="primary" onclick={retryScene}>Try 3D again</button>
          <details><summary>Technical details</summary><p>{sceneError}</p></details>
        </div>
      {/if}
      {#if compiled && !workshop && !simulationActive}
        <div class="guided-camera camera-keys" aria-label="Camera controls" role="group">
          <button class="control-key" disabled={blocked} onclick={lookAtStep}>{@render cameraIcon(false)}Look at this step</button>
          <button class="control-key" disabled={blocked} onclick={seeWholeBuild}>{@render cameraIcon(true)}See whole build</button>
        </div>
      {/if}

      {#if workshop && showEducation && model}<div class="mechanism-panel"><button class="mechanism-close" onclick={() => showEducation = false}>Close explanation ×</button><MechanismGuide {model} simulationFrame={simulationActive ? simulationFrame : null} {revision} {stepIndex} {selectedPartId} onSelect={(id) => selectPart(id)} onStep={selectStep} /></div>{/if}
      {#if workshop && !simulationActive && compiled}
        <section class="simulation-gate" class:available={simulationAvailable} aria-label="Post-assembly demonstration">
          {#if simulationAvailable && !blocked}<button bind:this={launchControl} class="control-key control-key-primary" aria-describedby="simulation-lock" onclick={enterSimulation}>Try the movement demo →</button>
          {:else}<span class="demo-later">Movement demo</span>{/if}
          <p id="simulation-lock">{simulationLock}</p>
        </section>
      {/if}
    </section>
    {#if wide}
      <aside id="inventory-panel" class="work-panel inventory-panel" class:panel-open={rightOpen} aria-label="Parts and inspection">
        {#if rightOpen}{@render inventory()}{/if}
      </aside>
    {:else}
      <dialog bind:this={inventoryDialog} id="inventory-panel" class="inventory-dialog" aria-labelledby="inventory-heading" onclose={inventoryClosed}>
        {#if rightOpen}{@render inventory()}{/if}
      </dialog>
    {/if}
    {/if}
  </main>
  {#snippet inventory()}
      <div class="panel-heading"><h2 bind:this={inventoryHeading} id="inventory-heading" tabindex="-1">Parts</h2><button onclick={() => closePanel('inventory')} aria-label="Collapse parts">×</button></div>
      <div class="panel-tabs" role="group" aria-label="Parts panel"><button aria-pressed={rightTab === 'inventory'} onclick={() => rightTab = 'inventory'}>All parts</button><button aria-pressed={rightTab === 'inspection'} onclick={() => rightTab = 'inspection'}>Selected part</button></div>
      <div class="panel-content">
        {#if rightTab === 'inventory'}
          <label class="stacked-label">Find a part<input type="search" placeholder="Name, color or part number" bind:value={search} onkeydown={(event) => {
            if (event.key === 'Escape' && inventoryDialog?.open) { event.preventDefault(); inventoryDialog.close(); }
          }} /></label>
          {#if stats.sampleTotal}<label class="stacked-label">Show<select bind:value={inventoryScope}><option value="all">Robot and sample parts</option><option value="robot">Robot parts</option><option value="sample">Sample parts</option></select></label>{/if}
          <p class="small">{filteredParts.length} components · {inventoryGroups.length} types{coverage.dimensions.inventory.status !== 'complete' ? '. Check the official manual for the complete inventory' : ''}. Expand a type to select an individual piece.</p>
          <ul class="inventory-list">
            {#each inventoryGroups as group (group.key)}
              {@const part = group.parts[0]}
              {@const color = partColor(part)}
              <li>
                <details class="part-group" open={!!search.trim()}>
                  <summary>
                    {@render partThumbnail(part, 48)}
                    <span class="part-group-name"><strong>{group.name}</strong><span>{color?.name}{stats.sampleTotal ? ` · ${part.inventoryScope === 'sample' ? 'Sample' : 'Robot'}` : ''} · {placedIn(group.parts)}/{group.parts.length} placed</span></span>
                    <span class="part-quantity">×{group.parts.length}</span>
                  </summary>
                  <ul class="instance-list">{#each group.parts as instance}<li><button class:selected={selectedPartId === instance.id} aria-pressed={selectedPartId === instance.id} onclick={() => selectPart(instance.id)}><strong>{instance.name}</strong><span class="mono">{instance.id}</span><span class="part-state">{partState(instance.id)}</span></button></li>{/each}</ul>
                </details>
              </li>
            {/each}
          </ul>
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
  {/snippet}
  <div class="workspace-dock">
  {#if workshop}
  <div class="assembly-summary" aria-label="Assembly counts"><span class="guide-step-count"><strong class="mono">{stats.stepsComplete}/{stats.stepsTotal}</strong> guide steps completed</span><span class="guide-part-count"><strong class="mono">{stats.robotInstalled}/{stats.robotTotal}</strong> robot parts shown in place</span>{#if stats.sampleTotal}<span><strong>{stats.sampleInstalled}/{stats.sampleTotal}</strong> sample parts</span>{/if}<span class="playback-state" class:is-playing={running} class:is-complete={assemblyComplete}>{loadError || sceneError ? 'Unavailable' : !ready ? 'Loading…' : simulationActive ? 'Movement demo' : assemblyComplete ? 'Guide complete' : running ? 'Playing' : timeMs === 0 && !resumable ? 'Ready to build' : 'Paused'}</span></div>
  {/if}
  {#if !simulationActive && compiled && workshop}
    <Timeline {compiled} {timeMs} {running} {resumable} {speed} disabled={blocked} onSeek={(time) => seek(time, false)}
      onSeekSettled={() => { announceStep(); saveProgress(); }} onPlayStep={() => begin('step')} onPlayAll={() => begin('all')}
      onPause={pausePlayback} onResume={resume} onReverse={() => begin('reverse')} onPrevious={previous} onNext={next}
      onSpeed={(value) => { speed = value; saveProgress(); }} onMilestone={selectStep} />
  {:else if !simulationActive && compiled}
    <section class="timeline guided-transport" aria-label="Step controls">
      <button class="control-key step-key step-key-back" onclick={guidedBack}>
        <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 6v12m14-6H9m5-5-5 5 5 5" /></svg>
        <span>Back a step</span>
      </button>
      <button class="control-key step-key step-key-watch" data-playing={running} disabled={blocked} aria-describedby={currentStep?.warnings.length ? 'step-warnings' : undefined} onclick={watchStep}>
        <span class="playback-glyph" aria-hidden="true">
          <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            {#if running}<path d="M9 6v12m6-12v12" />
            {:else if !resumable && (watchAgain || assemblyComplete)}<path d="M5 11a7 7 0 1 1 1.9 6.2M5 6v5h5" />
            {:else}<path d="m9 6 9 6-9 6Z" fill="currentColor" />{/if}
          </svg>
        </span>
        <span>{running ? 'Pause' : resumable ? 'Resume' : watchAgain || assemblyComplete ? 'Watch again' : 'Watch this step'}</span>
      </button>
      {#if !assemblyComplete || (simulationAvailable && !blocked)}
        <button bind:this={launchControl} class="control-key control-key-primary step-key step-key-next" onclick={() => assemblyComplete ? void enterSimulation() : guidedNext()}>
          <span>{assemblyComplete ? 'Watch what moves' : 'Next step'}</span>
          <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
        </button>
      {/if}
    </section>
  {:else if simulationActive && compiled}
    <SimulationControls bind:this={simulationControls} assembly={compiled} disabled={blocked} guided={!workshop}
      onFrame={showSimulationFrame} onExit={exitSimulation} onStatus={(message) => announcement = message} />
  {/if}
  </div>
</div>
{#snippet partThumbnail(part: PartInstance, size: number)}
  <img class="part-thumbnail" alt="" width={size} height={size} loading="lazy" src={`/previews/parts/${part.geometryId}-${part.materialId}.webp`} onerror={(event) => { (event.currentTarget as HTMLImageElement).hidden = true; }} />
{/snippet}

{#snippet cameraIcon(whole: boolean)}
  <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
    <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" />
    {#if whole}<path d="m12 7 4.5 2.5v5L12 17l-4.5-2.5v-5zm-4.5 2.5L12 12l4.5-2.5M12 12v5" />
    {:else}<circle cx="12" cy="12" r="3" />{/if}
  </svg>
{/snippet}
<div class="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
<dialog bind:this={resetDialog} aria-labelledby="reset-title" onclose={() => resetTrigger?.focus()}>
  <h2 id="reset-title">Start {entry.identity.name} over?</h2>
  <p>This clears the saved place for this guide only.</p>
  {#if resetError}<p role="alert">{resetError}</p>{/if}
  <div class="recovery-actions"><button onclick={() => resetDialog.close()}>Cancel</button><button class="primary" onclick={startOver}>Start over</button></div>
</dialog>
<dialog bind:this={referenceDialog} class="reference-dialog" aria-labelledby="reference-title" onclose={() => referenceReturnFocus?.focus()}>
  <div class="dialog-heading"><div><p class="eyebrow">{entry.identity.name}</p><h2 id="reference-title">Reference & credits</h2></div><button onclick={() => referenceDialog.close()} aria-label="Close reference">Close ×</button></div>
  {#if model}
    <p>{entry.identity.edition}</p>
    <p class="notice">This independent 3D guide has not been fully verified on a physical robot. Use the official instructions to check fit, cable routing and connections.</p>
    <details class="source-browser" open><summary>Browse original manuals</summary><label class="stacked-label">Document<select bind:value={sourceDocumentId} onchange={() => sourcePage = 1}>{#each manualDocuments as document}<option value={document.id}>{document.title}</option>{/each}</select></label><label class="stacked-label">PDF page<input type="number" min="1" max={sourceDocument?.pageCount} value={sourcePage} oninput={(event) => { const value = Number(event.currentTarget.value); if (Number.isInteger(value) && value >= 1 && sourceDocument?.pageCount !== undefined && value <= sourceDocument.pageCount) sourcePage = value; }} /></label>
      {#if sourceDocument}<a class="button-link" href={`${sourceDocument.sourceUrl.split('#')[0]}#page=${sourcePage}`} target="_blank" rel="noreferrer">Open official page {sourcePage} ↗</a>{/if}
      <p class="small">Browsing a manual keeps your current build position. Choose a mapped step below to move the guide.</p>
      {#each pageMappings as mapping}{@const mappedStep = mapping.stepId ?? model.operations.find((operation) => operation.id === mapping.operationId)?.stepId}{#if mappedStep}<button class="source-mapping" onclick={() => { selectStep(mappedStep); referenceDialog.close(); }}>Go to {mapping.source.figure ? `figure ${mapping.source.figure}` : `instruction ${mapping.source.instructionId ?? mappedStep}`} →</button>{:else}<p class="small">Reference page; no building step mapped.</p>{/if}{/each}
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
