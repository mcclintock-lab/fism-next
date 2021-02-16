/**
 * @group smoke
 */
import Handler from "./protectionLevel";
import {
  getExampleSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

const protectionLevel = Handler.func;

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof protectionLevel).toBe("function");
  });
  test("tests run against all examples", async () => {
    const examples = await getExampleSketches();
    for (const example of examples) {
      const result = await protectionLevel(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "protectionLevel", example.properties.name);
    }
  });
});
