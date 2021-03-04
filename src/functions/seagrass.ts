import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  sketchArea,
  isCollection,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import {
  BBox,
  Polygon,
  MultiPolygon,
  Feature,
  Geometry,
  FeatureCollection,
} from "geojson";
import { intersection } from "martinez-polygon-clipping";
import totals from "../../data/totals.json";
import currentEelgrass from "../../data/src/currentEelgrassMultipolygon.json";
import seagrassChange from "../../data/src/seagrassChange.json";
import calcArea from "@turf/area";
import okSuitability from "../../data/src/suitability-under-88-clipped.json";
import goodSuitability from "../../data/src/suitability-over-88-clipped.json";
import dissolve from "@turf/dissolve";

export interface AreaMeasure {
  squareMeters: number;
  acres: number;
  percent: number;
}

export interface SeagrassResults {
  /** area of the sketch in square meters */
  area: number;
  /** area of the sketch in acres */
  acres: number;
  /** area in acres of each sketch in the collection (if it is a collection) */
  sketchAcres?: { [sketchName: string]: number };
  /** total seagrass area for the entire study region */
  currentSeagrassTotalAcres: number;
  /** area of shape that overlaps current seagrass habitat. in acres */
  currentSeagrassAcres: number;
  /** Percentage of current seagrass that would be protected by this SMA */
  protectedSeagrassPercent: number;
  /** 0 - 4. This score is based on the percentage of the 2017 seagrass extent within the SMA boundaries, and ranges from 0 (no seagrass) to 4 (More than 75% of the seagrass extent). */
  seagrassCompositionScore: number;
  /** Within the area of interest, change in acres  */
  seagrassChange: {
    gain: AreaMeasure;
    loss: AreaMeasure;
    noChange: AreaMeasure;
  };
  /* In the case of these measures, area.percent represents the fraction of the zone **not of the whole dataset** */
  seagrassSiteSuitability: {
    score: 0 | 1 | 2 | 3 | 4;
    okArea: AreaMeasure;
    goodArea: AreaMeasure;
    sumSuitableArea: AreaMeasure;
  };
}

async function seagrass(
  sketch: Sketch | SketchCollection
): Promise<SeagrassResults> {
  const sqMeters = sketchArea(sketch);
  const currentSeagrassAcres = calculateCurrentSeagrassOverlap(sketch);

  const protectedSeagrassPercent =
    currentSeagrassAcres / totals.currentSeagrassTotalAcres;
  let seagrassCompositionScore = 0;
  if (protectedSeagrassPercent > 75) {
    seagrassCompositionScore = 4;
  } else if (protectedSeagrassPercent > 50) {
    seagrassCompositionScore = 3;
  } else if (protectedSeagrassPercent > 25) {
    seagrassCompositionScore = 2;
  } else if (protectedSeagrassPercent > 0) {
    seagrassCompositionScore = 1;
  }

  return {
    area: sqMeters,
    acres: sqMeters / 4047,
    sketchAcres: isCollection(sketch)
      ? sketch.features.reduce(
          (obj: { [sketchName: string]: number }, feature) => {
            obj[feature.properties.name] = sketchArea(feature) / 4047;
            return obj;
          },
          {}
        )
      : undefined,
    currentSeagrassAcres: currentSeagrassAcres,
    currentSeagrassTotalAcres: totals.currentSeagrassTotalAcres,
    protectedSeagrassPercent,
    seagrassCompositionScore,
    seagrassChange: calculateSeagrassChange(sketch),
    seagrassSiteSuitability: calculateSeagrassSiteSuitability(sketch),
  };
}

export default new GeoprocessingHandler(seagrass, {
  title: "seagrass",
  description:
    "Calculates intersection with current and potential eelgrass areas",
  timeout: 5, // seconds
  memory: 1024, // megabytes
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});

