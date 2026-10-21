<script lang="ts">
  import type { CompiledAssembly } from '#lib/types/model.ts';
  let { compiled, timeMs, running, resumable, speed, disabled, onSeek, onPlayStep, onPlayAll, onPause, onResume, onReverse, onPrevious, onNext, onSpeed, onMilestone }: {
    compiled: CompiledAssembly; timeMs: number; running: boolean; resumable: boolean; speed: number; disabled: boolean;
    onSeek: (time: number) => void; onPlayStep: () => void; onPlayAll: () => void; onPause: () => void; onResume: () => void; onReverse: () => void; onPrevious: () => void; onNext: () => void; onSpeed: (speed: number) => void; onMilestone: (stepId: string) => void;
  } = $props();
  const timestamp = (time: number) => `${Math.floor(time / 60000)}:${(time / 1000 % 60).toFixed(1).padStart(4, '0')}`;
</script>

<section class="timeline" aria-label="Assembly timeline">
  <label for="assembly-seek" class="sr-only">Assembly position</label>
  <input id="assembly-seek" class="seek-range" type="range" min="0" max={compiled.durationMs} step="1" value={timeMs} disabled={disabled} aria-valuetext={`${(timeMs / 1000).toFixed(1)} seconds of ${(compiled.durationMs / 1000).toFixed(1)} seconds of animation; not physical building time`} oninput={(event) => onSeek(Number(event.currentTarget.value))} />
  <div class="transport-row">
    <div class="transport-primary">
      <button aria-label="Previous step" title="Previous step [" disabled={disabled || timeMs <= 0} onclick={onPrevious}><span aria-hidden="true">←</span> Previous</button>
      <button class="primary" disabled={disabled || (!running && !resumable && timeMs >= compiled.durationMs)} onclick={() => { if (running) onPause(); else if (resumable) onResume(); else onPlayStep(); }}><span aria-hidden="true">{running ? 'Ⅱ' : '▷'}</span> {running ? 'Pause' : resumable ? 'Resume' : 'Play step'}</button>
      <button aria-label="Next step" title="Next step ]" disabled={disabled || timeMs >= compiled.durationMs} onclick={onNext}>Next <span aria-hidden="true">→</span></button>
    </div>
    <details class="playback-options">
      <summary aria-label="Playback options">More</summary>
      <div class="playback-options-content">
        <h3>Playback options</h3>
        <div class="transport-selects">
          <label>Speed <select value={String(speed)} disabled={disabled} onchange={(event) => onSpeed(Number(event.currentTarget.value))}><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></label>
          <label>Milestones <select value="" disabled={disabled || !compiled.model.milestones.length} onchange={(event) => { if (event.currentTarget.value) onMilestone(event.currentTarget.value); event.currentTarget.value = ''; }}><option value="">Jump to…</option>{#each compiled.model.milestones as milestone}<option value={milestone.stepId}>{milestone.title}</option>{/each}</select></label>
        </div>
        <div class="transport-secondary"><button disabled={disabled || timeMs >= compiled.durationMs} onclick={onPlayAll}>Play all</button><button disabled={disabled || timeMs <= 0} onclick={onReverse}>Reverse</button></div>
        <p class="small">Animation time <output>{timestamp(timeMs)} / {timestamp(compiled.durationMs)}</output></p>
        <p class="small">Seeking pauses playback. Reverse replays the animation; it is not a safe disassembly procedure.</p>
      </div>
    </details>
  </div>
</section>
