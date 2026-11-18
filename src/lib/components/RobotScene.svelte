<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { GeometryLibrary } from '../geometry/cache';
  import { SceneController } from '../scene/controller';
  import type { AssemblyFrame, RendererController, RobotModel, ViewOptions } from '../types/model';

  let {
    model, frame, revision, view, viewArea, selectedPartId = null, guidedStepIndex,
    onController, onReady, onError, onSelect, onCameraOverride
  }: {
    model: RobotModel | null;
    frame: AssemblyFrame | null;
    revision: number;
    view: ViewOptions;
    viewArea?: HTMLElement;
    selectedPartId?: string | null;
    guidedStepIndex?: number;
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
  let generation = 0;

  const reportError = (cause: unknown) => {
    const failure = cause instanceof Error ? cause : new Error(String(cause));
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

  $effect(() => { controller?.setViewArea(viewArea); });

  $effect(() => {
    const current = controller;
    const requested = model;
    if (!current) return;
    if (!requested) {
      generation++;
      current.unloadModel();
      loaded = null; loading = false;
      return;
    }
    const token = ++generation;
    loaded = null; loading = true;
    void current.loadModel(requested).then(() => {
      if (token !== generation) return;
      loaded = requested;
      untrack(() => {
        current.setView(view);
        if (frame?.compiled.model === requested) current.update(frame, guidedStepIndex);
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
    try { current.update(frame, guidedStepIndex); } catch (cause) { untrack(() => reportError(cause)); }
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
</div>

<style>
  .robot-scene { position: relative; width: 100%; height: 100%; min-height: 0; overflow: hidden; background: var(--scene); }
  .canvas-host { position: absolute; inset: 0; }
  .canvas-host :global(canvas:focus-visible) { outline: 3px solid var(--focus); }
</style>
