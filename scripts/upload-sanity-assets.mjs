import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, parse, resolve } from 'node:path';
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
const mediaRoot = resolve(
	process.argv[2] ??
		'/Users/tobeurdeath/Downloads/projects-files/lina-tsapova/optimized'
);

const categoryMap = {
	Md: { slug: 'modeling', title: 'Modeling' },
	Ph: { slug: 'photography', title: 'Photography' }
};

const heroFilename = 'lina-tsapova-modeling-silhouette-hero.jpg';
const heroAlt =
	'Seated model in silhouette raising one hand against a softly lit white background';

if (!projectId || !token) {
	console.error('Set PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env before uploading.');
	process.exit(1);
}

if (!existsSync(mediaRoot)) {
	console.error(`Optimized media folder does not exist: ${mediaRoot}`);
	process.exit(1);
}

const client = createClient({
	projectId,
	dataset,
	token: token.trim(),
	apiVersion: '2025-02-19',
	useCdn: false
});

const assertWriteAccess = async () => {
	try {
		await client.fetch('*[0]._id');
	} catch {
		console.error('Could not read from Sanity. Check PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN.');
		process.exit(1);
	}

	try {
		const probeId = 'upload-probe-delete-me';
		await client.createIfNotExists({
			_id: probeId,
			_type: 'workCategory',
			title: '__upload_probe__',
			slug: { _type: 'slug', current: '__upload-probe__' },
			images: []
		});
		await client.delete(probeId);
	} catch (error) {
		const message = error.response?.body?.error?.description ?? error.message;
		if (!message.includes('Insufficient permissions')) throw error;

		console.error(`
Your SANITY_API_TOKEN cannot write to the API.

Sanity "Editor" tokens often fail for asset uploads. Create a new token with the
Developer role instead:

  sanity.io/manage → Folio (nw8rsv9h) → API → Add API token → Permissions: Developer

Then replace SANITY_API_TOKEN in .env and run this command again.
`);
		process.exit(1);
	}
};

await assertWriteAccess();

const altFromFilename = (filename) =>
	parse(filename).name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

const portfolioImage = (assetId, alt) => ({
	_type: 'portfolioImage',
	asset: { _type: 'reference', _ref: assetId },
	alt
});

const uploadCategory = async (folder, categoryKey) => {
	const categoryDir = join(mediaRoot, folder);
	if (!existsSync(categoryDir)) {
		console.warn(`Skipping ${folder}/ — folder not found`);
		return [];
	}

	const filenames = readdirSync(categoryDir)
		.filter((filename) => extname(filename).toLowerCase() === '.jpg')
		.sort();

	const uploaded = [];
	for (const filename of filenames) {
		const filePath = join(categoryDir, filename);
		const title = parse(filename).name;
		console.log(`Uploading ${folder}/${filename}`);
		const asset = await client.assets.upload('image', createReadStream(filePath), {
			filename,
			title,
			label: folder
		});
		uploaded.push({
			category: folder,
			filename,
			title,
			assetId: asset._id,
			url: asset.url,
			alt: altFromFilename(filename)
		});
	}

	return uploaded;
};

const syncWorkCategory = async (folder, uploaded) => {
	if (!uploaded.length) return;

	const { slug, title } = categoryMap[folder];
	const images = uploaded.map(({ assetId, alt }) => portfolioImage(assetId, alt));
	const existing = await client.fetch(`*[_type == "workCategory" && slug.current == $slug][0]._id`, {
		slug
	});

	if (existing) {
		console.log(`Updating work category "${slug}" with ${images.length} images`);
		await client.patch(existing).set({ images }).commit();
		return;
	}

	console.log(`Creating work category "${slug}" with ${images.length} images`);
	await client.create({
		_type: 'workCategory',
		title,
		slug: { _type: 'slug', current: slug },
		description:
			slug === 'modeling'
				? 'Selected modeling work, portraits, and editorial studies.'
				: 'Commissioned and personal photography across people, place, and light.',
		order: slug === 'modeling' ? 1 : 2,
		images
	});
};

const findAsset = (manifest, filename) =>
	manifest.find((entry) => entry.filename.toLowerCase() === filename.toLowerCase());

const syncSiteSettings = async (manifest) => {
	const hero = findAsset(manifest, heroFilename);
	if (!hero) {
		console.warn(`Skipping hero image — ${heroFilename} not found in uploaded assets`);
		return;
	}

	const heroImage = portfolioImage(hero.assetId, heroAlt);
	const existing = await client.fetch(`*[_type == "siteSettings"][0]._id`);

	if (existing) {
		console.log(`Updating site settings with hero image (${heroFilename})`);
		await client.patch(existing).set({ heroImage }).commit();
		return;
	}

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
};

const syncProfile = async (manifest) => {
	const portrait = findAsset(manifest, 'IMG_7393.jpg');
	if (!portrait) {
		console.warn('Skipping profile portrait — IMG_7393.jpg not found in uploaded assets');
		return;
	}

	const portraitImage = portfolioImage(portrait.assetId, 'Portrait of Lina Tsapova');
	const existing = await client.fetch(`*[_type == "profile"][0]._id`);

	if (existing) {
		console.log('Updating profile with portrait (IMG_7393)');
		await client.patch(existing).set({ portrait: portraitImage, email: 'tsapovalina@gmail.com' }).commit();
		return;
	}

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
};

const manifest = [];
for (const folder of ['Md', 'Ph']) {
	const uploaded = await uploadCategory(folder, folder);
	manifest.push(...uploaded);
	await syncWorkCategory(folder, uploaded);
}

const manifestPath = join(mediaRoot, 'sanity-assets.json');
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await syncSiteSettings(manifest);
await syncProfile(manifest);
console.log(`Done. Uploaded ${manifest.length} assets and synced work categories.`);
console.log(`Manifest: ${manifestPath}`);
