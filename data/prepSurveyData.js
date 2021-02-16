const shapefile = require("shapefile");
const fs = require("fs");
const projection = require("@turf/projection");

const FILES = {
  Aquaculture: "Aquaculture.shp",
  "Commercial fishing": "Commercial_Fishing_.shp",
  "Kayak, Canoe, Paddleboard": "Kayak_canoe_Paddleboard.shp",
  "Motorboat, anchoring, swimming": "Boat_anchor_swim.shp",
  "Motorboat, anchoring, visiting beach": "Boat__anchor__beach.shp",
  "Motorboating, no anchoring": "Motorboating_no_anchoring.shp",
  Other: "Other.shp",
  "Rec fishing from a motorboat": "Rec_Fishing_from_a_motorized_boat.shp",
  "Rec fishing from a self-propelled boat":
    "Rec_fishing_from_a_self_propelled_boat_2.shp",
  "Rec fishing from shore": "Rec_fishing_from_shore.shp",
  "Rec shell fishing, clamming": "Rec_shellfishing_clamming2.shp",
  "Sailing and windsurfing": "Sailing_Windsurfing.shp",
  "Scuba or snorkel from boat": "scuba_snorkel_from_boat.shp",
  "Scuba or snorkel from shore": "Scuba_snorkel_from_shore.shp",
  Surfing: "Surfing.shp",
  Swimming: "Swimming.shp",
  "Vessel transit and transportation": "Vessel_Transit_Transportation.shp",
};

(async () => {
  const collectedFeatures = [];
  const counts = {};
  for (const type in FILES) {
    try {
      const featureCollection = await readShape(type);
      // console.log(featureCollection);
      for (const feature of featureCollection.features) {
        collectedFeatures.push(
          projection.toWgs84({
            ...feature,
            properties: {
              type,
            },
          })
        );
      }
      counts[type] = featureCollection.features.length;
    } catch (e) {
      console.error(e);
    }
  }

  fs.writeFileSync(
    "./surveyPoints.json",
    JSON.stringify({
      type: "FeatureCollection",
      features: collectedFeatures,
    })
  );
  fs.writeFileSync("./surveyTotals.json", JSON.stringify(counts));
  console.log(`Wrote files to "./surveyPoints.json" and "./surveyTotals.json"`);
})();

async function readShape(type) {
  const featureCollection = {
    type: "FeatureCollection",
    features: [],
  };
  const source = await shapefile.open(
    `./src/survey_results_102020/${FILES[type]}`
  );
  while (true) {
    const result = await source.read();
    if (result.done) break;
    featureCollection.features.push(result.value);
  }
  return featureCollection;
}
