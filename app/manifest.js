export default function manifest() {
  return {
    name: "BreedWise — UK Dog Breeder Directory",
    short_name: "BreedWise",
    description: "Compare dog breeder listings across the UK. Find the right breeder for your family.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00BFA5",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
