import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  sketchArea,
  isCollection,
  getUserAttribute,
} from "@seasketch/geoprocessing";

export interface ProtectionLevelScore {
  /* Fraction of the collection this zone's area represents. 1.0 for single-sketch analysis */
  percentArea: number;
  score: number;
  /* 0-4 score presented to the user */
  presentedScore: 0 | 1 | 2 | 3 | 4;
  zoneName: string;
}

export interface ProtectionLevelResults {
  /** area of the sketch in square meters */
  scores: ProtectionLevelScore[];
  totalScore: number;
  presentedTotalScore: 0 | 1 | 2 | 3 | 4;
}

async function protectionLevel(
  sketch: Sketch | SketchCollection
): Promise<ProtectionLevelResults> {
  let scores: ProtectionLevelScore[] = [];
  if (isCollection(sketch)) {
    const totalArea = sketchArea(sketch);
    for (const feature of sketch.features) {
      const score = protectionLevelForSketch(feature);
      scores.push({
        score,
        percentArea: sketchArea(feature) / totalArea,
        presentedScore: presentedScore(score),
        zoneName: feature.properties.name,
      });
    }
  } else {
    const score = protectionLevelForSketch(sketch);
    scores.push({
      score,
      percentArea: 1.0,
      presentedScore: presentedScore(score),
      zoneName: sketch.properties.name,
    });
  }
  let totalScore = scores[0].score;
  let presentedTotalScore = scores[0].presentedScore as 0 | 1 | 2 | 3 | 4;
  if (isCollection(sketch)) {
    totalScore = scores.reduce((sum, s) => {
      return sum + s.score * s.percentArea;
    }, 0);
    presentedTotalScore = presentedScore(totalScore);
  }

  return { scores, totalScore, presentedTotalScore };
}

export default new GeoprocessingHandler(protectionLevel, {
  title: "protectionLevel",
  description: "Calculates Horta e Costa-style protection level",
  timeout: 4, // seconds
  memory: 256, // megabytes
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: ["AQUA", "FISHING", "BOTTOM"],
});

/**
 * Weight of each possible allowed fishing gear type.
 */
const fishingGearScores: { [gear: string]: number } = {
  BEACH_REC: 8,
  BEACH_COM: 8,
  BIVALVE: 7,
  GILL_COM: 6,
  TRAPS_COM: 6,
  LINE_REC: 6,
  LINE_COM: 6,
  BI_DRE_REC: 5,
  BI_DRE_COM: 5,
  TP_REC: 4,
  TP_COM: 4,
  HH_REC: 4,
  HH_COM: 4,
  SP_REC: 3,
  SP_COM: 3,
  CAST_NETS: 3,
  none: 0,
};

/** Doesn't seem to be specified in sketches anymore */
const boatingScores: { [type: string]: number } = {
  UNREG_BOAT: 2,
  FULL_BOAT: 1,
  SCUBA: 1,
  SWIM: 0,
  none: 0,
};

const bottomScores: { [type: string]: number } = {
  EAR_MAT: 3,
  CONST: 2,
  OTHER_BO: 1,
  none: 0,
};

const aquacultureScores: { [type: string]: number } = {
  NEAR_FISH: 3,
  OFF_FISH: 2,
  SHELL_SUS: 1,
  SHELL_BOT: 1,
  none: 0,
};

function protectionLevelForSketch(sketch: Sketch) {
  const gearTypes: string[] = getAttr(sketch, "FISHING", []).filter(
    (v) => v !== "none"
  );
  let maxGearTypeScore = 0;
  maxGearTypeScore =
    Math.max(...gearTypes.map((t) => fishingGearScores[t] || 0)) ||
    maxGearTypeScore;

  const aquaculture: string[] = getAttr(sketch, "AQUA", []);
  const aquacultureScore = sum(...aquaculture.map((t) => aquacultureScores[t]));
  const bottom: string[] = getAttr(sketch, "BOTTOM", []);
  const bottomScore = sum(...bottom.map((t) => bottomScores[t]));
  const aquaAndBottomExploitationScore = aquacultureScore + bottomScore;
  // Boating doesn't seem to be specified anymore
  // const boatingTypes: string[] = getAttr(sketch, "BOAT")
  const numGearTypes = gearTypes.length;
  let score = 0;
  if (numGearTypes > 20) {
    score = 8;
  } else if (numGearTypes >= 16) {
    score = 7;
  } else if (numGearTypes >= 11) {
    score = 6;
  } else if (numGearTypes >= 6) {
    if (maxGearTypeScore == 9) {
      score = 6;
    } else {
      if (aquaAndBottomExploitationScore >= 2) {
        score = 6;
      } else {
        score = 5;
      }
    }
  } else if (numGearTypes >= 1) {
    if (maxGearTypeScore == 9) {
      score = 6;
    } else if (maxGearTypeScore >= 6) {
      if (aquaAndBottomExploitationScore >= 2) {
        score = 6;
      } else {
        score = 5;
      }
    } else {
      if (aquaAndBottomExploitationScore >= 2) {
        score = 6;
      } else {
        score = 4;
      }
    }
  } else {
    if (aquaAndBottomExploitationScore >= 2) {
      score = 6;
    } else if (aquaAndBottomExploitationScore == 1) {
      score = 4;
    } else {
      score = 1;
      // Again, boating attributes don't appear to be set
      // if (boating_score >= 2){
      //     score = 3
      // }else if (boating_score == 1) {
      //     score = 2
      // } else {
      //     score = 1
      // }
    }
  }
  return score;
}

function getAttr<T>(sketch: Sketch, exportid: string, defaultValue: T): T {
  const value = getUserAttribute(sketch, exportid, defaultValue);
  if (typeof value === "string") {
    return JSON.parse(value);
  } else {
    return value;
  }
}

function sum(...values: number[]): number {
  let sum = 0;
  for (const val of values) {
    sum += val;
  }
  return sum;
}

function presentedScore(score: number): 0 | 1 | 2 | 3 | 4 {
  if (score < 3) return 4;
  else if (score < 5) return 3;
  else if (score < 6) return 2;
  else if (score < 7) return 1;
  else return 0;
}
