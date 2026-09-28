// Generates the talking avatar with HeyGen Avatar IV (photo -> talking video)
// and saves it to public/avatar.mp4, ready for `npm run render:final`.
//
// Usage:
//   export HEYGEN_API_KEY=...            (HeyGen > Settings > API)
//   export HEYGEN_VOICE_ID=...           (optional: an Italian male voice id, see `node scripts/heygen.mjs --voices`)
//   npm run still:avatar                 (creates out/avatar-input.png: seated at the desk, frontal, 9:16)
//   npm run heygen
import fs from 'node:fs';

// Keep in sync with src/timeline.ts
const SCRIPT =
	'Esegui lo squat ad ogni allenamento? Occhio perché così rischi di danneggiare gravemente le tue ginocchia.';

const KEY = process.env.HEYGEN_API_KEY;
if (!KEY) {
	console.error('Missing HEYGEN_API_KEY');
	process.exit(1);
}
const IMAGE = process.env.AVATAR_IMAGE ?? 'out/avatar-input.png';
const API = 'https://api.heygen.com';
const headers = {'X-Api-Key': KEY};

const json = async (res) => {
	const body = await res.json();
	if (!res.ok || body.error) throw new Error(`${res.status} ${JSON.stringify(body.error ?? body)}`);
	return body.data;
};

const listItalianVoices = async () => {
	const data = await json(await fetch(`${API}/v2/voices`, {headers}));
	return data.voices.filter((v) => /ital/i.test(v.language ?? ''));
};

if (process.argv.includes('--voices')) {
	for (const v of await listItalianVoices()) console.log(v.voice_id, '|', v.name, '|', v.gender);
	process.exit(0);
}

let voiceId = process.env.HEYGEN_VOICE_ID;
if (!voiceId) {
	const voices = await listItalianVoices();
	const male = voices.find((v) => /male/i.test(v.gender ?? '') && !/female/i.test(v.gender ?? '')) ?? voices[0];
	if (!male) throw new Error('No Italian voice found, set HEYGEN_VOICE_ID');
	voiceId = male.voice_id;
	console.log('Voice:', male.name, voiceId);
}

// 1. upload the frontal seated image
console.log('Uploading', IMAGE);
const upload = await json(
	await fetch('https://upload.heygen.com/v1/asset', {
		method: 'POST',
		headers: {...headers, 'Content-Type': 'image/png'},
		body: fs.readFileSync(IMAGE),
	}),
);
const imageKey = upload.image_key;

// 2. Avatar IV generation (portrait 9:16)
const gen = await json(
	await fetch(`${API}/v2/video/av4/generate`, {
		method: 'POST',
		headers: {...headers, 'Content-Type': 'application/json'},
		body: JSON.stringify({
			image_key: imageKey,
			video_title: 'Squat ginocchia',
			script: SCRIPT,
			voice_id: voiceId,
			video_orientation: 'portrait',
			fit: 'cover',
			custom_motion_prompt: 'Seated at the desk, talking to the camera, natural head movements, serious warning tone',
		}),
	}),
);
const videoId = gen.video_id;
console.log('HeyGen video id:', videoId);

// 3. poll
let url;
for (;;) {
	await new Promise((r) => setTimeout(r, 10_000));
	const st = await json(await fetch(`${API}/v1/video_status.get?video_id=${videoId}`, {headers}));
	console.log('status:', st.status);
	if (st.status === 'completed') {
		url = st.video_url;
		break;
	}
	if (st.status === 'failed') throw new Error(JSON.stringify(st.error));
}

// 4. download
const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
fs.writeFileSync('public/avatar.mp4', buf);
console.log('Saved public/avatar.mp4 -> now run: npm run render:final');
