import React, { useState } from "react";
import {
  ResultsCard,
  SketchAttributesCard,
  Skeleton,
  useFunction,
  LayerToggle,
} from "@seasketch/geoprocessing/client";
import { SeagrassResults } from "../functions/seagrass";
import ScoreIndicator from "./ScoreIndicator";
import { isCollection } from "@seasketch/geoprocessing";
import useSketchProperties from "@seasketch/geoprocessing/src/hooks/useSketchProperties";

const Number = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumFractionDigits: 1,
});

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

export default function Overview({ hidden }: { hidden: boolean }) {
  const [props] = useSketchProperties();
  const isCollection = props.isCollection;
  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      {/* <SketchAttributesCard autoHide={true} /> */}
      <ResultsCard
        title="Zone Size"
        functionName="seagrass"
        skeleton={
          <p>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{ width: "80%" }}>&nbsp;</Skeleton>
          </p>
        }
      >
        {(data: SeagrassResults) => {
          return (
            <>
              {isCollection && (
                <div>
                  <table
                    style={{
                      fontSize: 14,
                      width: "100%",
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>Name</th>
                        <th>Area (acres)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(data.sketchAcres!).map((label) => (
                        <tr>
                          <td style={{ textAlign: "left" }}>{label}</td>
                          <td>{Number.format(data.sketchAcres![label])}</td>
                        </tr>
                      ))}
                      <tr>
                        <td
                          style={{
                            textAlign: "left",
                            // borderTop: "1px solid #efefef",
                            // paddingTop: 2,
                            fontWeight: "bold",
                          }}
                        >
                          Total
                        </td>
                        <td
                          style={{
                            // borderTop: "1px solid #efefef",
                            // paddingTop: 2,
                            fontWeight: "bold",
                          }}
                        >
                          {Number.format(data.acres)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {!isCollection && (
                <p style={{ fontSize: 14 }}>
                  The selected Seagrass Management Area is{" "}
                  <b>{Number.format(data.acres)} acres</b>. The seagrass extent
                  of this SMA is{" "}
                  <b>{Number.format(data.currentSeagrassAcres)} acres</b>, or{" "}
                  <b>{Percent.format(data.protectedSeagrassPercent)}</b> of the
                  total 2017 eelgrass extent of{" "}
                  {Number.format(data.currentSeagrassTotalAcres)} acres.
                </p>
              )}
              {isCollection && (
                <p>
                  The seagrass extent of this SMA Collection is{" "}
                  <b>{Number.format(data.currentSeagrassAcres)} acres</b>, or{" "}
                  <b>{Percent.format(data.protectedSeagrassPercent)}</b> of the
                  total 2017 eelgrass extent of{" "}
                  {Number.format(data.currentSeagrassTotalAcres)} acres.
                </p>
              )}
            </>
          );
        }}
      </ResultsCard>
      <ResultsCard
        title="Seagrass Ecosystem Composition Score"
        functionName="seagrass"
        skeleton={
          <p>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{ width: "80%" }}>&nbsp;</Skeleton>
          </p>
        }
      >
        {(data: SeagrassResults) => <EcosystemCompositionScore data={data} />}
      </ResultsCard>
      <ResultsCard
        title="Eelgrass Site Suitability"
        functionName="seagrass"
        skeleton={
          <p>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{ width: "80%" }}>&nbsp;</Skeleton>
          </p>
        }
      >
        {(data: SeagrassResults) => <SiteSuitability data={data} />}
      </ResultsCard>
      <ResultsCard
        title="Change in Seagrass"
        functionName="seagrass"
        skeleton={
          <p>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
            <Skeleton style={{}}>&nbsp;</Skeleton>
          </p>
        }
      >
        {(data: SeagrassResults) => (
          <>
            <table
              style={{
                marginTop: 10,
                width: "100%",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      paddingBottom: 4,
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    Type
                  </th>
                  <th style={{ paddingBottom: 4, fontWeight: 600 }}>
                    Area (acres)
                  </th>
                  <th style={{ paddingBottom: 4, fontWeight: 600 }}>
                    Total Change
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left" }}>
                    Gain (87.0 acres, +21.6%)
                  </td>
                  <td>{Number.format(data.seagrassChange.gain.acres)}</td>
                  <td>{Percent.format(data.seagrassChange.gain.percent)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left" }}>
                    No Change (259.7 acres, 64.4%)
                  </td>
                  <td>{Number.format(data.seagrassChange.noChange.acres)}</td>
                  <td>
                    {Percent.format(data.seagrassChange.noChange.percent)}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left" }}>
                    Loss (143.2 acres, -35.6%){" "}
                  </td>
                  <td>{Number.format(data.seagrassChange.loss.acres)}</td>
                  <td>{Percent.format(data.seagrassChange.loss.percent)}</td>
                </tr>
              </tbody>
            </table>
            <p>
              <LayerToggle
                layerId={"5e80c848cd44abca6e5266c9"}
                label="Show Eelgrass Change 2012 - 2017 Layer"
              />
            </p>
          </>
        )}
      </ResultsCard>
    </div>
  );
}

const SiteSuitability = ({ data }: { data: SeagrassResults }) => {
  let suitabilityClassLabel = "No suitable area beyond 2017 extent";
  let suitabilityLabel = "Not Suitable";
  const [props] = useSketchProperties();
  const isCollection = props.isCollection;

  switch (data.seagrassSiteSuitability.score) {
    case 4:
      suitabilityLabel = "Very Highly Suitable";
      suitabilityClassLabel =
        "> 20% of non-eelgrass area could support eelgrass and >50% of this area is highly suitable";
      break;
    case 3:
      suitabilityLabel = "Highly Suitable";
      suitabilityClassLabel =
        "> 20% of non-eelgrass area could support eelgrass and <50% of this area is highly suitable";
      break;
    case 2:
      suitabilityLabel = "Moderately Suitable";
      suitabilityClassLabel =
        "10-20% of the non-eelgrass area could support eelgrass.";
      break;
    case 1:
      suitabilityLabel = "Lightly Suitable";
      suitabilityClassLabel =
        "< 10% of the non-eelgrass area could support eelgrass.";
      break;
    default:
      break;
  }
  const colors = [
    "rgb(72,46,19)",
    "rgb(68,25,105)",
    "rgb(115,25,74)",
    "rgb(203,131,44)",
    "rgb(78, 142, 135)",
  ];
  return (
    <>
      <p style={{ fontSize: 14 }}>
        This report summarizes a measure of the extent of benthic habitat
        suitable for eelgrass colonization present within the SMA boundaries
        that did not contain eelgrass in 2017. This{" "}
        {isCollection ? "collection" : "SMA"} contains{" "}
        <b>
          {Number.format(
            data.seagrassSiteSuitability.goodArea.acres +
              data.seagrassSiteSuitability.okArea.acres
          )}
        </b>{" "}
        acres of potential eelgrass colonization sites, or{" "}
        <b>
          {Percent.format(
            data.seagrassSiteSuitability.goodArea.percent +
              data.seagrassSiteSuitability.okArea.percent
          )}
        </b>
        , of the area of the {isCollection ? "Collection" : "SMA"}.
      </p>
      <ScoreIndicator score={data.seagrassSiteSuitability.score} />

      <h5
        style={{
          fontSize: 18,
          paddingTop: 0,
          marginTop: 8,
          lineHeight: "32px",
          marginBottom: 0,
          paddingBottom: 0,
        }}
      >
        {suitabilityLabel}
      </h5>

      <p style={{ paddingTop: 0, marginTop: 0, fontSize: 13 }}>
        {suitabilityClassLabel}. These scores are based on research from{" "}
        <a target="_blank" href="https://opencommons.uconn.edu/marine_sci/3/">
          Vaudrey et al., 2013{" "}
        </a>
      </p>
      <h5 style={{ marginBottom: 0, paddingBottom: 0, marginTop: 5 }}>
        Eelgrass habitat suitability scores are calculated as:
      </h5>
      <p style={{ marginTop: 5, fontSize: 13 }}>
        0. No suitable area beyond 2017 extent
        <br />
        1. Less than 10% of non-eelgrass area could support eelgrass (≥50
        threshold)
        <br />
        2. 10-20% of non-eelgrass area could support eelgrass (≥50 threshold)
        <br />
        3. More than 20% of non-eelgrass area could support eelgrass (≥50
        threshold) AND LESS THAN half of that area is highly suitable for
        eelgrass (≥88 threshold)
        <br />
        4. More than 20% of non-eelgrass area could support eelgrass (≥50
        threshold) AND at least half of that area is highly suitable for
        eelgrass (≥88 threshold)
        <br />
      </p>
      <LayerToggle
        layerId={"5eb2ead3ddf0760320ef69ff"}
        label="Show Eelgrass Habitat Suitability Index Layer"
      />
    </>
  );
};

const EcosystemCompositionScore = ({ data }: { data: SeagrassResults }) => {
  let seagrassScore = 0;
  let seagrassClassLabel = "No Seagrass";
  if (data.protectedSeagrassPercent > 0.75) {
    seagrassClassLabel = "More than 75% Seagrass";
    seagrassScore = 4;
  } else if (data.protectedSeagrassPercent > 0.5) {
    seagrassClassLabel = "Between 50 and 75% Seagrass";
    seagrassScore = 3;
  } else if (data.protectedSeagrassPercent > 0.25) {
    seagrassClassLabel = "Between 25% and 50% Seagrass";
    seagrassScore = 2;
  } else if (data.protectedSeagrassPercent > 0) {
    seagrassClassLabel = "25% or less Seagrass";
    seagrassScore = 1;
  }
  const [props] = useSketchProperties();
  const isCollection = props.isCollection;

  return (
    <>
      <ScoreIndicator score={seagrassScore as 0 | 1 | 2 | 3 | 4} />
      <h5
        style={{
          fontSize: 18,
          paddingTop: 0,
          marginTop: 8,
          lineHeight: "32px",
          marginBottom: 0,
          paddingBottom: 0,
        }}
      >
        {seagrassClassLabel}
      </h5>

      <p style={{ paddingTop: 0, marginTop: 0, fontSize: 13 }}>
        This score is based on the percentage of the 2017 seagrass extent within
        the SMA boundaries, and ranges from 0 (no seagrass) to 4 (More than 75%
        of the seagrass extent).{" "}
      </p>
      {/* <br /> */}
      <h5 style={{ marginBottom: 0, paddingBottom: 0, marginTop: 5 }}>
        Habitat composition scores are calculated as:
      </h5>
      <p style={{ marginTop: 5, fontSize: 13 }}>
        0. No seagrass
        <br />
        1. SMA contains 25% or less of the 2017 seagrass extent
        <br />
        2. SMA contains 26-50% of the 2017 seagrass extent
        <br />
        3. SMA contains 51-75% of the 2017 seagrass extent
        <br />
        4. SMA contains more than 75% of the 2017 seagrass extent
        <br />
      </p>
      <LayerToggle
        layerId={"5e80c8a8cd44abca6e5268af"}
        label="Show USFWS LIS Eelgrass 2017 Layer"
      />
    </>
  );
};
