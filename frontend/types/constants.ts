import { z } from "zod";
export const COMP_NAME = "MyComp";


export const Font = z.object({
  textColor: z.string(),
  fontSize: z.number(),
  fontFamily: z.string(),
  fontName: z.string(),
  fontWeight: z.number(),
  verticalPosition: z.number(),
  uppercase: z.boolean(),
  punctuation: z.boolean(),
  stroke: z.object({
    strokeWidth: z.string(),
    strokeColor: z.string(),
  }),
  shadow: z.string(),
});

export const Subtitle = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
});

export const CompositionProps = z.object({
  subtitles: z.array(Subtitle), // Use z.array to specify an array of Subtitle schema
  font: Font, // Use the previously defined Font schema
  video: z.string(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  subtitles: [
    {
      start: 0,
      end: 0.1,
      text: "",
    },
  ],
  font: {
    textColor: "",
    fontSize: 0,
    fontFamily: "",
    fontName: "",
    fontWeight: 0,
    verticalPosition: 0,
    uppercase: false,
    punctuation: false,
    stroke: {
      strokeWidth: "",
      strokeColor: "",
    },
    shadow: "",
  },
  video: "",
};