function calculateSeagrassChangeForSketch(
  sketch: Sketch
): { gain: AreaMeasure; loss: AreaMeasure; noChange: AreaMeasure } {
  if (isCollection(sketch)) {
    throw new Error("Cannot be called with a Collection");
  }
  const change = { gain: BLANK, loss: BLANK, noChange: BLANK };
  for (const feature of seagrassChange.features) {
    let type: "gain" | "loss" | "noChange" = "noChange";
    if (feature.properties.EelgrassStatus === "GAIN") {
      type = "gain";
    } else if (feature.properties.EelgrassStatus === "LOSS") {
      type = "loss";
    }
    const overlap = intersect(
      feature as Feature<Polygon | MultiPolygon>,
      sketch as Feature<Polygon | MultiPolygon>
    );
    if (overlap) {
      const squareMeters = calcArea(overlap);
      change[type] = {
        squareMeters,
        acres: squareMeters / 4047,
        percent: squareMeters / totals.seagrassChange[type],
      };
    }
  }
  return change;
}

function calculateSeagrassChange(sketch: Sketch | SketchCollection) {
  if (isCollection(sketch)) {
    let results: {
      gain: AreaMeasure;
      loss: AreaMeasure;
      noChange: AreaMeasure;
    } = {
      gain: {
        squareMeters: 0,
        acres: 0,
        percent: 0,
      },
      loss: {
        squareMeters: 0,
        acres: 0,
        percent: 0,
      },
      noChange: {
        squareMeters: 0,
        acres: 0,
        percent: 0,
      },
    };
    const dissolved = dissolve(sketch as FeatureCollection<Polygon>);
    for (const feature of dissolved.features) {
      const data = calculateSeagrassChangeForSketch(feature as Sketch);
      results.gain.squareMeters += data.gain.squareMeters;
      results.gain.acres += data.gain.acres;
      results.loss.squareMeters += data.loss.squareMeters;
      results.loss.acres += data.loss.acres;
      results.noChange.squareMeters += data.noChange.squareMeters;
      results.noChange.acres += data.noChange.acres;
    }
    results.gain.percent =
      results.gain.squareMeters / totals.seagrassChange["gain"];
    results.loss.percent =
      results.loss.squareMeters / totals.seagrassChange["loss"];
    results.noChange.percent =
      results.noChange.squareMeters / totals.seagrassChange["noChange"];
    return results;
  } else {
    return calculateSeagrassChangeForSketch(sketch);
  }
}

function calculateSeagrassSiteSuitability(
  sketch: Sketch | SketchCollection
): {
  okArea: AreaMeasure;
  goodArea: AreaMeasure;
  sumSuitableArea: AreaMeasure;
  score: 0 | 1 | 2 | 3 | 4;
} {
  const results = {
    okArea: {
      acres: 0,
      percent: 0,
      squareMeters: 0,
    },
    goodArea: {
      acres: 0,
      percent: 0,
      squareMeters: 0,
    },
    sumSuitableArea: {
      acres: 0,
      percent: 0,
      squareMeters: 0,
    },
  };
  let totalArea = 0;
  if (isCollection(sketch)) {
    const dissolved = dissolve(sketch as FeatureCollection<Polygon>);
    for (const feature of dissolved.features) {
      totalArea += calcArea(feature);
      const data = calculateSeagrassSiteSuitabilityForSketch(feature as Sketch);
      results.okArea.acres += data.okArea.acres;
      results.okArea.squareMeters += data.okArea.squareMeters;
      results.goodArea.acres += data.goodArea.acres;
      results.goodArea.squareMeters += data.goodArea.squareMeters;
      results.sumSuitableArea.acres += data.sumSuitableArea.acres;
      results.sumSuitableArea.squareMeters += data.sumSuitableArea.squareMeters;
    }
    results.okArea.percent = results.okArea.squareMeters / totalArea;
    results.goodArea.percent = results.goodArea.squareMeters / totalArea;
    results.sumSuitableArea.percent =
      results.sumSuitableArea.squareMeters / totalArea;
  } else {
    const data = calculateSeagrassSiteSuitabilityForSketch(sketch);
    totalArea = calcArea(sketch);
    results.okArea = {
      ...data.okArea,
      percent: data.okArea.squareMeters / totalArea,
    };
    results.goodArea = {
      ...data.goodArea,
      percent: data.goodArea.squareMeters / totalArea,
    };
    results.sumSuitableArea = {
      ...data.sumSuitableArea,
      percent: data.sumSuitableArea.squareMeters / totalArea,
    };
  }
  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (results.sumSuitableArea.percent > 0.2) {
    if (results.goodArea.squareMeters >= results.okArea.squareMeters) {
      score = 4;
    } else {
      score = 3;
    }
  } else if (results.sumSuitableArea.percent > 0.1) {
    score = 2;
  } else if (results.sumSuitableArea.percent > 0) {
    score = 1;
  }
  return {
    ...results,
    score,
  };
}

