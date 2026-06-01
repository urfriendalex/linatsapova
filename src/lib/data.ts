import type { PortfolioImage, Project } from './types';

const photo = (id: string, width: number, height: number, alt: string): PortfolioImage => ({
  id,
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=88`,
  alt,
  width,
  height
});

const p = {
  coast: photo('photo-1507525428034-b723cf961d3e', 1800, 1200, 'Foamy ocean waves at the coast'),
  figure: photo('photo-1506794778202-cad84cf45f1d', 1200, 1600, 'Portrait in soft window light'),
  desert: photo('photo-1509316785289-025f5b846b35', 1800, 1200, 'Desert road through a pale landscape'),
  room: photo('photo-1505693416388-ac5ce068fe85', 1600, 1200, 'Quiet room with warm natural light'),
  flowers: photo('photo-1490750967868-88aa4486c946', 1200, 1600, 'Wild flowers in a field'),
  mountain: photo('photo-1464822759023-fed622ff2c3b', 1800, 1200, 'Mountain range beneath a clear sky'),
  city: photo('photo-1477959858617-67f85cf4f1df', 1800, 1200, 'City buildings viewed from above'),
  woman: photo('photo-1488426862026-3ee34a7d66df', 1200, 1600, 'Editorial portrait outdoors'),
  dunes: photo('photo-1500534623283-312aade485b7', 1800, 1200, 'Layered hills fading into distance'),
  forest: photo('photo-1441974231531-c6227db76b6e', 1600, 1200, 'Sunlight entering a dense forest'),
  architecture: photo('photo-1487958449943-2429e8be8625', 1800, 1200, 'Minimal modern house exterior'),
  portrait: photo('photo-1517841905240-472988babdf9', 1200, 1600, 'Portrait against a soft background')
};

export const projects: Project[] = [
  {
    slug: 'notes-on-silence',
    title: 'Notes on silence',
    year: '2025',
    summary: 'A study of distance, repetition, and the spaces that hold a pause.',
    cover: p.coast,
    stack: [p.figure, p.desert],
    gallery: [p.coast, p.figure, p.desert, p.room, p.flowers, p.mountain]
  },
  {
    slug: 'familiar-strangers',
    title: 'Familiar strangers',
    year: '2024',
    summary: 'Passing expressions and private gestures gathered in the city.',
    cover: p.woman,
    stack: [p.city, p.portrait],
    gallery: [p.woman, p.city, p.portrait, p.figure, p.architecture, p.room]
  },
  {
    slug: 'soft-territories',
    title: 'Soft territories',
    year: '2024',
    summary: 'Landscapes treated as memory: partial, softened, and slightly out of reach.',
    cover: p.dunes,
    stack: [p.forest, p.mountain],
    gallery: [p.dunes, p.forest, p.mountain, p.desert, p.flowers, p.coast]
  },
  {
    slug: 'rooms-for-light',
    title: 'Rooms for light',
    year: '2023',
    summary: 'Domestic architecture shaped by shifting daylight.',
    cover: p.room,
    stack: [p.architecture, p.flowers],
    gallery: [p.room, p.architecture, p.flowers, p.forest, p.city, p.desert]
  }
];

const allImages = [...new Map(projects.flatMap((project) => project.gallery).map((image) => [image.id, image])).values()];
export const workCategories = {
  modeling: {
    title: 'Modeling',
    description: 'Selected modeling work, portraits, and editorial studies.',
    images: [p.woman, p.portrait, p.figure, p.city, p.architecture, p.room]
  },
  photography: {
    title: 'Photography',
    description: 'Commissioned and personal photography across people, place, and light.',
    images: allImages
  }
} as const;
export type WorkCategory = keyof typeof workCategories;
export const getWorkCategory = (category: string) => workCategories[category as WorkCategory];
export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
