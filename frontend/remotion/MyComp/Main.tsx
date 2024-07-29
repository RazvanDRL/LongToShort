import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
} from "remotion";
import React, { useEffect, useMemo } from "react";
import { loadFonts } from "../load-font";

type Subtitle = {
  start: number;
  end: number;
  text: string;
};

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
  letterSpacing: number;
}

function removePunctuation(text: string) {
  return text.replace(/[.,\/\\!?#&^*;:{}=\-_`~()"+|<>@[\]\\]/g, "");
}

export const Main: React.FC<{
  subtitles: Subtitle[];
  font: Font;
  video: string;
  video_fps: number;
  words: number;
}> = ({ subtitles, font, video, video_fps, words }) => {
  const { fps } = useVideoConfig();
  video_fps = fps;
  const sequenceStyle: React.CSSProperties = useMemo(() => {
    return {
      color: font.textColor,
      fontFamily: font.fontName,
      justifyContent: "center",
      fontWeight: font.fontWeight,
      textShadow: font.shadow,
      fontSize: font.fontSize * 1.5,
      transform: `translateY(${100 - font.verticalPosition}%)`,
      verticalAlign: font.verticalPosition,
      textTransform: font.uppercase ? "uppercase" : "none",
      // letterSpacing: font.letterSpacing,
    };
  }, [font]);

  if (words > 1) {
    const newSubtitles: Subtitle[] = [];

    for (let i = 0; i < subtitles.length; i += words) {
      const subtitle = subtitles.slice(i, i + words);
      const start = subtitle[0].start;
      const end = subtitle[subtitle.length - 1].end;

      const text = subtitle.map(s => s.text).join(" ");
      newSubtitles.push({ start, end, text });
    }

    subtitles = newSubtitles;
  }

  const renderedSubtitles = useMemo(() => {
    return subtitles.map((subtitle) => {
      if (subtitle.start === 0 && subtitle.end === 0) {

        const index = subtitles.indexOf(subtitle);
        const previousSubtitle = subtitles[index - 1];

        if (previousSubtitle) {
          subtitle.start = previousSubtitle.end;
        };

        const nextSubtitle = subtitles[index + 1];

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
          style={sequenceStyle}
        >
          <span
            style={{
              position: font.stroke?.strokeWidth.length > 0 ? "absolute" : undefined,
            }}
          >
            {font.punctuation == false ? removePunctuation(subtitle.text) : subtitle.text}
          </span>
          {
            font.stroke?.strokeWidth.length > 0
            &&
            <span style={{ WebkitTextStroke: font.stroke.strokeWidth + font.stroke.strokeColor }}>
              {font.punctuation == false ? removePunctuation(subtitle.text) : subtitle.text}
            </span>
          }
        </Sequence>
      );
    });
  }, [subtitles, font]);

  useEffect(() => {
    loadFonts();
  }, [font]);

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={video!}
        volume={1}
        onError={(e) => console.error(e)}
        pauseWhenBuffering={true}
      />
      {renderedSubtitles}
    </AbsoluteFill>
  );
}