import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  sketchArea,
  isCollection,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import { AllGeoJSON, BBox } from "@turf/helpers";

const SCORES: { [reg: string]: number } = {
  FERT_PART: 1,
  FERT_REG: 2,
  FERT_PLUS: 3,
};

export interface WatershedResults {
  /** area of the sketch in square meters */
  scores: { score: 0 | 1 | 2 | 3 | 4; zoneName: string; percentArea: number }[];
  totalScore: number;
}

async function watershed(
  sketch: Sketch | SketchCollection
): Promise<WatershedResults> {
  const totalArea = sketchArea(sketch);
  const scores: {
    score: 0 | 1 | 2 | 3 | 4;
    zoneName: string;
    percentArea: number;
  }[] = [];
  for (const feature of isCollection(sketch) ? sketch.features : [sketch]) {
    let score: 0 | 1 | 2 | 3 | 4 = 0;
    for (const reg of JSON.parse(
      feature.properties.userAttributes.find(
        (attr) => attr.exportId === "WATER"
      )?.value || "[]"
    ) as string[]) {
      if (SCORES[reg] && SCORES[reg] > score) {
        score = SCORES[reg] as 0 | 1 | 2 | 3 | 4;
      }
    }
    scores.push({
      score,
      zoneName: feature.properties.name,
      percentArea: sketchArea(feature) / totalArea,
    });
  }

  return {
    scores,
    totalScore: isCollection(sketch)
      ? Math.round(
          scores.reduce((sum, s) => {
            return sum + s.score * s.percentArea;
          }, 0)
        )
      : scores[0].score,
  };
}

export default new GeoprocessingHandler(watershed, {
  title: "watershed",
  description: "Simple attribute-based calculation of protection score",
  timeout: 2, // seconds
  memory: 1024, // megabytes
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
