import { createClient, type SanityClient } from '@sanity/client';
import { publicSanityDataset, publicSanityProjectId } from './env';

export const sanityConfigured = Boolean(publicSanityProjectId);

export const sanityClient: SanityClient | null = sanityConfigured
	? createClient({
			projectId: publicSanityProjectId,
			dataset: publicSanityDataset,
			apiVersion: '2025-02-19',
			useCdn: true
		})
	: null;
