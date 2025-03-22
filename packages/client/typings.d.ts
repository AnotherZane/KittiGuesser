import type { MapboxOptions, Map, LngLatLike } from "mapbox-gl";

interface MazemapOptions extends MapboxOptions {
  container: string;
  style?: string;
  minZoom?: number;
  maxZoom?: number;
  center?: LngLatLike;
  zoom?: number;
  zLevel?: number;
  campuses?: string;
  autoSetRTLTextPlugin?: string;
  zLevelUpdaterType?:
    | "buildingsInView"
    | "buildingClosestToCenter"
    | "userFocused";
  zLevelUpdater?: boolean;
  zLevelControl?: boolean;
}

export class MazemapMap extends Map {
  constructor(options?: MazemapOptions);
}

interface Mazemap {
  Analytics: unknown;
  BlueDot: unknown;
  ColorDot: unknown;
  ColorHalo: unknown;
  Config: unknown;
  CustomPoisLayer: unknown;
  Data: unknown;
  GUIComponents: unknown;
  Highlighter: unknown;
  Hotel: unknown;
  LegacyBlueDot: unknown;
  LngLat: unknown;
  LngLatBounds: unknown;
  LocationController: unknown;
  Map: typeof MazemapMap;
  MazeMarker: unknown;
  Poi: unknown;
  Popup: unknown;
  Route: unknown;
  RouteController: unknown;
  Search: unknown;
  SearchResultPoi: unknown;
  Util: unknown;
  ZLevelBarControl: unknown;
  ZLevelMarker: unknown;
  ZLevelSelectorControl: unknown;
  __esModule: boolean;
  mapboxVersion: unknown;
  mapboxgl: unknown;
  version: unknown;
}

declare global {
  interface Window {
    Mazemap: Mazemap;
  }
}

export {};
