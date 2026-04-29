import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionType } from "@/features/transaction/transationType";
import { formatCurrency } from "@/lib/format-currency";

const formatLabel = (value: string) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

type TransactionDetailModalProps = {
  transaction: TransactionType | null;
  isOpen: boolean;
  onClose: () => void;
};

const TransactionDetailModal = ({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailModalProps) => {
  if (!transaction) return null;

  const amount = Number(transaction.amount || 0);
  const isIncome = transaction.type === "INCOME";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Full details for {transaction.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label="Title" value={transaction.title} />
          <Detail label="Transaction Date" value={format(new Date(transaction.date), "MMM dd, yyyy")} />
          <Detail
            label="Amount"
            value={`${isIncome ? "+" : "-"}${formatCurrency(amount, { currency: "KES" })}`}
            valueClassName={isIncome ? "text-green-600" : "text-destructive"}
          />
          <Detail label="Type" value={transaction.type} />
          <Detail label="Category" value={transaction.category} />
          <Detail label="Payment Method" value={formatLabel(transaction.paymentMethod)} />
          <Detail label="Status" value={transaction.status} />
          <Detail
            label="Recurring"
            value={transaction.isRecurring ? formatLabel(transaction.recurringInterval || "") : "One-time"}
          />
          <Detail
            label="Created At"
            value={format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
          />
          <Detail
            label="Updated At"
            value={format(new Date(transaction.updatedAt), "MMM dd, yyyy HH:mm")}
          />
          {transaction.nextRecurringDate && (
            <Detail
              label="Next Recurring Date"
              value={format(new Date(transaction.nextRecurringDate), "MMM dd, yyyy")}
            />
          )}
          {transaction.goalId && (
            <Detail label="Goal Linked" value="Yes" />
          )}
          {transaction.description && (
            <div className="sm:col-span-2 rounded-md border p-3">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1 text-sm">{transaction.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Detail = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className="rounded-md border p-3">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className={`mt-1 text-sm font-medium ${valueClassName || ""}`}>{value}</p>
  </div>
);

export default TransactionDetailModal;
