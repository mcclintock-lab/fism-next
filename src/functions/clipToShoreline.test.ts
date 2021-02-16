import Handler from "./clipToShoreline";
import {
  getExampleFeatures,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";
import { ValidationError } from "@seasketch/geoprocessing";
import calcArea from "@turf/area";

const clipToShoreline = Handler.func;

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof clipToShoreline).toBe("function");
  });
  test("tests run against all examples", async () => {
    const examples = await getExampleFeatures();
    for (const example of examples) {
      try {
        const result = await clipToShoreline(example);
        expect(result).toBeTruthy();
        writeResultOutput(result, "clipToShoreline", example.properties.name);
      } catch (e) {
        if (e instanceof ValidationError) {
          // ValidationErrors don't indicate failures, just comprehensive tests
        } else {
          throw e;
        }
      }
    }
  });
});

describe("Unit tests", () => {
  test("dumpling islands are removed", async () => {
    const examples = await getExampleFeatures();
    const dumpling = examples.find(
      (ex) => ex.properties.name === "dumplingIslands.json"
    );
    if (!dumpling) {
      throw new Error("Could not find example 'dumplingIslands.json'");
    }
    const areaBefore = calcArea(dumpling);
    const result = await clipToShoreline(dumpling);
    expect(calcArea(result)).toBeLessThan(areaBefore);
  });
});
