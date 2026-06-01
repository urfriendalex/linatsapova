export type PortfolioImage = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  lqip?: string;
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
