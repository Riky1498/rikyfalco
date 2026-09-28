import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';

export const FPS = 25;
export const TOTAL_FRAMES = 743; // 29.72s @ 25fps
export const OVERLAY_FRAMES = 200; // primi 8 secondi

export const Root: React.FC = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
