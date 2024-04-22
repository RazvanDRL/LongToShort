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
        durationInFrames={1920}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultMyCompProps}
        calculateMetadata={async ({ props }) => {
          const data = await getVideoMetadata(props.video);
          return {
            width: data.width,
            height: data.height,
          };
        }}
      />
    </>
  );
};
