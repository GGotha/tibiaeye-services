import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle, Key, XCircle } from "lucide-react";

interface LicenseStatusCardProps {
  hasLicense: boolean;
  status: "active" | "expired" | "revoked" | null;
  daysRemaining: number;
  expiresAt: string | null;
  onRenew: () => void;
}

export function LicenseStatusCard({
  hasLicense,
  status,
  daysRemaining,
  expiresAt,
  onRenew,
}: LicenseStatusCardProps) {
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;
  const progressValue = Math.min(100, (daysRemaining / 30) * 100);

  return (
    <Card
      className={cn(
        "bg-slate-900/50 border-slate-800",
        !hasLicense && "border-red-500/50",
        isExpiringSoon && "border-yellow-500/50"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Key className="h-5 w-5" />
          License Status
        </CardTitle>
        <Badge
          className={cn(
            status === "active" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            status === "expired" && "bg-red-500/10 text-red-400 border-red-500/20",
            status === "revoked" && "bg-slate-500/10 text-slate-400 border-slate-500/20",
            !hasLicense && "bg-red-500/10 text-red-400 border-red-500/20"
          )}
        >
          {status || "No License"}
        </Badge>
      </CardHeader>
      <CardContent>
        {hasLicense && status === "active" ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Days Remaining</span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  daysRemaining > 7 ? "text-emerald-400" : "text-yellow-400"
                )}
              >
                {daysRemaining}
              </span>
            </div>
            <Progress value={progressValue} className="h-2 mb-4" />
            {isExpiringSoon && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span>Your license is expiring soon!</span>
              </div>
            )}
            <p className="text-xs text-slate-500">
              Expires: {expiresAt ? new Date(expiresAt).toLocaleDateString() : "N/A"}
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
            <p className="text-slate-400 mb-4">
              {status === "expired"
                ? "Your license has expired"
                : "You don't have an active license"}
            </p>
            <Button onClick={onRenew} className="bg-emerald-500 hover:bg-emerald-600 text-black">
              {status === "expired" ? "Renew License" : "Get License"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
