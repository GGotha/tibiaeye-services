import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBanUser, useSuspendUser, useUnsuspendUser, useUser } from "@/hooks/use-users";
import { formatCurrencyPrecise, formatDate, getRelativeTime } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Ban, CheckCircle, Key, Shield, User, UserX } from "lucide-react";

export const Route = createFileRoute("/dashboard/users/$id")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { id } = Route.useParams();
  const { data: user, isLoading } = useUser(id);
  const suspendUser = useSuspendUser();
  const unsuspendUser = useUnsuspendUser();
  const banUser = useBanUser();

  const handleSuspend = () => {
    const reason = window.prompt("Enter suspension reason:");
    if (reason) {
      suspendUser.mutate({ id, reason });
    }
  };

  const handleUnsuspend = () => {
    if (window.confirm("Are you sure you want to unsuspend this user?")) {
      unsuspendUser.mutate(id);
    }
  };

  const handleBan = () => {
    const reason = window.prompt("Enter ban reason:");
    if (
      reason &&
      window.confirm("Are you sure you want to ban this user? This cannot be undone.")
    ) {
      banUser.mutate({ id, reason });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8 text-slate-400">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/users">
          <Button variant="ghost" size="icon" className="text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{user.name || "Unnamed User"}</h1>
          <p className="text-slate-400">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {user.status === "active" && (
            <Button
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
              onClick={handleSuspend}
            >
              <UserX className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          )}
          {user.status === "suspended" && (
            <Button
              variant="outline"
              className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
              onClick={handleUnsuspend}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Unsuspend
            </Button>
          )}
          {user.status !== "banned" && (
            <Button
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/10"
              onClick={handleBan}
            >
              <Ban className="h-4 w-4 mr-2" />
              Ban
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-red-400" />
              User Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <Badge
                className={
                  user.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : user.status === "suspended"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                }
              >
                {user.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Role</span>
              <span className="text-white">{user.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Joined</span>
              <span className="text-white">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Login</span>
              <span className="text-white">
                {user.lastLoginAt ? getRelativeTime(user.lastLoginAt) : "Never"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.subscription ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-white">{user.subscription.plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <Badge
                    className={
                      user.subscription.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-500/20 text-slate-400"
                    }
                  >
                    {user.subscription.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Price</span>
                  <span className="text-white">
                    {formatCurrencyPrecise(user.subscription.plan.price)}/
                    {user.subscription.plan.interval}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Renews</span>
                  <span className="text-white">
                    {formatDate(user.subscription.currentPeriodEnd)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-4">No active subscription</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-red-400" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{user.apiKeys.length}</div>
            <p className="text-slate-400">Active API Keys</p>
            {user.apiKeys.length > 0 && (
              <div className="mt-4 space-y-2">
                {user.apiKeys.slice(0, 3).map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between text-sm p-2 bg-slate-800 rounded"
                  >
                    <code className="text-slate-300">{key.keyPrefix}...</code>
                    <Badge
                      className={
                        key.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }
                    >
                      {key.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="licenses" className="space-y-4">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="licenses">Licenses ({user.licenses.length})</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions ({user.recentSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="licenses">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {user.licenses.length > 0 ? (
                <div className="space-y-2">
                  {user.licenses.map((license) => (
                    <div
                      key={license.id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded"
                    >
                      <div>
                        <code className="text-slate-300">{license.keyPrefix}...</code>
                        <p className="text-xs text-slate-500">
                          Expires {formatDate(license.expiresAt)}
                        </p>
                      </div>
                      <Badge
                        className={
                          license.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : license.status === "expired"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }
                      >
                        {license.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4">No licenses</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              {user.recentSessions.length > 0 ? (
                <div className="space-y-2">
                  {user.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded"
                    >
                      <div>
                        <p className="text-white font-medium">{session.characterName}</p>
                        <p className="text-xs text-slate-500">
                          {session.huntLocation || "Unknown location"} -{" "}
                          {getRelativeTime(session.startedAt)}
                        </p>
                      </div>
                      <Badge
                        className={
                          session.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : session.status === "completed"
                              ? "bg-slate-500/20 text-slate-400"
                              : "bg-red-500/20 text-red-400"
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4">No recent sessions</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
