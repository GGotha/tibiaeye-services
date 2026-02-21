import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useCancelSubscription, useSubscription } from "@/hooks/use-license";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const cancelSubscription = useCancelSubscription();

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    try {
      await api.updateMe({ name });
      setProfileMessage({ type: "success", text: "Profile updated successfully" });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await api.updatePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: "success", text: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update password",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancelSubscription = () => {
    setIsCancelDialogOpen(true);
  };

  const confirmCancelSubscription = async () => {
    await cancelSubscription.mutateAsync();
    setIsCancelDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-slate-400">
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {profileMessage && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      profileMessage.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-slate-800 border-slate-700 text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-slate-400">
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {passwordMessage && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      passwordMessage.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Subscription</CardTitle>
              <CardDescription className="text-slate-400">
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Current Plan</span>
                    <span className="font-semibold text-white">{subscription.plan.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Price</span>
                    <span className="font-semibold text-white">
                      ${subscription.plan.price}/month
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Status</span>
                    <span className="font-semibold text-emerald-400">{subscription.status}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">Next Billing Date</span>
                    <span className="font-semibold text-white">
                      {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-slate-400">No active subscription</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-4">
          <Card className="bg-slate-900/50 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-slate-400">
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription && subscription.status === "active" && (
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-800">
                  <div>
                    <h4 className="font-medium text-white">Cancel Subscription</h4>
                    <p className="text-sm text-slate-400">
                      Stop your subscription at the end of the billing period
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={handleCancelSubscription}
                    disabled={cancelSubscription.isPending}
                  >
                    {cancelSubscription.isPending ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-800">
                <div>
                  <h4 className="font-medium text-white">Delete Account</h4>
                  <p className="text-sm text-slate-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancelar assinatura"
        description="Tem certeza que deseja cancelar sua assinatura? Você perderá acesso ao final do período de cobrança."
        confirmText="Cancelar assinatura"
        onConfirm={confirmCancelSubscription}
        isLoading={cancelSubscription.isPending}
      />
    </div>
  );
}
