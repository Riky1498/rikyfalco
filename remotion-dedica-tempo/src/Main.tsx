import React, {useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const OVERLAY_FRAMES = 200; // 8s @ 25fps

const INK = '#1F2433';
const CORAL = '#F2694B';
const MUTED = 'rgba(31,36,51,0.55)';
const SHADOW = '0 18px 40px rgba(31,36,51,0.16), 0 4px 10px rgba(31,36,51,0.08)';

// ---------- fonts ----------
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useState(() => {
    const faces = [
      new FontFace('Outfit', `url(${staticFile('Outfit-Regular.ttf')})`, {weight: '400'}),
      new FontFace('Outfit', `url(${staticFile('Outfit-Bold.ttf')})`, {weight: '700'}),
      new FontFace('InstrumentSerif', `url(${staticFile('InstrumentSerif-Italic.ttf')})`, {style: 'italic'}),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
    return null;
  });
};

// ---------- helpers ----------
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const usePop = (delay: number, damping = 13) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, mass: 0.7, stiffness: 140}});
};

// Uscita comune: tutto si chiude tra 7.1s e 7.9s (con piccolo sfalsamento)
const useExit = (offset = 0) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [176 + offset, 194 + offset], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
};

// Percorso delle "particelle di tempo": dall'orologio (sx) al primo chip (dx), sopra la testa
const P0 = {x: 250, y: 520};
const P1 = {x: 600, y: 130};
const P2 = {x: 915, y: 470};
const bezier = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});

// ---------- Titolo ----------
const Word: React.FC<{children: React.ReactNode; delay: number; style: React.CSSProperties}> = ({
  children,
  delay,
  style,
}) => {
  const p = usePop(delay, 16);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', padding: '0.05em 0.14em 0.12em', margin: '0 0.1em'}}>
      <span
        style={{
          display: 'inline-block',
          transform: `translateY(${(1 - p) * 110}%)`,
          opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
          ...style,
        }}
      >
        {children}
      </span>
    </span>
  );
};

