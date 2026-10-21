<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { CatalogEntry } from '#lib/types/model.ts';

  let { entries, visits, onOpen }: { entries: CatalogEntry[]; visits: Record<string, { timeMs: number; installed: number; total: number; steps: number; complete: boolean }>; onOpen: (entry: Extract<CatalogEntry, { status: 'available' }>) => void } = $props();
  let failedPreviews = $state<string[]>([]);
  let mounted = $state(false);
  onMount(() => { mounted = true; });
  let sourceEntry = $state<Extract<CatalogEntry, { status: 'blocked' }> | null>(null);
  let sourcesDialog: HTMLDialogElement;
  let sourceTrigger: HTMLElement | null = null;

  async function showSources(entry: Extract<CatalogEntry, { status: 'blocked' }>, event: MouseEvent) {
    sourceTrigger = event.currentTarget as HTMLElement;
    sourceEntry = entry;
    await tick();
    sourcesDialog.showModal();
  }
</script>

<div class="catalog-shell">
  <header class="catalog-header">
    <a href="/" class="wordmark" aria-label="RoboBuild home"><span class="alignment-mark" aria-hidden="true"></span>RoboBuild</a>
    <a class="quiet-link" href="https://education.lego.com/en-us/product-resources/spike-prime/downloads/building-instructions/" target="_blank" rel="noreferrer">Official building instructions ↗</a>
  </header>
  <main id="main" class="catalog-main">
    <div class="catalog-intro">
      <div><p class="eyebrow">One part. One step. Your robot.</p><h1>Make something<br />that moves.</h1></div>
      <div class="intro-note"><p>Choose a robot, gather your parts, and follow the build in 3D. Rotate the model, replay a tricky step, and pick up where you left off.</p><p class="small">These guides have not been fully checked on physical robots. Compare connections with the official instructions, and never force a fit.</p></div>
    </div>
    <div class="catalog-divider"><h2>Choose your build</h2><span>{entries.filter((entry) => entry.status === 'available').length} interactive guides</span></div>
    <p class="catalog-readiness sr-only" role="status">{mounted ? 'Building guides ready.' : 'Preparing building guides…'}</p>
    <noscript><p class="notice">Enable JavaScript to open the 3D guides. Official building instructions are available above.</p></noscript>
    <div class="catalog-grid">
      {#each entries as entry (entry.identity.id)}
        {#if entry.status === 'available'}
          {@const visit = visits[entry.identity.id]}
          <article class="build-card available">
            <div class="card-preview">
              {#if !failedPreviews.includes(entry.identity.id)}
                <img src={entry.previewUrl} alt={`${entry.identity.name} robot`} onerror={() => failedPreviews = [...failedPreviews, entry.identity.id]} />
              {:else}<div class="typographic-preview"><span class="preview-cross" aria-hidden="true">+</span><strong>Preview unavailable</strong><span>Open the guide to view this robot in 3D.</span></div>{/if}
              <span class="coverage-badge">{entry.coverage.implementedSteps} steps{entry.coverage.implementedSteps < entry.coverage.documentedSteps ? ` of ${entry.coverage.documentedSteps} available` : ''}</span>
            </div>
            <div class="card-body">
              <div class="card-category"><span>{entry.identity.manufacturer}</span><span>{entry.identity.complexity}</span></div>
              <h3>{entry.identity.name}</h3>
              <p>{entry.identity.description}</p>
              <div class="visit-progress" aria-label={`${entry.identity.name} visit progress`}>
                {#if visit && visit.timeMs > 0}
                  <span>{visit.complete ? 'Guide completed' : visit.steps === entry.coverage.documentedSteps ? 'Finish the remaining steps' : `${visit.steps} steps completed this visit`}</span>
                  <progress value={visit.steps} max={entry.coverage.documentedSteps} aria-label={`${entry.identity.name} numbered instruction progress`}></progress>
                {:else}<span>Ready when you are</span>{/if}
              </div>
              <button id={`open-${entry.identity.id}`} class="primary card-action" disabled={!mounted} onclick={() => onOpen(entry)}>{visit && visit.timeMs > 0 ? 'Continue building' : 'Start building'} <span aria-hidden="true">→</span></button>
            </div>
          </article>
        {/if}
      {/each}
    </div>
    {#each entries as entry}
      {#if entry.status === 'blocked'}
        <article class="unavailable-build">
          <div><span class="eyebrow">Guide unavailable</span><h3>{entry.identity.name}</h3><p>The 3D guide is unavailable because permission to use the model has not been secured. You can still open the official instructions.</p></div>
          <button class="secondary" disabled={!mounted} onclick={(event) => showSources(entry, event)}>Instructions & availability ↗</button>
        </article>
      {/if}
    {/each}
    <footer class="catalog-footer"><p>Progress is kept for this visit. Reloading starts a new visit.</p><span>Independent building guides. Not affiliated with LEGO Education or VEX Robotics. <a href="/models/library/CREDITS.txt" target="_blank" rel="noreferrer">Credits & licenses ↗</a></span></footer>
  </main>
</div>

<dialog bind:this={sourcesDialog} class="source-dialog" onclose={() => sourceTrigger?.focus()} aria-labelledby="sources-title">
  {#if sourceEntry}
    <div class="dialog-heading"><span class="eyebrow">Instructions & availability</span><button aria-label="Close sources" onclick={() => sourcesDialog.close()}>Close ×</button></div>
    <h2 id="sources-title">{sourceEntry.identity.name}</h2>
    <p>{sourceEntry.identity.edition}</p>
    <div class="notice"><strong>3D guide unavailable</strong><ul>{#each sourceEntry.blockers as blocker}<li>{blocker}</li>{/each}</ul></div>
    <h3>Official instructions</h3>
    <ul class="source-list">{#each sourceEntry.sourceDocuments as document}<li><a href={document.sourceUrl} target="_blank" rel="noreferrer">{document.title} ↗</a><span>{document.edition}{document.pageCount ? ` · ${document.pageCount} PDF pages` : ''}</span></li>{/each}</ul>
    <h3>Coverage & accounting</h3><p>{sourceEntry.coverage.dimensions.inventory.note}</p><p>{sourceEntry.coverage.dimensions.geometry.note}</p>
    <ul>{#each sourceEntry.coverage.outstandingDeviations as deviation}<li>{deviation}</li>{/each}</ul>
    <p class="small">Required demonstration, not yet implemented: {sourceEntry.requiredScenario}</p>
    <p class="small">Sources are linked, not redistributed. A public download does not imply permission to convert or redistribute app geometry.</p>
  {/if}
</dialog>

<style>
  .visit-progress{display:flex;flex-direction:column;gap:4px;margin:16px 0;font-size:12px;color:var(--muted)}.visit-progress progress{width:100%;height:5px;accent-color:var(--teal)}
</style>
