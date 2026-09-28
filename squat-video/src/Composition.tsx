import {
  AbsoluteFill,
  Composition,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
const fontFamily =
  "Inter, 'SF Pro Display', 'Helvetica Neue', 'DejaVu Sans', Arial, sans-serif";

const ACCENT = "#7C5CFF";
const DANGER = "#FF4D5E";
const BG = "#0B0B14";
const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const MyComposition = () => {
  return (
    <Composition
      id="SquatWarning"
      component={SquatWarning}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const danger = interpolate(frame, [70, 85], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          translate: `0px ${interpolate(frame, [0, 150], [0, 90])}px`,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 35%, ${ACCENT}55, transparent 55%)`,
          opacity: 1 - danger,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${DANGER}55, transparent 55%)`,
          opacity: danger,
        }}
      />
    </AbsoluteFill>
  );
};

const DAYS = ["LUN", "MAR", "MER", "GIO", "VEN"];

const SceneQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: 100, gap: 60 }}
    >
      <Interactive.Div
        name="Badge"
        style={{
          padding: "16px 32px",
          borderRadius: 999,
          border: `2px solid ${ACCENT}`,
          background: `${ACCENT}22`,
          color: "#CFC4FF",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 4,
          opacity: interpolate(frame, [0, 10], [0, 1], clamp),
          translate: interpolate(frame, [0, 15], ["0px 30px", "0px 0px"], { ...clamp, easing: ease }),
        }}
      >
        IL TUO PIANO
      </Interactive.Div>

      <Interactive.Div
        name="Question"
        style={{
          color: "white",
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1.05,
          textAlign: "center",
          letterSpacing: -2,
          opacity: interpolate(frame, [4, 18], [0, 1], clamp),
          translate: interpolate(frame, [4, 22], ["0px 50px", "0px 0px"], { ...clamp, easing: ease }),
        }}
      >
        Stai facendo lo{" "}
        <span style={{ color: ACCENT }}>squat</span>
        <br />
        tutti gli allenamenti?
      </Interactive.Div>

      <Interactive.Div
        name="Card"
        style={{
          width: 880,
          padding: 44,
          borderRadius: 40,
          background: "rgba(255,255,255,0.06)",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "space-between",
          opacity: interpolate(frame, [14, 26], [0, 1], clamp),
          scale: interpolate(frame, [14, 32], [0.9, 1], {
            ...clamp,
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      >
        {DAYS.map((d, i) => {
          const start = 24 + i * 0.2 * fps;
          return (
            <div
              key={d}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}
            >
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 30, fontWeight: 700 }}>
                {d}
              </div>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 30,
                  background: ACCENT,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 64,
                  fontWeight: 800,
                  opacity: interpolate(frame, [start, start + 6], [0, 1], clamp),
                  scale: interpolate(frame, [start, start + 10], [0.4, 1], {
                    ...clamp,
                    easing: Easing.spring({ damping: 12 }),
                    output: "perceptual-scale",
                  }),
                }}
              >
                ✓
              </div>
              <div style={{ color: "white", fontSize: 26, fontWeight: 700 }}>SQUAT</div>
            </div>
          );
        })}
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const SceneWarning: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = interpolate(frame, [0, 4, 8, 12, 16], [0, -14, 12, -6, 0], clamp);
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: 100, gap: 56 }}
    >
      <Interactive.Div
        name="AlertIcon"
        style={{
          width: 220,
          height: 220,
          borderRadius: 60,
          background: `${DANGER}22`,
          border: `3px solid ${DANGER}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 130,
          color: DANGER,
          fontWeight: 800,
          boxShadow: `0 0 ${interpolate(frame % 30, [0, 15, 30], [30, 90, 30])}px ${DANGER}88`,
          scale: interpolate(frame, [0, 14], [0, 1], {
            ...clamp,
            easing: Easing.spring({ damping: 10 }),
            output: "perceptual-scale",
          }),
          rotate: `${shake}deg`,
        }}
      >
        !
      </Interactive.Div>

      <Interactive.Div
        name="Occhio"
        style={{
          color: DANGER,
          fontSize: 150,
          fontWeight: 800,
          letterSpacing: -4,
          opacity: interpolate(frame, [6, 14], [0, 1], clamp),
          translate: interpolate(frame, [6, 20], ["0px 40px", "0px 0px"], { ...clamp, easing: ease }),
        }}
      >
        Occhio!
      </Interactive.Div>

      <Interactive.Div
        name="Message"
        style={{
          color: "white",
          fontSize: 84,
          fontWeight: 800,
          lineHeight: 1.1,
          textAlign: "center",
          letterSpacing: -1.5,
          opacity: interpolate(frame, [16, 28], [0, 1], clamp),
          translate: interpolate(frame, [16, 34], ["0px 40px", "0px 0px"], { ...clamp, easing: ease }),
        }}
      >
        perché ti rovini
        <br />
        la{" "}
        <span
          style={{
            background: DANGER,
            padding: "0 20px",
            borderRadius: 18,
            display: "inline-block",
            scale: interpolate(frame, [30, 42], [0.8, 1], {
              ...clamp,
              easing: Easing.spring({ damping: 10 }),
              output: "perceptual-scale",
            }),
          }}
        >
          schiena
        </span>
      </Interactive.Div>

      <Interactive.Div
        name="RiskBar"
        style={{
          width: 820,
          padding: 36,
          borderRadius: 32,
          background: "rgba(255,255,255,0.06)",
          border: "2px solid rgba(255,255,255,0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          opacity: interpolate(frame, [30, 40], [0, 1], clamp),
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", color: "white", fontSize: 34, fontWeight: 700 }}>
          <span>Stress lombare</span>
          <span style={{ color: DANGER }}>
            {Math.round(interpolate(frame, [34, 70], [0, 92], { ...clamp, easing: ease }))}%
          </span>
        </div>
        <div style={{ height: 22, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, #FFB84D, ${DANGER})`,
              width: `${interpolate(frame, [34, 70], [0, 92], { ...clamp, easing: ease })}%`,
            }}
          />
        </div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

export const SquatWarning: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      <Sequence durationInFrames={75} name="Domanda">
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [64, 75], [1, 0], clamp),
            scale: interpolate(frame, [64, 75], [1, 0.92], { ...clamp, output: "perceptual-scale" }),
          }}
        >
          <SceneQuestion />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={72} name="Avviso">
        <SceneWarning />
      </Sequence>
    </AbsoluteFill>
  );
};