const Title: React.FC = () => {
  const exit = useExit(0);
  const l1: React.CSSProperties = {fontFamily: 'Outfit', fontWeight: 700, fontSize: 62, color: INK, letterSpacing: -1};
  const l2: React.CSSProperties = {fontFamily: 'InstrumentSerif', fontStyle: 'italic', fontSize: 104, color: CORAL};
  return (
    <div
      style={{
        position: 'absolute',
        top: 88,
        width: '100%',
        textAlign: 'center',
        lineHeight: 1.05,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 40}px)`,
      }}
    >
      <div>
        {['Quanto', 'del', 'tuo', 'tempo'].map((w, i) => (
          <Word key={w} delay={4 + i * 3} style={l1}>
            {w}
          </Word>
        ))}
      </div>
      <div style={{marginTop: -6}}>
        {['va', 'agli', 'altri?'].map((w, i) => (
          <Word key={w} delay={18 + i * 4} style={l2}>
            {w}
          </Word>
        ))}
      </div>
    </div>
  );
};

// ---------- Orologio (parete sinistra) ----------
const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(12, 11);
  const exit = useExit(2);
  const R = 118;
  const C = 2 * Math.PI * (R - 14);
  // arco "tempo consumato" che si riempie
  const used = interpolate(frame, [30, 170], [0, 0.92], {...clamp, easing: Easing.inOut(Easing.quad)});
  const minuteRot = frame * 9; // lancette veloci: il tempo scorre
  const hourRot = frame * 0.75 + 60;
  // pulsazione quando parte una particella
  const pulse = frame > 50 && frame < 172 ? Math.max(0, 1 - ((frame - 50) % 8) / 8) * 0.04 : 0;
  const scale = p * (1 - exit) + pulse;

  return (
    <div
      style={{
        position: 'absolute',
        left: 205 - R,
        top: 560 - R,
        width: R * 2,
        height: R * 2,
        transform: `scale(${scale}) rotate(${(1 - p) * -40}deg)`,
        opacity: Math.min(1, p * 2) * (1 - exit),
      }}
    >
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff', boxShadow: SHADOW}} />
      <svg width={R * 2} height={R * 2} style={{position: 'absolute', inset: 0}}>
        <circle cx={R} cy={R} r={R - 14} fill="none" stroke="rgba(31,36,51,0.08)" strokeWidth={10} />
        <circle
          cx={R}
          cy={R}
          r={R - 14}
          fill="none"
          stroke={CORAL}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${C * used} ${C}`}
          transform={`rotate(-90 ${R} ${R})`}
        />
        {Array.from({length: 12}).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r1 = R - 32;
          const r2 = i % 3 === 0 ? R - 46 : R - 40;
          return (
            <line
              key={i}
              x1={R + Math.sin(a) * r1}
              y1={R - Math.cos(a) * r1}
              x2={R + Math.sin(a) * r2}
              y2={R - Math.cos(a) * r2}
              stroke={INK}
              strokeOpacity={i % 3 === 0 ? 0.8 : 0.3}
              strokeWidth={i % 3 === 0 ? 5 : 3}
              strokeLinecap="round"
            />
          );
        })}
        <line x1={R} y1={R} x2={R} y2={R - 44} stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${hourRot} ${R} ${R})`} />
        <line x1={R} y1={R} x2={R} y2={R - 66} stroke={CORAL} strokeWidth={5} strokeLinecap="round" transform={`rotate(${minuteRot} ${R} ${R})`} />
        <circle cx={R} cy={R} r={9} fill={INK} />
      </svg>
    </div>
  );
};

const ClockLabel: React.FC = () => {
  const p = usePop(26, 16);
  const exit = useExit(2);
  return (
    <div
      style={{
        position: 'absolute',
        left: 205 - 150,
        width: 300,
        top: 700,
        textAlign: 'center',
        fontFamily: 'Outfit',
        fontSize: 30,
        color: MUTED,
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: p * (1 - exit),
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      il tuo tempo
    </div>
  );
};

// ---------- Particelle di tempo ----------
const EMIT_START = 50;
const EMIT_END = 150;
const EMIT_EVERY = 8;
const TRAVEL = 30;

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = useExit(0);
  const guideP = interpolate(frame, [36, 60], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  // traccia tratteggiata del percorso
  const pathD = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`;
  const emits: number[] = [];
  for (let f = EMIT_START; f <= EMIT_END; f += EMIT_EVERY) emits.push(f);

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - exit}}>
      <path
        d={pathD}
        fill="none"
        stroke={INK}
        strokeOpacity={0.18}
        strokeWidth={3}
        strokeDasharray="2 14"
        strokeLinecap="round"
        pathLength={1}
        style={{strokeDashoffset: 0}}
        clipPath="url(#reveal)"
      />
      <defs>
        <clipPath id="reveal">
          <rect x={0} y={0} width={P0.x + (P2.x - P0.x + 80) * guideP} height={1920} />
        </clipPath>
      </defs>
      {emits.map((start, i) => {
        const t = (frame - start) / TRAVEL;
        if (t < 0 || t > 1) return null;
        const e = Easing.inOut(Easing.quad)(t);
        const size = 9 + (i % 3) * 3;
        // piccola scia
        return [0, 0.04, 0.08, 0.12].map((lag, k) => {
          const tt = Math.max(0, e - lag);
          const pt = bezier(tt);
          return (
            <circle
              key={`${i}-${k}`}
              cx={pt.x}
              cy={pt.y}
              r={size * (1 - k * 0.22)}
              fill={CORAL}
              opacity={(1 - k * 0.28) * interpolate(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0.6])}
            />
          );
        });
      })}
    </svg>
  );
};

// ---------- Icone "gli altri" (parete destra) ----------
const IconPeople = () => (
  <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={22} cy={20} r={8} />
    <path d="M8 46c0-9 6-15 14-15s14 6 14 15" />
    <circle cx={42} cy={18} r={7} />
    <path d="M40 30c8 0 14 5 14 14" />
  </g>
);
const IconChat = () => (
  <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14h40a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H28l-10 8v-8h-8a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" />
    <circle cx={21} cy={28} r={1.5} fill={INK} />
    <circle cx={30} cy={28} r={1.5} fill={INK} />
    <circle cx={39} cy={28} r={1.5} fill={INK} />
  </g>
);
const IconWork = () => (
  <g fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x={8} y={20} width={44} height={28} rx={5} />
    <path d="M22 20v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" />
    <path d="M8 32h44" />
  </g>
);
const IconHeart = () => (
  <g fill="none" stroke={CORAL} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M30 50S8 37 8 22a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 15-22 28-22 28z" fill={CORAL} fillOpacity={0.15} />
  </g>
);

const CHIP_X = 978;
const CHIPS = [
  {y: 470, Icon: IconPeople},
  {y: 640, Icon: IconChat},
  {y: 810, Icon: IconWork},
  {y: 980, Icon: IconHeart},
];

