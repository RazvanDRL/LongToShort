import {
    AbsoluteFill,
    OffthreadVideo,
    Sequence,
    useVideoConfig,
} from "remotion";
import React, { useEffect, useMemo } from "react";

const subtitles = [
    {
        start: 0,
        end: 0,
        text: "Hello, world!",
    },
    {
        start: 2,
        end: 4,
        text: "This is a subtitle",
    },
    {
        start: 5,
        end: 7,
        text: "This is another subtitle",
    },
    {
        start: 8,
        end: 10,
        text: "This is a third subtitle",
    },
];

export const Landing: React.FC<{
    video: string;
    showSubtitles: boolean;
}> = ({ video, showSubtitles }) => {
    let fps = 30;
    const renderedSubtitles = useMemo(() => {
        return subtitles.map((subtitle) => {
            if (subtitle.start === 0 && subtitle.end === 0) {

                const previousSubtitle = subtitles[subtitles.indexOf(subtitle) - 1];

                if (previousSubtitle) {
                    subtitle.start = previousSubtitle.end;
                };

                const nextSubtitle = subtitles[subtitles.indexOf(subtitle) + 1];

                if (nextSubtitle) {
                    subtitle.end = nextSubtitle.start;
                }
            }

            const subtitleDuration = subtitle.end - subtitle.start;
            if (subtitleDuration <= 0) {
                // Handle invalid subtitle duration
                return null;
            }

            return (
                <Sequence
                    key={subtitle.start}
                    from={subtitle.start * fps}
                    durationInFrames={subtitleDuration * fps}
                >
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-white text-center">
                        <p>{subtitle.text}</p>
                    </div>
                </Sequence>
            );
        });
    }, []);


    return (
        <AbsoluteFill>
            <OffthreadVideo
                src={video!}
                volume={0}
                onError={(e) => console.error(e)}
                pauseWhenBuffering={true}
            />
            {
                showSubtitles &&
                renderedSubtitles
            }
        </AbsoluteFill>
    );
}