import { Composition } from "remotion";
import { Lesson, type LessonProps } from "./Lesson";

const defaultProps: LessonProps = {
  title: "Sample topic",
  points: ["First point from the lecture", "Second point", "Third point"],
  audioUrl: "",
  audioSeconds: 30,
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Lesson"
      component={Lesson}
      durationInFrames={30 * 60}
      fps={30}
      width={1280}
      height={720}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => {
        const frames = Math.max(Math.ceil(props.audioSeconds * 30), 150);
        return { durationInFrames: frames };
      }}
    />
  );
};
