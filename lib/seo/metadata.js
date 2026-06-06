export const siteName = "BreedWise";
export const siteUrl = "https://breedwise.co.uk";
export const defaultTitle = "BreedWise | UK Dog Breeder Directory";
export const defaultDescription =
  "Compare public dog breeder listings across the UK. Search by town, breed, and location. BreedWise is a directory only — we do not sell puppies or endorse breeders.";

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
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
    },
  };
}
