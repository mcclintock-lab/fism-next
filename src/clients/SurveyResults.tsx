import {
  Card,
  ResultsCard,
  SketchAttributesCard,
} from "@seasketch/geoprocessing/client";
import useSketchProperties from "@seasketch/geoprocessing/src/hooks/useSketchProperties";
import React from "react";
import { SurveysResults } from "../functions/surveys";
const Number = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumFractionDigits: 1,
});

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

export default function SurveyResults({ hidden }: { hidden: boolean }) {
  return (
    <div style={{ display: hidden ? "none" : "block", fontSize: 14 }}>
      <ResultsCard title="Survey Results of Human Uses" functionName="surveys">
        {(data: SurveysResults) => (
          <>
            <table style={{ width: "100%", textAlign: "center" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th>Count</th>
                  <th>Percent of Activity</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(data).map((activity) => (
                  <tr
                    style={
                      data[activity].overlap === 0
                        ? { color: "rgba(0,0,0,0.5)" }
                        : {}
                    }
                  >
                    <td style={{ textAlign: "left" }}>{activity}</td>
                    <td>{Number.format(data[activity].overlap)}</td>
                    <td>
                      {Percent.format(
                        data[activity].overlap /
                          data[activity].activityPointCount
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </ResultsCard>
    </div>
  );
}
