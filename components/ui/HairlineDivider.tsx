import React from "react";

interface HairlineDividerProps {
  withRunwayArrow?: boolean;
  className?: string;
  color?: string;
}

export function HairlineDivider({
  withRunwayArrow = false,
  className = "",
  color = "#262626",
}: HairlineDividerProps) {
  if (withRunwayArrow) {
    return (
      <div
        className={`w-full relative flex items-center my-6 ${className}`}
        role="separator"
        aria-orientation="horizontal"
      >
        <div className="w-full h-[1px] bg-[#262626]" />
        <div
          className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[10px] border-l-[#262626] shrink-0 -ml-[1px]"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <hr
      className={`w-full border-t border-[${color}] my-0 border-b-0 border-x-0 ${className}`}
      style={{ borderColor: color }}
    />
  );
}
