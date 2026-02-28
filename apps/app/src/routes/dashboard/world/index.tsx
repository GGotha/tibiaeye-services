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
import { formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Globe, Search, Shield, Swords, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard/world/")({
  component: WorldDashboardPage,
});

function WorldDashboardPage() {
  const { data: characters } = useCharacters();
  const [playerSearch, setPlayerSearch] = useState("");

  const characterWorld = characters?.[0]?.world;
  const { data: worldInfo, isLoading: isLoadingWorld } = useTibiaWorld(characterWorld);
  const { data: killStats } = useKillStatistics(characterWorld);

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

  if (!characterWorld) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">World</h1>
        <div className="text-center py-12 text-slate-400">
          Adicione um character para ver informacoes do world.
        </div>
      </div>
    );
  }

  if (isLoadingWorld) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Globe className="h-8 w-8 text-emerald-400" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{worldInfo?.name ?? characterWorld}</h1>
              {worldInfo && (
                <div className="flex items-center gap-2">
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
                </div>
              )}
            </div>
            {worldInfo?.worldQuestTitles && worldInfo.worldQuestTitles.length > 0 && (
              <p className="text-sm text-slate-400 mt-1">{worldInfo.worldQuestTitles.join(", ")}</p>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
