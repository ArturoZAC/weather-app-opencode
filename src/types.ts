export type City = {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type Unit = "celsius" | "fahrenheit";

export type Config = {
  cities: City[];
  defaultCityName: string | null;
  unit: Unit;
};

export type Weather = {
  temperature: number;
  unit: string;
};

export type DailyForecast = {
  date: string;
  min: number;
  max: number;
  unit: string;
};
