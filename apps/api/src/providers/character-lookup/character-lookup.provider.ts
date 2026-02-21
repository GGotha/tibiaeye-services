export interface CharacterLookupResult {
  name: string;
  world: string;
  level: number;
  vocation: string;
}

export interface CharacterLookupProvider {
  lookup(name: string): Promise<CharacterLookupResult | null>;
}