const Chip: React.FC<{y: number; index: number; Icon: React.FC}> = ({y, index, Icon}) => {
  const frame = useCurrentFrame();
  const p = usePop(34 + index * 7, 10);
  const exit = useExit(index * 2);
  const R = 60;
  const float = Math.sin((frame + index * 20) / 14) * 6;
  // impatto: ogni particella arriva sul primo chip e l'onda scende lungo la colonna
  let hit = 0;
  for (let f = EMIT_START; f <= EMIT_END; f += EMIT_EVERY) {
    const d = frame - (f + TRAVEL + index * 4);
    if (d >= 0 && d < 10) hit = Math.max(hit, 1 - d / 10);
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: CHIP_X - R,
        top: y - R + float,
        width: R * 2,
        height: R * 2,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: `${SHADOW}, 0 0 0 ${hit * 10}px rgba(242,105,75,${0.25 * hit})`,
        transform: `scale(${p * (1 - exit) * (1 + hit * 0.08)})`,
        opacity: Math.min(1, p * 2) * (1 - exit),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={60} height={60} viewBox="0 0 60 60">
        <Icon />
      </svg>
    </div>
  );
};

const ChipConnector: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = useExit(0);
  const grow = interpolate(frame, [40, 70], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const top = CHIPS[0].y;
  const bottom = CHIPS[CHIPS.length - 1].y;
  return (
    <div
      style={{
        position: 'absolute',
        left: CHIP_X - 1.5,
        top,
        width: 3,
        height: (bottom - top) * grow,
        backgroundImage: `linear-gradient(${INK} 40%, transparent 40%)`,
        backgroundSize: '3px 14px',
        opacity: 0.2 * (1 - exit),
      }}
    />
  );
};

// ---------- Scheda sulla scrivania: 24 ore ----------
const DayCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(70, 14);
  const exit = useExit(4);
  const FILL_START = 88;
  const FILL_STEP = 3.2;
  const OTHERS = 22;
  const filled = interpolate(frame, [FILL_START, FILL_START + OTHERS * FILL_STEP], [0, OTHERS], clamp);
  const hoursShown = Math.floor(filled);
  const footerP = interpolate(frame, [FILL_START + OTHERS * FILL_STEP, FILL_START + OTHERS * FILL_STEP + 12], [0, 1], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 1168,
        width: 540,
        padding: '26px 30px 24px',
        borderRadius: 30,
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(31,36,51,0.06)',
        boxShadow: SHADOW,
        fontFamily: 'Outfit',
        color: INK,
        transform: `translateY(${(1 - p) * 80 + exit * 40}px) scale(${0.9 + 0.1 * p - exit * 0.1})`,
        opacity: Math.min(1, p * 1.5) * (1 - exit),
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div style={{fontSize: 28, color: MUTED, letterSpacing: 3, textTransform: 'uppercase'}}>La tua giornata</div>
        <div style={{fontSize: 30, color: MUTED}}>24h</div>
      </div>
      <div style={{marginTop: 6, fontSize: 54, fontWeight: 700, letterSpacing: -1}}>
        <span style={{color: CORAL}}>{hoursShown}h</span>
        <span style={{fontFamily: 'InstrumentSerif', fontStyle: 'italic', fontWeight: 400, fontSize: 58}}> agli altri</span>
      </div>
      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 8,
        }}
      >
        {Array.from({length: 24}).map((_, i) => {
          const f = Math.max(0, Math.min(1, filled - i));
          const isMine = i >= OTHERS;
          return (
            <div
              key={i}
              style={{
                height: 34,
                borderRadius: 9,
                background: isMine ? 'transparent' : `rgba(242,105,75,${0.12 + 0.88 * f})`,
                border: isMine ? `2.5px dashed rgba(31,36,51,${0.25 + 0.5 * footerP})` : 'none',
                transform: `scale(${isMine ? 1 : 0.85 + 0.15 * f + Math.sin(f * Math.PI) * 0.15})`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 28,
          color: MUTED,
          textAlign: 'right',
          opacity: footerP,
          transform: `translateX(${(1 - footerP) * 20}px)`,
        }}
      >
        e per te? <b style={{color: INK}}>2h</b>
      </div>
    </div>
  );
};

// ---------- Overlay ----------
const Overlay: React.FC = () => (
  <AbsoluteFill>
    <Particles />
    <Title />
    <Clock />
    <ClockLabel />
    <ChipConnector />
    {CHIPS.map((c, i) => (
      <Chip key={i} index={i} y={c.y} Icon={c.Icon} />
    ))}
    <DayCard />
  </AbsoluteFill>
);

export const Main: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <OffthreadVideo src={staticFile('video.mp4')} />
      <Sequence durationInFrames={OVERLAY_FRAMES}>
        <Overlay />
      </Sequence>
    </AbsoluteFill>
  );
};
