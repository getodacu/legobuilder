export type GuideProgress = {
  timeline: string;
  timeMs: number;
  heldStepId: string | null;
  steps: number;
  complete: boolean;
};

export const guideProgressKey = (id: string) => `robobuild-guide-v1:${id}`;

export function parseGuideProgress(json: string | null, maxSteps: number): GuideProgress | undefined {
  if (json === null) return;
  let value: unknown;
  try { value = JSON.parse(json); } catch { return; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const { timeline, timeMs, heldStepId, steps, complete } = value as Record<string, unknown>;
  if (typeof timeline !== 'string' || typeof timeMs !== 'number' || !Number.isFinite(timeMs) || timeMs < 0 ||
    (heldStepId !== null && typeof heldStepId !== 'string') || typeof steps !== 'number' ||
    !Number.isInteger(steps) || steps < 0 || steps > maxSteps || typeof complete !== 'boolean') return;
  return { timeline, timeMs, heldStepId, steps, complete };
}
