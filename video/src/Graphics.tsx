import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Caption} from './timeline';
import {anton, inter} from './fonts';

export const YELLOW = '#FFD60A';
export const RED = '#FF3B30';
const INK = '#0B0B0D';

// ---------- Captions (max 3 words, word-by-word pop) ----------
export const CaptionPop: React.FC<{caption: Caption}> = ({caption}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = caption.text.split(' ');
	const dur = (caption.to - caption.from) * fps;
	const out = interpolate(frame, [dur - 5, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const box = caption.danger ? RED : caption.accent ? YELLOW : null;

	return (
		<AbsoluteFill style={{alignItems: 'center', top: 170, opacity: out}}>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22, maxWidth: 900}}>
				{words.map((w, i) => {
					const s = spring({frame: frame - i * 4, fps, config: {damping: 11, stiffness: 180, mass: 0.7}});
					const isKey = i === words.length - 1 && box;
					return (
						<span
							key={i}
							style={{
								fontFamily: anton,
								fontSize: words.length === 1 ? 190 : 128,
								lineHeight: 1.05,
								letterSpacing: 2,
								color: isKey ? (caption.danger ? '#fff' : INK) : '#fff',
								background: isKey ? box : 'transparent',
								padding: isKey ? '4px 26px 10px' : 0,
								borderRadius: 18,
								transform: `translateY(${(1 - s) * 60}px) scale(${0.6 + s * 0.4}) rotate(${(1 - s) * (i % 2 ? 6 : -6)}deg)`,
								opacity: Math.min(1, s * 1.5),
								WebkitTextStroke: isKey ? undefined : `6px ${INK}`,
								paintOrder: 'stroke fill',
								textShadow: '0 10px 30px rgba(0,0,0,0.35)',
								display: 'inline-block',
							}}
						>
							{w}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// ---------- Progress bar ----------
export const ProgressBar: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 12, background: 'rgba(0,0,0,0.25)'}}>
			<div style={{height: '100%', width: `${(frame / durationInFrames) * 100}%`, background: YELLOW}} />
		</div>
	);
};

// ---------- Camera HUD (frontal video camera look) ----------
export const CameraHud: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const blink = Math.floor(frame / (fps / 2)) % 2 === 0;
	const secs = Math.floor(frame / fps);
	const ff = String(frame % fps).padStart(2, '0');
	const c = 'rgba(255,255,255,0.85)';
	const corner = (style: React.CSSProperties) => (
		<div style={{position: 'absolute', width: 70, height: 70, borderColor: c, borderStyle: 'solid', borderWidth: 0, ...style}} />
	);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{corner({top: 60, left: 50, borderTopWidth: 6, borderLeftWidth: 6})}
			{corner({top: 60, right: 50, borderTopWidth: 6, borderRightWidth: 6})}
			{corner({bottom: 330, left: 50, borderBottomWidth: 6, borderLeftWidth: 6})}
			{corner({bottom: 330, right: 50, borderBottomWidth: 6, borderRightWidth: 6})}
			<div
				style={{
					position: 'absolute',
					top: 90,
					left: 80,
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					fontFamily: inter,
					fontWeight: 800,
					fontSize: 34,
					color: '#fff',
					textShadow: '0 2px 8px rgba(0,0,0,0.4)',
				}}
			>
				<div style={{width: 24, height: 24, borderRadius: 12, background: RED, opacity: blink ? 1 : 0.2}} />
				REC
			</div>
			<div
				style={{
					position: 'absolute',
					top: 92,
					right: 80,
					fontFamily: inter,
					fontWeight: 600,
					fontSize: 30,
					color: '#fff',
					textShadow: '0 2px 8px rgba(0,0,0,0.4)',
				}}
			>
				00:0{secs}:{ff}
			</div>
		</AbsoluteFill>
	);
};

