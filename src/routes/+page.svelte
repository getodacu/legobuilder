<script lang="ts">
  import '../app.css';
  import { tick } from 'svelte';
  import Catalog from '#lib/components/Catalog.svelte';
  import { catalog } from '#lib/models/catalog.ts';
  import type { CatalogEntry } from '#lib/types/model.ts';

  let selected = $state<Extract<CatalogEntry, { status: 'available' }> | null>(null);
  let Workspace = $state.raw<typeof import('#lib/components/Workspace.svelte').default | null>(null);
  let workspaceError = $state('');
  let request = 0;

  async function open(entry: Extract<CatalogEntry, { status: 'available' }>) {
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
    await tick();
    if (id) document.getElementById(`open-${id}`)?.focus();
  }
</script>

<svelte:head>
  <title>{selected ? `${selected.identity.name} · RoboBuild` : 'RoboBuild · Assembly workbench'}</title>
  <meta name="description" content="A source-linked robotics assembly workbench. Explore genuine components, reversible assembly, and the evidence behind each build." />
</svelte:head>

<a class="skip-link" href="#main">Skip to workbench</a>
{#if selected}
  {#if Workspace}
    {#key selected.identity.id}
      <Workspace entry={selected} onBack={() => void back()} />
    {/key}
  {:else}
    <div class="workspace-loading">
      <header class="catalog-header"><button class="wordmark wordmark-button" onclick={() => void back()} aria-label="Back to build catalog"><span class="alignment-mark" aria-hidden="true"></span>RoboBuild</button></header>
      <main id="main" tabindex="-1" aria-busy={!workspaceError}>
        <p class="eyebrow">{selected.identity.manufacturer} / Assembly workbench</p>
        <h1>{selected.identity.name}</h1>
        {#if workspaceError}
          <div role="alert"><h2>Workbench could not load</h2><p>{workspaceError}</p></div>
          <button class="primary" onclick={() => { if (selected) void open(selected); }}>Retry workbench</button>
        {:else}
          <div role="status"><h2>Loading the 3D workbench…</h2><p>Downloading the viewer. Source-linked components load next.</p></div>
        {/if}
        <button onclick={() => void back()}>Back to builds</button>
      </main>
    </div>
  {/if}
{:else}
  <Catalog entries={catalog} onOpen={(entry) => void open(entry)} />
{/if}
