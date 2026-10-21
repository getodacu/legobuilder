<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { GeometryLibrary } from '../geometry/cache';
  import { SceneController } from '../scene/controller';
  import type { AssemblyFrame, RendererController, RobotModel, ViewOptions } from '../types/model';

  let {
    model, frame, revision, view, selectedPartId = null,
    onController, onReady, onError, onSelect, onCameraOverride
  }: {
    model: RobotModel | null;
    frame: AssemblyFrame | null;
    revision: number;
    view: ViewOptions;
    selectedPartId?: string | null;
    onController: (controller: RendererController | null) => void;
    onReady: () => void;
    onError: (error: Error) => void;
    onSelect: (id: string | null) => void;
    onCameraOverride: () => void;
  } = $props();

  let host: HTMLDivElement;
  let controller = $state<SceneController | null>(null);
  let loaded = $state.raw<RobotModel | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let generation = 0;

  const reportError = (cause: unknown) => {
    const failure = cause instanceof Error ? cause : new Error(String(cause));
    error = failure.message;
    onError(failure);
  };

  onMount(() => {
    const cache = new GeometryLibrary();
    try {
      controller = new SceneController(host, cache, {
        onSelect: (id) => onSelect(id),
        onCameraOverride: () => onCameraOverride(),
        onError: reportError
      });
      onController(controller);
    } catch (cause) {
      cache.dispose();
      reportError(cause);
    }
    return () => {
      generation++;
      controller?.dispose();
      cache.dispose();
      onController(null);
    };
  });

  $effect(() => {
    const current = controller;
    const requested = model;
    if (!current) return;
    if (!requested) {
      generation++;
      current.unloadModel();
      loaded = null; loading = false; error = null;
      return;
    }
    const token = ++generation;
    loaded = null; loading = true; error = null;
    void current.loadModel(requested).then(() => {
      if (token !== generation) return;
      loaded = requested;
      untrack(() => {
        current.setView(view);
        if (frame?.compiled.model === requested) current.update(frame);
        current.select(selectedPartId);
        onReady();
      });
    }).catch((cause: unknown) => {
      if (token === generation) reportError(cause);
    }).finally(() => {
      if (token === generation) loading = false;
    });
    return () => { if (token === generation) generation++; };
  });

  $effect(() => {
    revision;
    const current = controller;
    if (!current || !loaded || frame?.compiled.model !== loaded) return;
    try { current.update(frame); } catch (cause) { untrack(() => reportError(cause)); }
  });

  $effect(() => {
    const current = controller;
    const options = view;
    if (!current || !loaded) return;
    try { current.setView(options); } catch (cause) { untrack(() => reportError(cause)); }
  });

  $effect(() => {
    const current = controller;
    const selected = selectedPartId;
    if (!current || !loaded) return;
    try { current.select(selected); } catch (cause) { untrack(() => reportError(cause)); }
  });
</script>

<div class="robot-scene" aria-busy={loading}>
  <div class="canvas-host" style:visibility={loaded === model && model !== null ? 'visible' : 'hidden'} bind:this={host}></div>
  {#if loading}
    <div class="scene-status" role="status">Loading licensed component geometry…</div>
  {/if}
  {#if error}
    <div class="scene-error" role="alert"><strong>3D view unavailable</strong><p>{error}</p><p>Instructions, source links and inventory remain accessible. Reload the workbench after resolving the error.</p></div>
  {/if}
  <details class="scene-help">
    <summary>Camera help</summary>
    <p>Drag to orbit. Right-drag or two-finger drag to pan. Scroll or pinch to zoom.</p>
    <p>Focus the viewer: arrow keys orbit, Shift + arrows pan, + / − zoom, R resets, F focuses selection or active parts. Use the inventory to select any part.</p>
    <p>At time zero, the camera fits the staged inventory. Advancing playback or scrubbing starts the authored instruction views. Reset restores the current source view; Fit frames current component bounds. In simulation, Reset frames the robot without distant course props.</p>
    <p>Manual movement pauses automatic camera framing until Resume auto camera is selected.</p>
  </details>
</div>

<style>
  .robot-scene { position: relative; width: 100%; height: 100%; min-height: 0; overflow: hidden; background: var(--scene); border-radius: 8px; }
  .canvas-host { position: absolute; inset: 0; }
  .canvas-host :global(canvas:focus-visible) { outline: 3px solid var(--focus); }
  .scene-status, .scene-error { position: absolute; z-index: 2; left: 16px; right: 16px; top: 16px; padding: 14px 16px; background: var(--panel); color: var(--ink); border: 1px solid var(--control); border-radius: 6px; font: 14px/1.5 system-ui, sans-serif; }
  .scene-error { border-color: var(--accent); }
  .scene-error p { margin: 8px 0 0; }
  .scene-help { position: absolute; z-index: 3; bottom: 12px; left: 12px; max-width: min(340px, calc(100% - 24px)); color: var(--ink); background: var(--panel); border: 1px solid var(--control); border-radius: 6px; font: 12px/1.5 system-ui, sans-serif; }
  .scene-help summary { min-height: 44px; padding: 12px; cursor: pointer; box-sizing: border-box; }
  .scene-help summary:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
  .scene-help p { margin: 0; padding: 0 12px 12px; }
</style>
