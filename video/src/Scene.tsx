import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FPS} from './timeline';

// Frontal "camera on the desk" shot: studio wall behind, the character seated,
// an empty desk in the foreground. Used both as the HeyGen Avatar IV input
// image and as the stand-in for the avatar in the preview render.

const DESK_TOP_Y = 1400;

const Desk: React.FC = () => (
	<AbsoluteFill>
		{/* desk top seen slightly from above: empty surface */}
		<div
			style={{
				position: 'absolute',
				left: -80,
				right: -80,
				top: DESK_TOP_Y,
				height: 120,
				background: 'linear-gradient(180deg, #cfcec9 0%, #e2e1dc 55%, #ebeae6 100%)',
				clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)',
			}}
		/>
		{/* soft contact shadow of the body on the desk */}
		<div
			style={{
				position: 'absolute',
				left: 190,
				width: 700,
				top: DESK_TOP_Y - 10,
				height: 70,
				borderRadius: '50%',
				background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.28), rgba(0,0,0,0) 70%)',
				filter: 'blur(6px)',
			}}
		/>
		{/* grey edge band, like the real desk */}
		<div
			style={{
				position: 'absolute',
				left: -80,
				right: -80,
				top: DESK_TOP_Y + 120,
				height: 26,
				borderRadius: 13,
				background: 'linear-gradient(180deg, #6b7178 0%, #4a4f56 50%, #3a3e44 100%)',
				boxShadow: '0 8px 18px rgba(0,0,0,0.25)',
			}}
		/>
		{/* front panel */}
		<div
			style={{
				position: 'absolute',
				left: -80,
				right: -80,
				top: DESK_TOP_Y + 146,
				bottom: 0,
				background: 'linear-gradient(180deg, #d9d8d3 0%, #e6e5e0 30%, #cfcec9 100%)',
			}}
		/>
	</AbsoluteFill>
);

export const Scene: React.FC<{animate?: boolean}> = ({animate = true}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	// idle "alive" motion for the preview (breathing + tiny head sway)
	const breathe = animate ? Math.sin(t * 2.1) * 0.006 : 0;
	const sway = animate ? Math.sin(t * 1.3) * 4 : 0;
	const lift = animate ? interpolate(Math.sin(t * 2.1), [-1, 1], [0, -6]) : 0;

	return (
		<AbsoluteFill style={{backgroundColor: '#d8d6d0'}}>
			<Img src={staticFile('studio/bg-frontal.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			{/* warm key light from camera side */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse 70% 45% at 50% 42%, rgba(255,244,228,0.35), rgba(0,0,0,0) 70%), linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.12))',
				}}
			/>

			<AbsoluteFill style={{transform: `translate(${sway}px, ${lift}px) scale(${1 + breathe})`, transformOrigin: '50% 80%'}}>
				{/* torso: extends the black polo beyond the reference crop */}
				<div
					style={{
						position: 'absolute',
						left: 110,
						width: 860,
						top: 1195,
						height: 400,
						background: 'linear-gradient(180deg, #16161a, #0b0b0d)',
						borderRadius: '260px 260px 0 0',
					}}
				/>
				<Img
					src={staticFile('character/front.png')}
					style={{position: 'absolute', left: 540 - 305, top: 300, width: 610, height: 1202}}
				/>
			</AbsoluteFill>

			<Desk />
		</AbsoluteFill>
	);
};
