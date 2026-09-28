// Prepares the still assets used by the Remotion composition:
//  - public/studio/bg-frontal.jpg : 9:16 plate cut from the studio photos (empty wall + corner, desk removed)
//  - public/character/front.png   : front close-up of the character, cut out from the white reference sheet
//
// Run: npm run prepare-assets
import sharp from 'sharp';
import fs from 'node:fs';

const W = 1080;
const H = 1920;

// ---------- Studio background ----------
// studio3.jpg is 3024x4032. We keep the upper part (wall + room corner) where
// there are no objects, so the desk plate drawn in Remotion is the only desk and
// its top is completely empty.
const bgCrop = {left: 1130, top: 0, width: 1110, height: 1973}; // ~9:16
await sharp('public/studio/studio3.jpg')
	.extract(bgCrop)
	.resize(W, H, {fit: 'cover'})
	.blur(5) // shallow depth of field, the subject stays sharp
	.modulate({brightness: 1.02})
	.jpeg({quality: 90})
	.toFile('public/studio/bg-frontal.jpg');

// ---------- Character cut-out ----------
// Front close-up from the reference sheet (first panel of the bottom row).
const SCALE = 4;
const crop = {left: 0, top: 300, width: 138, height: 272};
const {data, info} = await sharp('public/character/reference-sheet.webp')
	.extract(crop)
	.resize(crop.width * SCALE, crop.height * SCALE, {kernel: 'lanczos3'})
	.removeAlpha()
	.raw()
	.toBuffer({resolveWithObject: true});

const {width: w, height: h} = info;
const isBg = (i) => {
	const r = data[i * 3];
	const g = data[i * 3 + 1];
	const b = data[i * 3 + 2];
	const mn = Math.min(r, g, b);
	const mx = Math.max(r, g, b);
	return mn > 222 && mx - mn < 28;
};

// Flood fill the white studio background starting from top/left/right borders.
const bg = new Uint8Array(w * h);
const stack = [];
const push = (x, y) => {
	if (x < 0 || y < 0 || x >= w || y >= h) return;
	const i = y * w + x;
	if (bg[i] || !isBg(i)) return;
	bg[i] = 1;
	stack.push(i);
};
for (let x = 0; x < w; x++) push(x, 0);
for (let y = 0; y < h; y++) {
	push(0, y);
	push(w - 1, y);
}
while (stack.length) {
	const i = stack.pop();
	const x = i % w;
	const y = (i - x) / w;
	push(x + 1, y);
	push(x - 1, y);
	push(x, y + 1);
	push(x, y - 1);
}

const rgba = Buffer.alloc(w * h * 4);
for (let i = 0; i < w * h; i++) {
	rgba[i * 4] = data[i * 3];
	rgba[i * 4 + 1] = data[i * 3 + 1];
	rgba[i * 4 + 2] = data[i * 3 + 2];
	rgba[i * 4 + 3] = bg[i] ? 0 : 255;
}

// Soften the matte edge and pull it slightly inwards to kill the white halo.
const alpha = await sharp(rgba, {raw: {width: w, height: h, channels: 4}})
	.extractChannel(3)
	.blur(2.2)
	.linear(1.35, -90)
	.raw()
	.toBuffer();
for (let i = 0; i < w * h; i++) rgba[i * 4 + 3] = alpha[i];

fs.mkdirSync('public/character', {recursive: true});
await sharp(rgba, {raw: {width: w, height: h, channels: 4}})
	.png()
	.toFile('public/character/front.png');

console.log('bg-frontal.jpg', W, H, '| front.png', w, h);
