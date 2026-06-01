import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join, parse, resolve } from 'node:path';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET ?? 'production';
const token = process.env.SANITY_API_TOKEN;
const mediaRoot = resolve(
  process.argv[2] ??
    '/Users/tobeurdeath/Desktop/project-screens/project-media-organized/lina-tsapova/optimized'
);

if (!projectId || !token) {
  console.error('Set PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN before uploading.');
  process.exit(1);
}

if (!existsSync(mediaRoot)) {
  console.error(`Optimized media folder does not exist: ${mediaRoot}`);
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-02-19',
  useCdn: false
});

const manifest = [];
for (const category of ['Md', 'Ph']) {
  const categoryDir = join(mediaRoot, category);
  const filenames = readdirSync(categoryDir)
    .filter((filename) => extname(filename).toLowerCase() === '.jpg')
    .sort();

  for (const filename of filenames) {
    const filePath = join(categoryDir, filename);
    const title = parse(filename).name;
    console.log(`Uploading ${category}/${filename}`);
    const asset = await client.assets.upload('image', createReadStream(filePath), {
      filename,
      title,
      label: category
    });
    manifest.push({
      category,
      filename,
      title,
      assetId: asset._id,
      url: asset.url
    });
  }
}

const manifestPath = join(mediaRoot, 'sanity-assets.json');
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Uploaded ${manifest.length} assets. Manifest written to ${manifestPath}`);
