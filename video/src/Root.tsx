import React from 'react';
import {Composition, Still} from 'remotion';
import {Scene} from './Scene';
import {SquatReel, calculateReelMetadata, reelSchemaDefaults} from './SquatReel';
import {DEFAULT_DURATION_S, FPS, HEIGHT, WIDTH} from './timeline';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="SquatReel"
			component={SquatReel}
			width={WIDTH}
			height={HEIGHT}
			fps={FPS}
			durationInFrames={DEFAULT_DURATION_S * FPS}
			defaultProps={reelSchemaDefaults}
			calculateMetadata={calculateReelMetadata}
		/>
		{/* Frontal seated shot without graphics: the image fed to HeyGen Avatar IV */}
		<Still id="AvatarInput" component={() => <Scene animate={false} />} width={WIDTH} height={HEIGHT} />
	</>
);
