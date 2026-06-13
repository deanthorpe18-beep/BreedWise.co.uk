-- Migration 020: Multi-Animal Type Support
-- Expand BreedWise from dog-only to multi-species directory.

-- ============================================================================
-- 1. ANIMAL TYPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.animal_types (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text DEFAULT 'PawPrint',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.animal_types (name, slug, icon, display_order, is_active)
VALUES
  ('Dog', 'dog', 'Dog', 1, true),
  ('Cat', 'cat', 'Cat', 2, true),
  ('Bird', 'bird', 'Bird', 3, true),
  ('Fish', 'fish', 'Fish', 4, true),
  ('Reptile', 'reptile', 'Snail', 5, true),
  ('Small Pet', 'small-pet', 'Rabbit', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. ADD animal_type TO breeds TABLE
-- ============================================================================
ALTER TABLE public.breeds
  ADD COLUMN IF NOT EXISTS animal_type text DEFAULT 'dog';

-- Update all existing breeds to dog
UPDATE public.breeds SET animal_type = 'dog' WHERE animal_type IS NULL OR animal_type = '';

-- Make non-nullable after backfill
ALTER TABLE public.breeds ALTER COLUMN animal_type SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_breeds_animal_type ON public.breeds(animal_type);
CREATE INDEX IF NOT EXISTS idx_breeds_animal_slug ON public.breeds(animal_type, slug);

-- ============================================================================
-- 3. ADD animal_type TO breeder_breeds TABLE
-- ============================================================================
ALTER TABLE public.breeder_breeds
  ADD COLUMN IF NOT EXISTS animal_type text DEFAULT 'dog';

-- Update all existing rows to dog
UPDATE public.breeder_breeds SET animal_type = 'dog' WHERE animal_type IS NULL OR animal_type = '';

-- Make non-nullable after backfill
ALTER TABLE public.breeder_breeds ALTER COLUMN animal_type SET NOT NULL;

-- Drop old unique constraint, add new one including animal_type
ALTER TABLE public.breeder_breeds DROP CONSTRAINT IF EXISTS breeder_breeds_breeder_id_breed_key;
ALTER TABLE public.breeder_breeds ADD CONSTRAINT breeder_breeds_breeder_id_breed_animal_key UNIQUE (breeder_id, breed, animal_type);

CREATE INDEX IF NOT EXISTS idx_breeder_breeds_animal ON public.breeder_breeds(animal_type);
CREATE INDEX IF NOT EXISTS idx_breeder_breeds_animal_breed ON public.breeder_breeds(animal_type, breed);

-- ============================================================================
-- 4. SEED STARTER BREEDS FOR NON-DOG ANIMALS
-- ============================================================================

-- CATS
INSERT INTO public.breeds (name, slug, animal_type, group_name, size, is_popular, description)
VALUES
  ('Maine Coon', 'maine-coon', 'cat', 'Longhair', 'large', true, 'The Maine Coon is one of the largest domesticated cat breeds, known for its friendly dog-like personality and luxurious long coat.'),
  ('British Shorthair', 'british-shorthair', 'cat', 'Shorthair', 'medium', true, 'The British Shorthair is a stocky, easygoing cat with a dense coat and round face. They are calm, affectionate companions.'),
  ('Bengal', 'bengal', 'cat', 'Shorthair', 'medium', true, 'The Bengal is a domesticated cat with a wild appearance, featuring a spotted coat reminiscent of a leopard. They are energetic and intelligent.'),
  ('Siamese', 'siamese', 'cat', 'Shorthair', 'medium', true, 'The Siamese is one of the oldest and most recognisable cat breeds, known for its striking blue eyes, pointed colouration, and vocal personality.'),
  ('Ragdoll', 'ragdoll', 'cat', 'Longhair', 'large', true, 'The Ragdoll is a large, affectionate cat known for going limp when picked up. They have striking blue eyes and a semi-long silky coat.'),
  ('Persian', 'persian', 'cat', 'Longhair', 'medium', true, 'The Persian is a long-haired cat with a distinctive flat face and luxurious coat. They are calm, gentle, and prefer a quiet indoor lifestyle.'),
  ('Sphynx', 'sphynx', 'cat', 'Hairless', 'medium', true, 'The Sphynx is a hairless cat breed known for its wrinkled skin and extroverted, affectionate personality. They are surprisingly warm to the touch.'),
  ('Scottish Fold', 'scottish-fold', 'cat', 'Shorthair', 'medium', true, 'The Scottish Fold is recognised by its unique folded ears. They are sweet-natured, adaptable cats that get along well with children and other pets.')
ON CONFLICT (name) DO UPDATE SET animal_type = EXCLUDED.animal_type, slug = EXCLUDED.slug;

-- BIRDS
INSERT INTO public.breeds (name, slug, animal_type, group_name, size, is_popular, description)
VALUES
  ('Budgerigar', 'budgerigar', 'bird', 'Parrot', 'small', true, 'The Budgerigar, or budgie, is a small, colourful parrot native to Australia. They are intelligent, social, and can learn to mimic speech.'),
  ('African Grey', 'african-grey', 'bird', 'Parrot', 'medium', true, 'The African Grey is widely considered the most intelligent parrot species, with remarkable speech mimicry and problem-solving abilities.'),
  ('Cockatiel', 'cockatiel', 'bird', 'Parrot', 'small', true, 'The Cockatiel is a small parrot with a distinctive crest. They are friendly, relatively quiet, and make excellent first birds.'),
  ('Macaw', 'macaw', 'bird', 'Parrot', 'large', true, 'Macaws are large, colourful parrots known for their impressive size, loud calls, and strong bonds with their owners. They need plenty of space.'),
  ('Canary', 'canary', 'bird', 'Songbird', 'small', true, 'The Canary is a small songbird prized for its beautiful singing. They are relatively low-maintenance and do well in cages.'),
  ('Lovebird', 'lovebird', 'bird', 'Parrot', 'small', true, 'Lovebirds are small, colourful parrots known for forming strong pair bonds. They are active, playful, and thrive on social interaction.')
ON CONFLICT (name) DO UPDATE SET animal_type = EXCLUDED.animal_type, slug = EXCLUDED.slug;

-- FISH
INSERT INTO public.breeds (name, slug, animal_type, group_name, size, is_popular, description)
VALUES
  ('Neon Tetra', 'neon-tetra', 'fish', 'Tetra', 'small', true, 'The Neon Tetra is a small, vibrant freshwater fish known for its iridescent blue and red stripes. They are peaceful schooling fish.'),
  ('Goldfish', 'goldfish', 'fish', 'Carp', 'small', true, 'The Goldfish is one of the most popular aquarium fish worldwide. They come in many varieties and can live for decades with proper care.'),
  ('Betta', 'betta', 'fish', 'Labyrinth', 'small', true, 'The Betta, or Siamese Fighting Fish, is known for its flowing fins and vivid colours. Males must be kept alone but can thrive in community tanks.'),
  ('Angelfish', 'angelfish', 'fish', 'Cichlid', 'medium', true, 'The Angelfish is an elegant freshwater fish with a distinctive triangular shape and long fins. They are relatively easy to care for.'),
  ('Discus', 'discus', 'fish', 'Cichlid', 'medium', true, 'The Discus is often called the king of aquarium fish due to its stunning colours and round shape. They require pristine water conditions.'),
  ('Guppy', 'guppy', 'fish', 'Livebearer', 'small', true, 'The Guppy is a popular, colourful livebearer that breeds readily. They are hardy, peaceful, and ideal for beginners.'),
  ('Dojo Loach', 'dojo-loach', 'fish', 'Loach', 'small', true, 'The Dojo Loach, or Weather Loach, is an eel-like bottom-dweller known for its sensitivity to barometric pressure changes. Peaceful and active.')
ON CONFLICT (name) DO UPDATE SET animal_type = EXCLUDED.animal_type, slug = EXCLUDED.slug;

-- REPTILES
INSERT INTO public.breeds (name, slug, animal_type, group_name, size, is_popular, description)
VALUES
  ('Bearded Dragon', 'bearded-dragon', 'reptile', 'Lizard', 'medium', true, 'The Bearded Dragon is a friendly, docile lizard native to Australia. They are one of the most popular pet reptiles due to their calm temperament.'),
  ('Leopard Gecko', 'leopard-gecko', 'reptile', 'Gecko', 'small', true, 'The Leopard Gecko is a small, ground-dwelling lizard known for its spotted pattern and easy care requirements. Ideal for first-time reptile keepers.'),
  ('Ball Python', 'ball-python', 'reptile', 'Snake', 'medium', true, 'The Ball Python is a docile, relatively small snake that gets its name from curling into a ball when stressed. They are the most popular pet snake.'),
  ('Crested Gecko', 'crested-gecko', 'reptile', 'Gecko', 'small', true, 'The Crested Gecko is an arboreal lizard with distinctive eyelash-like crests. They are easy to care for and eat a specialised fruit diet.'),
  ('Corn Snake', 'corn-snake', 'reptile', 'Snake', 'medium', true, 'The Corn Snake is a colourful, docile snake native to North America. They are active, curious, and excellent for beginners.')
ON CONFLICT (name) DO UPDATE SET animal_type = EXCLUDED.animal_type, slug = EXCLUDED.slug;

-- SMALL PETS
INSERT INTO public.breeds (name, slug, animal_type, group_name, size, is_popular, description)
VALUES
  ('Rabbit', 'rabbit', 'small-pet', 'Lagomorph', 'medium', true, 'Rabbits are social, intelligent small pets that can be litter-trained and form strong bonds with their owners. They need plenty of space to hop.'),
  ('Guinea Pig', 'guinea-pig', 'small-pet', 'Rodent', 'small', true, 'Guinea Pigs are gentle, vocal rodents that thrive in pairs or groups. They require vitamin C in their diet and enjoy human interaction.'),
  ('Hamster', 'hamster', 'small-pet', 'Rodent', 'small', true, 'Hamsters are nocturnal rodents that are popular pets due to their small size and relatively simple care requirements. They need a large cage with enrichment.'),
  ('Ferret', 'ferret', 'small-pet', 'Mustelid', 'small', true, 'Ferrets are playful, intelligent mustelids known for their curiosity and energy. They are social animals that need several hours of playtime daily.'),
  ('Chinchilla', 'chinchilla', 'small-pet', 'Rodent', 'small', true, 'Chinchillas are soft-furred rodents native to the Andes. They are active, social, and need dust baths to keep their dense coat healthy.')
ON CONFLICT (name) DO UPDATE SET animal_type = EXCLUDED.animal_type, slug = EXCLUDED.slug;

-- ============================================================================
-- 5. ADD animal_type TO search_analytics
-- ============================================================================
ALTER TABLE public.search_analytics
  ADD COLUMN IF NOT EXISTS animal text;

CREATE INDEX IF NOT EXISTS idx_search_analytics_animal ON public.search_analytics(animal);

-- ============================================================================
-- 6. RLS FOR animal_types
-- ============================================================================
ALTER TABLE public.animal_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY animal_types_select_public
  ON public.animal_types FOR SELECT
  USING (true);
