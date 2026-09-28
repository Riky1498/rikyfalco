// Everything time-related lives here, in seconds.
// The timings match an average Italian delivery of the script (~7s).
// Once the HeyGen video is in public/avatar.mp4, nudge these values so each
// caption lands on the spoken word.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const SCRIPT =
	'Esegui lo squat ad ogni allenamento? Occhio perché così rischi di danneggiare gravemente le tue ginocchia.';

export type Caption = {
	text: string; // max 3 words
	from: number;
	to: number;
	accent?: boolean; // yellow highlight box
	danger?: boolean; // red highlight box
};

export const CAPTIONS: Caption[] = [
	{text: 'SQUAT', from: 0.15, to: 1.1, accent: true},
	{text: 'OGNI ALLENAMENTO?', from: 1.1, to: 2.5},
	{text: 'OCCHIO!', from: 2.5, to: 3.4, danger: true},
	{text: 'RISCHIO SERIO', from: 3.4, to: 5.0},
	{text: 'GINOCCHIA DANNEGGIATE', from: 5.0, to: 7.0, danger: true},
	{text: 'SEGUI PER ALTRO', from: 7.2, to: 9.0, accent: true},
];

// Graphic beats
export const BEATS = {
	calendar: {from: 1.1, to: 2.5}, // every training day lit up
	warning: {from: 2.5, to: 3.6}, // warning sign + shake
	knee: {from: 5.0, to: 7.1}, // knee schematic with pain pulse
	punchIns: [0.15, 2.5, 5.0], // camera punch-in moments
	outro: 7.2,
};

export const DEFAULT_DURATION_S = 9;
