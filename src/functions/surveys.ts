import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  sketchArea,
  isCollection,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import { AllGeoJSON, BBox } from "@turf/helpers";
import activities from "../../data/surveyTotals.json";
import activityPoints from "../../data/surveyPoints.json";
import pointsWithinPolygon from "@turf/points-within-polygon";
import { FeatureCollection, Point, Feature, Polygon } from "geojson";

export interface Count {
  /* number of point features overlapping this sketch */
  overlap: number;
  /* number of points in the entire dataset */
  activityPointCount: number;
}

export interface SurveysResults {
  [activity: string]: Count;
}

async function surveys(
  sketch: Sketch | SketchCollection
): Promise<SurveysResults> {
  let results = initResults();
  if (isCollection(sketch)) {
    for (const feature of sketch.features) {
      const sketchResults = activitiesForSketch(feature);
      for (const type in sketchResults) {
        results[type].overlap += sketchResults[type].overlap;
      }
    }
  } else {
    results = activitiesForSketch(sketch);
  }

  return results;
}

export default new GeoprocessingHandler(surveys, {
  title: "surveys",
  description: "Calculates overlap with human uses survey points",
  timeout: 5, // seconds
  memory: 1024, // megabytes
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});

function activitiesForSketch(sketch: Sketch) {
  const overlappingFeatures = pointsWithinPolygon(
    activityPoints as FeatureCollection<Point>,
    sketch as Feature<Polygon>
  );
  const results = initResults();
  for (const point of overlappingFeatures.features) {
    results[point.properties!.type].overlap += 1;
  }
  return results;
}

function initResults(): SurveysResults {
  const results: SurveysResults = {};
  for (const [activity, count] of Object.entries(activities)) {
    results[activity] = {
      overlap: 0,
      activityPointCount: count,
    };
  }
  return results;
}
