import { useGetAllGoalsQuery } from "@/features/goal/goalAPI";
import GoalCard from "@/components/goal/goal-card";

export default function GoalsSummary() {
  const { data, isLoading } = useGetAllGoalsQuery();
  const goals = data?.data ?? [];

  const totalTarget = goals.reduce((s: number, g: any) => s + (g.targetAmount || 0), 0);
  const totalCurrent = goals.reduce((s: number, g: any) => s + (g.currentAmount || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Goals</h3>
        <div className="text-sm text-muted-foreground">
          {goals.length} goal{goals.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Total saved</div>
          <div>KSh {Number(totalCurrent).toFixed(2)}</div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div>Total target</div>
          <div>KSh {Number(totalTarget).toFixed(2)}</div>
        </div>
        <div className="grid grid-cols-1 gap-3 mt-2">
          {isLoading ? <div>Loading...</div> : goals.slice(0, 3).map((g: any) => (
            <GoalCard key={g._id} goal={g} />
          ))}
          {goals.length === 0 && <div className="text-sm text-muted-foreground">No goals yet</div>}
        </div>
      </div>
    </div>
  );
}
