import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  Video,
} from "remotion";
import React, { useMemo } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

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
}


function removePunctuation(text: string) {
  return text.replace(/[.,\/\\!?#&^*;:{}=\-_`~()"+|<>@[\]\\]/g, "");
}

function localFont(fontName: string) {
  const waitForFont = delayRender();
  const font = new FontFace(
    `${fontName}`,
    `url('${staticFile(`${fontName}.ttf`)}') format('truetype')`,
  );

  font
    .load()
    .then(() => {
      document.fonts.add(font);
      continueRender(waitForFont);
    })
    .catch((err) => console.log("Error loading font", err));
}

export const Main: React.FC<{
  subtitles: Subtitle[];
  font: Font;
  video: string;
}> = ({ subtitles, font, video }) => {
  const { fps } = useVideoConfig();

  localFont(font.fontName);

  const sequenceStyle: React.CSSProperties = useMemo(() => {
    return {
      color: font.textColor,
      fontFamily: font.fontName,
      justifyContent: "center",
      fontWeight: font.fontWeight,
      verticalPosition: font.verticalPosition,
      textShadow: font.shadow,
      fontSize: font.fontSize,
      transform: `translateY(${100 - font.verticalPosition}%)`,
      textTransform: font.uppercase ? "uppercase" : "none",
    };
  }, [font]);

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
          style={sequenceStyle}
        >
          <span
            style={{
              position: font.stroke?.strokeWidth.length > 0 ? "absolute" : undefined,
            }}
          >
            {font.punctuation == false ? removePunctuation(subtitle.text) : subtitle.text}
          </span>
          {font.stroke?.strokeWidth.length > 0 &&
            <span style={{ WebkitTextStroke: font.stroke.strokeWidth + font.stroke.strokeColor }}>
              {font.punctuation == false ? removePunctuation(subtitle.text) : subtitle.text}
            </span>}
        </Sequence>
      );
    });
  }, [subtitles, font]);

  return (
    <AbsoluteFill>
      <Video
        src={video!}
        volume={1}
        startFrom={0}
        onError={(e) => console.error(e)}
      />

      {renderedSubtitles}
    </AbsoluteFill>
  );
}