<script lang="ts">
  import { onMount } from 'svelte';
  import { officialInstructionsIndex } from './GuideOpenError.svelte';
  import type { CatalogEntry } from '#lib/types/model.ts';
  import type { GuideProgress } from './guide-progress.ts';

  let { entries, progress, persistenceFailed, onOpen }: {
    entries: CatalogEntry[]; progress: Partial<Record<string, GuideProgress>>; persistenceFailed: boolean;
    onOpen: (entry: CatalogEntry) => void;
  } = $props();
  let failedPreviews = $state<string[]>([]);
  let mounted = $state(false);
  onMount(() => { mounted = true; });
  const outcomes: Record<string, string> = {
    'robotic-hand': 'Make a hand that grips and lets go.',
    'advanced-driving-base': 'Build a robot that rolls and turns.',
    'quality-check': 'Build a robot head that reacts to a simulated color.',
    'package-sorter': 'Build a sorter and watch its motors move. The preview can’t pick up or sort packages.'
  };
  const ordered = $derived([...entries.filter((entry) => entry.identity.id === 'robotic-hand'), ...entries.filter((entry) => entry.identity.id !== 'robotic-hand')]);
</script>

<div class="catalog-shell">
  <header class="catalog-header">
    <a href="/" class="wordmark" aria-label="RoboBuild home"><span class="alignment-mark" aria-hidden="true"></span>RoboBuild</a>
    <a class="quiet-link" href={officialInstructionsIndex} target="_blank" rel="noreferrer">Official building instructions ↗</a>
  </header>
  <main id="main" class="catalog-main" tabindex="-1">
    <div class="catalog-intro">
      <h1><span>Make something</span> <span>that moves.</span></h1>
      <div class="intro-note">
        <p>Find the pieces. Watch where they go. Build, then choose Next.</p>
        <p class="small">For the real build, use the official instructions. Don’t force pieces. If they don’t fit, ask an adult.</p>
      </div>
    </div>
    <p class="catalog-readiness sr-only" role="status">{mounted ? 'Building guides ready.' : 'Preparing building guides…'}</p>
    <noscript><p class="notice">Enable JavaScript to open the 3D guides. Official building instructions are available above.</p></noscript>
    <div class="catalog-grid">
      {#each ordered as entry (entry.identity.id)}
        {@const hand = entry.identity.id === 'robotic-hand'}
        {@const checkpoint = progress[entry.identity.id]}
        <article class="build-card available" class:has-progress={!!checkpoint}>
          <div class="card-preview">
            {#if !failedPreviews.includes(entry.identity.id)}
              <img src={entry.previewUrl} alt={`${entry.identity.name} robot`} width="900" height="620" loading={hand ? 'eager' : 'lazy'} onerror={() => failedPreviews = [...failedPreviews, entry.identity.id]} />
            {:else}<div class="typographic-preview">Preview unavailable</div>{/if}
          </div>
          <div class="card-body">
            <h2>{entry.identity.name}</h2>
            {#if hand}<strong class="featured-note">Start here · Shortest guide</strong>{/if}
            <p>{outcomes[entry.identity.id]}</p>
            <p class="card-steps">{entry.coverage.implementedSteps} numbered steps{hand ? ' + wiring' : ''}</p>
            {#if checkpoint}
              <p class="guide-progress">{checkpoint.complete ? 'End of guide reached' : hand && checkpoint.steps === entry.coverage.documentedSteps ? 'Wiring remains' : `${checkpoint.steps} of ${entry.coverage.documentedSteps} guide steps reached`}</p>
            {/if}
            <dl class="build-facts">
              <div><dt>Edition</dt><dd>{entry.identity.edition}</dd></div>
              <div><dt>Manufacturer</dt><dd>{entry.identity.manufacturer}</dd></div>
              <div><dt>Complexity</dt><dd>{entry.identity.complexity}</dd></div>
              <div><dt>Inventory</dt><dd>{entry.coverage.modeledComponents} tracked units</dd></div>
              <div><dt>Authored guide coverage</dt><dd>{entry.coverage.implementedSteps} of {entry.coverage.documentedSteps} numbered steps</dd></div>
            </dl>
            <button id={`open-${entry.identity.id}`} class="card-action" class:primary={hand} disabled={!mounted} onclick={() => onOpen(entry)}>{checkpoint ? 'Continue' : 'Start'} {entry.identity.name} <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg></button>
          </div>
        </article>
      {/each}
    </div>
    <footer class="catalog-footer">
      <p>{persistenceFailed ? 'Your place is kept while this page stays open.' : 'Saved in this browser. On a shared device, use Start over in the guide when your group is done.'}</p>
      <span>Independent building guides. Not affiliated with LEGO Education. <a href="/models/library/CREDITS.txt" target="_blank" rel="noreferrer">Credits & licenses ↗</a></span>
    </footer>
  </main>
</div>
