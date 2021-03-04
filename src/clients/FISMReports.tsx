import React, { useState } from "react";
import {
  ResultsCard,
  SketchAttributesCard,
  Skeleton,
  useFunction,
} from "@seasketch/geoprocessing/client";
import { SeagrassResults } from "../functions/seagrass";
import SegmentControl from "./SegmentControl";
import Overview from "./Overview";
import ProtectionLevel from "./ProtectionLevel";
import WatershedProtection from "./WatershedProtection";
import SurveyResults from "./SurveyResults";
import "./index.css";

const Number = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumFractionDigits: 1,
});

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const enableAllTabs = false;
const FISMReports = () => {
  const [tab, setTab] = useState<string>("Overview");
  return (
    <>
      <div style={{ marginTop: 5 }}>
        <SegmentControl
          value={tab}
          onClick={(segment) => setTab(segment)}
          segments={[
            "Overview",
            "Protection Level",
            "Watershed Protections",
            "Survey Results",
          ]}
        />
      </div>
      <Overview hidden={!enableAllTabs && tab !== "Overview"} />
      <ProtectionLevel hidden={!enableAllTabs && tab !== "Protection Level"} />
      <WatershedProtection
        hidden={!enableAllTabs && tab !== "Watershed Protections"}
      />
      <SurveyResults hidden={!enableAllTabs && tab !== "Survey Results"} />
    </>
  );
};
export default FISMReports;
