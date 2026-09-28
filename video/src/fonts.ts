import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are shipped in public/fonts so rendering works offline.
const FONTS: [string, string, string][] = [
	['Anton', 'fonts/anton-latin-400-normal.woff2', '400'],
	['Inter', 'fonts/inter-latin-600-normal.woff2', '600'],
	['Inter', 'fonts/inter-latin-800-normal.woff2', '800'],
];

const handle = delayRender('Loading fonts');
Promise.all(
	FONTS.map(async ([family, file, weight]) => {
		const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight});
		await face.load();
		document.fonts.add(face);
	}),
).then(() => continueRender(handle));

export const anton = 'Anton, Impact, sans-serif';
export const inter = 'Inter, Arial, sans-serif';
