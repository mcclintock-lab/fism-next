import {
  ValidationError,
  PreprocessingHandler,
} from "@seasketch/geoprocessing";
import area from "@turf/area";
import { Feature, BBox, Polygon, MultiPolygon } from "geojson";
import shoreline from "../../data/shore-multi-new.json";
import { diff, intersection } from "martinez-polygon-clipping";
import buffer from "@turf/buffer";

const DEFAULT_BUFFER = 750;
const BUFFER_ATTR = "BUFF_DIST";

async function clipToShoreline(feature: Feature): Promise<Feature> {
  console.time("clip");
  if (!isPolygon(feature)) {
    throw new ValidationError("Input must be a polygon");
  }
  const bufferDistance =
    feature.properties && feature.properties[BUFFER_ATTR]
      ? parseInt(feature.properties[BUFFER_ATTR])
      : DEFAULT_BUFFER;

  // Create clipping mask
  const buffered = buffer(
    shoreline.features[0] as Feature<MultiPolygon>,
    bufferDistance,
    { units: "feet" }
  );

  let clippedCoords = diff(
    feature.geometry.coordinates,
    shoreline.features[0].geometry.coordinates
  );

  clippedCoords = intersection(clippedCoords, buffered.geometry.coordinates);

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
  timeout: 30,
  memory: 1024,
  requiresProperties: [],
});

function isPolygon(feature: Feature): feature is Feature<Polygon> {
  return feature.geometry.type === "Polygon";
}
