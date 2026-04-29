/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import {
  ArrowUpDown,
  CircleDot,
  Copy,
  HandCoins,
  Loader,
  LucideIcon,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  //StopCircleIcon,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/format-currency";
import useEditTransactionDrawer from "@/hooks/use-edit-transaction-drawer";
import { TransactionType } from "@/features/transaction/transationType";
import { _TRANSACTION_FREQUENCY, _TRANSACTION_TYPE } from "@/constant";
import {
  useDeleteTransactionMutation,
  useDuplicateTransactionMutation,
} from "@/features/transaction/transactionAPI";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useContributeToGoalMutation,
  useGetAllGoalsQuery,
  useRemoveContributionFromGoalMutation,
} from "@/features/goal/goalAPI";

type FrequencyInfo = {
  label: string;
  icon: LucideIcon;
};
type FrequencyMapType = {
  [key: string]: FrequencyInfo;
  DEFAULT: FrequencyInfo;
};

export const transactionColumns: ColumnDef<TransactionType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="!border-black data-[state=checked]:!bg-gray-800 !text-white"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="!border-black data-[state=checked]:!bg-gray-800 !text-white"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-start !px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-left">{format(row.getValue("createdAt"), "MMM dd, yyyy")}</div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-start !px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const category = row.original.category;
      return <div className="capitalize">{category}</div>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-start !px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.getValue("type") === _TRANSACTION_TYPE.INCOME
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.getValue("type")}
        </span>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.getValue("type");

      return (
        <div
          className={`text-right font-medium ${
            type === _TRANSACTION_TYPE.INCOME
              ? "text-green-600"
              : "text-destructive"
          }`}
        >
          {type === _TRANSACTION_TYPE.EXPENSE ? "-" : "+"}
          {formatCurrency(amount, { currency: "KES" })}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-start !px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Transaction Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-left">{format(row.original.date, "MMM dd, yyyy")}</div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const paymentMethod = row.original.paymentMethod;
      if (!paymentMethod) return "N/A";
      //remove _
      const paymentMethodWithoutUnderscore = paymentMethod
        ?.replace("_", " ")
        ?.toLowerCase();
      return <div className="capitalize">{paymentMethodWithoutUnderscore}</div>;
    },
  },
  {
    accessorKey: "recurringInterval",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-start !px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Frequently
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const frequency = row.getValue("recurringInterval");
      const nextDate = row.original?.nextRecurringDate;
      const isRecurring = row.original?.isRecurring;

      const frequencyMap: FrequencyMapType = isRecurring
        ? {
            [_TRANSACTION_FREQUENCY.DAILY]: { label: "Daily", icon: RefreshCw },
            [_TRANSACTION_FREQUENCY.WEEKLY]: {
              label: "Weekly",
              icon: RefreshCw,
            },
            [_TRANSACTION_FREQUENCY.MONTHLY]: {
              label: "Monthly",
              icon: RefreshCw,
            },
            [_TRANSACTION_FREQUENCY.YEARLY]: {
              label: "Yearly",
              icon: RefreshCw,
            },
            DEFAULT: { label: "One-time", icon: CircleDot }, // Fallback
          }
        : { DEFAULT: { label: "One-time", icon: CircleDot } };

      const frequencyKey = isRecurring ? (frequency as string) : "DEFAULT";
      const frequencyInfo =
        frequencyMap?.[frequencyKey] || frequencyMap.DEFAULT;
      const { label, icon: Icon } = frequencyInfo;

      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{label}</span>
            {nextDate && isRecurring && (
              <span className="text-xs text-muted-foreground">
                Next: {format(nextDate, "MMM dd yyyy")}
              </span>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];

// eslint-disable-next-line react-refresh/only-export-components
const ActionsCell = ({ row }: { row: any }) => {
  //const isRecurring = row.original.isRecurring;
  const transaction = row.original as TransactionType;
  const transactionId = transaction.id || transaction._id;
  const { onOpenDrawer } = useEditTransactionDrawer();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [assignAmount, setAssignAmount] = useState(
    String(Math.abs(Number(transaction.amount || 0))),
  );

  const { data: goalsData } = useGetAllGoalsQuery();
  const [contributeToGoal, { isLoading: isAssigning }] =
    useContributeToGoalMutation();
  const [removeContributionFromGoal, { isLoading: isRemovingContribution }] =
    useRemoveContributionFromGoalMutation();

  const goals = goalsData?.data || [];
  const alreadyLinked = !!transaction.isContribution;

  const [duplicateTransaction, { isLoading: isDuplicating }] =
    useDuplicateTransactionMutation();

  const [deleteTransaction, { isLoading: isDeleting }] =
    useDeleteTransactionMutation();
  const duplicateInFlightRef = useRef(false);
  const deleteInFlightRef = useRef(false);
  const removeContributionInFlightRef = useRef(false);

  const handleDuplicate = (e: Event) => {
    e.preventDefault();
    e.stopPropagation?.();
    if (isDuplicating || duplicateInFlightRef.current) return;
    duplicateInFlightRef.current = true;
    duplicateTransaction(transactionId)
      .unwrap()
      .then(() => {
        toast.success("Transaction duplicated successfully");
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to duplicate transaction");
      })
      .finally(() => {
        duplicateInFlightRef.current = false;
      });
  };

  const handleDelete = (e: Event) => {
    e.preventDefault();
    e.stopPropagation?.();
    if (isDeleting || deleteInFlightRef.current) return;
    deleteInFlightRef.current = true;
    deleteTransaction(transactionId)
      .unwrap()
      .then(() => {
        toast.success("Transaction deleted successfully");
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to delete transaction");
      })
      .finally(() => {
        deleteInFlightRef.current = false;
      });
  };

  const handleAssignToGoal = () => {
    if (!selectedGoalId) {
      toast.error("Please select a goal");
      return;
    }

    if (Number(assignAmount) <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }

    contributeToGoal({
      id: selectedGoalId,
      amount: Number(assignAmount),
      transactionId,
    })
      .unwrap()
      .then(() => {
        toast.success("Transaction linked as a goal contribution");
        setAssignDialogOpen(false);
        setSelectedGoalId("");
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to assign transaction");
      });
  };

  const handleRemoveFromGoal = (e: Event) => {
    e.preventDefault();
    e.stopPropagation?.();

    if (!transaction.goalId) {
      toast.error("This transaction is not linked to a goal");
      return;
    }

    if (isRemovingContribution || removeContributionInFlightRef.current) return;

    removeContributionInFlightRef.current = true;

    removeContributionFromGoal({
      id: transaction.goalId,
      transactionId,
    })
      .unwrap()
      .then(() => {
        toast.success("Transaction removed from goal contribution");
      })
      .catch((error) => {
        toast.error(error.data?.message || "Failed to remove contribution");
      })
      .finally(() => {
        removeContributionInFlightRef.current = false;
      });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-52"
          align="end"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onCloseAutoFocus={(e) => {
            if (
              isDeleting ||
              isDuplicating ||
              isAssigning ||
              isRemovingContribution
            ) {
              e.preventDefault();
            }
          }}
        >
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenDrawer(transactionId);
            }}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="relative"
            disabled={isDuplicating}
            onSelect={(event) => handleDuplicate(event)}
          >
            <Copy className="mr-1 h-4 w-4" />
            Duplicate
            {isDuplicating && (
              <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />
            )}
          </DropdownMenuItem>

          {alreadyLinked ? (
            <DropdownMenuItem
              className="relative"
              disabled={isRemovingContribution}
              onSelect={(event) => handleRemoveFromGoal(event)}
            >
              <HandCoins className="mr-1 h-4 w-4" />
              Remove From Goal
              {isRemovingContribution && (
                <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />
              )}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAssignAmount(
                  String(Math.abs(Number(transaction.amount || 0))),
                );
                setAssignDialogOpen(true);
              }}
            >
              <HandCoins className="mr-1 h-4 w-4" />
              Assign To Goal
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="relative !text-destructive"
            disabled={isDeleting}
            onSelect={(event) => handleDelete(event)}
          >
            <Trash2 className="mr-1 h-4 w-4 !text-destructive" />
            Delete
            {isDeleting && (
              <Loader className="ml-1 h-4 w-4 absolute right-2 animate-spin" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Transaction To Goal</DialogTitle>
            <DialogDescription>
              Link this transaction as a goal contribution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Transaction</Label>
              <div className="text-sm text-muted-foreground">
                {transaction.title}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`goal-select-${transactionId}`}>Goal</Label>
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                <SelectTrigger
                  id={`goal-select-${transactionId}`}
                  className="w-full"
                >
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((goal: { _id: string; title: string }) => (
                    <SelectItem key={goal._id} value={goal._id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`amount-${transactionId}`}>
                Contribution Amount (KES)
              </Label>
              <Input
                id={`amount-${transactionId}`}
                type="number"
                min={1}
                step="0.01"
                value={assignAmount}
                onChange={(event) => setAssignAmount(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedGoalId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignToGoal}
              disabled={isAssigning || goals.length === 0}
            >
              Assign Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
