<script lang="ts">
  import type { CompiledAssembly } from '#lib/types/model.ts';
  let { compiled, timeMs, running, resumable, speed, disabled, onSeek, onPlayStep, onPlayAll, onPause, onResume, onReverse, onPrevious, onNext, onSpeed, onMilestone }: {
    compiled: CompiledAssembly; timeMs: number; running: boolean; resumable: boolean; speed: number; disabled: boolean;
    onSeek: (time: number) => void; onPlayStep: () => void; onPlayAll: () => void; onPause: () => void; onResume: () => void; onReverse: () => void; onPrevious: () => void; onNext: () => void; onSpeed: (speed: number) => void; onMilestone: (stepId: string) => void;
  } = $props();
  const timestamp = (time: number) => `${Math.floor(time / 60000)}:${(time / 1000 % 60).toFixed(1).padStart(4, '0')}`;
</script>

<section class="timeline" aria-label="Assembly timeline">
  <div class="timeline-top"><label for="assembly-seek">Assembly position <output for="assembly-seek">{timestamp(timeMs)} / {timestamp(compiled.durationMs)}</output></label><span class="small">Manual seeking pauses playback</span></div>
  <input id="assembly-seek" class="seek-range" type="range" min="0" max={compiled.durationMs} step="1" value={timeMs} disabled={disabled} aria-valuetext={`${(timeMs / 1000).toFixed(1)} seconds of ${(compiled.durationMs / 1000).toFixed(1)} seconds; source steps, not real assembly time`} oninput={(event) => onSeek(Number(event.currentTarget.value))} />
  <div class="transport-row">
    <div class="transport-primary">
      <button class="icon-button" aria-label="Previous source-step boundary" title="Previous source-step boundary [" disabled={disabled || timeMs <= 0} onclick={onPrevious}>|←</button>
      <button class="primary" disabled={disabled || timeMs >= compiled.durationMs} onclick={onPlayStep}>▷ Play step</button>
      {#if running}<button class="pause-button" onclick={onPause}>Ⅱ Pause</button>{:else}<button disabled={disabled || !resumable} onclick={onResume}>Resume</button>{/if}
      <button class="icon-button" aria-label="Next source-step boundary" title="Next source-step boundary ]" disabled={disabled || timeMs >= compiled.durationMs} onclick={onNext}>→|</button>
    </div>
    <div class="transport-secondary"><button disabled={disabled || timeMs >= compiled.durationMs} onclick={onPlayAll}>Play all</button><button disabled={disabled || timeMs <= 0} onclick={onReverse}>← Reverse</button></div>
    <div class="transport-selects">
      <label>Speed <select value={String(speed)} disabled={disabled} onchange={(event) => onSpeed(Number(event.currentTarget.value))}><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></label>
      <label>Milestones <select value="" disabled={disabled || !compiled.model.milestones.length} onchange={(event) => { if (event.currentTarget.value) onMilestone(event.currentTarget.value); event.currentTarget.value = ''; }}><option value="">Jump to…</option>{#each compiled.model.milestones as milestone}<option value={milestone.stepId}>{milestone.title}</option>{/each}</select></label>
    </div>
  </div>
  <p class="transport-footnote">Installed counts commit at each instance’s seating event; in-flight parts remain pending. Reverse is an explanation, not a safe disassembly procedure.</p>
</section>
