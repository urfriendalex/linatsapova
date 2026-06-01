import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type PortfolioImage = {
	id: string;
	src: string;
	alt: string;
	width: number;
	height: number;
	caption?: string;
	lqip?: string;
	sanityAsset?: SanityImageSource;
};

export type Project = {
	slug: string;
	title: string;
	year: string;
	summary: string;
	cover: PortfolioImage;
	stack: [PortfolioImage, PortfolioImage];
	gallery: PortfolioImage[];
};

export type WorkCategory = {
	slug: string;
	title: string;
	description: string;
	images: PortfolioImage[];
};

export type Profile = {
	name: string;
	descriptor: string;
	headline: string;
	bio: string;
	email: string;
	instagram: string;
	threads: string;
	portrait?: PortfolioImage | null;
};

export type SiteSettings = {
	siteTitle: string;
	metaDescription: string;
	landingStatement: string;
	heroNote: string;
	heroImage?: PortfolioImage | null;
};
