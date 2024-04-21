import { useRendering } from "../helpers/use-rendering";
import { CompositionProps, COMP_NAME } from "../types/constants";
import { Button } from "@/components/ui/button";
import { DownloadButton } from "./DownloadButton";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from 'sonner';

export const RenderControls: React.FC<{
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ inputProps }) => {
  const { renderMedia, state, undo } = useRendering(COMP_NAME, inputProps);

  if (state.status === "error") {
    toast.error(state.error.message);
  }

  return (
    <div>
      <Toaster />
      {state.status === "init" ||
        state.status === "invoking" ||
        state.status === "error" ? (
        <>
          {state.status === "invoking" ?
            (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) :
            (
              <Button
                onClick={renderMedia}
              >
                Render video
              </Button>
            )
          }
        </>
      ) : null}
      {
        state.status === "rendering" ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Rendering&nbsp;{Math.ceil(state.progress * 100)}%
          </Button>
        ) : null
      }
      {state.status === "done" ? (
        <>
          <DownloadButton undo={undo} state={state}></DownloadButton>
        </>
      ) : null}
    </div>
  );
};
