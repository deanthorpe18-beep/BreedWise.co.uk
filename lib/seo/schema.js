export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BreedWise",
    url: "https://breedwise.co.uk",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://breedwise.co.uk/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BreedWise",
    url: "https://breedwise.co.uk",
    logo: "https://breedwise.co.uk/logo.png",
    sameAs: [],
  };
}

export function breadcrumbSchema(items) {
  // items: array of { name, url }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(questions) {
  // questions: array of { question, answer }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function localBusinessSchema(breeder) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: breeder.name?.value || breeder.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: breeder.town?.value || breeder.town,
      addressRegion: breeder.county?.value || breeder.county,
      addressCountry: "UK",
    },
    telephone: breeder.phone?.value || breeder.phone,
    url: breeder.website?.value || breeder.website,
    aggregateRating: breeder.google_rating?.value
      ? {
          "@type": "AggregateRating",
          ratingValue: breeder.google_rating.value,
          bestRating: "5",
        }
      : undefined,
  };
}
