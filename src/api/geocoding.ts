import type { City } from "../types/City.ts";
import { GEOCODE_URL } from "../utils/constants.ts";

type GeocodeResponse = {
  results?: Array<{
    name: string;
    admin1?: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
};

export const geocodeCities = async (
  name: string,
  count = 5,
): Promise<City[]> => {
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding respondió ${response.status}`);

  const data = (await response.json()) as GeocodeResponse;
  return (data.results ?? []).map((match) => ({
    name: match.name,
    admin1: match.admin1,
    country: match.country ?? "",
    latitude: match.latitude,
    longitude: match.longitude,
  }));
};
