import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CharacterWithStatus } from "@/types";
import { Link } from "@tanstack/react-router";
import { History, Plus, Trash } from "lucide-react";

interface CharactersListProps {
  characters: CharacterWithStatus[];
  onAddClick: () => void;
  onDelete: (id: string) => void;
}

export function CharactersList({ characters, onAddClick, onDelete }: CharactersListProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Your Characters</CardTitle>
        <Button
          onClick={onAddClick}
          size="sm"
          className="bg-emerald-500 hover:bg-emerald-600 text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </CardHeader>
      <CardContent>
        {characters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No characters added yet</p>
            <Button onClick={onAddClick} variant="outline" className="border-slate-700">
              Add your first character
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Character</TableHead>
                <TableHead className="text-slate-400">World</TableHead>
                <TableHead className="text-slate-400">Level</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {characters.map((char) => (
                <TableRow key={char.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{char.name}</p>
                      {char.vocation && <p className="text-sm text-slate-400">{char.vocation}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{char.world}</TableCell>
                  <TableCell className="text-slate-300">{char.level || "-"}</TableCell>
                  <TableCell>
                    {char.hasActiveSession ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse">
                        ONLINE
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
                        Offline
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link
                          to="/dashboard/characters/$characterId"
                          params={{ characterId: char.id }}
                        >
                          <History className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => onDelete(char.id)}
                        disabled={char.hasActiveSession}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
