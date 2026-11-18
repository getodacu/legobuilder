<script lang="ts">
  import type { CompiledAssembly } from '#lib/types/model.ts';
  let { compiled, timeMs, running, resumable, speed, disabled, onSeek, onSeekSettled, onPlayStep, onPlayAll, onPause, onResume, onReverse, onPrevious, onNext, onSpeed, onMilestone }: {
    compiled: CompiledAssembly; timeMs: number; running: boolean; resumable: boolean; speed: number; disabled: boolean;
    onSeekSettled: () => void;
    onSeek: (time: number) => void; onPlayStep: () => void; onPlayAll: () => void; onPause: () => void; onResume: () => void; onReverse: () => void; onPrevious: () => void; onNext: () => void; onSpeed: (speed: number) => void; onMilestone: (stepId: string) => void;
  } = $props();
  const timestamp = (time: number) => `${Math.floor(time / 60000)}:${(time / 1000 % 60).toFixed(1).padStart(4, '0')}`;
</script>

<section class="timeline" aria-label="Assembly timeline">
  <label for="assembly-seek" class="sr-only">Assembly position</label>
  <input id="assembly-seek" class="seek-range" type="range" min="0" max={compiled.durationMs} step="1" value={timeMs} disabled={disabled} aria-valuetext={`${(timeMs / 1000).toFixed(1)} seconds of ${(compiled.durationMs / 1000).toFixed(1)} seconds of animation; not physical building time`} oninput={(event) => onSeek(Number(event.currentTarget.value))} onchange={onSeekSettled} />
  <div class="transport-row">
    <div class="transport-primary">
      <button class="control-key" aria-label="Previous step" title="Previous step [" disabled={timeMs <= 0} onclick={onPrevious}><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 6v12m14-6H9m5-5-5 5 5 5" /></svg> Previous</button>
      <button class="control-key control-key-primary" disabled={disabled || (!running && !resumable && timeMs >= compiled.durationMs)} onclick={() => { if (running) onPause(); else if (resumable) onResume(); else onPlayStep(); }}><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">{#if running}<path d="M9 6v12m6-12v12" />{:else}<path d="m9 6 9 6-9 6Z" fill="currentColor" />{/if}</svg> {running ? 'Pause' : resumable ? 'Resume' : 'Play step'}</button>
      <button class="control-key" aria-label="Next step" title="Next step ]" disabled={timeMs >= compiled.durationMs} onclick={onNext}>Next <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 6v12M5 12h10m-5-5 5 5-5 5" /></svg></button>
    </div>
    <details class="playback-options" name="workspace-options">
      <summary class="control-key" aria-label="Playback options" title="Playback options"><span class="playback-options-label">Playback</span><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h9m4 0h3M4 17h3m4 0h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></svg></summary>
      <div class="playback-options-content">
        <h3>Playback options</h3>
        <div class="transport-selects">
          <label>Speed <select value={String(speed)} disabled={disabled} onchange={(event) => onSpeed(Number(event.currentTarget.value))}><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></label>
          <label>Milestones <select value="" disabled={!compiled.model.milestones.length} onchange={(event) => { if (event.currentTarget.value) onMilestone(event.currentTarget.value); event.currentTarget.value = ''; }}><option value="">Jump to…</option>{#each compiled.model.milestones as milestone}<option value={milestone.stepId}>{milestone.title}</option>{/each}</select></label>
        </div>
        <div class="transport-secondary"><button class="control-key" disabled={disabled || timeMs >= compiled.durationMs} onclick={onPlayAll}>Play all</button><button class="control-key" disabled={disabled || timeMs <= 0} onclick={onReverse}>Reverse</button></div>
        <p class="small">Animation time <output>{timestamp(timeMs)} / {timestamp(compiled.durationMs)}</output></p>
        <p class="small">Seeking pauses playback. Reverse replays the animation; it is not a safe disassembly procedure.</p>
      </div>
    </details>
  </div>
</section>
