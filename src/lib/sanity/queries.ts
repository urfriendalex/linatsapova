const portfolioImageProjection = /* groq */ `
  asset,
  "width": asset.asset->metadata.dimensions.width,
  "height": asset.asset->metadata.dimensions.height,
  "lqip": asset.asset->metadata.lqip,
  alt,
  caption
`;

export const projectsQuery = /* groq */ `
  *[_type == "project" && featured != false] | order(order asc, title asc) {
    "slug": slug.current,
    title,
    year,
    summary,
    cover { ${portfolioImageProjection} },
    "stack": stackImages[0..1] { ${portfolioImageProjection} },
    gallery[] { ${portfolioImageProjection} }
  }
`;

export const workCategoriesQuery = /* groq */ `
  *[_type == "workCategory"] | order(order asc, title asc) {
    "slug": slug.current,
    title,
    description,
    images[] { ${portfolioImageProjection} }
  }
`;

export const profileQuery = /* groq */ `
  *[_type == "profile"][0] {
    name,
    descriptor,
    headline,
    bio,
    email,
    instagram,
    threads,
    portrait { ${portfolioImageProjection} }
  }
`;

export const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings"][0] {
    siteTitle,
    metaDescription,
    landingStatement,
    heroNote,
    heroImage { ${portfolioImageProjection} }
  }
`;
