import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatDate } from "@/lib/utils";
import type { LicenseStatus } from "@/types";
import { AlertTriangle, Key } from "lucide-react";

interface LicenseStatusCardProps {
  license: LicenseStatus | null | undefined;
  onGetLicense?: () => void;
}

export function LicenseStatusCard({ license, onGetLicense }: LicenseStatusCardProps) {
  const daysRemaining = license?.subscription.daysRemaining ?? 0;
  const isExpiringSoon = license && daysRemaining > 0 && daysRemaining <= 7;
  const progressValue = license ? Math.min(100, (daysRemaining / 30) * 100) : 0;

  return (
    <Card
      className={cn(
        "bg-slate-900/50 border-slate-800",
        !license && "border-red-500/50",
        isExpiringSoon && "border-yellow-500/50"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5" />
            License Status
          </CardTitle>
          <Badge
            className={cn(
              license?.status === "active" &&
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              (!license || license.status === "revoked") &&
                "bg-red-500/10 text-red-400 border-red-500/20"
            )}
          >
            {license?.status || "No License"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {license && license.status === "active" ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Days Remaining</span>
              <span
                className={cn(
                  "text-3xl font-bold",
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
            <p className="text-sm text-slate-500 mb-4">
              Expires: {formatDate(license.subscription.currentPeriodEnd)}
            </p>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black"
              onClick={onGetLicense}
            >
              Renew Subscription
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 mb-4">
              You don't have an active license. Get one to start using TibiaEye.
            </p>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-black"
              onClick={onGetLicense}
            >
              Get License
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
