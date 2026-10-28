<script lang="ts">
  import { onMount } from 'svelte';
  import type { CatalogEntry } from '#lib/types/model.ts';

  let { entries, visits, onOpen }: { entries: CatalogEntry[]; visits: Record<string, { timeMs: number; installed: number; total: number; steps: number; complete: boolean }>; onOpen: (entry: CatalogEntry) => void } = $props();
  let failedPreviews = $state<string[]>([]);
  let mounted = $state(false);
  onMount(() => { mounted = true; });
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
    <div class="catalog-divider"><h2>Choose your build</h2><span>{entries.length} interactive guides</span></div>
    <p class="catalog-readiness sr-only" role="status">{mounted ? 'Building guides ready.' : 'Preparing building guides…'}</p>
    <noscript><p class="notice">Enable JavaScript to open the 3D guides. Official building instructions are available above.</p></noscript>
    <div class="catalog-grid">
      {#each entries as entry (entry.identity.id)}
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
      {/each}
    </div>
    <footer class="catalog-footer"><p>Progress is kept for this visit. Reloading starts a new visit.</p><span>Independent building guides. Not affiliated with LEGO Education. <a href="/models/library/CREDITS.txt" target="_blank" rel="noreferrer">Credits & licenses ↗</a></span></footer>
  </main>
</div>


<style>
  .visit-progress{display:flex;flex-direction:column;gap:4px;margin:16px 0;font-size:12px;color:var(--muted)}.visit-progress progress{width:100%;height:5px;accent-color:var(--teal)}
</style>
