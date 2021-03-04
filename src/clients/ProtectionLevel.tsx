import {
  Card,
  LayerToggle,
  ResultsCard,
  SketchAttributesCard,
} from "@seasketch/geoprocessing/client";
import useSketchProperties from "@seasketch/geoprocessing/src/hooks/useSketchProperties";
import React from "react";
import { ProtectionLevelResults } from "../functions/protectionLevel";
import { SeagrassResults } from "../functions/seagrass";
import ScoreIndicator from "./ScoreIndicator";
import attributeLabels from "../../data/src/attributeLabels.json";
import { UserAttribute } from "@seasketch/geoprocessing/src/types";

const Number = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumFractionDigits: 1,
});

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const LABELS = [
  "Unprotected",
  "Minimally protected",
  "Lightly protected",
  "Highly protected",
  "Fully protected",
];

const attrLabels: {
  [exportid: string]: { [value: string]: string };
} = attributeLabels;

export default function ProtectionLevel({ hidden }: { hidden: boolean }) {
  const [attributes, getAttribute] = useSketchProperties();
  const userAttributes = attributes.userAttributes
    .filter((a) => a.fieldType !== "SectionHtml")
    .sort((a, b) => a.label.localeCompare(b.label));
  const [props] = useSketchProperties();
  const isCollection = props.isCollection;
  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <ResultsCard functionName="seagrass" title="Percent Protected">
        {(data: SeagrassResults) => (
          <>
            <p style={{ fontSize: 14 }}>
              The seagrass extent of this{" "}
              {isCollection ? "SMA Collection" : "SMA"} is{" "}
              <b>{Number.format(data.currentSeagrassAcres)}</b> acres, or{" "}
              <b>{Percent.format(data.protectedSeagrassPercent)}</b> of the
              total 2017 eelgrass extent of{" "}
              {Number.format(data.currentSeagrassTotalAcres)} acres. To
              stabilize ecosystems and prevent further decline, scientists
              recommend protecting at least 30% of marine ecosystems in highly
              or fully protected areas.{" "}
              <a
                target="_blank"
                href="https://presspage-production-content.s3.amazonaws.com/uploads/1763/jointstatement-905923.pdf?10000"
              >
                BirdLife International et al., 2019
              </a>{" "}
              and{" "}
              <a
                href="https://portals.iucn.org/library/sites/library/files/resrecfiles/WCC_2016_RES_096_EN.pdf"
                target="_blank"
              >
                IUCN, 2016
              </a>
            </p>

            <LayerToggle
              layerId={"5e80c8a8cd44abca6e5268af"}
              label="Show USFWS LIS Eelgrass 2017 Layer"
            />
          </>
        )}
      </ResultsCard>
      <ResultsCard functionName="protectionLevel" title="Seagrass Protection">
        {(data: ProtectionLevelResults) => (
          <div>
            <ScoreIndicator
              score={(data.presentedTotalScore || 0) as 0 | 1 | 2 | 3 | 4}
            />
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
              {LABELS[data.presentedTotalScore]}
            </h5>
            <p style={{ paddingTop: 0, marginTop: 0, fontSize: 14 }}>
              This classification ranges from 0 (unprotected) to 4 (fully
              protected), and is based on the allowed fishing gear types and
              uses within the area(s) using methods defined in{" "}
              <a
                target="_blank"
                href="https://doi.org/10.1016/j.marpol.2016.06.021"
              >
                A regulation-based classification system for Marine Protected
                Areas
              </a>
              , a study that evaluated impacts to biodiversity and habitats
              associated with allowed uses across 100 MPAs worldwide. The
              resulting score is intended to provide science-based guidelines
              for achieving protection level targets, but does not account for
              local differences which should also be incorporated into
              place-based decision-making.
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
                              score={record.presentedScore}
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
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 20,
                    marginBottom: 10,
                  }}
                >
                  <img src={require("./formula.png")} width={277} />
                </div>
              </>
            )}
          </div>
        )}
      </ResultsCard>
      {!isCollection && (
        <Card title="Attributes">
          <div>
            {userAttributes.map((a) => (
              <div
                style={{
                  display: "flex",
                  padding: "8px",
                  borderTop:
                    userAttributes.indexOf(a) === 0
                      ? "none"
                      : "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    width: 200,
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                >
                  {a.label}
                </div>
                <div style={{ fontSize: 13, flex: 1, paddingLeft: 5 }}>
                  {a.fieldType === "ChoiceField" ? (
                    <ChoiceFieldValue attribute={a} />
                  ) : (
                    a.value
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ChoiceFieldValue({ attribute }: { attribute: UserAttribute }) {
  let values: string[] | string = attribute.value;
  if (!Array.isArray(values)) {
    values = JSON.parse(values) as string[];
  }
  const labels = attrLabels[attribute.exportId];
  return <div>{values.map((v) => labels[v]).join(", ")}</div>;
}
