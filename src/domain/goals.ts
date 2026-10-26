import type { Goal } from "@/domain/types";

export function goalProgress(goal: Goal): number {
  if (goal.milestones.length === 0) return 0;
  const totalWeight = goal.milestones.reduce((sum, milestone) => sum + Math.max(0, milestone.weight || 1), 0);
  if (totalWeight === 0) return 0;
  const completedWeight = goal.milestones.reduce(
    (sum, milestone) => sum + (milestone.isCompleted ? Math.max(0, milestone.weight || 1) : 0),
    0,
  );
  return (completedWeight / totalWeight) * 100;
}
