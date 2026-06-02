import type { PortfolioImage, Profile, Project, SiteSettings, WorkCategory } from '$lib/types';
import { sampleProfile, sampleSiteSettings } from '$lib/sample-data';
import { sanityClient, sanityConfigured } from './client.server';
import { mapPortfolioImage, type SanityPortfolioImage } from './image';
import {
	profileQuery,
	projectsQuery,
	siteSettingsQuery,
	workCategoriesQuery
} from './queries';

type SanityProject = {
	slug: string;
	title: string;
	year: string;
	summary: string;
	cover: SanityPortfolioImage;
	stack: [SanityPortfolioImage, SanityPortfolioImage];
	gallery: SanityPortfolioImage[];
};

type SanityWorkCategory = {
	slug: string;
	title: string;
	description: string;
	images: SanityPortfolioImage[];
};

type SanityProfile = {
	name?: string;
	descriptor?: string;
	headline?: string;
	bio?: string;
	email?: string;
	instagram?: string;
	threads?: string;
	portrait?: SanityPortfolioImage;
};

type SanitySiteSettings = {
	siteTitle?: string;
	metaDescription?: string;
	landingStatement?: string;
	heroNote?: string;
	heroImage?: SanityPortfolioImage;
};

const mapProject = (project: SanityProject): Project => ({
	slug: project.slug,
	title: project.title,
	year: project.year ?? '',
	summary: project.summary ?? '',
	cover: mapPortfolioImage(project.cover),
	stack: [mapPortfolioImage(project.stack[0]), mapPortfolioImage(project.stack[1])],
	gallery: project.gallery.map(mapPortfolioImage)
});

const mapWorkCategory = (category: SanityWorkCategory): WorkCategory => ({
	slug: category.slug,
	title: category.title,
	description: category.description ?? '',
	images: category.images.map(mapPortfolioImage)
});

const mapProfile = (profile: SanityProfile): Profile => ({
	name: profile.name ?? sampleProfile.name,
	descriptor: profile.descriptor ?? sampleProfile.descriptor,
	headline: profile.headline ?? sampleProfile.headline,
	bio: profile.bio ?? sampleProfile.bio,
	email: sampleProfile.email,
	instagram: profile.instagram ?? sampleProfile.instagram,
	threads: profile.threads ?? sampleProfile.threads,
	portrait: profile.portrait ? mapPortfolioImage(profile.portrait) : null
});

const mapSiteSettings = (settings: SanitySiteSettings): SiteSettings => ({
	siteTitle: settings.siteTitle ?? sampleSiteSettings.siteTitle,
	metaDescription: settings.metaDescription ?? sampleSiteSettings.metaDescription,
	landingStatement: settings.landingStatement ?? sampleSiteSettings.landingStatement,
	heroNote: settings.heroNote ?? sampleSiteSettings.heroNote,
	heroImage: settings.heroImage ? mapPortfolioImage(settings.heroImage) : null
});

const fetchFromSanity = async <T>(query: string): Promise<T | null> => {
	if (!sanityClient) return null;
	try {
		return await sanityClient.fetch<T>(query);
	} catch {
		return null;
	}
};

export const getProjects = async (): Promise<Project[]> => {
	if (!sanityConfigured) return [];
	const projects = await fetchFromSanity<SanityProject[]>(projectsQuery);
	if (!projects?.length) return [];
	return projects.map(mapProject);
};

export const getProject = async (slug: string): Promise<Project | undefined> => {
	const projects = await getProjects();
	return projects.find((project) => project.slug === slug);
};

export const getWorkCategories = async (): Promise<WorkCategory[]> => {
	if (!sanityConfigured) return [];
	const categories = await fetchFromSanity<SanityWorkCategory[]>(workCategoriesQuery);
	if (!categories?.length) return [];
	return categories.map(mapWorkCategory);
};

export const getWorkCategory = async (slug: string): Promise<WorkCategory | undefined> => {
	const categories = await getWorkCategories();
	return categories.find((category) => category.slug === slug);
};

export const getProfile = async (): Promise<Profile> => {
	if (!sanityConfigured) return sampleProfile;
	const profile = await fetchFromSanity<SanityProfile>(profileQuery);
	if (!profile) return sampleProfile;
	return mapProfile(profile);
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
	if (!sanityConfigured) return sampleSiteSettings;
	const settings = await fetchFromSanity<SanitySiteSettings>(siteSettingsQuery);
	if (!settings) return sampleSiteSettings;
	return mapSiteSettings(settings);
};

export const getProjectSlugs = async () => (await getProjects()).map((project) => project.slug);

export const getWorkCategorySlugs = async () =>
	(await getWorkCategories()).map((category) => category.slug);

export const getAllGalleryImages = async (): Promise<PortfolioImage[]> => {
	const categories = await getWorkCategories();
	return [
		...new Map(
			categories.flatMap((category) => category.images).map((image) => [image.id, image])
		).values()
	];
};
