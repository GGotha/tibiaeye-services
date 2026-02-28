import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TibiaSprite } from "@/components/ui/tibia-sprite";
import { useBoostedCreatures } from "@/hooks/use-tibia-data";
import { creatureSpriteUrl } from "@/lib/tibia-sprites";
import { Zap } from "lucide-react";

export function BoostedCard() {
  const { data: boosted, isLoading } = useBoostedCreatures();

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          Boosted Today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-10 w-full animate-pulse bg-slate-800 rounded-lg" />
            <div className="h-10 w-full animate-pulse bg-slate-800 rounded-lg" />
          </div>
        ) : boosted ? (
          <>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <TibiaSprite
                src={creatureSpriteUrl(boosted.boostedCreature.name)}
                alt={boosted.boostedCreature.name}
                size="sm"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{boosted.boostedCreature.name}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                2x XP
              </span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
              <TibiaSprite
                src={creatureSpriteUrl(boosted.boostedBoss.name)}
                alt={boosted.boostedBoss.name}
                size="sm"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{boosted.boostedBoss.name}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">
                2x Loot
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Indisponivel</p>
        )}
      </CardContent>
    </Card>
  );
}
