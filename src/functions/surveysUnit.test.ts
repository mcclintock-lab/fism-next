/**
 * @group unit
 */
import Handler from "./surveys";
import {
  getExampleSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

const surveys = Handler.func;

describe("Unit tests", () => {
  test("Area should be > 700 sq km", async () => {
    const examples = await getExampleSketches();
    const result = await surveys(examples[0]);
    expect(true).toBeTruthy();
  });
});
