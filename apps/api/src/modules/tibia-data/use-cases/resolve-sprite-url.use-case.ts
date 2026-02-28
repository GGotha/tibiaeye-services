import { CacheTTL, tibiaApiProvider } from "../tibia-api.provider.js";

interface FandomApiResponse {
  query: {
    pages: Record<
      string,
      {
        imageinfo?: Array<{ url: string }>;
      }
    >;
  };
}

const FANDOM_API_BASE = "https://tibia.fandom.com/api.php";

export class ResolveSpriteUrlUseCase {
  async execute(fileName: string): Promise<string | null> {
    const params = new URLSearchParams({
      action: "query",
      titles: `File:${fileName}`,
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
    });

    const url = `${FANDOM_API_BASE}?${params.toString()}`;

    const response = await tibiaApiProvider.fetchWithCache<FandomApiResponse>(url, CacheTTL.LONG);

    const pages = response.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      const imageUrl = page.imageinfo?.[0]?.url;
      if (imageUrl) return imageUrl;
    }

    return null;
  }
}
