import {
  Card,
  ResultsCard,
  SketchAttributesCard,
} from "@seasketch/geoprocessing/client";
import useSketchProperties from "@seasketch/geoprocessing/src/hooks/useSketchProperties";
import React from "react";
import { SeagrassResults } from "../functions/seagrass";
import { WatershedResults } from "../functions/watershed";
import ScoreIndicator from "./ScoreIndicator";
const Number = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumFractionDigits: 1,
});

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const scores: { [reg: string]: number } = {
  FERT_PART: 1,
  FERT_REG: 2,
  FERT_PLUS: 3,
};

const labels: { [score: number]: string } = {
  0: "Not protected",
  1: "Minimally protected",
  2: "Highly protected",
  3: "Fully protected",
};

const descriptions: { [score: number]: string } = {
  0: "Unregulated fertilizer use and conventional septic systems",
  1: "Partially regulated fertilizer use only",
  2: "Fully regulated fertilizer use only",
  3: "Fully regulated fertilizer use and alternative onsite wastewater treatment systems that reduce nitrogen loading below seagrass tolerance thresholds (<3 g TN m-2 y-1)",
};

export default function WatershedProtection({ hidden }: { hidden: boolean }) {
  const [attributes, getAttribute] = useSketchProperties();
  let watershedProtections = getAttribute("WATER", []);
  if (!Array.isArray(watershedProtections)) {
    watershedProtections = JSON.parse(watershedProtections) as string[];
  }
  const [props] = useSketchProperties();
  const isCollection = props.isCollection;

  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <ResultsCard title="Watershed Protection" functionName="watershed">
        {(data: WatershedResults) => {
          const score = Math.floor(data.totalScore) as 0 | 1 | 2 | 3 | 4;
          return (
            <>
              <p style={{ fontSize: 14 }}>
                This report estimates a measure of the level of protection of
                seagrass from land-based sources of nitrogen pollution. The goal
                of watershed protection is to reduce nitrogen loading to SMAs
                from land-based sources on the island (e.g. fertilizer use and
                wastewater). Restrictions and goals are based research by{" "}
                <a href="https://www.conservationgateway.org/Documents/UNH%20Eelgrass%20Final%20Report%202012.pdf">
                  Short et al., 2012
                </a>
                , Watson et al., 2018, and{" "}
                <a href="http://easterndivision.s3.amazonaws.com/Marine/Seagrass%20Report_Phase%20II_Final_05May14.pdf">
                  Woods Hole Group, 2014
                </a>
              </p>
              <ScoreIndicator score={score} />

              <h5
                style={{
                  fontSize: 18,
                  paddingTop: 4,
                  marginTop: 16,
                  lineHeight: "32px",
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                {labels[score]}
              </h5>

              <p style={{ paddingTop: 0, marginTop: 0, fontSize: 13 }}>
                {descriptions[score]}
              </p>
              <h5
                style={{
                  marginBottom: 0,
                  paddingBottom: 0,
                  marginTop: 5,
                  clear: "both",
                }}
              >
                Watershed protection scoring is calculated as:
              </h5>
              <p style={{ marginTop: 5, fontSize: 13 }}>
                {Object.keys(labels).map((score) => (
                  <div>
                    {score}. {labels[parseInt(score)]}
                  </div>
                ))}
              </p>
              {isCollection && (
                <>
                  <table
                    style={{ textAlign: "center", fontSize: 13, width: "100%" }}
                  >
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>Class</th>
                        <th style={{ textAlign: "left" }}>Zone Name</th>
                        <th>Area</th>
                      </tr>
                      {data.scores.map((record) => {
                        return (
                          <tr>
                            <td style={{ textAlign: "left" }}>
                              <ScoreIndicator
                                small
                                inline
                                score={record.score}
                              />
                            </td>
                            <td style={{ textAlign: "left" }}>
                              {record.zoneName}
                            </td>
                            <td>{Percent.format(record.percentArea)}</td>
                          </tr>
                        );
                      })}
                    </thead>
                  </table>
                </>
              )}
            </>
          );
        }}
      </ResultsCard>
    </div>
  );
}
