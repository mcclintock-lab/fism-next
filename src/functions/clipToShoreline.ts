import {
  ValidationError,
  PreprocessingHandler,
} from "@seasketch/geoprocessing";
import area from "@turf/area";
import { Feature, BBox, Polygon } from "geojson";
import shoreline from "../../data/src/shoreline-multi.json";
import { diff } from "martinez-polygon-clipping";

async function clipToShoreline(feature: Feature): Promise<Feature> {
  if (!isPolygon(feature)) {
    throw new ValidationError("Input must be a polygon");
  }
  const clippedCoords = diff(
    feature.geometry.coordinates,
    shoreline.features[0].geometry.coordinates
  );
  const clipped = {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: clippedCoords[0],
    },
  };
  if (area(clipped) === 0) {
    throw new ValidationError("Sketch is outside of project boundaries");
  } else {
    return clipped as Feature<Polygon>;
  }
}

export default new PreprocessingHandler(clipToShoreline, {
  title: "clipToShoreline",
  description: "Erases land features from the sketch",
  timeout: 1,
  memory: 256,
  requiresProperties: [],
});

function isPolygon(feature: Feature): feature is Feature<Polygon> {
  return feature.geometry.type === "Polygon";
}
