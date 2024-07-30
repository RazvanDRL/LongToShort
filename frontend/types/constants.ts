import { z } from "zod";
export const COMP_NAME = "MyComp";

export type downloadAll = {
  title: string;
  thumbnail: string;
  duration: number;
  medias: {
    url: string;
    quality: string;
    extension: string;
    type: string;
  }[];
};

export interface Metadata {
  created_at: string;
  name: string;
  duration: number;
  fps?: number;
  width?: number;
  height?: number;
  video_src?: string;
  thumbnail?: string;
  processed: boolean;
  ext: string;
};

export interface User {
  id: string;
  email: string;
  access_token: string;
  avatar_url?: string;
}

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
  letterSpacing: z.number(),
});

export const Subtitle = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
  filteredWord: z.string().optional(),
});

export const CompositionProps = z.object({
  subtitles: z.array(Subtitle), // Use z.array to specify an array of Subtitle schema
  font: Font, // Use the previously defined Font schema
  video: z.string(),
  user_id: z.string(),
  video_id: z.string(),
  video_height: z.number(),
  video_width: z.number(),
  video_duration: z.number(),
  video_fps: z.number(),
  words: z.number(),
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
    letterSpacing: 0,
  },
  video: "",
  user_id: "",
  video_id: "",
  video_height: 0,
  video_width: 0,
  video_duration: 0,
  video_fps: 0,
  words: 1,
};