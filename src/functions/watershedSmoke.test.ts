/**
 * @group smoke
 */
import Handler from "./watershed";
import {
  getExampleSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

const watershed = Handler.func;

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof watershed).toBe("function");
  });
  test("tests run against all examples", async () => {
    const examples = await getExampleSketches();
    for (const example of examples) {
      const result = await watershed(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "watershed", example.properties.name);
    }
  });
});
