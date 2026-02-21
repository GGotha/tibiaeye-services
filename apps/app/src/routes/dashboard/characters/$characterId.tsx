import { SessionsTable } from "@/components/tables/sessions-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCharacter, useCharacterSessions } from "@/hooks/use-characters";
import { formatDate } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard/characters/$characterId")({
  component: CharacterDetailPage,
});

function CharacterDetailPage() {
  const { characterId } = Route.useParams();
  const { data: character, isLoading: isLoadingCharacter } = useCharacter(characterId);
  const { data: sessionsData, isLoading: isLoadingSessions } = useCharacterSessions(characterId);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/characters">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{character.name}</h1>
            {character.hasActiveSession && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse">
                ONLINE
              </Badge>
            )}
          </div>
          <p className="text-slate-400">
            {character.vocation || "Unknown Vocation"} - {character.world}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{character.level || "-"}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">World</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{character.world}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Added</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{formatDate(character.createdAt)}</p>
          </CardContent>
        </Card>
      </div>

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
