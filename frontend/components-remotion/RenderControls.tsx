import { useRendering } from "../helpers/use-rendering";
import { CompositionProps, COMP_NAME } from "../types/constants";
import { AlignEnd } from "./AlignEnd";
import { Button } from "./Button/Button";
import { InputContainer } from "./Container";
import { DownloadButton } from "./DownloadButton";
import { Input } from "./Input";
import { ErrorComp } from "./Error";
import { ProgressBar } from "./ProgressBar";
import { Spacing } from "./Spacing";
import { z } from "zod";

type Font = {
  textColor: string;
  fontSize: number;
  fontFamily: string;
  fontName: string;
  fontWeight: number;
  verticalPosition: number;
  uppercase: boolean;
  punctuation: boolean;
  stroke: {
    strokeWidth: string,
    strokeColor: string,
  };
  shadow: string;
}

export const RenderControls: React.FC<{
  font: Font;
  setFont: React.Dispatch<React.SetStateAction<Font>>;
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ font, setFont, inputProps }) => {
  const { renderMedia, state, undo } = useRendering(COMP_NAME, inputProps);
  return (
    <InputContainer>
      {state.status === "init" ||
        state.status === "invoking" ||
        state.status === "error" ? (
        <>
          <Input
            disabled={state.status === "invoking"}
            setFont={setFont}
            font={font}
          ></Input>
          <Spacing></Spacing>
          <AlignEnd>
            <Button
              disabled={state.status === "invoking"}
              loading={state.status === "invoking"}
              onClick={renderMedia}
            >
              Render video
            </Button>
          </AlignEnd>
          {state.status === "error" ? (
            <ErrorComp message={state.error.message}></ErrorComp>
          ) : null}
        </>
      ) : null}
      {state.status === "rendering" || state.status === "done" ? (
        <>
          <ProgressBar
            progress={state.status === "rendering" ? state.progress : 1}
          />
          <Spacing></Spacing>
          <AlignEnd>
            <DownloadButton undo={undo} state={state}></DownloadButton>
          </AlignEnd>
        </>
      ) : null}
    </InputContainer>
  );
};
