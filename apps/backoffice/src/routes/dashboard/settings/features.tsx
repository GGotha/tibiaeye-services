import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useFeatureFlags,
  useMaintenanceMode,
  useSetFeatureFlag,
  useSetMaintenanceMode,
} from "@/hooks/use-settings";
import { formatDateTime } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Settings, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/settings/features")({
  component: FeaturesPage,
});

function FeaturesPage() {
  const { data: featureFlags, isLoading: loadingFlags } = useFeatureFlags();
  const { data: maintenance, isLoading: loadingMaintenance } = useMaintenanceMode();
  const setFeatureFlag = useSetFeatureFlag();
  const setMaintenanceMode = useSetMaintenanceMode();

  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    if (maintenance) {
      setMaintenanceEnabled(maintenance.enabled);
      setMaintenanceMessage(maintenance.message || "");
    }
  }, [maintenance]);

  const handleFeatureToggle = (id: string, enabled: boolean) => {
    setFeatureFlag.mutate({ id, enabled });
  };

  const handleMaintenanceSave = () => {
    setMaintenanceMode.mutate({
      enabled: maintenanceEnabled,
      message: maintenanceMessage || null,
      scheduledEnd: null,
    });
  };

  if (loadingFlags || loadingMaintenance) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Feature Flags & Settings</h1>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Maintenance Mode
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enable maintenance mode to prevent users from accessing the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-300">Enable Maintenance Mode</Label>
              <p className="text-sm text-slate-500">Users will see a maintenance message</p>
            </div>
            <Switch
              checked={maintenanceEnabled}
              onCheckedChange={setMaintenanceEnabled}
              className="data-[state=checked]:bg-yellow-500"
            />
          </div>

          {maintenanceEnabled && (
            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-300">
                Maintenance Message
              </Label>
              <Input
                id="message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="We're performing scheduled maintenance..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}

          <Button
            onClick={handleMaintenanceSave}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
            disabled={setMaintenanceMode.isPending}
          >
            {setMaintenanceMode.isPending ? "Saving..." : "Save Maintenance Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ToggleRight className="h-5 w-5 text-red-400" />
            Feature Flags
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enable or disable features across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {featureFlags?.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
            >
              <div className="space-y-0.5">
                <p className="font-medium text-white">{flag.name}</p>
                <p className="text-sm text-slate-400">{flag.description}</p>
                <p className="text-xs text-slate-500">
                  Last updated: {formatDateTime(flag.updatedAt)}
                </p>
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={(enabled) => handleFeatureToggle(flag.id, enabled)}
                disabled={setFeatureFlag.isPending}
              />
            </div>
          ))}

          {(!featureFlags || featureFlags.length === 0) && (
            <div className="text-center py-8 text-slate-400">
              <Settings className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p>No feature flags configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
