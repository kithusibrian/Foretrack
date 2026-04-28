import { FormEvent, useMemo, useState } from "react";
import {
  useCreateGoalMutation,
  useGetAllGoalsQuery,
  useContributeToGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
} from "@/features/goal/goalAPI";
import GoalCard from "@/components/goal/goal-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageLayout from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Pencil,
  PlusCircle,
  HandCoins,
  CalendarDays,
  Target,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllTransactionsQuery } from "@/features/transaction/transactionAPI";
import { TransactionType } from "@/features/transaction/transationType";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type GoalItem = {
  _id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
};

const initialForm = {
  title: "",
  targetAmount: "",
  description: "",
  targetDate: "",
};

export default function GoalsPage() {
  const { data: goalsData, isLoading } = useGetAllGoalsQuery();
  const [createGoal] = useCreateGoalMutation();
  const [contribute] = useContributeToGoalMutation();
  const [updateGoal] = useUpdateGoalMutation();
  const [deleteGoal] = useDeleteGoalMutation();

  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState<GoalItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributionGoal, setContributionGoal] = useState<GoalItem | null>(
    null,
  );
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionTransactionId, setContributionTransactionId] =
    useState("");
  const [isCreateDateOpen, setIsCreateDateOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);

  const { data: transactionsData } = useGetAllTransactionsQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const goals: GoalItem[] = goalsData?.data || [];
  const transactions = (transactionsData?.transactions ||
    []) as TransactionType[];
  const availableTransactions = transactions.filter(
    (item) => !item.isContribution,
  );

  const totalTarget = useMemo(
    () => goals.reduce((sum, item) => sum + Number(item.targetAmount || 0), 0),
    [goals],
  );

  const totalSaved = useMemo(
    () => goals.reduce((sum, item) => sum + Number(item.currentAmount || 0), 0),
    [goals],
  );

  const canSubmitCreate =
    form.title.trim().length > 0 && Number(form.targetAmount) > 0;

  const canSubmitEdit =
    !!editing &&
    editing.title.trim().length > 0 &&
    Number(editing.targetAmount) > 0;

  const canSubmitContribution =
    !!contributionGoal && Number(contributionAmount) > 0;

  const resetCreateForm = () => setForm(initialForm);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmitCreate) {
      toast.error("Please provide a title and a valid target amount");
      return;
    }

    try {
      await createGoal({
        title: form.title.trim(),
        targetAmount: Number(form.targetAmount),
        description: form.description.trim() || undefined,
        targetDate: form.targetDate || undefined,
      }).unwrap();

      resetCreateForm();
      toast.success("Goal created successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create goal");
    }
  };

  const onContribute = (goal: GoalItem) => {
    setContributionGoal(goal);
    setContributionAmount("");
    setContributionTransactionId("");
    setContributeOpen(true);
  };

  const handleSelectContributionTransaction = (transactionId: string) => {
    setContributionTransactionId(transactionId);
    const selected = availableTransactions.find(
      (item) => (item.id || item._id) === transactionId,
    );
    if (selected) {
      setContributionAmount(String(Math.abs(Number(selected.amount || 0))));
    }
  };

  const onSubmitContribution = async () => {
    if (!contributionGoal || !canSubmitContribution) {
      toast.error("Enter a valid contribution amount");
      return;
    }

    try {
      await contribute({
        id: contributionGoal._id,
        amount: Number(contributionAmount),
        transactionId: contributionTransactionId.trim() || undefined,
      }).unwrap();

      toast.success("Contribution added");
      setContributeOpen(false);
      setContributionGoal(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add contribution");
    }
  };

  const onEdit = (g: GoalItem) => {
    setEditing(g);
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!canSubmitEdit || !editing) {
      toast.error("Please provide a title and a valid target amount");
      return;
    }

    try {
      await updateGoal({
        id: editing._id,
        body: {
          title: editing.title.trim(),
          targetAmount: Number(editing.targetAmount),
          description: editing.description?.trim() || undefined,
          targetDate: editing.targetDate || undefined,
        },
      }).unwrap();

      setEditOpen(false);
      setEditing(null);
      toast.success("Goal updated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update goal");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id).unwrap();
      toast.success("Goal deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete goal");
    }
  };

  return (
    <PageLayout
      title="Goal-Based Budgeting"
      subtitle="Create savings goals, track progress, and log contributions against each goal."
      addMarginTop
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border bg-gradient-to-b from-white to-slate-50/80 shadow-none lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="goal-title">Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g. Emergency Fund"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal-target-amount">Target Amount (KES)</Label>
                <Input
                  id="goal-target-amount"
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="50000"
                  value={form.targetAmount}
                  onChange={(event) =>
                    setForm({ ...form, targetAmount: event.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal-description">Description (Optional)</Label>
                <Input
                  id="goal-description"
                  placeholder="What are you saving for?"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal-target-date">Target Date (Optional)</Label>
                <Popover
                  open={isCreateDateOpen}
                  onOpenChange={setIsCreateDateOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.targetDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {form.targetDate
                        ? format(new Date(form.targetDate), "PPP")
                        : "Select target date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={
                        form.targetDate ? new Date(form.targetDate) : undefined
                      }
                      onSelect={(date) => {
                        setForm({
                          ...form,
                          targetDate: date ? date.toISOString() : "",
                        });
                        setIsCreateDateOpen(false);
                      }}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                type="submit"
                disabled={!canSubmitCreate}
                className="w-full"
              >
                Create Goal
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="border bg-gradient-to-r from-cyan-50/50 via-white to-sky-50/60 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-700" />
                Goals Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Goals</p>
                  <p className="text-xl font-semibold">{goals.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Saved</p>
                  <p className="text-xl font-semibold text-emerald-700">
                    KSh {totalSaved.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Target</p>
                  <p className="text-xl font-semibold text-slate-800">
                    KSh {totalTarget.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-none">
            <CardHeader>
              <CardTitle>Your Goals</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading goals...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {goals.map((goal) => (
                    <div key={goal._id} className="space-y-3">
                      <GoalCard goal={goal} />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onContribute(goal)}
                        >
                          <HandCoins className="h-4 w-4" />
                          Contribute
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(goal)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(goal._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}

                  {goals.length === 0 && (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      No goals yet. Create your first goal from the form on the
                      left.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update goal details and save your changes.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-goal-title">Title</Label>
                <Input
                  id="edit-goal-title"
                  value={editing.title}
                  onChange={(event) =>
                    setEditing({ ...editing, title: event.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-goal-target">Target Amount (KES)</Label>
                <Input
                  id="edit-goal-target"
                  type="number"
                  min={1}
                  step="0.01"
                  value={String(editing.targetAmount)}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      targetAmount: Number(event.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-goal-description">Description</Label>
                <Input
                  id="edit-goal-description"
                  value={editing.description || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, description: event.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-goal-date">Target Date</Label>
                <Popover open={isEditDateOpen} onOpenChange={setIsEditDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-goal-date"
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editing.targetDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {editing.targetDate
                        ? format(new Date(editing.targetDate), "PPP")
                        : "Select target date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={
                        editing.targetDate
                          ? new Date(editing.targetDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        setEditing({
                          ...editing,
                          targetDate: date ? date.toISOString() : "",
                        });
                        setIsEditDateOpen(false);
                      }}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={onSaveEdit} disabled={!canSubmitEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={contributeOpen}
        onOpenChange={(open) => {
          if (!open) {
            setContributeOpen(false);
            setContributionGoal(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add an amount to {contributionGoal?.title || "this goal"}. You can
              optionally attach an existing transaction ID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="contribution-amount">Amount (KES)</Label>
              <Input
                id="contribution-amount"
                type="number"
                min={1}
                step="0.01"
                placeholder="1000"
                value={contributionAmount}
                onChange={(event) => setContributionAmount(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contribution-transaction-id">
                Link Existing Transaction (Optional)
              </Label>
              <Select
                value={contributionTransactionId}
                onValueChange={handleSelectContributionTransaction}
              >
                <SelectTrigger
                  id="contribution-transaction-id"
                  className="w-full"
                >
                  <SelectValue placeholder="Select a transaction" />
                </SelectTrigger>
                <SelectContent>
                  {availableTransactions.map((tx) => {
                    const txId = tx.id || tx._id;
                    return (
                      <SelectItem key={txId} value={txId}>
                        {tx.title} - KSh {Number(tx.amount).toFixed(2)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setContributeOpen(false);
                setContributionGoal(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmitContribution}
              disabled={!canSubmitContribution}
            >
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
