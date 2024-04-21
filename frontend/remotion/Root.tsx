import { Composition } from "remotion";
import { Main } from "./MyComp/Main";
import {
  COMP_NAME,
  defaultMyCompProps,
} from "../types/constants";

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
      />
    </>
  );
};