function calculateSeagrassSiteSuitabilityForSketch(
  sketch: Sketch
): {
  okArea: Pick<AreaMeasure, "acres" | "squareMeters">;
  goodArea: Pick<AreaMeasure, "acres" | "squareMeters">;
  sumSuitableArea: Pick<AreaMeasure, "acres" | "squareMeters">;
} {
  const okOverlap = intersect(
    sketch as Feature<Polygon>,
    (okSuitability.features[0] as unknown) as Feature<Polygon>
  );
  const okArea = okOverlap ? calcArea(okOverlap) : 0;
  const goodOverlap = intersect(
    sketch as Feature<Polygon>,
    (goodSuitability.features[0] as unknown) as Feature<Polygon>
  );
  const goodArea = goodOverlap ? calcArea(goodOverlap) : 0;
  return {
    okArea: {
      acres: okArea / 4047,
      squareMeters: okArea,
    },
    goodArea: {
      acres: goodArea / 4047,
      squareMeters: goodArea,
    },
    sumSuitableArea: {
      acres: (okArea + goodArea) / 4047,
      squareMeters: okArea + goodArea,
    },
  };
}

function intersect(
  a: Feature<Polygon | MultiPolygon>,
  b: Feature<Polygon | MultiPolygon>
): Feature<Polygon | MultiPolygon> | null {
  const coords = intersection(a.geometry.coordinates, b.geometry.coordinates);
  if (coords) {
    return {
      ...a,
      geometry: {
        ...a,
        type:
          a.geometry.type === "MultiPolygon" ||
          b.geometry.type === "MultiPolygon"
            ? "MultiPolygon"
            : "Polygon",
        coordinates: coords,
      },
    } as Feature<Polygon | MultiPolygon>;
  } else {
    return null;
  }
}

const BLANK = {
  squareMeters: 0,
  acres: 0,
  percent: 0,
};

function calculateCurrentSeagrassOverlap(sketch: Sketch | SketchCollection) {
  if (isCollection(sketch)) {
    let sum = 0;
    const dissolved = dissolve(sketch as FeatureCollection<Polygon>);
    for (const feature of dissolved.features) {
      sum += calculateCurrentSeagrassOverlapForSketch(feature as Sketch);
    }
    return sum;
  } else {
    return calculateCurrentSeagrassOverlapForSketch(sketch);
  }
}

function calculateCurrentSeagrassOverlapForSketch(sketch: Sketch): number {
  if (isCollection(sketch)) {
    throw new Error("Cannot be called with sketch");
  }
  let currentSeagrassAcres = 0;
  const overlapCoords = intersection(
    currentEelgrass.features[0].geometry.coordinates,
    (sketch.geometry as Polygon).coordinates
  );
  const overlapFeature = {
    ...sketch,
    geometry: {
      ...sketch.geometry,
      type: "MultiPolygon",
      coordinates: overlapCoords,
    },
  };
  currentSeagrassAcres = calcArea(overlapFeature) / 4047;
  return currentSeagrassAcres;
}
