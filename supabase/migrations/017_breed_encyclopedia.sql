-- Migration 017: Breed Encyclopedia — add rich content columns to breeds table
-- and seed with Top 15 UK breeds using Kennel Club data.

-- ============================================================================
-- 1. ADD ENCYCLOPEDIA COLUMNS
-- ============================================================================
ALTER TABLE public.breeds
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS temperament text,
  ADD COLUMN IF NOT EXISTS lifespan text,
  ADD COLUMN IF NOT EXISTS exercise_needs text,
  ADD COLUMN IF NOT EXISTS grooming text,
  ADD COLUMN IF NOT EXISTS health_issues text,
  ADD COLUMN IF NOT EXISTS origin text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS male_height text,
  ADD COLUMN IF NOT EXISTS female_height text,
  ADD COLUMN IF NOT EXISTS male_weight text,
  ADD COLUMN IF NOT EXISTS female_weight text,
  ADD COLUMN IF NOT EXISTS coat_type text,
  ADD COLUMN IF NOT EXISTS good_with_children boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS good_with_other_dogs boolean DEFAULT false;

-- ============================================================================
-- 2. ENSURE SLUGS EXIST FOR ALL CURRENT BREEDS
-- ============================================================================
UPDATE public.breeds
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- ============================================================================
-- 3. SEED / UPDATE TOP 15 UK BREEDS WITH FULL ENCYCLOPEDIA DATA
-- ============================================================================

