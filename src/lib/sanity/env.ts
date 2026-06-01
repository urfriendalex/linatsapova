import { env } from '$env/dynamic/public';

export const publicSanityProjectId = env.PUBLIC_SANITY_PROJECT_ID ?? '';
export const publicSanityDataset = env.PUBLIC_SANITY_DATASET ?? 'production';
