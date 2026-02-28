import { SessionsTable } from "@/components/tables/sessions-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TibiaSprite } from "@/components/ui/tibia-sprite";
import { useCharacter, useCharacterSessions } from "@/hooks/use-characters";
import { useTibiaCharacter } from "@/hooks/use-tibia-data";
import { creatureSpriteUrl, outfitSpriteUrl } from "@/lib/tibia-sprites";
import { formatDate, formatNumber, getRelativeTime } from "@/lib/utils";
import { Link, Outlet, createFileRoute, useMatches } from "@tanstack/react-router";
import { ArrowLeft, Award, Clock, Globe, Settings, Skull, Star, User } from "lucide-react";

export const Route = createFileRoute("/dashboard/characters/$characterId")({
  component: CharacterDetailLayout,
});

function CharacterDetailLayout() {
  const matches = useMatches();
  const hasChildRoute = matches.some(
    (m) => m.routeId === "/dashboard/characters/$characterId/config"
  );

  if (hasChildRoute) {
    return <Outlet />;
  }

  return <CharacterDetailPage />;
}

function CharacterDetailPage() {
  const { characterId } = Route.useParams();
  const { data: character, isLoading: isLoadingCharacter } = useCharacter(characterId);
  const { data: sessionsData, isLoading: isLoadingSessions } = useCharacterSessions(characterId);
  const { data: tibiaData } = useTibiaCharacter(character?.name);

  if (isLoadingCharacter) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Character not found</p>
        <Link to="/dashboard/characters">
          <Button variant="outline" className="mt-4 border-slate-700">
            Back to Characters
          </Button>
        </Link>
      </div>
    );
  }

  const vocation = tibiaData?.vocation ?? character.vocation ?? "Unknown";
  const sex = tibiaData?.sex ?? "Male";
  const level = tibiaData?.level ?? character.level;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/characters">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <TibiaSprite src={outfitSpriteUrl(vocation, sex)} alt={character.name} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{character.name}</h1>
            {character.hasActiveSession && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse">
                ONLINE
              </Badge>
            )}
          </div>
          <p className="text-slate-400">
            {vocation} - {character.world}
          </p>
          {tibiaData?.guild && (
            <p className="text-sm text-cyan-400">
              {tibiaData.guild.name} ({tibiaData.guild.rank})
            </p>
          )}
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            {tibiaData && (
              <>
                <span>
                  {tibiaData.accountStatus === "Premium Account" ? "Premium" : "Free Account"}
                </span>
                <span>Last login: {getRelativeTime(tibiaData.lastLogin)}</span>
              </>
            )}
          </div>
        </div>
        <Link
          to="/dashboard/characters/$characterId/config"
          params={{ characterId }}
        >
          <Button variant="outline" className="border-slate-700 hover:border-emerald-500/50 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Bot Config
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5" />
              Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{level || "-"}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              World
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{character.world}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              Achievement Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {tibiaData ? formatNumber(tibiaData.achievementPoints) : "-"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Added
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{formatDate(character.createdAt)}</p>
          </CardContent>
        </Card>
      </div>

      {tibiaData && tibiaData.deaths.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Skull className="h-5 w-5 text-red-400" />
              Deaths Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tibiaData.deaths.slice(0, 5).map((death, index) => (
              <div
                key={`${death.time}-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1">
                    {death.killers.slice(0, 3).map((killer) => (
                      <TibiaSprite
                        key={killer.name}
                        src={creatureSpriteUrl(killer.name)}
                        alt={killer.name}
                        size="sm"
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white">
                      <span className="text-slate-400">Lv {death.level}:</span> Killed by{" "}
                      {death.killers.map((k) => k.name).join(" and ")}
                    </p>
                    <p className="text-xs text-slate-500">{death.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tibiaData?.otherCharacters && tibiaData.otherCharacters.length > 1 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Outros Characters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tibiaData.otherCharacters
                .filter((c) => c.name !== character.name)
                .map((c) => (
                  <Badge
                    key={c.name}
                    className={
                      c.status === "online"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }
                  >
                    {c.name} ({c.world})
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Sessions History</h2>
        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : sessionsData && sessionsData.data.length > 0 ? (
          <SessionsTable sessions={sessionsData.data} />
        ) : (
          <div className="text-center py-8 text-slate-400">
            No sessions recorded for this character yet.
          </div>
        )}
      </div>
    </div>
  );
}