// ---------- "Every training day" calendar ----------
const DAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
export const TrainingCalendar: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 14}});
	return (
		<AbsoluteFill style={{alignItems: 'center', top: 1600}}>
			<div
				style={{
					display: 'flex',
					gap: 14,
					padding: '22px 26px',
					background: 'rgba(11,11,13,0.88)',
					borderRadius: 30,
					transform: `translateY(${(1 - enter) * 200}px)`,
					boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
				}}
			>
				{DAYS.map((d, i) => {
					const on = spring({frame: frame - 4 - i * 3, fps, config: {damping: 10, stiffness: 200}});
					return (
						<div
							key={i}
							style={{
								width: 96,
								height: 118,
								borderRadius: 20,
								background: interpolate(on, [0, 1], [0, 1]) > 0.5 ? YELLOW : 'rgba(255,255,255,0.12)',
								color: INK,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								transform: `scale(${0.85 + on * 0.15})`,
								fontFamily: anton,
								fontSize: 44,
							}}
						>
							<span style={{color: on > 0.5 ? INK : '#fff'}}>{d}</span>
							<span style={{fontSize: 34, opacity: on, color: INK}}>✓</span>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// ---------- Warning sign ----------
export const WarningSign: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const draw = interpolate(frame, [0, 12], [1, 0], {extrapolateRight: 'clamp'});
	const pop = spring({frame: frame - 8, fps, config: {damping: 7, stiffness: 220}});
	const wobble = Math.sin(frame * 0.9) * 4 * Math.max(0, 1 - frame / 25);
	const perim = 3 * 300;
	return (
		<AbsoluteFill style={{alignItems: 'center', top: 1560}}>
			<svg width={300} height={270} viewBox="0 0 300 270" style={{transform: `rotate(${wobble}deg)`, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.35))'}}>
				<path
					d="M150 14 L288 256 L12 256 Z"
					fill={YELLOW}
					fillOpacity={pop}
					stroke={INK}
					strokeWidth={16}
					strokeLinejoin="round"
					strokeDasharray={perim}
					strokeDashoffset={perim * draw}
				/>
				<g transform={`translate(150 170) scale(${pop}) translate(-150 -170)`}>
					<rect x={137} y={92} width={26} height={100} rx={12} fill={INK} />
					<circle cx={150} cy={222} r={15} fill={INK} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// ---------- Red danger flash ----------
export const DangerFlash: React.FC = () => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [0, 3, 18], [0, 0.55, 0], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse at center, rgba(255,59,48,0) 45%, rgba(255,59,48,${o}) 100%)`,
				pointerEvents: 'none',
			}}
		/>
	);
};

// ---------- Knee schematic with pain pulse ----------
export const KneeAlert: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 13}});
	const drawLeg = interpolate(frame, [0, 14], [1, 0], {extrapolateRight: 'clamp'});
	const rings = [0, 12, 24].map((d) => ((frame + d) % 36) / 36);
	const pulse = 1 + Math.sin(frame * 0.5) * 0.12;
	const legLen = 520;
	return (
		<AbsoluteFill style={{alignItems: 'center', top: 1545}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 26,
					padding: '20px 36px 20px 24px',
					background: 'rgba(11,11,13,0.9)',
					borderRadius: 34,
					transform: `translateY(${(1 - enter) * 220}px)`,
					boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
				}}
			>
				<svg width={230} height={230} viewBox="0 0 230 230">
					{rings.map((r, i) => (
						<circle key={i} cx={122} cy={112} r={20 + r * 90} fill="none" stroke={RED} strokeWidth={6} opacity={(1 - r) * 0.8} />
					))}
					{/* thigh + shin in a squat position */}
					<path
						d="M30 60 L122 112 L80 212"
						fill="none"
						stroke="#fff"
						strokeWidth={26}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeDasharray={legLen}
						strokeDashoffset={legLen * drawLeg}
					/>
					<circle cx={122} cy={112} r={26 * pulse} fill={RED} />
					{/* pain sparks */}
					<path d="M160 60 l18 -26 M172 96 l30 -6 M162 140 l26 16" stroke={YELLOW} strokeWidth={9} strokeLinecap="round" opacity={frame % 8 < 5 ? 1 : 0.3} />
				</svg>
				<div style={{fontFamily: anton, fontSize: 70, color: '#fff', lineHeight: 1}}>
					STOP
					<br />
					<span style={{color: RED}}>DOLORE</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------- Outro follow button ----------
export const FollowButton: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - 6, fps, config: {damping: 9}});
	const tap = frame > 28 ? spring({frame: frame - 28, fps, config: {damping: 8, stiffness: 300}}) : 0;
	const done = frame > 32;
	return (
		<AbsoluteFill style={{alignItems: 'center', top: 1600}}>
			<div
				style={{
					transform: `scale(${s * (1 - tap * 0.08 + (done ? 0.08 : 0))})`,
					background: done ? '#fff' : RED,
					color: done ? INK : '#fff',
					fontFamily: inter,
					fontWeight: 800,
					fontSize: 58,
					padding: '26px 70px',
					borderRadius: 999,
					boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
				}}
			>
				{done ? '✓ Seguito' : '+ Segui'}
			</div>
		</AbsoluteFill>
	);
};

export const PreviewBadge: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			bottom: 360,
			right: 70,
			fontFamily: inter,
			fontWeight: 600,
			fontSize: 24,
			color: 'rgba(255,255,255,0.9)',
			background: 'rgba(0,0,0,0.45)',
			padding: '8px 16px',
			borderRadius: 10,
		}}
	>
		ANTEPRIMA · avatar HeyGen da inserire
	</div>
);
