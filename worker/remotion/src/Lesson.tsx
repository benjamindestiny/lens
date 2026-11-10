import { AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type LessonProps = {
  title: string;
  points: string[];
  audioUrl: string;
  audioSeconds: number;
};

export const Lesson: React.FC<LessonProps> = ({ title, points, audioUrl }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, fps * 0.8], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, fps * 0.8], [12, 0], { extrapolateRight: "clamp" });

  const perPoint = Math.max(
    Math.floor((durationInFrames - fps * 2) / Math.max(points.length, 1)),
    fps
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#fafaf9", padding: 80, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <div style={{ width: 40, height: 4, backgroundColor: "#4f46e5", marginBottom: 24 }} />
        <h1 style={{ fontSize: 56, fontWeight: 600, color: "#1c1917", lineHeight: 1.15, margin: 0 }}>
          {title}
        </h1>
      </div>

      <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 20 }}>
        {points.map((p, i) => {
          const start = fps * 1.5 + i * perPoint;
          const opacity = interpolate(frame, [start, start + fps * 0.6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame, [start, start + fps * 0.6], [-12, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                fontSize: 30,
                color: "#44403c",
                lineHeight: 1.4,
                paddingLeft: 24,
                borderLeft: "3px solid #e7e5e4",
              }}
            >
              {p}
            </div>
          );
        })}
      </div>

      <Audio src={audioUrl} />
    </AbsoluteFill>
  );
};
