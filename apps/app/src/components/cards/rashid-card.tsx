import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TibiaSprite } from "@/components/ui/tibia-sprite";
import { useRashidLocation } from "@/hooks/use-tibia-data";
import { npcSpriteUrl } from "@/lib/tibia-sprites";
import { Store } from "lucide-react";

export function RashidCard() {
  const { data: rashid, isLoading } = useRashidLocation();

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
          <Store className="h-4 w-4" />
          Rashid Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse bg-slate-800 rounded" />
        ) : rashid ? (
          <div className="flex items-center gap-3">
            <TibiaSprite src={npcSpriteUrl("Rashid")} alt="Rashid" size="md" />
            <div>
              <p className="text-lg font-bold text-white">{rashid.city}</p>
              <p className="text-xs text-slate-500">Vende equipamentos raros e loot</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Indisponivel</p>
        )}
      </CardContent>
    </Card>
  );
}
