/**
 * BreedWise Utilities
 * 
 * This file previously contained FAKE/MOCK breeder data. It has been cleaned.
 * It now only contains:
 * - A static list of UK dog breeds (for UI convenience)
 * - Utility functions (slugify)
 * 
 * UNDER NO CIRCUMSTANCES should fake breeder data be added here.
 * All breeder data MUST come from Supabase / Google Places API only.
 */

export const BREED_LIST = [
  "Labrador Retriever",
  "Golden Retriever",
  "Cocker Spaniel",
  "English Springer Spaniel",
  "Vizsla",
  "Cavalier King Charles Spaniel",
  "French Bulldog",
  "Pug",
  "Dachshund",
  "Shih Tzu",
  "Pomeranian",
  "Chihuahua",
  "German Shepherd",
  "Border Collie",
  "Jack Russell Terrier",
  "Staffordshire Bull Terrier",
  "Boxer",
  "Rottweiler",
  "Doberman",
  "Cockapoo",
  "Cavapoo",
  "Labradoodle",
  "Goldendoodle",
  "Maltipoo",
  "Miniature Schnauzer",
  "Beagle",
  "Border Terrier",
  "Whippet",
  "West Highland Terrier",
  "Bernese Mountain Dog"
];

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getBreeds() {
  return BREED_LIST;
}
