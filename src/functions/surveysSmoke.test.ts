/**
 * @group smoke
 */
import Handler from "./surveys";
import {
  getExampleSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

const surveys = Handler.func;

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof surveys).toBe("function");
  });
  test("tests run against all examples", async () => {
    const examples = await getExampleSketches();
    for (const example of examples) {
      const result = await surveys(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "surveys", example.properties.name);
    }
  });
});
