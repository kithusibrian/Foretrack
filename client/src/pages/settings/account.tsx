import { Separator } from "@/components/ui/separator";
import { AccountForm } from "./_components/account-form";
import { PasswordForm } from "./_components/password-form";
import { DeleteAccountSection } from "./_components/delete-account-section";

const Account = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings.
        </p>
      </div>
      <Separator />
      <AccountForm />

      <div className="space-y-4 pt-2">
        <Separator />
        <div>
          <h3 className="text-lg font-medium">Security</h3>
          <p className="text-sm text-muted-foreground">
            Change your password using your current password.
          </p>
        </div>
        <PasswordForm />
      </div>

      <div className="space-y-4 pt-2">
        <Separator />
        <DeleteAccountSection />
      </div>
    </div>
  );
};

export default Account;
