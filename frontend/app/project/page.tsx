"use client";
import { Player } from "@remotion/player";
import { AbsoluteFill, Video, Sequence } from "remotion";

let videourl = "https://oepfdpopvlyvxrmpstiy.supabase.co/storage/v1/object/sign/videos/2004d696-42bc-42c4-99f4-7fa0122374e3/29992dea-b0c0-458c-9b6b-86c6fdf0c6ee.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ2aWRlb3MvMjAwNGQ2OTYtNDJiYy00MmM0LTk5ZjQtN2ZhMDEyMjM3NGUzLzI5OTkyZGVhLWIwYzAtNDU4Yy05YjZiLTg2YzZmZGYwYzZlZS5tcDQiLCJpYXQiOjE3MTE2NDY0NTYsImV4cCI6MTcxMjI1MTI1Nn0.Sj_pwpZ_8oZfTNBiYfU2x6ueAOk9Igh8rKwrtE--7Uk&t=2024-03-28T17%3A20%3A56.202Z";

// Subtitle data in SRT format
let subtitles = [
    { start: 1, end: 2, text: "I" },
    { start: 3, end: 4, text: "f*cked" },
    { start: 5, end: 6, text: "up." },
    { start: 7, end: 8, text: "She" },
    { start: 9, end: 10, text: "left" },
    { start: 11, end: 12, text: "me" },
    // Add more subtitles as needed
];

function MyVideo() {
    return (
        <AbsoluteFill>
            <Video src={videourl} volume={1} startFrom={0} onError={(e) => console.error(e)} />
            {/* Mapping over subtitles and rendering them within Sequence */}
            {subtitles.map((subtitle, index) => (
                <Sequence key={index} from={subtitle.start * 30} durationInFrames={(subtitle.end - subtitle.start) * 30}>
                    <div style={{ color: "white", fontSize: 40 }}>{subtitle.text}</div>
                </Sequence>
            ))}
        </AbsoluteFill>
    );
}

export default function App() {
    return (
        <Player
            component={MyVideo}
            durationInFrames={30 * 15}
            compositionWidth={1080 / 4}
            compositionHeight={1920 / 4}
            fps={29.97}
            controls
        />
    );
};
