import { createClient, type SanityClient } from '@sanity/client';
import { PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID } from '$env/static/public';

export const sanityConfigured = Boolean(PUBLIC_SANITY_PROJECT_ID);

export const sanityClient: SanityClient | null = sanityConfigured
	? createClient({
			projectId: PUBLIC_SANITY_PROJECT_ID,
			dataset: PUBLIC_SANITY_DATASET || 'production',
			apiVersion: '2025-02-19',
			useCdn: true
		})
	: null;
