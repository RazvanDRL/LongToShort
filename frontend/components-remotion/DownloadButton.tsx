import React from "react";
import { State } from "../helpers/use-rendering";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Undo2 } from "lucide-react";

const light: React.CSSProperties = {
  opacity: 0.6,
};

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
};

const Megabytes: React.FC<{
  sizeInBytes: number;
}> = ({ sizeInBytes }) => {
  const megabytes = Intl.NumberFormat("en", {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
  }).format(sizeInBytes);
  return <span style={light}>&nbsp;{megabytes}</span>;
};

export const DownloadButton: React.FC<{
  state: State;
  undo: () => void;
}> = ({ state, undo }) => {
  if (state.status === "rendering") {
    return <Button disabled>Download video</Button>;
  }

  if (state.status !== "done") {
    throw new Error("Download button should not be rendered when not done");
  }

  return (
    <div style={row}>
      <Button variant={"secondary"} onClick={undo}>
        <Undo2/>
      </Button>
      <Button asChild>
        <Link href={state.url}>
          Download video
          <Megabytes sizeInBytes={state.size}></Megabytes>
        </Link>
      </Button>
    </div>
  );
};