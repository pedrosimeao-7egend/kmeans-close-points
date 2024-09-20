export interface HeatmapConfig {
  defaultRadius: number;
  defaultRenderer: string;
  defaultGradient: { [key: number]: string };
  defaultMaxOpacity: number;
  defaultMinOpacity: number;
  defaultBlur: number;
  defaultXField: string;
  defaultYField: string;
  defaultValueField: string;
  plugins: { [key: string]: any };
}

export type Data = {
    x: number;
    y: number;
    value: number;
}

export type Point = {
    x: number;
    y: number;
}

export type HeatmapData = {
    min: number;
    max: number;
    data: Data[];
}