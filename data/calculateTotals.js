const currentEelgrass = require("./src/currentEelgrassMultipolygon.json");
const changes = require("./src/seagrassChange.json");
const calcArea = require("@turf/area").default;

console.log(
  JSON.stringify({
    currentSeagrassTotalAcres: calcArea(currentEelgrass.features[0]) / 4047,
    seagrassChange: {
      gain: calcArea(
        changes.features.find((f) => f.properties.EelgrassStatus === "GAIN")
      ),
      loss: calcArea(
        changes.features.find((f) => f.properties.EelgrassStatus === "LOSS")
      ),
      noChange: calcArea(
        changes.features.find((f) => f.properties.EelgrassStatus === "NOCHANGE")
      ),
    },
  })
);
