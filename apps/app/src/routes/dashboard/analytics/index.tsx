import { KillsChart } from "@/components/charts/kills-chart";
import { LootChart } from "@/components/charts/loot-chart";
import { XPChart } from "@/components/charts/xp-chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExperienceHourly, useKillsByCreature, useLootSummary } from "@/hooks/use-analytics";
import { useCharacters } from "@/hooks/use-characters";
import { useSessions } from "@/hooks/use-sessions";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/analytics/")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [characterFilter, setCharacterFilter] = useState<string>("all");
  const [sessionFilter, setSessionFilter] = useState<string>("all");

  const { data: characters = [] } = useCharacters();
  const { data: sessionsData } = useSessions({ limit: 20 });
  const { data: experienceData } = useExperienceHourly(
    sessionFilter === "all" ? undefined : sessionFilter
  );
  const { data: killsData } = useKillsByCreature(
    sessionFilter === "all" ? undefined : sessionFilter
  );
  const { data: lootData } = useLootSummary(sessionFilter === "all" ? undefined : sessionFilter);

  const sessions = sessionsData?.data ?? [];
  const filteredSessions =
    characterFilter !== "all"
      ? sessions.filter((s) => s.characterName === characterFilter)
      : sessions;

  const handleExportCSV = () => {
    alert("CSV export coming soon!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <Button variant="outline" className="border-slate-700" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={characterFilter} onValueChange={setCharacterFilter}>
          <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="All characters" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All characters</SelectItem>
            {characters.map((char) => (
              <SelectItem key={char.id} value={char.name}>
                {char.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sessionFilter} onValueChange={setSessionFilter}>
          <SelectTrigger className="w-[250px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="All sessions" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All sessions</SelectItem>
            {filteredSessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.characterName} - {new Date(session.startedAt).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="experience" className="w-full">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="kills">Kills</TabsTrigger>
          <TabsTrigger value="loot">Loot</TabsTrigger>
        </TabsList>

        <TabsContent value="experience" className="mt-4">
          <XPChart
            data={experienceData?.dataPoints ?? []}
            averageXpPerHour={experienceData?.xpPerHourAverage ?? 0}
          />
        </TabsContent>

        <TabsContent value="kills" className="mt-4">
          {killsData && killsData.length > 0 ? (
            <KillsChart data={killsData} />
          ) : (
            <div className="text-center py-12 text-slate-400">
              No kill data available. Select a session or start hunting!
            </div>
          )}
        </TabsContent>

        <TabsContent value="loot" className="mt-4">
          {lootData && lootData.items.length > 0 ? (
            <LootChart data={lootData} />
          ) : (
            <div className="text-center py-12 text-slate-400">
              No loot data available. Select a session or start hunting!
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
