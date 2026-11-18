<script lang="ts">
  import '../app.css';
  import { onMount, tick } from 'svelte';
  import Catalog from '#lib/components/Catalog.svelte';
  import GuideOpenError from '#lib/components/GuideOpenError.svelte';
  import { guideProgressKey, parseGuideProgress, type GuideProgress } from '#lib/components/guide-progress.ts';
  import { catalog } from '#lib/models/catalog.ts';
  import type { CatalogEntry } from '#lib/types/model.ts';

  let selected = $state<CatalogEntry | null>(null);
  let Workspace = $state.raw<typeof import('#lib/components/Workspace.svelte').default | null>(null);
  let workspaceError = $state('');
  let progress = $state.raw<Partial<Record<string, GuideProgress>>>({});
  let persistenceFailed = $state(false);
  let initialProgress = $state.raw<GuideProgress | undefined>();
  let request = 0;

  onMount(() => {
    try {
      for (const entry of catalog) {
        const id = entry.identity.id;
        const checkpoint = parseGuideProgress(localStorage.getItem(guideProgressKey(id)), entry.coverage.documentedSteps);
        if (checkpoint) progress[id] = checkpoint;
      }
      progress = { ...progress };
    } catch { persistenceFailed = true; }
    const id = new URL(location.href).searchParams.get('build');
    const entry = catalog.find((candidate) => candidate.identity.id === id);
    if (entry) void open(entry);
  });

  function retryWorkspace() {
    if (!selected) return;
    const url = new URL(location.href);
    url.searchParams.set('build', selected.identity.id);
    history.replaceState(history.state, '', url);
    location.reload();
  }

  function saveProgress(id: string, checkpoint: GuideProgress | null) {
    const next = { ...progress };
    if (checkpoint) next[id] = checkpoint;
    else delete next[id];
    progress = next;
    try {
      if (checkpoint) localStorage.setItem(guideProgressKey(id), JSON.stringify(checkpoint));
      else localStorage.removeItem(guideProgressKey(id));
    } catch { persistenceFailed = true; }
  }

  function resetProgress(id: string) {
    try { localStorage.removeItem(guideProgressKey(id)); }
    catch { return false; }
    const next = { ...progress };
    delete next[id]; progress = next;
    initialProgress = undefined;
    return true;
  }

  async function open(entry: CatalogEntry) {
    initialProgress = progress[entry.identity.id];
    selected = entry;
    workspaceError = '';
    const current = ++request;
    await tick();
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
    try {
      const module = await import('#lib/components/Workspace.svelte');
      if (current !== request) return;
      Workspace = module.default;
      await tick();
      document.getElementById('main')?.focus({ preventScroll: true });
    } catch (error) {
      if (current === request) workspaceError = error instanceof Error ? error.message : String(error);
    }
  }

  async function back() {
    const id = selected?.identity.id;
    request++;
    selected = null;
    workspaceError = '';
    const url = new URL(location.href);
    if (url.searchParams.has('build')) {
      url.searchParams.delete('build');
      history.replaceState(history.state, '', url);
    }
    await tick();
    if (id) document.getElementById(`open-${id}`)?.focus();
  }
</script>

<svelte:head>
  <title>{selected ? `${selected.identity.name} · RoboBuild` : 'RoboBuild · Build your robot'}</title>
  <meta name="description" content="Build your robot one step at a time with interactive 3D instructions, parts lists and links to the official building manuals." />
</svelte:head>

<a class="skip-link" href="#main">Skip to workbench</a>
{#if selected}
  {#if Workspace}
    {#key selected.identity.id}
      {@const id = selected.identity.id}
      <Workspace entry={selected} {initialProgress} {persistenceFailed} onProgress={(checkpoint) => saveProgress(id, checkpoint)} onReset={() => resetProgress(id)} onBack={() => void back()} />
    {/key}
  {:else}
    <div class="workspace-loading">
      <header class="catalog-header"><button class="wordmark wordmark-button" onclick={() => void back()} aria-label="Back to build catalog"><span class="alignment-mark" aria-hidden="true"></span>RoboBuild</button></header>
      <main id="main" tabindex="-1" aria-busy={!workspaceError}>
        <p class="eyebrow">{selected.identity.manufacturer} / Assembly workbench</p>
        <h1>{selected.identity.name}</h1>
        {#if workspaceError}
          <GuideOpenError error={workspaceError} onRetry={retryWorkspace} onBack={() => void back()} />
        {:else}
          <div role="status"><h2>Opening your building guide…</h2></div>
          <button onclick={() => void back()}>All builds</button>
        {/if}
      </main>
    </div>
  {/if}
{:else}
  <Catalog entries={catalog} {progress} {persistenceFailed} onOpen={(entry) => void open(entry)} />
{/if}
