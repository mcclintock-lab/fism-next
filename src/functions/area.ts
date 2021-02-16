import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  sketchArea,
  isCollection,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import { AllGeoJSON, BBox } from "@turf/helpers";

export interface AreaResults {
  /** area of the sketch in square meters */
  area: number;
  /** area of the sketch in acres */
  acres: number;
}

async function area(sketch: Sketch | SketchCollection): Promise<AreaResults> {
  const sqMeters = sketchArea(sketch);
  return {
    area: sqMeters,
    acres: sqMeters / 4047,
  };
}

export default new GeoprocessingHandler(area, {
  title: "area",
  description: "Calculates acres",
  timeout: 2, // seconds
  memory: 256, // megabytes
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
