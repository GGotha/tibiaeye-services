import { ActiveSessionBanner } from "@/components/cards/active-session-banner";
import { SessionsTable } from "@/components/tables/sessions-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCharacters } from "@/hooks/use-characters";
import { useActiveSessions, useDeleteSession, useSessions } from "@/hooks/use-sessions";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/sessions/")({
  component: SessionsPage,
});

function SessionsPage() {
  const [page, setPage] = useState(1);
  const [characterFilter, setCharacterFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  const { data: activeSessions = [] } = useActiveSessions();
  const { data: characters = [] } = useCharacters();
  const { data: sessionsData, isLoading } = useSessions({
    page,
    limit: 10,
    characterId: characterFilter || undefined,
    status: statusFilter || undefined,
  });
  const deleteSession = useDeleteSession();

  const handleDelete = (id: string) => {
    setDeleteSessionId(id);
  };

  const confirmDeleteSession = async () => {
    if (deleteSessionId) {
      await deleteSession.mutateAsync(deleteSessionId);
      setDeleteSessionId(null);
    }
  };

  const pastSessions = sessionsData?.data?.filter((s) => s.status !== "active") ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Sessions</h1>

      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            {activeSessions.length === 1 ? "Active Session" : "Active Sessions"}
          </h2>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <ActiveSessionBanner key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Session History</h2>

        <div className="flex items-center gap-4 mb-4">
          <Select value={characterFilter} onValueChange={setCharacterFilter}>
            <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All characters" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All characters</SelectItem>
              {characters.map((char) => (
                <SelectItem key={char.id} value={char.id}>
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="crashed">Crashed</SelectItem>
            </SelectContent>
          </Select>

          {(characterFilter || statusFilter) && (
            <Button
              variant="ghost"
              onClick={() => {
                setCharacterFilter("");
                setStatusFilter("");
              }}
              className="text-slate-400"
            >
              Clear filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : pastSessions.length > 0 ? (
          <>
            <SessionsTable sessions={pastSessions} onDelete={handleDelete} />

            {sessionsData && sessionsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-slate-400">
                  Page {page} of {sessionsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= sessionsData.totalPages}
                  className="border-slate-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-slate-400">
            No sessions found. Start hunting to see your history!
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteSessionId}
        onOpenChange={(open) => !open && setDeleteSessionId(null)}
        title="Excluir sessão"
        description="Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={confirmDeleteSession}
        isLoading={deleteSession.isPending}
      />
    </div>
  );
}
