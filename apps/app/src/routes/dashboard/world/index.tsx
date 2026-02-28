import { StatsCard } from "@/components/cards/stats-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TibiaSprite } from "@/components/ui/tibia-sprite";
import { useCharacters } from "@/hooks/use-characters";
import { useKillStatistics, useTibiaWorld } from "@/hooks/use-tibia-data";
import { creatureSpriteUrl } from "@/lib/tibia-sprites";
import { cn, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Globe, Search, Shield, Swords, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard/world/")({
  component: WorldDashboardPage,
});

function WorldDashboardPage() {
  const { data: characters } = useCharacters();
  const [playerSearch, setPlayerSearch] = useState("");

  const worldsWithCharacters = useMemo(() => {
    if (!characters) return [];
    const worldMap = new Map<string, string[]>();
    for (const char of characters) {
      if (!char.world) continue;
      const existing = worldMap.get(char.world) || [];
      existing.push(char.name);
      worldMap.set(char.world, existing);
    }
    return Array.from(worldMap.entries()).map(([world, names]) => ({ world, characters: names }));
  }, [characters]);

  const [selectedWorld, setSelectedWorld] = useState<string | undefined>(undefined);
  const activeWorld = selectedWorld ?? worldsWithCharacters[0]?.world;

  const { data: worldInfo, isLoading: isLoadingWorld } = useTibiaWorld(activeWorld);
  const { data: killStats } = useKillStatistics(activeWorld);

  const filteredPlayers = useMemo(() => {
    if (!worldInfo?.onlinePlayers) return [];
    if (!playerSearch) return worldInfo.onlinePlayers;
    const search = playerSearch.toLowerCase();
    return worldInfo.onlinePlayers.filter(
      (p) => p.name.toLowerCase().includes(search) || p.vocation.toLowerCase().includes(search)
    );
  }, [worldInfo?.onlinePlayers, playerSearch]);

  const topKilledCreatures = useMemo(() => {
    if (!killStats?.entries) return [];
    return [...killStats.entries].sort((a, b) => b.lastWeekKilled - a.lastWeekKilled).slice(0, 10);
  }, [killStats?.entries]);

  if (worldsWithCharacters.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">World</h1>
        <div className="text-center py-12 text-slate-400">
          Adicione um character para ver informacoes do world.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Globe className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">World</h1>
            <p className="text-sm text-slate-500">Selecione um mundo para visualizar</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {worldsWithCharacters.map(({ world, characters: charNames }) => (
          <button
            key={world}
            type="button"
            onClick={() => setSelectedWorld(world)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 transition-all duration-200 text-left",
              activeWorld === world
                ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/50"
            )}
          >
            <div className="flex items-center gap-2">
              <Globe className={cn("h-4 w-4", activeWorld === world ? "text-emerald-400" : "text-slate-500")} />
              <span className={cn("font-semibold", activeWorld === world ? "text-emerald-400" : "text-white")}>
                {world}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {charNames.map((name) => (
                <span key={name} className="text-xs text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  {name}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {isLoadingWorld ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {worldInfo && (
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white">{worldInfo.name}</h2>
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                {worldInfo.pvpType}
              </Badge>
              {worldInfo.battlEyeProtected && (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  <Shield className="h-3 w-3 mr-1" />
                  BattlEye
                </Badge>
              )}
              <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
                {worldInfo.transferType}
              </Badge>
              {worldInfo.worldQuestTitles && worldInfo.worldQuestTitles.length > 0 && (
                <span className="text-sm text-slate-500">{worldInfo.worldQuestTitles.join(", ")}</span>
              )}
            </div>
          )}

          {worldInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Players Online"
                value={formatNumber(worldInfo.playersOnline)}
                icon={Users}
              />
              <StatsCard
                title="Record Online"
                value={formatNumber(worldInfo.onlineRecordPlayers)}
                icon={Trophy}
                description={worldInfo.onlineRecordDate}
              />
              <StatsCard
                title="Online Players"
                value={worldInfo.onlinePlayers.length.toString()}
                icon={Users}
                description="Jogadores listados"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Players Online
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar jogador..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Name</TableHead>
                        <TableHead className="text-slate-400 text-right">Level</TableHead>
                        <TableHead className="text-slate-400">Vocation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlayers.map((player) => (
                        <TableRow key={player.name} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="font-medium text-white">{player.name}</TableCell>
                          <TableCell className="text-right text-slate-300">{player.level}</TableCell>
                          <TableCell className="text-slate-400">{player.vocation}</TableCell>
                        </TableRow>
                      ))}
                      {filteredPlayers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-slate-500 py-4">
                            Nenhum jogador encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Swords className="h-5 w-5" />
                  Top Criaturas Mortas (Semana)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topKilledCreatures.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Criatura</TableHead>
                        <TableHead className="text-slate-400 text-right">Mortas (Semana)</TableHead>
                        <TableHead className="text-slate-400 text-right">Mortas (Dia)</TableHead>
                        <TableHead className="text-slate-400 text-right">Players Mortos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topKilledCreatures.map((entry) => (
                        <TableRow key={entry.race} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center gap-2">
                              <TibiaSprite
                                src={creatureSpriteUrl(entry.race)}
                                alt={entry.race}
                                size="sm"
                              />
                              {entry.race}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-emerald-400">
                            {formatNumber(entry.lastWeekKilled)}
                          </TableCell>
                          <TableCell className="text-right text-slate-300">
                            {formatNumber(entry.lastDayKilled)}
                          </TableCell>
                          <TableCell className="text-right text-red-400">
                            {formatNumber(entry.lastWeekPlayersKilled)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Estatisticas de kill indisponiveis.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
