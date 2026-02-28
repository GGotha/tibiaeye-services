import { CacheTTL, tibiaApiProvider } from "../tibia-api.provider.js";

interface TibiaDataBoostableBossesResponse {
  boostable_bosses: {
    boosted: {
      name: string;
      image_url: string;
      featured: boolean;
    };
  };
}

interface TibiaDataCreaturesResponse {
  creatures: {
    boosted: {
      name: string;
      race: string;
      image_url: string;
      featured: boolean;
    };
  };
}

interface BoostedCreatures {
  boostedBoss: { name: string; imageUrl: string };
  boostedCreature: { name: string; imageUrl: string };
}

export class GetBoostedCreaturesUseCase {
  async execute(): Promise<BoostedCreatures> {
    const [bossResponse, creatureResponse] = await Promise.all([
      tibiaApiProvider.fetchWithCache<TibiaDataBoostableBossesResponse>(
        "https://api.tibiadata.com/v4/boostablebosses",
        CacheTTL.LONG,
      ),
      tibiaApiProvider.fetchWithCache<TibiaDataCreaturesResponse>(
        "https://api.tibiadata.com/v4/creatures",
        CacheTTL.LONG,
      ),
    ]);

    return {
      boostedBoss: {
        name: bossResponse.boostable_bosses.boosted.name,
        imageUrl: bossResponse.boostable_bosses.boosted.image_url,
      },
      boostedCreature: {
        name: creatureResponse.creatures.boosted.name,
        imageUrl: creatureResponse.creatures.boosted.image_url,
      },
    };
  }
}
