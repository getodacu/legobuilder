<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { CatalogEntry } from '#lib/types/model.ts';

  let { entries, visits, onOpen }: { entries: CatalogEntry[]; visits: Record<string, { timeMs: number; installed: number; total: number; steps: number }>; onOpen: (entry: Extract<CatalogEntry, { status: 'available' }>) => void } = $props();
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
    <span class="eyebrow">Assembly workbench / 01</span>
    <a class="quiet-link" href="https://education.lego.com/en-us/product-resources/spike-prime/downloads/building-instructions/" target="_blank" rel="noreferrer">Official building resources ↗</a>
  </header>
  <main id="main" class="catalog-main">
    <div class="catalog-intro">
      <div><p class="eyebrow">Understand what holds it together.</p><h1>From individual parts.<br />To working principles.</h1></div>
      <div class="intro-note"><span class="section-number">01 — THE BUILDS</span><p>Explore the mechanics, follow the source, inspect every connection. Real component geometry. Assembly you can rewind.</p><p class="small">Reconstruction is in progress. Coverage is shown separately from the complete official build.</p></div>
    </div>
    <div class="catalog-divider"><h2>Choose your workbench</h2><span>{entries.length} source-backed builds</span></div>
    <p class="catalog-readiness small" role="status">{mounted ? 'Workbench controls ready.' : 'Initializing controls… Build and source actions will be available shortly.'}</p>
    <noscript><p class="notice">Enable JavaScript to open interactive workbenches and source dialogs. Official building resources remain available above.</p></noscript>
    <div class="catalog-grid">
      {#each entries as entry, index (entry.identity.id)}
        {@const partial = entry.coverage.implementedSteps < entry.coverage.documentedSteps}
        {@const fitUnchecked = entry.coverage.verifiedSteps < entry.coverage.documentedSteps || entry.coverage.dimensions.placement.status !== 'complete'}
        {@const visit = visits[entry.identity.id]}
        <article class:available={entry.status === 'available'} class="build-card">
          <div class="card-preview">
            <span class="card-index">{String(index + 1).padStart(2, '0')}</span>
            {#if entry.status === 'available' && !failedPreviews.includes(entry.identity.id)}
              <img src={entry.previewUrl} alt={`${entry.identity.name} component preview; ${entry.coverage.implementedSteps}/${entry.coverage.documentedSteps} instructions authored${fitUnchecked ? ', physical fit remains unverified' : ''}`} onerror={() => failedPreviews = [...failedPreviews, entry.identity.id]} />
            {:else}
              <div class="typographic-preview"><span class="preview-cross" aria-hidden="true">+</span><strong>{entry.status === 'available' ? 'Reconstruction preview unavailable' : entry.identity.manufacturer.toLowerCase().includes('vex') ? 'App geometry permission blocked' : 'Reconstruction not available'}</strong><span>{entry.status === 'available' ? 'Open the workbench to view the actual CAD geometry.' : 'Source record · no app model or invented preview'}</span></div>
            {/if}
            <span class="coverage-badge">{partial ? 'Partial reconstruction · ' : fitUnchecked ? 'Assembly authored · fit unchecked · ' : ''}{entry.coverage.implementedSteps}/{entry.coverage.documentedSteps} source steps implemented</span>
          </div>
          <div class="card-body">
            <div class="card-category"><span>{entry.identity.manufacturer}</span><span>{entry.identity.category}</span></div>
            <h3>{entry.identity.name}</h3>
            <p>{entry.identity.description}</p>
            <dl class="card-facts"><div><dt>Edition</dt><dd>{entry.identity.edition}</dd></div><div><dt>Complexity</dt><dd>{entry.identity.complexity}</dd></div><div><dt>Inventory scope</dt><dd>{entry.coverage.dimensions.inventory.note}</dd></div><div><dt>Verified reconstruction</dt><dd>{entry.coverage.verifiedSteps} source steps · {entry.coverage.verifiedComponents} components</dd></div></dl>
            {#if entry.status === 'available'}
              <div class="visit-progress" aria-label={`${entry.identity.name} visit progress`}>
                {#if visit && visit.timeMs > 0}<strong>{visit.steps === entry.coverage.documentedSteps ? 'Authored assembly reached' : 'Paused this visit'}</strong><span>{visit.installed}/{visit.total} robot units · {visit.steps}/{entry.coverage.documentedSteps} source steps</span><progress value={visit.steps} max={entry.coverage.documentedSteps} aria-label={`${entry.identity.name} source-step progress`}></progress>{:else}<span>Not started this visit</span>{/if}
              </div>
              <button id={`open-${entry.identity.id}`} class="primary card-action" disabled={!mounted} onclick={() => onOpen(entry)}>{visit && visit.timeMs > 0 ? 'Resume' : 'Open'} {partial ? 'partial ' : ''}workbench <span aria-hidden="true">↗</span></button>
            {:else}
              <button class="secondary card-action" disabled={!mounted} onclick={(event) => showSources(entry, event)}>View sources & limitations <span aria-hidden="true">↗</span></button>
            {/if}
          </div>
        </article>
      {/each}
    </div>
    <footer class="catalog-footer"><p>Built around evidence, not approximations disguised as completion. <a href="/models/library/CREDITS.txt" target="_blank" rel="noreferrer">Geometry & preview credits ↗</a></p><span>Independent learning tool. Not affiliated with or endorsed by LEGO Education or VEX Robotics.</span></footer>
  </main>
</div>

<dialog bind:this={sourcesDialog} class="source-dialog" onclose={() => sourceTrigger?.focus()} aria-labelledby="sources-title">
  {#if sourceEntry}
    <div class="dialog-heading"><span class="eyebrow">Source record</span><button aria-label="Close sources" onclick={() => sourcesDialog.close()}>Close ×</button></div>
    <h2 id="sources-title">{sourceEntry.identity.name}</h2>
    <p>{sourceEntry.identity.edition}</p>
    <div class="notice"><strong>Reconstruction unavailable</strong><ul>{#each sourceEntry.blockers as blocker}<li>{blocker}</li>{/each}</ul></div>
    <h3>Authoritative documents</h3>
    <ul class="source-list">{#each sourceEntry.sourceDocuments as document}<li><a href={document.sourceUrl} target="_blank" rel="noreferrer">{document.title} ↗</a><span>{document.edition}{document.pageCount ? ` · ${document.pageCount} PDF pages` : ''}</span></li>{/each}</ul>
    <h3>Coverage & accounting</h3><p>{sourceEntry.coverage.dimensions.inventory.note}</p><p>{sourceEntry.coverage.dimensions.geometry.note}</p>
    <ul>{#each sourceEntry.coverage.outstandingDeviations as deviation}<li>{deviation}</li>{/each}</ul>
    <p class="small">Required demonstration, not yet implemented: {sourceEntry.requiredScenario}</p>
    <p class="small">Sources are linked, not redistributed. A public download does not imply permission to convert or redistribute app geometry.</p>
  {/if}
</dialog>

<style>
  .visit-progress{display:flex;flex-direction:column;gap:4px;margin:16px 0;font-size:12px;color:var(--muted)}.visit-progress strong{color:var(--ink)}.visit-progress progress{width:100%;height:5px;accent-color:var(--teal)}
</style>
