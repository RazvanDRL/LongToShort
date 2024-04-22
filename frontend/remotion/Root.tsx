import { Composition } from "remotion";
import { Main } from "./MyComp/Main";
import {
  COMP_NAME,
  defaultMyCompProps,
} from "../types/constants";
import { getVideoMetadata } from "@remotion/media-utils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={600}
        fps={30}
        width={640}
        height={640}
        defaultProps={defaultMyCompProps}
        // calculateMetadata={async ({ props }) => {
        //   const data = await getVideoMetadata(props.src);

        //   return {
        //     durationInFrames: Math.floor(data.durationInSeconds * 30),
        //   };
        // }}
      />
    </>
  );
};
