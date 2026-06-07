import { createClient } from '@sanity/client';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(projectRoot, '.env');

if (existsSync(envPath)) {
	for (const line of readFileSync(envPath, 'utf8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const separator = trimmed.indexOf('=');
		if (separator === -1) continue;
		const key = trimmed.slice(0, separator).trim();
		let value = trimmed.slice(separator + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = value;
	}
}

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;
const manifestPath = resolve(
	process.argv[2] ??
		'/Users/tobeurdeath/Downloads/projects-files/lina-tsapova/optimized/sanity-assets.json'
);

if (!projectId || !token) {
	console.error('Set PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env before syncing.');
	process.exit(1);
}

if (!existsSync(manifestPath)) {
	console.error(`Manifest not found: ${manifestPath}`);
	process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const client = createClient({
	projectId,
	dataset,
	token: token.trim(),
	apiVersion: '2025-02-19',
	useCdn: false
});

const portfolioImage = (assetId, alt) => ({
	_type: 'portfolioImage',
	asset: { _type: 'reference', _ref: assetId },
	alt
});

const heroFilename = 'lina-tsapova-modeling-silhouette-hero.jpg';
const heroAlt =
	'Seated model in silhouette raising one hand against a softly lit white background';

const findAsset = (filename) =>
	manifest.find((entry) => entry.filename.toLowerCase() === filename.toLowerCase());

const hero = findAsset(heroFilename);
const portrait = findAsset('IMG_7393.jpg');

if (!hero) {
	console.error(`${heroFilename} not found in manifest.`);
	process.exit(1);
}

if (!portrait) {
	console.error('IMG_7393.jpg not found in manifest.');
	process.exit(1);
}

const heroImage = portfolioImage(hero.assetId, heroAlt);
const portraitImage = portfolioImage(portrait.assetId, 'Portrait of Lina Tsapova');

const siteSettingsId = await client.fetch(`*[_type == "siteSettings"][0]._id`);
if (siteSettingsId) {
	console.log(`Updating site settings with hero image (${heroFilename})`);
	await client.patch(siteSettingsId).set({ heroImage }).commit();
} else {
	console.log(`Creating site settings with hero image (${heroFilename})`);
	await client.create({
		_type: 'siteSettings',
		_id: 'siteSettings',
		siteTitle: 'Lina Tsapova — Modeling and Photography',
		metaDescription: 'Lina Tsapova — photographer and visual artist.',
		landingStatement: 'Presence,\nobserved.',
		heroNote: 'Warsaw — available worldwide',
		heroImage
	});
}

const profileId = await client.fetch(`*[_type == "profile"][0]._id`);
if (profileId) {
	console.log('Updating profile with portrait (IMG_7393)');
	await client.patch(profileId).set({ portrait: portraitImage, email: 'tsapovalina@gmail.com' }).commit();
} else {
	console.log('Creating profile with portrait (IMG_7393)');
	await client.create({
		_type: 'profile',
		_id: 'profile',
		name: 'Lina Tsapova',
		descriptor: 'About / Contact',
		headline: 'Looking for the quieter part of a moment.',
		bio: 'Lina Tsapova is a photographer and visual artist based in Warsaw. Her work moves between portraiture, landscape, and the architecture of everyday life.\n\nAvailable for editorial commissions, selected commercial projects, and collaborations worldwide.',
		email: 'tsapovalina@gmail.com',
		instagram: 'https://www.instagram.com/lina_tsapova?igsh=NXdvYTFpM2Vxcmc3',
		threads: 'https://www.threads.com/@lina_tsapova?igshid=NTc4MTIwNjQ2YQ==',
		portrait: portraitImage
	});
}

console.log('Done.');
