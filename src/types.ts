export interface ObserverCoordinates {
  lat: number;
  lng: number;
  cityName: string;
}

export interface WeatherCondition {
  temp: number;
  humidity: number;
  clouds: number;
  wind: number;
  transparency: string; // e.g., "Excellent", "Moderate", "Poor"
  seeing: number; // Stargazing metric 1 to 5 index
}

export enum CelestialType {
  SPACECRAFT = "Spacecraft",
  PLANET = "Planet",
  CONSTELLATION = "Constellation"
}

export interface CelestialBody {
  id: string;
  name: string;
  type: CelestialType;
  noradId?: string; // For satellites
  altitude?: number; // km (for spacecraft)
  velocity?: number; // km/s (for spacecraft)
  distance?: number; // AU for planets, light-years for stars
  magnitude?: number; // Apparent brightness
  description: string;
  lore: string;
  // Positions dynamically calculated:
  azimuth?: number; // 0° (North) to 360°
  elevation?: number; // -90° to +90° (positive means visible)
  inView?: boolean;
}

export interface StargazingPass {
  name: string;
  type: string;
  timeRemaining: string; // e.g., "00:12:45"
  peakElevation: number; // deg
}

export interface AtmosphereMetrics {
  extinction: number; // mag/airmass
  skyBrightness: number; // mag/arcsec²
}
