export const siteName = "BreedWise";
export const siteUrl = "https://breedwise.co.uk";
export const defaultTitle = "BreedWise | UK Pet Breeder Directory";
export const defaultDescription =
  "Compare public pet breeder listings across the UK — dogs, cats, birds, fish, reptiles and small pets. Search by breed and location. BreedWise is a directory only — we do not sell animals or endorse breeders.";

export function generateMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const canonical = `${siteUrl}${path}`;

  return {
    title: fullTitle,
    description: fullDescription,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: canonical,
      siteName,
      locale: "en_GB",
      type: "website",
      images: [
        {
          url: `${siteUrl}/logo.svg`,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
    },
  };
}
