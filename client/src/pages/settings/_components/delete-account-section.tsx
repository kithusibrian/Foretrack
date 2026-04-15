import { useState } from "react";
import { Loader, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAppDispatch } from "@/app/hook";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { logout } from "@/features/auth/authSlice";
import { useDeleteAccountMutation } from "@/features/user/userAPI";
import { AUTH_ROUTES } from "@/routes/common/routePath";

export function DeleteAccountSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const hasPassword = currentPassword.trim().length > 0;
  const hasConfirmationText = confirmationText.length > 0;
  const hasDeletePhrase = confirmationText === "DELETE";
  const canDelete = hasPassword && hasDeletePhrase && !isLoading;

  const resetDialogState = () => {
    setCurrentPassword("");
    setConfirmationText("");
    setFormError(null);
  };

  const handleDeleteAccount = () => {
    if (!hasPassword) {
      setFormError("Please enter your current password.");
      return;
    }

    if (!hasDeletePhrase) {
      setFormError('Please type "DELETE" to confirm account deletion.');
      return;
    }

    if (isLoading) return;

    setFormError(null);

    deleteAccount({
      currentPassword,
      confirmationText,
    })
      .unwrap()
      .then((response) => {
        setIsOpen(false);
        resetDialogState();
        dispatch(logout());
        toast.success(response.message || "Account deleted successfully");
        navigate(AUTH_ROUTES.SIGN_IN);
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Failed to delete account");
      });
  };

  return (
    <div className="space-y-4 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
      <div>
        <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data.
        </p>
      </div>

      <Button
        type="button"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      >
        Delete account and all data
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <TriangleAlert className="h-5 w-5" />
              Permanently delete your account?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account and all associated data
              will be permanently deleted, including your profile, transactions,
              reports, and report settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current password</p>
              <Input
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setFormError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Type DELETE to confirm</p>
              <Input
                type="text"
                placeholder="DELETE"
                value={confirmationText}
                onChange={(event) => {
                  setConfirmationText(event.target.value);
                  setFormError(null);
                }}
              />
              {hasConfirmationText && (
                <p
                  className={`text-sm ${hasDeletePhrase ? "text-green-600" : "text-red-500"}`}
                >
                  {hasDeletePhrase
                    ? "Confirmation phrase is correct"
                    : 'Please type exactly "DELETE"'}
                </p>
              )}
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                resetDialogState();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!canDelete}
              onClick={handleDeleteAccount}
            >
              {isLoading && <Loader className="h-4 w-4 animate-spin" />}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
