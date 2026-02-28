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
          <Zap className="h-4 w-4" />
          Boosted Today
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-6 w-32 animate-pulse bg-slate-800 rounded" />
            <div className="h-6 w-32 animate-pulse bg-slate-800 rounded" />
          </div>
        ) : boosted ? (
          <>
            <div className="flex items-center gap-3">
              <TibiaSprite
                src={creatureSpriteUrl(boosted.boostedCreature.name)}
                alt={boosted.boostedCreature.name}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-white">{boosted.boostedCreature.name}</p>
                <p className="text-xs text-emerald-400">2x XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TibiaSprite
                src={creatureSpriteUrl(boosted.boostedBoss.name)}
                alt={boosted.boostedBoss.name}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-white">{boosted.boostedBoss.name}</p>
                <p className="text-xs text-yellow-400">2x Loot (Boss)</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Indisponivel</p>
        )}
      </CardContent>
    </Card>
  );
}
