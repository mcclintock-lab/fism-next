/**
 * @group unit
 */
import Handler from "./seagrass";
import {
  getExampleSketches,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";
import area from "@turf/area";

const seagrass = Handler.func;

describe("Unit tests", () => {
  test("HungryPoint area should be 127 acres", async () => {
    const examples = await getExampleSketches();
    const result = await Handler.func(
      examples.find((e) => e.properties.name === "HungryPoint")!
    );
    expect(Math.round(result.acres)).toBe(127);
  });

  test("Total current eelgrass area in study region should be 347 acres", async () => {
    const examples = await getExampleSketches();
    const result = await Handler.func(
      examples.find((e) => e.properties.name === "HungryPoint")!
    );
    expect(Math.round(result.currentSeagrassTotalAcres)).toBe(347);
  });

  test("HungryPoint current eelgrass acres should be ~41 acres", async () => {
    const examples = await getExampleSketches();
    const result = await Handler.func(
      examples.find((e) => e.properties.name === "HungryPoint")!
    );
    expect(Math.round(result.currentSeagrassAcres)).toBe(41);
  });

  test("HungryPoint seagrass ecosystem composition score = 1", async () => {
    const examples = await getExampleSketches();
    const result = await Handler.func(
      examples.find((e) => e.properties.name === "HungryPoint")!
    );
    expect(Math.round(result.seagrassCompositionScore)).toBe(1);
  });
});
