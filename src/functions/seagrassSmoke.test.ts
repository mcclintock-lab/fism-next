/**
 * @group smoke
 */
import Handler from "./seagrass";
import {
  getExampleSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

const eelgrass = Handler.func;

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof eelgrass).toBe("function");
  });
  test("tests run against all examples", async () => {
    const examples = await getExampleSketches();
    for (const example of examples) {
      const result = await eelgrass(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "seagrass", example.properties.name);
    }
  });
});
