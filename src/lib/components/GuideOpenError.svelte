<script module lang="ts">
  export const officialInstructionsIndex = 'https://education.lego.com/en-us/product-resources/spike-prime/downloads/building-instructions/';
</script>

<script lang="ts">
  let { error, onRetry, onBack }: { error: string; onRetry: () => void; onBack: () => void } = $props();
</script>

<div class="guide-error">
  <h2 role="alert" aria-live="polite">This guide couldn’t open. Try again or use the official instructions.</h2>
  <div class="recovery-actions">
    <button class="primary" onclick={onRetry}>Retry</button>
    <button onclick={onBack}>All builds</button>
    <a class="button-link" href={officialInstructionsIndex} target="_blank" rel="noreferrer">Official building instructions ↗</a>
  </div>
  <details><summary>Technical details</summary><p>{error}</p></details>
</div>