-- Helper: upsert breed data
INSERT INTO public.breeds (
  name, slug, group_name, size, popularity_rank, is_popular,
  description, temperament, lifespan, exercise_needs, grooming,
  health_issues, origin, image_url,
  male_height, female_height, male_weight, female_weight,
  coat_type, good_with_children, good_with_other_dogs
)
VALUES
(
  'Labrador Retriever', 'labrador-retriever', 'Gundog', 'large', 1, true,
  'The Labrador Retriever is the UK''s most popular dog breed, known for its friendly, outgoing nature and intelligence. Originally bred as a fishing dog in Newfoundland, they excel as family companions, assistance dogs, and working gundogs. Their eager-to-please attitude makes them highly trainable.',
  'Outgoing, even-tempered, gentle, intelligent, eager-to-please',
  '10–12 years',
  'High — at least 2 hours daily. Labradors are energetic working dogs that need plenty of exercise including walks, swimming, and retrieval games.',
  'Moderate — weekly brushing, more during shedding seasons. Their double coat sheds year-round with heavy seasonal drops.',
  'Hip and elbow dysplasia, progressive retinal atrophy (PRA), exercise-induced collapse, obesity (common due to food motivation)',
  'Newfoundland, Canada (developed in the UK)',
  'https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?w=800&q=80',
  '56–57 cm', '55–56 cm', '29–36 kg', '25–32 kg',
  'Short, dense, water-resistant double coat', true, true
),
(
  'French Bulldog', 'french-bulldog', 'Utility', 'small', 2, true,
  'The French Bulldog is a compact, muscular breed with distinctive bat-like ears and a playful personality. Despite their small stature, they have a big character and form strong bonds with their owners. They are well-suited to apartment living due to their moderate exercise needs.',
  'Adaptable, playful, alert, affectionate, stubborn at times',
  '10–12 years',
  'Moderate — 30–60 minutes daily. Short walks and indoor play suffice. Avoid overexertion in hot weather due to brachycephalic breathing.',
  'Low — weekly brushing. Minimal shedding. Wrinkles need regular cleaning to prevent infection.',
  'Brachycephalic airway syndrome, hip dysplasia, skin allergies, intervertebral disc disease, heat sensitivity',
  'France (descended from English Bulldogs)',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
  '30–31 cm', '30–31 cm', '10–13 kg', '10–13 kg',
  'Short, smooth, single coat', true, true
),
(
  'Cocker Spaniel', 'cocker-spaniel', 'Gundog', 'medium', 3, true,
  'The Cocker Spaniel is a merry, compact gundog with a silky coat and expressive eyes. There are two strains: show (with a more luxurious coat) and working (shorter coat, higher energy). Both are affectionate family dogs that retain their sporting instincts.',
  'Gentle, friendly, intelligent, active, sometimes reserved with strangers',
  '12–15 years',
  'High — 1–2 hours daily. Working Cockers need more. They love scent work, retrieval, and off-lead exercise in secure areas.',
  'High — daily brushing required. The long silky coat mats easily. Professional grooming every 6–8 weeks recommended.',
  'Hip dysplasia, progressive retinal atrophy (PRA), familial nephropathy, ear infections (long pendulous ears trap moisture)',
  'England',
  'https://images.unsplash.com/photo-1606567595334-d39972c85ede?w=800&q=80',
  '39–41 cm', '38–39 cm', '13–16 kg', '12–15 kg',
  'Medium-length, silky, feathered', true, true
),
(
  'Dachshund', 'dachshund', 'Hound', 'small', 4, true,
  'The Dachshund, or "sausage dog," is a long-bodied, short-legged hound originally bred for hunting badgers. They come in three coat types (smooth, wire, long) and two sizes (standard and miniature). Their bold, tenacious personality far exceeds their small size.',
  'Brave, curious, stubborn, loyal, can be vocal',
  '12–16 years',
  'Moderate — 30–60 minutes daily. Two walks plus playtime. Avoid stairs and jumping to protect their long backs.',
  'Low to moderate depending on coat type. Smooth: weekly brushing. Longhaired: daily brushing. Wire: stripping required.',
  'Intervertebral disc disease (IVDD), obesity, dental issues, patellar luxation, eye problems',
  'Germany',
  'https://images.unsplash.com/photo-1612195583950-b004495d1d7a?w=800&q=80',
  '20–27 cm', '20–27 cm', '7.3–15 kg', '7.3–15 kg',
  'Smooth, wire-haired, or long-haired', true, false
),
(
  'German Shepherd', 'german-shepherd', 'Pastoral', 'large', 5, true,
  'The German Shepherd is a versatile working dog known for its intelligence, loyalty, and protective instincts. Widely used in police, military, and assistance roles, they are also devoted family guardians. They need an experienced owner who can provide structure and mental stimulation.',
  'Confident, courageous, intelligent, loyal, aloof with strangers',
  '9–13 years',
  'Very high — 2+ hours daily. They need physical exercise plus mental challenges like obedience, tracking, or agility to prevent boredom.',
  'Moderate — weekly brushing, daily during seasonal shedding (twice yearly "blowouts").',
  'Hip and elbow dysplasia, degenerative myelopathy, bloat, pancreatic insufficiency, allergies',
  'Germany',
  'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&q=80',
  '60–65 cm', '55–60 cm', '30–40 kg', '22–32 kg',
  'Medium-length, dense double coat', true, false
),
(
  'Golden Retriever', 'golden-retriever', 'Gundog', 'large', 6, true,
  'The Golden Retriever is one of the most beloved family dogs worldwide, prized for its gentle temperament and stunning golden coat. Originally developed in Scotland as a gundog, they are now popular as therapy dogs, assistance dogs, and family companions.',
  'Friendly, intelligent, devoted, trustworthy, eager-to-please',
  '10–12 years',
  'High — 1.5–2 hours daily. They love swimming, retrieving, and long walks. Mental stimulation through training is essential.',
  'Moderate to high — weekly brushing, more during shedding seasons. Their water-resistant coat needs regular maintenance.',
  'Hip and elbow dysplasia, certain cancers (higher incidence), heart conditions, skin allergies, cataracts',
  'Scotland',
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&q=80',
  '56–61 cm', '51–56 cm', '30–34 kg', '27–32 kg',
  'Medium-length, water-resistant double coat with feathering', true, true
),
(
  'Poodle', 'poodle', 'Utility', 'medium', 7, true,
  'The Poodle comes in three sizes (Standard, Miniature, Toy) and is renowned for its intelligence, hypoallergenic coat, and elegant appearance. Originally a water retriever from Germany, they excel in obedience and agility. Their non-shedding coat makes them popular with allergy sufferers.',
  'Intelligent, alert, active, proud, trainable',
  '12–15 years',
  'Moderate to high — 1–2 hours daily depending on size. Standard Poodles need more exercise than Toys. They excel at dog sports.',
  'Very high — professional grooming every 4–6 weeks is essential. Daily brushing at home to prevent matting of the dense curly coat.',
  'Hip dysplasia, progressive retinal atrophy (PRA), Addison''s disease, epilepsy, bloat (Standard), patellar luxation (Toy/Miniature)',
  'Germany (standardised in France)',
  'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&q=80',
  '45–60 cm', '45–60 cm', '20–32 kg', '20–32 kg',
  'Dense, curly, non-shedding, hypoallergenic', true, true
),
(
  'Bulldog', 'bulldog', 'Utility', 'medium', 8, true,
  'The British Bulldog is an iconic symbol of Britain, instantly recognisable by its loose, wrinkled skin and pushed-in nose. Despite their fierce historical use in bull-baiting, modern Bulldogs are gentle, patient companions. They are low-energy and well-suited to indoor living.',
  'Docile, friendly, willful, gregarious, gentle with children',
  '8–10 years',
  'Low — 20–30 minutes daily. Short walks in cool weather. They overheat easily and should not be over-exercised.',
  'Low — weekly brushing. Wrinkle folds need daily cleaning. Tail pockets also need regular attention.',
  'Brachycephalic airway syndrome, hip dysplasia, skin infections (wrinkles), cherry eye, breathing difficulties, heat sensitivity',
  'England',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80',
  '31–40 cm', '31–40 cm', '23–25 kg', '18–23 kg',
  'Short, smooth, fine coat', true, true
),
(
  'Beagle', 'beagle', 'Hound', 'medium', 9, true,
  'The Beagle is a small scent hound with an incredible nose and an amiable temperament. Originally bred for hunting hare in packs, they are now popular family pets. Their howl ("bay") is distinctive. They are food-motivated and prone to following their nose into trouble.',
  'Curious, friendly, merry, determined, food-motivated',
  '12–15 years',
  'Moderate to high — 1–1.5 hours daily. They need secure areas for off-lead exercise as they will follow scents. Scent work is ideal mental stimulation.',
  'Low — weekly brushing. Minimal grooming needs. Their short coat is easy to maintain.',
  'Hip dysplasia, epilepsy, hypothyroidism, intervertebral disc disease, ear infections, obesity (very food-motivated)',
  'England',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&q=80',
  '33–41 cm', '33–41 cm', '10–11 kg', '9–10 kg',
  'Short, dense, weather-resistant', true, true
),
(
  'Staffordshire Bull Terrier', 'staffordshire-bull-terrier', 'Terrier', 'medium', 10, true,
  'The Staffordshire Bull Terrier, or "Staffy," is a muscular, stocky terrier known for its affectionate nature toward humans — especially children. Despite their tough appearance, they are often called "nanny dogs" for their patience with kids. They need consistent training and socialisation.',
  'Bold, fearless, loyal, affectionate with family, tenacious',
  '12–14 years',
  'Moderate — 1 hour daily. They are energetic and muscular. Interactive play, tug-of-war, and walks keep them satisfied.',
  'Low — weekly brushing. Minimal shedding. Occasional baths as needed.',
  'Hip dysplasia, elbow dysplasia, cataracts, L-2-hydroxyglutaric aciduria (L2HGA), skin allergies',
  'England (Staffordshire)',
  'https://images.unsplash.com/photo-1605725657590-b2cf0d1a891e?w=800&q=80',
  '36–41 cm', '36–41 cm', '13–17 kg', '11–15 kg',
  'Short, smooth, close coat', true, false
),
(
  'Shih Tzu', 'shih-tzu', 'Toy', 'small', 11, true,
  'The Shih Tzu is an ancient toy breed from Tibet, bred as a companion for Chinese royalty. Their name means "lion dog." They are affectionate, playful, and thrive on human companionship. Their luxurious coat requires significant maintenance unless kept in a puppy cut.',
  'Affectionate, playful, outgoing, loyal, sometimes stubborn',
  '10–16 years',
  'Low — 30 minutes daily. Short walks and indoor play. They are brachycephalic so avoid overexertion in heat.',
  'Very high — daily brushing if coat is kept long. Professional grooming every 4–6 weeks. Many owners opt for a puppy cut.',
  'Brachycephalic airway syndrome, hip dysplasia, eye problems (due to protruding eyes), ear infections, dental disease',
  'Tibet / China',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
  '20–28 cm', '20–28 cm', '4.5–8.5 kg', '4.5–8.5 kg',
  'Long, silky, double coat', true, true
),
(
  'Border Collie', 'border-collie', 'Pastoral', 'medium', 12, true,
  'The Border Collie is widely considered the most intelligent dog breed. Bred for herding sheep on the Scottish borders, they have an intense work drive and incredible problem-solving ability. They need a job to do and are not suited to a sedentary lifestyle.',
  'Intelligent, energetic, responsive, tenacious, work-driven',
  '12–15 years',
  'Very high — 2+ hours daily. They need running, agility, herding, flyball, or intense mental challenges. A bored Border Collie will become destructive.',
  'Moderate — weekly brushing, more during shedding seasons. Their double coat sheds seasonally.',
  'Hip dysplasia, collie eye anomaly (CEA), epilepsy, deafness (in merles), neuronal ceroid lipofuscinosis',
  'Scotland / England border',
  'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&q=80',
  '48–56 cm', '46–53 cm', '14–20 kg', '12–19 kg',
  'Medium-length, dense double coat', true, true
),
(
  'Boxer', 'boxer', 'Working', 'large', 13, true,
  'The Boxer is a medium-to-large working breed from Germany, known for its boundless energy, playful personality, and protective instincts. They are patient with children and make excellent family guardians. Their short coat and expressive face make them instantly recognisable.',
  'Playful, energetic, brave, loyal, patient with children',
  '10–12 years',
  'High — 1.5–2 hours daily. They need vigorous exercise including running, fetch, and play. Mental stimulation through training is important.',
  'Low — weekly brushing. Minimal grooming. Their short coat is easy to maintain.',
  'Hip dysplasia, heart conditions (aortic stenosis, Boxer cardiomyopathy), certain cancers (mast cell tumours, lymphoma), bloat, thyroid issues',
  'Germany',
  'https://images.unsplash.com/photo-1543071220-6ee5bf71a54e?w=800&q=80',
  '57–63 cm', '53–59 cm', '30–32 kg', '25–29 kg',
  'Short, smooth, close-fitting', true, true
),
(
  'Miniature Schnauzer', 'miniature-schnauzer', 'Utility', 'small', 14, true,
  'The Miniature Schnauzer is the smallest of the three Schnauzer breeds, characterised by its distinctive beard and eyebrows. They are alert, spirited companions that make excellent watchdogs. They adapt well to various living situations and are generally healthy.',
  'Friendly, intelligent, alert, spirited, obedient',
  '12–15 years',
  'Moderate — 1 hour daily. Walks and play sessions. They enjoy interactive games and can excel at obedience and agility.',
  'Moderate — weekly brushing, hand-stripping or clipping every 5–8 weeks. Their wiry coat needs professional attention.',
  'Pancreatitis, bladder stones, progressive retinal atrophy (PRA), cataracts, skin disorders, dental disease',
  'Germany',
  'https://images.unsplash.com/photo-1603123853880-a92fafb7809f?w=800&q=80',
  '30–36 cm', '30–36 cm', '5.4–9.1 kg', '5.4–8.2 kg',
  'Wiry, harsh topcoat with soft undercoat', true, true
),
(
  'Chihuahua', 'chihuahua', 'Toy', 'small', 15, true,
  'The Chihuahua is the smallest dog breed in the world, named after the Mexican state of Chihuahua. Despite their tiny size, they have huge personalities and are fiercely loyal to their owners. They come in smooth and long coat varieties and adapt well to apartment living.',
  'Bold, confident, loyal, alert, can be territorial',
  '14–16 years',
  'Low — 20–30 minutes daily. Short walks and indoor play. They tire quickly due to their small size but enjoy bursts of activity.',
  'Low — weekly brushing for smooth coats, more for long coats. Minimal grooming needs.',
  'Patellar luxation, dental disease (crowded teeth), hydrocephalus (apple-head variety), hypoglycaemia, tracheal collapse, heart problems',
  'Mexico',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
  '15–23 cm', '15–23 cm', '1.8–2.7 kg', '1.8–2.7 kg',
  'Smooth or long coat', true, false
)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  group_name = EXCLUDED.group_name,
  size = EXCLUDED.size,
  popularity_rank = EXCLUDED.popularity_rank,
  is_popular = EXCLUDED.is_popular,
  description = EXCLUDED.description,
  temperament = EXCLUDED.temperament,
  lifespan = EXCLUDED.lifespan,
  exercise_needs = EXCLUDED.exercise_needs,
  grooming = EXCLUDED.grooming,
  health_issues = EXCLUDED.health_issues,
  origin = EXCLUDED.origin,
  image_url = EXCLUDED.image_url,
  male_height = EXCLUDED.male_height,
  female_height = EXCLUDED.female_height,
  male_weight = EXCLUDED.male_weight,
  female_weight = EXCLUDED.female_weight,
  coat_type = EXCLUDED.coat_type,
  good_with_children = EXCLUDED.good_with_children,
  good_with_other_dogs = EXCLUDED.good_with_other_dogs;

-- ============================================================================
-- 4. ENSURE ALL BREEDS HAVE A SLUG
-- ============================================================================
UPDATE public.breeds
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- ============================================================================
-- 5. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_breeds_slug ON public.breeds(slug);
CREATE INDEX IF NOT EXISTS idx_breeds_popular ON public.breeds(is_popular, popularity_rank);
