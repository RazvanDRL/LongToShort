import { deployFunction, getCompositionsOnLambda, getFunctions } from "@remotion/lambda";
import { getCompositions } from "@remotion/renderer";
import { getRenderProgress, renderMediaOnLambda } from "@remotion/lambda/client";
import { deploySite, getOrCreateBucket } from "@remotion/lambda";
import path from "path";


async function comp() {
    const [{ functionName }] = await getFunctions({
        region: "us-east-1",
        compatibleOnly: true,
    });

    const render = await renderMediaOnLambda({
        functionName,
        inputProps: {},
        region: "us-east-1",
        serveUrl: "text-warping",
        codec: "h264",
        composition: "CompID",
    });

    while (true) {
        const progress = await getRenderProgress({
            bucketName: render.bucketName,
            functionName,
            region: "us-east-1",
            renderId: render.renderId,
        });

        if (progress.done) {
            console.log("Render done", progress.outputFile);
            break;
        }

        if (progress.fatalErrorEncountered) {
            console.error("Fatal error encountered", progress.errors.filter((e) => e.isFatal));
            break;
        }

        console.log("Progress", progress.overallProgress);
        await new Promise((r) => setTimeout(r, 1000));
    }
}

comp();