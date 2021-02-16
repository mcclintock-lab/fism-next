import React from "react";

export default function ScoreIndicator({
  score,
  small,
  inline,
}: {
  score: 0 | 1 | 2 | 3 | 4;
  small?: boolean;
  inline?: boolean;
}) {
  const colors = [
    "rgb(72,46,19)",
    "rgb(68,25,105)",
    "rgb(115,25,74)",
    "rgb(203,131,44)",
    "rgb(78, 142, 135)",
  ];
  return (
    <svg
      style={{
        padding: inline ? 0 : "4px 0px",
        ...(inline
          ? { display: "inline-block", marginRight: -9 }
          : { float: "left" }),
        paddingRight: 10,
        filter: "drop-shadow( 1px 1px 3px rgba(0,0,0,0.5) )",
      }}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width={small ? 32 : 80}
      height={small ? 32 : 80}
      viewBox="0 0 80 80"
    >
      <filter id="blur-filter" x="-2" y="-2" width="200" height="200">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
      </filter>
      <g>
        <title>Layer 1</title>
        <path
          d="M 41.0 9.0 C 52.0 9.0 59.923 9.0 71.0 9.0 L 71.0 40.0 L 71.0 40.0 C 71.394 57.511 56.917 71.78 39.749 72.0 C 21.963 72.055 7.125 56.522 8.04 38.762 C 8.919 21.728 24.143 8.784 41.0 9.0 L 41.0 9.0 Z"
          fill="rgb(100%, 100%, 100%)"
          stroke="none"
        />
      </g>

      <g>
        <title>Shadow Effect</title>
      </g>

      <g>
        <title>Layer 4</title>
        <path
          d="M 67.0 39.0 L 67.0 39.0 C 67.637 54.29 54.725 66.515 39.796 66.896 C 24.681 66.834 12.063 53.822 12.844 38.644 C 13.586 24.202 25.853 13.268 40.0 13.0 L 40.0 13.0 L 67.2 12.65 L 67.0 39.0 Z"
          fill={colors[score]}
          stroke="none"
        />
      </g>
      <text
        x="30"
        y="52"
        style={{ fontWeight: "bold" }}
        fontSize="36"
        fill="white"
      >
        {score}
      </text>
    </svg>
  );
}
