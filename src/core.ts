import { Data, HeatmapConfig, HeatmapData } from "./types";
import { merge } from "./utils"

const defaultHeatmapConfig: HeatmapConfig = {
    defaultRadius: 40,
    defaultRenderer: "canvas2d",
    defaultGradient: {
      0.25: "rgb(0,0,255)",
      0.55: "rgb(0,255,0)",
      0.85: "yellow",
      1.0: "rgb(255,0,0)",
    },
    defaultMaxOpacity: 1,
    defaultMinOpacity: 0,
    defaultBlur: 0.85,
    defaultXField: "x",
    defaultYField: "y",
    defaultValueField: "value",
    plugins: {},
  };

export const createHeatmap = (container: HTMLDivElement, config?: HeatmapConfig) => {
    const mergedConfig = merge(defaultHeatmapConfig, config || {});

    let _data: Array<HeatmapData> = []

    const createCanvasIntoContainer = () => {
        const canvas = document.createElement("canvas");
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        container.appendChild(canvas);
        return canvas;
    }


    const addData = (data: Data) => {
        console.log("Adding data", data);

        // Add data to heatmap
        // TODO: review this
        const heatmapData = {
            min: 0,
            max: 100,
            data: [{ x: data.x, y: data.y, value: data.value }],
        };

        _data.push(heatmapData);

        return _data;
    }

    return {
        addData,
    }
}

const heatmapContainer = document.getElementById("heatmap") as HTMLDivElement;
let heatmap = createHeatmap(heatmapContainer);
heatmap.addData({ x: 100, y: 100, value: 10 });