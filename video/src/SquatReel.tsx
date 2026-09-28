import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getVideoMetadata} from '@remotion/media-utils';
import {Scene} from './Scene';
import {
	CameraHud,
	CaptionPop,
	DangerFlash,
	FollowButton,
	KneeAlert,
	PreviewBadge,
	ProgressBar,
	TrainingCalendar,
	WarningSign,
} from './Graphics';
import {BEATS, CAPTIONS, DEFAULT_DURATION_S, FPS} from './timeline';

export type ReelProps = {
	// Path inside public/ of the HeyGen Avatar IV render. null = preview with the still character.
	avatar: string | null;
};

export const reelSchemaDefaults: ReelProps = {avatar: null};

export const calculateReelMetadata: CalculateMetadataFunction<ReelProps> = async ({props}) => {
	if (!props.avatar) return {durationInFrames: DEFAULT_DURATION_S * FPS};
	const {durationInSeconds} = await getVideoMetadata(staticFile(props.avatar));
	// keep room for the outro even if the avatar talks faster than expected
	return {durationInFrames: Math.ceil(Math.max(durationInSeconds, BEATS.outro + 1.8) * FPS)};
};

const f = (s: number) => Math.round(s * FPS);

// Camera punch-ins + shake on the "Occhio!" beat
const useCamera = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	let scale = 1;
	for (const t of BEATS.punchIns) {
		const local = frame - f(t);
		if (local < 0) continue;
		const inS = spring({frame: local, fps, config: {damping: 12, stiffness: 160}});
		const outS = spring({frame: local - f(1.2), fps, config: {damping: 20}});
		scale += 0.07 * (inS - outS);
	}
	const w = frame - f(BEATS.warning.from);
	const shake = w >= 0 && w < 14 ? (1 - w / 14) * 14 : 0;
	return {scale, x: Math.sin(frame * 2.3) * shake, y: Math.cos(frame * 1.7) * shake};
};

export const SquatReel: React.FC<ReelProps> = ({avatar}) => {
	const cam = useCamera();
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill style={{transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`, transformOrigin: '50% 38%'}}>
				{avatar ? <OffthreadVideo src={staticFile(avatar)} /> : <Scene />}
			</AbsoluteFill>

			{/* subtle grade + vignette so white text always reads */}
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.25) 100%)',
				}}
			/>

			<CameraHud />

			<Sequence from={f(BEATS.calendar.from)} durationInFrames={f(BEATS.calendar.to - BEATS.calendar.from)}>
				<TrainingCalendar />
			</Sequence>
			<Sequence from={f(BEATS.warning.from)} durationInFrames={f(BEATS.warning.to - BEATS.warning.from)}>
				<WarningSign />
				<DangerFlash />
			</Sequence>
			<Sequence from={f(BEATS.knee.from)} durationInFrames={f(BEATS.knee.to - BEATS.knee.from)}>
				<KneeAlert />
				<DangerFlash />
			</Sequence>
			<Sequence from={f(BEATS.outro)}>
				<FollowButton />
			</Sequence>

			{CAPTIONS.map((c) => (
				<Sequence key={c.text} from={f(c.from)} durationInFrames={f(c.to - c.from)}>
					<CaptionPop caption={c} />
				</Sequence>
			))}

			<ProgressBar />
			{!avatar && <PreviewBadge />}
		</AbsoluteFill>
	);
};
