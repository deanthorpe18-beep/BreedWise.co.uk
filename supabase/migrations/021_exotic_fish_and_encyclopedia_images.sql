-- Migration 021: Add exotic fish breeds + full encyclopedia data with images for all non-dog breeds

-- ============================================================================
-- 1. ADD MORE EXOTIC FISH BREEDS
-- ============================================================================
INSERT INTO public.breeds (
  name, slug, animal_type, group_name, size, popularity_rank, is_popular,
  description, temperament, lifespan, exercise_needs, grooming,
  health_issues, origin, image_url,
  male_height, female_height, male_weight, female_weight,
  coat_type, good_with_children, good_with_other_dogs
)
VALUES
(
  'Koi Carp', 'koi-carp', 'fish', 'Carp', 'large', 36, true,
  'The Koi Carp is a colourful, ornamental variety of the common carp that has been bred in Japan for over 200 years. Known for their stunning patterns and long lifespans, they are the centrepiece of many garden ponds worldwide. Koi are intelligent and can be trained to eat from hand.',
  'Peaceful, social, intelligent, hardy, active',
  '25–35 years (some live over 200 years)',
  'Requires large pond — minimum 1,000 litres for a small koi. They need space to swim and explore. Active swimmers that benefit from water features.',
  'High — excellent water filtration essential. Regular water testing and partial water changes. Pond cleaning and filter maintenance weekly.',
  'Koi herpesvirus (KHV), bacterial infections (columnaris), parasites (ich, flukes), swim bladder issues, poor water quality effects',
  'Japan (cultivated from Chinese carp)',
  'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80',
  '60–90 cm', '60–90 cm', '5–10 kg', '5–10 kg',
  'Scales in various colours — white, red, black, yellow, blue', true, true
),
(
  'Arowana', 'arowana', 'fish', 'Bonytongue', 'large', 37, true,
  'The Arowana is a large, predatory freshwater fish known for its elongated body, large scales, and ability to jump out of water to catch prey. They are considered living fossils and are highly prized in Asian cultures as symbols of good luck.',
  'Predatory, solitary, territorial, intelligent, jump-prone',
  '10–15 years',
  'Requires very large tank — minimum 500 litres for juveniles, 1,000+ litres for adults. Strong swimmers that need open swimming space.',
  'Very high — powerful filtration required. Weekly water changes. Tank must be fully covered as they are expert jumpers.',
  'Drop eye syndrome, swim bladder disease, fin rot, parasites, injuries from jumping, stress-related illnesses',
  'South America, Asia, Australia',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  '60–90 cm', '60–90 cm', '3–6 kg', '3–6 kg',
  'Large, metallic scales — silver, gold, red, black', false, false
),
(
  'Oscar', 'oscar', 'fish', 'Cichlid', 'large', 38, true,
  'The Oscar is a large, personable cichlid often called the "dog of the aquarium" due to its interactive behaviour and recognition of owners. They are intelligent, aggressive, and have big personalities in a big body.',
  'Intelligent, territorial, interactive, aggressive, destructive',
  '10–13 years',
  'Requires large tank — minimum 200 litres for one oscar, 400+ litres for a pair. They rearrange tank decor and need sturdy furnishings.',
  'Moderate — good filtration essential due to high waste production. Weekly water changes. They uproot plants and move decorations.',
  'Hole-in-the-head disease, hexamita, fin rot, ich, swim bladder issues, obesity from overfeeding',
  'South America (Amazon basin)',
  'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80',
  '25–35 cm', '25–35 cm', '0.5–1.5 kg', '0.5–1.5 kg',
  'Various colours — tiger, red, albino, blue', false, false
),
(
  'Flowerhorn Cichlid', 'flowerhorn-cichlid', 'fish', 'Cichlid', 'medium', 39, true,
  'The Flowerhorn Cichlid is a man-made hybrid fish famous for its large, colourful nuchal hump (kok) on its head. They are highly interactive and aggressive, forming strong bonds with their owners while being hostile to other fish.',
  'Aggressive, territorial, intelligent, interactive, hardy',
  '10–12 years',
  'Requires spacious tank — minimum 300 litres. They are active swimmers that need room to establish territory.',
  'Moderate — good filtration required. Regular water changes. Tank decorations should be minimal and sturdy.',
  'Hole-in-the-head disease, digestive issues, aggression-related injuries, poor water quality effects',
  'Malaysia / Taiwan (human-made hybrid)',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  '30–40 cm', '30–40 cm', '0.5–1 kg', '0.5–1 kg',
  'Vivid colours with distinctive head hump', false, false
),
(
  'Plecostomus', 'plecostomus', 'fish', 'Catfish', 'medium', 40, true,
  'The Plecostomus, or common pleco, is a popular algae-eating catfish that helps keep aquariums clean. They are nocturnal bottom-dwellers that grow surprisingly large and need substantial tanks as adults.',
  'Peaceful, nocturnal, solitary, hardy, territorial with other plecos',
  '10–15 years',
  'Requires large tank — minimum 200 litres, ideally 400+ litres for adults. They need hiding places and driftwood to rasp on.',
  'Low — algae-eating reduces some maintenance. Supplement with algae wafers and vegetables. Provide driftwood for rasping.',
  'Starvation from inadequate diet, ich, fin rot, constipation from poor diet, poor water quality',
  'South America (Amazon basin)',
  'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80',
  '30–60 cm', '30–60 cm', '0.5–2 kg', '0.5–2 kg',
  'Armoured body with sucker mouth', true, true
),
(
  'Clownfish', 'clownfish', 'fish', 'Damselfish', 'small', 41, true,
  'The Clownfish is a small, brightly coloured marine fish famous from popular films. They form symbiotic relationships with sea anemones and are one of the most recognisable and beginner-friendly saltwater fish.',
  'Peaceful, territorial around anemone, social, hardy, active',
  '6–10 years',
  'Requires marine tank — minimum 100 litres with live rock and anemone or suitable host. Active swimmers that need open water and hiding spots.',
  'Moderate — marine tank maintenance includes regular water testing, protein skimming, and water changes. Stable salinity is critical.',
  'Marine ich (white spot), brooklynella, bacterial infections, anemone sting sensitivity, poor water quality',
  'Indo-Pacific (Great Barrier Reef, Red Sea)',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  '7–11 cm', '7–11 cm', '0.2 kg', '0.2 kg',
  'Bright orange with white stripes', true, true
)
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  animal_type = EXCLUDED.animal_type,
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
-- 2. UPDATE ALL NON-DOG BREEDS WITH FULL ENCYCLOPEDIA DATA AND IMAGES
-- ============================================================================

-- CATS — full data
UPDATE public.breeds SET
  description = 'The Maine Coon is one of the largest domesticated cat breeds, known for its friendly dog-like personality and luxurious long coat. Originating in Maine, USA, they are excellent hunters and gentle giants that get along with everyone.',
  temperament = 'Gentle, friendly, intelligent, playful, dog-like',
  lifespan = '12–15 years',
  exercise_needs = 'Moderate — 30–60 minutes daily. They enjoy interactive play, puzzle toys, and some even like walking on a leash.',
  grooming = 'High — daily brushing required for their long, thick coat. Regular nail trimming and ear cleaning.',
  health_issues = 'Hip dysplasia, hypertrophic cardiomyopathy (HCM), spinal muscular atrophy, polycystic kidney disease (PKD)',
  origin = 'United States (Maine)',
  image_url = 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&q=80',
  male_height = '25–41 cm', female_height = '25–41 cm',
  male_weight = '6–11 kg', female_weight = '4–6 kg',
  coat_type = 'Long, thick, water-resistant double coat',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'maine-coon';

UPDATE public.breeds SET
  description = 'The British Shorthair is a stocky, easygoing cat with a dense coat and round face. One of the oldest English breeds, they are calm, affectionate companions that are happy with their own company.',
  temperament = 'Calm, affectionate, independent, loyal, easygoing',
  lifespan = '12–17 years',
  exercise_needs = 'Low — 20–30 minutes daily. Short play sessions suffice. They are not overly active and prefer observing.',
  grooming = 'Moderate — weekly brushing. Their dense coat sheds seasonally.',
  health_issues = 'Hypertrophic cardiomyopathy (HCM), polycystic kidney disease (PKD), obesity (prone to weight gain)',
  origin = 'United Kingdom (England)',
  image_url = 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80',
  male_height = '30–33 cm', female_height = '30–33 cm',
  male_weight = '5–8 kg', female_weight = '4–6 kg',
  coat_type = 'Short, dense, plush double coat',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'british-shorthair';

UPDATE public.breeds SET
  description = 'The Bengal is a domesticated cat with a wild appearance, featuring a spotted coat reminiscent of a leopard. They are energetic, intelligent, and need plenty of stimulation. Not a cat for the faint-hearted owner.',
  temperament = 'Energetic, intelligent, playful, vocal, demanding',
  lifespan = '12–16 years',
  exercise_needs = 'High — 60+ minutes daily. They need climbing trees, puzzle feeders, and interactive play. Some enjoy water.',
  grooming = 'Low — weekly brushing. Their short, sleek coat is easy to maintain.',
  health_issues = 'Hypertrophic cardiomyopathy (HCM), progressive retinal atrophy (PRA), patellar luxation, obesity',
  origin = 'United States (hybrid of Asian Leopard Cat and domestic cat)',
  image_url = 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&q=80',
  male_height = '20–25 cm', female_height = '20–25 cm',
  male_weight = '4.5–7 kg', female_weight = '3–5 kg',
  coat_type = 'Short, sleek, spotted or marbled',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'bengal';

UPDATE public.breeds SET
  description = 'The Siamese is one of the oldest and most recognisable cat breeds, known for its striking blue eyes, pointed colouration, and vocal personality. They form intense bonds with their owners and demand attention.',
  temperament = 'Vocal, intelligent, affectionate, demanding, social',
  lifespan = '15–20 years',
  exercise_needs = 'High — 45–60 minutes daily. They need interactive play, climbing, and mental stimulation. Boredom leads to destructive behaviour.',
  grooming = 'Low — weekly brushing. Their short coat is easy to maintain.',
  health_issues = 'Progressive retinal atrophy (PRA), amyloidosis, asthma, dental issues, crossed eyes (in some lines)',
  origin = 'Thailand (formerly Siam)',
  image_url = 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&q=80',
  male_height = '20–25 cm', female_height = '20–25 cm',
  male_weight = '4–6 kg', female_weight = '3–4 kg',
  coat_type = 'Short, fine, pointed colouration',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'siamese';

UPDATE public.breeds SET
  description = 'The Ragdoll is a large, affectionate cat known for going limp when picked up. They have striking blue eyes and a semi-long silky coat. They are indoor cats that crave human companionship.',
  temperament = 'Gentle, docile, affectionate, relaxed, loyal',
  lifespan = '12–17 years',
  exercise_needs = 'Low to moderate — 20–30 minutes daily. They enjoy gentle play and following their owners around.',
  grooming = 'Moderate — 2–3 times per week brushing. Their semi-long coat does not mat easily.',
  health_issues = 'Hypertrophic cardiomyopathy (HCM), bladder stones, feline infectious peritonitis (FIP) susceptibility',
  origin = 'United States (California)',
  image_url = 'https://images.unsplash.com/photo-1517331156700-0c3d5f07f25e?w=800&q=80',
  male_height = '23–28 cm', female_height = '23–28 cm',
  male_weight = '5–9 kg', female_weight = '4–6 kg',
  coat_type = 'Semi-long, silky, pointed colouration',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'ragdoll';

UPDATE public.breeds SET
  description = 'The Persian is a long-haired cat with a distinctive flat face and luxurious coat. One of the oldest cat breeds, they are calm, gentle, and prefer a quiet indoor lifestyle with their favourite humans.',
  temperament = 'Calm, gentle, quiet, affectionate, reserved',
  lifespan = '12–17 years',
  exercise_needs = 'Low — 15–20 minutes daily. Short play sessions. They are not active cats and prefer lounging.',
  grooming = 'Very high — daily brushing essential. Regular bathing, eye cleaning, and professional grooming.',
  health_issues = 'Polycystic kidney disease (PKD), brachycephalic breathing issues, tear staining, dental malocclusion',
  origin = 'Persia (modern-day Iran)',
  image_url = 'https://images.unsplash.com/photo-1517331156700-0c3d5f07f25e?w=800&q=80',
  male_height = '25–30 cm', female_height = '25–30 cm',
  male_weight = '3.5–7 kg', female_weight = '3–5 kg',
  coat_type = 'Very long, thick, silky double coat',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'persian';

UPDATE public.breeds SET
  description = 'The Sphynx is a hairless cat breed known for its wrinkled skin and extroverted, affectionate personality. They are surprisingly warm to the touch and crave human body heat, making them excellent lap cats.',
  temperament = 'Extroverted, affectionate, energetic, curious, clownish',
  lifespan = '12–14 years',
  exercise_needs = 'Moderate — 30–45 minutes daily. They are active and playful, enjoying climbing and interactive toys.',
  grooming = 'High — weekly bathing to remove skin oils. Regular ear cleaning and nail trimming.',
  health_issues = 'Hypertrophic cardiomyopathy (HCM), skin infections, sunburn, temperature sensitivity, dental issues',
  origin = 'Canada (Toronto)',
  image_url = 'https://images.unsplash.com/photo-1506755855567-92ff770e8d00?w=800&q=80',
  male_height = '20–25 cm', female_height = '20–25 cm',
  male_weight = '3.5–5.5 kg', female_weight = '3–4 kg',
  coat_type = 'Hairless (fine peach fuzz)',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'sphynx';

UPDATE public.breeds SET
  description = 'The Scottish Fold is recognised by its unique folded ears. They are sweet-natured, adaptable cats that get along well with children and other pets. Their owl-like appearance makes them instantly recognisable.',
  temperament = 'Sweet-natured, adaptable, playful, intelligent, calm',
  lifespan = '11–14 years',
  exercise_needs = 'Moderate — 30–45 minutes daily. They enjoy interactive play and puzzle toys.',
  grooming = 'Moderate — weekly brushing for short coat, 2–3 times per week for long-haired variants.',
  health_issues = 'Osteochondrodysplasia (cartilage/bone disorder), hypertrophic cardiomyopathy (HCM), arthritis',
  origin = 'United Kingdom (Scotland)',
  image_url = 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80',
  male_height = '20–25 cm', female_height = '20–25 cm',
  male_weight = '4–6 kg', female_weight = '3–5 kg',
  coat_type = 'Short or long, dense, soft',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'scottish-fold';

-- BIRDS — full data
UPDATE public.breeds SET
  description = 'The Budgerigar, or budgie, is a small, colourful parrot native to Australia. They are intelligent, social, and can learn to mimic speech and perform tricks. One of the most popular pet birds worldwide.',
  temperament = 'Social, intelligent, playful, vocal, active',
  lifespan = '5–10 years (up to 15 with excellent care)',
  exercise_needs = 'High — minimum 2–3 hours out of cage daily. They need flight space, toys, and interaction.',
  grooming = 'Moderate — regular wing clipping (optional), nail trimming, bathing opportunities. Clean cage daily.',
  health_issues = 'Respiratory infections, mites, obesity, feather plucking (boredom), tumours, egg binding (females)',
  origin = 'Australia',
  image_url = 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',
  male_height = '18–20 cm', female_height = '18–20 cm',
  male_weight = '0.03–0.04 kg', female_weight = '0.03–0.04 kg',
  coat_type = 'Feathers — various colours including blue, green, yellow, white',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'budgerigar';

UPDATE public.breeds SET
  description = 'The African Grey is widely considered the most intelligent parrot species, with remarkable speech mimicry and problem-solving abilities. They form deep bonds with owners but need constant mental stimulation.',
  temperament = 'Intelligent, sensitive, social, vocal, demanding',
  lifespan = '40–60 years',
  exercise_needs = 'Very high — minimum 3–4 hours out of cage daily. They need puzzle toys, training, and social interaction. Boredom causes feather plucking.',
  grooming = 'Moderate — regular nail and beak trimming, bathing, cage cleaning.',
  health_issues = 'Feather plucking, calcium deficiency, respiratory infections, aspergillosis, psittacosis',
  origin = 'Central and West Africa',
  image_url = 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',
  male_height = '33–35 cm', female_height = '33–35 cm',
  male_weight = '0.4–0.6 kg', female_weight = '0.4–0.6 kg',
  coat_type = 'Grey feathers with red tail',
  good_with_children = true, good_with_other_dogs = false
WHERE slug = 'african-grey';

UPDATE public.breeds SET
  description = 'The Cockatiel is a small parrot with a distinctive crest. They are friendly, relatively quiet, and make excellent first birds. Their whistling abilities and gentle nature make them popular family pets.',
  temperament = 'Friendly, gentle, playful, vocal, affectionate',
  lifespan = '15–20 years',
  exercise_needs = 'Moderate — minimum 2 hours out of cage daily. They enjoy flying, exploring, and interacting with owners.',
  grooming = 'Moderate — regular nail trimming, occasional wing clipping, bathing, cage cleaning.',
  health_issues = 'Respiratory infections, fatty liver disease, egg binding (females), night frights',
  origin = 'Australia',
  image_url = 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',
  male_height = '30–33 cm', female_height = '30–33 cm',
  male_weight = '0.08–0.12 kg', female_weight = '0.08–0.12 kg',
  coat_type = 'Grey body with yellow crest, orange cheeks, white wing patches',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'cockatiel';

UPDATE public.breeds SET
  description = 'Macaws are large, colourful parrots known for their impressive size, loud calls, and strong bonds with their owners. They need plenty of space, enrichment, and experienced handling.',
  temperament = 'Intelligent, social, loud, demanding, affectionate',
  lifespan = '50–80 years',
  exercise_needs = 'Very high — minimum 4 hours out of cage daily. They need large flight space, climbing, and constant enrichment.',
  grooming = 'Moderate — regular beak and nail trimming, bathing, large cage cleaning.',
  health_issues = 'Feather plucking, proventricular dilatation disease (PDD), macaw wasting syndrome, respiratory infections',
  origin = 'Central and South America',
  image_url = 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',
  male_height = '80–100 cm', female_height = '80–100 cm',
  male_weight = '1–1.7 kg', female_weight = '1–1.7 kg',
  coat_type = 'Vivid colours — scarlet, blue and gold, green wing, hyacinth',
  good_with_children = true, good_with_other_dogs = false
WHERE slug = 'macaw';

UPDATE public.breeds SET
  description = 'The Canary is a small songbird prized for its beautiful singing. They are relatively low-maintenance and do well in cages, making them ideal for those who want a pet bird without the demanding care of a parrot.',
  temperament = 'Active, vocal, independent, territorial (males sing)',
  lifespan = '10–15 years',
  exercise_needs = 'Moderate — allow flight within cage and short supervised out-of-cage time. They need space to fly horizontally.',
  grooming = 'Low — clean cage regularly, provide bathing water, occasional nail trimming.',
  health_issues = 'Respiratory infections, mites, obesity, egg binding, scaly face mites',
  origin = 'Canary Islands, Madeira, Azores',
  image_url = 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',
  male_height = '12–14 cm', female_height = '12–14 cm',
  male_weight = '0.015–0.02 kg', female_weight = '0.015–0.02 kg',
  coat_type = 'Yellow, red, orange, white, or mixed feathers',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'canary';

UPDATE public.breeds SET
  description = 'Lovebirds are small, colourful parrots known for forming strong pair bonds. They are active, playful, and thrive on social interaction. Despite their small size, they have big personalities.',
  temperament = 'Active, playful, social, territorial, vocal',
  lifespan = '10–15 years',
  exercise_needs = 'High — minimum 2–3 hours out of cage daily. They need flight space, toys, and interaction.',
  grooming = 'Moderate — regular nail trimming, bathing, cage cleaning.',
  health_issues = 'Respiratory infections, feather plucking, egg binding, beak overgrowth',
  origin = 'Africa (various species)',
  image_url = 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&q=80',
  male_height = '13–17 cm', female_height = '13–17 cm',
  male_weight = '0.04–0.06 kg', female_weight = '0.04–0.06 kg',
  coat_type = 'Various colours — peach-faced, masked, Fischer',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'lovebird';

-- FISH — full data (existing + new)
UPDATE public.breeds SET
  description = 'The Neon Tetra is a small, vibrant freshwater fish known for its iridescent blue and red stripes. They are peaceful schooling fish that should be kept in groups of 6 or more for best health and behaviour.',
  temperament = 'Peaceful, schooling, shy, active, timid',
  lifespan = '5–10 years',
  exercise_needs = 'Requires planted tank — minimum 40 litres for a school of 6. They need open swimming space and hiding spots.',
  grooming = 'Moderate — regular water changes, filter maintenance, gravel vacuuming. Sensitive to water parameter changes.',
  health_issues = 'Neon Tetra Disease (NTD — parasite), ich, fin rot, poor water quality sensitivity',
  origin = 'South America (Amazon basin)',
  image_url = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80',
  male_height = '2.5 cm', female_height = '2.5 cm',
  male_weight = '0.001 kg', female_weight = '0.001 kg',
  coat_type = 'Iridescent blue stripe with red tail',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'neon-tetra';

UPDATE public.breeds SET
  description = 'The Goldfish is one of the most popular aquarium fish worldwide. They come in many varieties and can live for decades with proper care. Contrary to popular belief, they need large tanks and excellent filtration.',
  temperament = 'Peaceful, social, active, hardy, friendly',
  lifespan = '10–15 years (some live 20+ years)',
  exercise_needs = 'Requires spacious tank — minimum 75 litres for one fancy goldfish, 150+ litres for common/comet. They are active swimmers.',
  grooming = 'High — excellent filtration essential. Weekly water changes. They produce a lot of waste.',
  health_issues = 'Swim bladder disease, ich, fin rot, dropsy, poor water quality effects, constipation',
  origin = 'China (domesticated from Prussian carp)',
  image_url = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80',
  male_height = '10–30 cm', female_height = '10–30 cm',
  male_weight = '0.1–1 kg', female_weight = '0.1–1 kg',
  coat_type = 'Scales — orange, red, white, black, calico',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'goldfish';

UPDATE public.breeds SET
  description = 'The Betta, or Siamese Fighting Fish, is known for its flowing fins and vivid colours. Males must be kept alone but can thrive in community tanks with peaceful species. They are labyrinth fish that breathe air.',
  temperament = 'Territorial (males), curious, interactive, hardy, solitary',
  lifespan = '2–4 years',
  exercise_needs = 'Requires minimum 20 litres for one betta. They need hiding places and slow water flow. Some enjoy exploring planted tanks.',
  grooming = 'Moderate — regular water changes, filter maintenance. They prefer warm, stable water.',
  health_issues = 'Fin rot, ich, swim bladder disease, velvet, popeye, columnaris',
  origin = 'Thailand (formerly Siam)',
  image_url = 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80',
  male_height = '6–8 cm', female_height = '6–8 cm',
  male_weight = '0.002 kg', female_weight = '0.002 kg',
  coat_type = 'Flowing fins — red, blue, purple, white, multicolour',
  good_with_children = true, good_with_other_dogs = false
WHERE slug = 'betta';

UPDATE public.breeds SET
  description = 'The Angelfish is an elegant freshwater fish with a distinctive triangular shape and long fins. They are relatively easy to care for but can be semi-aggressive, especially when breeding.',
  temperament = 'Semi-aggressive, territorial when breeding, elegant, active',
  lifespan = '8–12 years',
  exercise_needs = 'Requires tall tank — minimum 100 litres. They need vertical swimming space and plants.',
  grooming = 'Moderate — regular water changes, filter maintenance. They prefer warm, soft water.',
  health_issues = 'Ich, fin rot, hole-in-the-head disease, swim bladder issues, aggression injuries',
  origin = 'South America (Amazon basin)',
  image_url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  male_height = '15 cm', female_height = '15 cm',
  male_weight = '0.01 kg', female_weight = '0.01 kg',
  coat_type = 'Long fins with stripes — silver, black, marble, gold',
  good_with_children = true, good_with_other_dogs = false
WHERE slug = 'angelfish';

UPDATE public.breeds SET
  description = 'The Discus is often called the king of aquarium fish due to its stunning colours and round shape. They require pristine water conditions and are best kept by experienced aquarists.',
  temperament = 'Peaceful, shy, social, sensitive, slow-moving',
  lifespan = '10–15 years',
  exercise_needs = 'Requires large tank — minimum 200 litres for a group of 6. They need open swimming space and stable conditions.',
  grooming = 'Very high — pristine water quality essential. Daily water changes recommended. Advanced filtration.',
  health_issues = 'Hole-in-the-head disease, intestinal worms, bacterial infections, stress-related illness, poor water quality',
  origin = 'South America (Amazon basin)',
  image_url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  male_height = '15–20 cm', female_height = '15–20 cm',
  male_weight = '0.15–0.25 kg', female_weight = '0.15–0.25 kg',
  coat_type = 'Round body with vivid colours — red, blue, green, pigeon blood',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'discus';

UPDATE public.breeds SET
  description = 'The Guppy is a popular, colourful livebearer that breeds readily. They are hardy, peaceful, and ideal for beginners. Their endless colour variations make them a favourite in community tanks.',
  temperament = 'Peaceful, active, social, hardy, prolific breeder',
  lifespan = '1–3 years',
  exercise_needs = 'Requires minimum 40 litres. They need plants for fry to hide and open swimming space.',
  grooming = 'Low — regular water changes and filter maintenance. They are tolerant of various conditions.',
  health_issues = 'Ich, fin rot, dropsy, poor water quality, overcrowding stress',
  origin = 'South America (Trinidad and Tobago, Venezuela)',
  image_url = 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80',
  male_height = '2–4 cm', female_height = '2–4 cm',
  male_weight = '0.0005 kg', female_weight = '0.0005 kg',
  coat_type = 'Endless colour variations — tail types include fantail, delta, veil',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'guppy';

UPDATE public.breeds SET
  description = 'The Dojo Loach, or Weather Loach, is an eel-like bottom-dweller known for its sensitivity to barometric pressure changes. Peaceful and active, they are fascinating to watch as they explore the substrate.',
  temperament = 'Peaceful, active, social, hardy, nocturnal',
  lifespan = '7–10 years',
  exercise_needs = 'Requires minimum 100 litres with soft substrate (sand). They need hiding places and space to burrow.',
  grooming = 'Low — regular water changes, filter maintenance. They help clean the substrate.',
  health_issues = 'Ich, bacterial infections, injuries from rough substrate, poor water quality',
  origin = 'East Asia (China, Korea, Japan)',
  image_url = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80',
  male_height = '15–30 cm', female_height = '15–30 cm',
  male_weight = '0.05–0.1 kg', female_weight = '0.05–0.1 kg',
  coat_type = 'Eel-like body with small scales — olive, gold, pink (albino)',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'dojo-loach';

-- New exotic fish
UPDATE public.breeds SET
  description = 'The Koi Carp is a colourful, ornamental variety of the common carp that has been bred in Japan for over 200 years. Known for their stunning patterns and long lifespans, they are the centrepiece of many garden ponds worldwide.',
  temperament = 'Peaceful, social, intelligent, hardy, active',
  lifespan = '25–35 years',
  exercise_needs = 'Requires large pond — minimum 1,000 litres. Active swimmers that benefit from water features.',
  grooming = 'High — excellent water filtration essential. Regular water testing and partial water changes.',
  health_issues = 'Koi herpesvirus, bacterial infections, parasites, swim bladder issues, poor water quality',
  origin = 'Japan',
  image_url = 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80',
  male_height = '60–90 cm', female_height = '60–90 cm',
  male_weight = '5–10 kg', female_weight = '5–10 kg',
  coat_type = 'Scales in various colours — white, red, black, yellow, blue',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'koi-carp';

UPDATE public.breeds SET
  description = 'The Arowana is a large, predatory freshwater fish known for its elongated body and ability to jump out of water. Considered living fossils and symbols of good luck in Asian cultures.',
  temperament = 'Predatory, solitary, territorial, intelligent, jump-prone',
  lifespan = '10–15 years',
  exercise_needs = 'Requires very large tank — minimum 500 litres. Strong swimmers needing open space.',
  grooming = 'Very high — powerful filtration. Weekly water changes. Tank must be fully covered.',
  health_issues = 'Drop eye syndrome, swim bladder disease, fin rot, parasites, jumping injuries',
  origin = 'South America, Asia, Australia',
  image_url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  male_height = '60–90 cm', female_height = '60–90 cm',
  male_weight = '3–6 kg', female_weight = '3–6 kg',
  coat_type = 'Large metallic scales — silver, gold, red, black',
  good_with_children = false, good_with_other_dogs = false
WHERE slug = 'arowana';

UPDATE public.breeds SET
  description = 'The Oscar is a large, personable cichlid often called the "dog of the aquarium" due to its interactive behaviour. They are intelligent, aggressive, and have big personalities.',
  temperament = 'Intelligent, territorial, interactive, aggressive, destructive',
  lifespan = '10–13 years',
  exercise_needs = 'Requires large tank — minimum 200 litres. They rearrange tank decor.',
  grooming = 'Moderate — good filtration essential. Weekly water changes. They uproot plants.',
  health_issues = 'Hole-in-the-head disease, hexamita, fin rot, ich, swim bladder issues, obesity',
  origin = 'South America (Amazon basin)',
  image_url = 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80',
  male_height = '25–35 cm', female_height = '25–35 cm',
  male_weight = '0.5–1.5 kg', female_weight = '0.5–1.5 kg',
  coat_type = 'Various colours — tiger, red, albino, blue',
  good_with_children = false, good_with_other_dogs = false
WHERE slug = 'oscar';

UPDATE public.breeds SET
  description = 'The Flowerhorn Cichlid is a man-made hybrid famous for its large, colourful nuchal hump. Highly interactive and aggressive, they form strong bonds with owners while being hostile to other fish.',
  temperament = 'Aggressive, territorial, intelligent, interactive, hardy',
  lifespan = '10–12 years',
  exercise_needs = 'Requires spacious tank — minimum 300 litres. Active swimmers needing territory space.',
  grooming = 'Moderate — good filtration. Regular water changes. Minimal sturdy decorations.',
  health_issues = 'Hole-in-the-head disease, digestive issues, aggression injuries, poor water quality',
  origin = 'Malaysia / Taiwan (human-made hybrid)',
  image_url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  male_height = '30–40 cm', female_height = '30–40 cm',
  male_weight = '0.5–1 kg', female_weight = '0.5–1 kg',
  coat_type = 'Vivid colours with distinctive head hump',
  good_with_children = false, good_with_other_dogs = false
WHERE slug = 'flowerhorn-cichlid';

UPDATE public.breeds SET
  description = 'The Plecostomus is a popular algae-eating catfish that helps keep aquariums clean. Nocturnal bottom-dwellers that grow surprisingly large and need substantial tanks as adults.',
  temperament = 'Peaceful, nocturnal, solitary, hardy, territorial with other plecos',
  lifespan = '10–15 years',
  exercise_needs = 'Requires large tank — minimum 200 litres. They need hiding places and driftwood.',
  grooming = 'Low — algae-eating reduces maintenance. Supplement with algae wafers and vegetables.',
  health_issues = 'Starvation, ich, fin rot, constipation, poor water quality',
  origin = 'South America (Amazon basin)',
  image_url = 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80',
  male_height = '30–60 cm', female_height = '30–60 cm',
  male_weight = '0.5–2 kg', female_weight = '0.5–2 kg',
  coat_type = 'Armoured body with sucker mouth',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'plecostomus';

UPDATE public.breeds SET
  description = 'The Clownfish is a small, brightly coloured marine fish famous from popular films. They form symbiotic relationships with sea anemones and are beginner-friendly saltwater fish.',
  temperament = 'Peaceful, territorial around anemone, social, hardy, active',
  lifespan = '6–10 years',
  exercise_needs = 'Requires marine tank — minimum 100 litres with live rock and anemone.',
  grooming = 'Moderate — marine tank maintenance includes regular water testing and water changes.',
  health_issues = 'Marine ich, brooklynella, bacterial infections, anemone sting sensitivity',
  origin = 'Indo-Pacific',
  image_url = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  male_height = '7–11 cm', female_height = '7–11 cm',
  male_weight = '0.2 kg', female_weight = '0.2 kg',
  coat_type = 'Bright orange with white stripes',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'clownfish';

-- REPTILES — full data
UPDATE public.breeds SET
  description = 'The Bearded Dragon is a friendly, docile lizard native to Australia. They are one of the most popular pet reptiles due to their calm temperament and willingness to be handled.',
  temperament = 'Docile, friendly, curious, tolerant, interactive',
  lifespan = '10–15 years',
  exercise_needs = 'Requires minimum 120 cm vivarium. They need climbing branches, basking spots, and supervised out-of-enclosure time.',
  grooming = 'Moderate — regular enclosure cleaning, UVB lighting replacement, nail trimming, occasional bathing.',
  health_issues = 'Metabolic bone disease (MBD), impaction, respiratory infections, parasites, mouth rot',
  origin = 'Australia',
  image_url = 'https://images.unsplash.com/photo-1504450874802-0ed58ffa9b64?w=800&q=80',
  male_height = '40–60 cm', female_height = '40–60 cm',
  male_weight = '0.4–0.6 kg', female_weight = '0.4–0.6 kg',
  coat_type = 'Spiny scales with beard — tan, red, orange, yellow, leatherback (smooth)',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'bearded-dragon';

UPDATE public.breeds SET
  description = 'The Leopard Gecko is a small, ground-dwelling lizard known for its spotted pattern and easy care requirements. Ideal for first-time reptile keepers.',
  temperament = 'Docile, shy, nocturnal, hardy, easygoing',
  lifespan = '10–20 years',
  exercise_needs = 'Requires minimum 60 cm vivarium. They need hiding spots, a warm hide, and a moist hide for shedding.',
  grooming = 'Low — regular enclosure cleaning, substrate spot-cleaning, occasional bathing during shed.',
  health_issues = 'Metabolic bone disease, impaction, shedding issues, parasites, mouth rot',
  origin = 'Pakistan, Afghanistan, Iran, India',
  image_url = 'https://images.unsplash.com/photo-1504450874802-0ed58ffa9b64?w=800&q=80',
  male_height = '20–25 cm', female_height = '20–25 cm',
  male_weight = '0.05–0.08 kg', female_weight = '0.05–0.08 kg',
  coat_type = 'Bumpy skin with spots — normal, high yellow, tangerine, albino',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'leopard-gecko';

UPDATE public.breeds SET
  description = 'The Ball Python is a docile, relatively small snake that curls into a ball when stressed. They are the most popular pet snake due to their gentle nature and manageable size.',
  temperament = 'Docile, shy, nocturnal, hardy, tolerant',
  lifespan = '20–30 years',
  exercise_needs = 'Requires minimum 90 cm vivarium. They need hiding spots, a water bowl large enough to soak, and climbing branches.',
  grooming = 'Low — regular enclosure cleaning, humidity monitoring, shedding assistance if needed.',
  health_issues = 'Respiratory infections, mites, scale rot, mouth rot, inclusion body disease (IBD)',
  origin = 'West and Central Africa',
  image_url = 'https://images.unsplash.com/photo-1531386816498-118b97284d01?w=800&q=80',
  male_height = '90–120 cm', female_height = '90–120 cm',
  male_weight = '1–1.5 kg', female_weight = '1–1.5 kg',
  coat_type = 'Smooth scales — normal, pastel, albino, piebald, clown (morphs)',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'ball-python';

UPDATE public.breeds SET
  description = 'The Crested Gecko is an arboreal lizard with distinctive eyelash-like crests. Easy to care for and eats a specialised fruit diet, making them ideal for beginners.',
  temperament = 'Docile, shy, nocturnal, jumpy, hardy',
  lifespan = '15–20 years',
  exercise_needs = 'Requires tall vivarium — minimum 45x45x60 cm. They need vertical climbing space, plants, and hiding spots.',
  grooming = 'Low — regular enclosure cleaning, misting for humidity, feeding every 2–3 days.',
  health_issues = 'Metabolic bone disease, floppy tail syndrome, shedding issues, calcium deficiency',
  origin = 'New Caledonia',
  image_url = 'https://images.unsplash.com/photo-1504450874802-0ed58ffa9b64?w=800&q=80',
  male_height = '15–20 cm', female_height = '15–20 cm',
  male_weight = '0.03–0.05 kg', female_weight = '0.03–0.05 kg',
  coat_type = 'Bumpy skin with crests — various colours and patterns',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'crested-gecko';

UPDATE public.breeds SET
  description = 'The Corn Snake is a colourful, docile snake native to North America. Active, curious, and excellent for beginners. They come in a huge variety of colour morphs.',
  temperament = 'Docile, active, curious, hardy, tolerant',
  lifespan = '15–20 years',
  exercise_needs = 'Requires minimum 120 cm vivarium. They need hiding spots, climbing branches, and a water bowl for soaking.',
  grooming = 'Low — regular enclosure cleaning, humidity monitoring, shedding assistance if needed.',
  health_issues = 'Respiratory infections, mites, scale rot, mouth rot, egg binding (females)',
  origin = 'United States (southeast)',
  image_url = 'https://images.unsplash.com/photo-1531386816498-118b97284d01?w=800&q=80',
  male_height = '120–180 cm', female_height = '120–180 cm',
  male_weight = '0.3–0.9 kg', female_weight = '0.3–0.9 kg',
  coat_type = 'Smooth scales — normal, amelanistic, snow, lavender, anery (morphs)',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'corn-snake';

-- SMALL PETS — full data
UPDATE public.breeds SET
  description = 'Rabbits are social, intelligent small pets that can be litter-trained and form strong bonds with their owners. They need plenty of space to hop and should ideally be kept in pairs.',
  temperament = 'Social, intelligent, gentle, curious, timid',
  lifespan = '8–12 years',
  exercise_needs = 'Very high — minimum 3 hours out of enclosure daily. They need a large run or room to explore.',
  grooming = 'Moderate — weekly brushing, regular nail trimming, ear cleaning. Long-haired breeds need daily brushing.',
  health_issues = 'GI stasis, dental malocclusion, respiratory infections, mites, flystrike',
  origin = 'Europe (domesticated from wild European rabbit)',
  image_url = 'https://images.unsplash.com/photo-1585110396063-7a1a12c27714?w=800&q=80',
  male_height = '20–40 cm', female_height = '20–40 cm',
  male_weight = '1–2.5 kg', female_weight = '1–2.5 kg',
  coat_type = 'Short, long, or rex — various colours',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'rabbit';

UPDATE public.breeds SET
  description = 'Guinea Pigs are gentle, vocal rodents that thrive in pairs or groups. They require vitamin C in their diet and enjoy human interaction. Their wheeking sounds are endearing.',
  temperament = 'Gentle, vocal, social, timid, friendly',
  lifespan = '4–8 years',
  exercise_needs = 'Moderate — minimum 1 hour out of enclosure daily. They need a large cage and floor time to explore.',
  grooming = 'Moderate — weekly brushing, nail trimming, ear cleaning. Long-haired breeds need daily brushing.',
  health_issues = 'Vitamin C deficiency (scurvy), respiratory infections, mites, bumblefoot, dental issues',
  origin = 'South America (Andes)',
  image_url = 'https://images.unsplash.com/photo-1585110396063-7a1a12c27714?w=800&q=80',
  male_height = '20–25 cm', female_height = '20–25 cm',
  male_weight = '0.7–1.2 kg', female_weight = '0.7–1.2 kg',
  coat_type = 'Short, long, rosette, or rex — various colours',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'guinea-pig';

UPDATE public.breeds SET
  description = 'Hamsters are nocturnal rodents that are popular pets due to their small size. They need a large cage with enrichment. Unlike guinea pigs, they are solitary and must be housed alone.',
  temperament = 'Nocturnal, solitary, active, territorial, timid',
  lifespan = '2–3 years',
  exercise_needs = 'Moderate — need a large cage with a running wheel (minimum 28 cm diameter). They are active at night.',
  grooming = 'Low — spot-clean cage daily, full clean weekly. They self-groom.',
  health_issues = 'Wet tail (diarrhoea), respiratory infections, diabetes (in dwarf hamsters), tumours',
  origin = 'Syria (Syrian hamster) / various (dwarf species)',
  image_url = 'https://images.unsplash.com/photo-1425082661707-3f5cb3e5e990?w=800&q=80',
  male_height = '5–18 cm', female_height = '5–18 cm',
  male_weight = '0.025–0.2 kg', female_weight = '0.025–0.2 kg',
  coat_type = 'Short or long — golden, white, black, grey, cream',
  good_with_children = true, good_with_other_dogs = false
WHERE slug = 'hamster';

UPDATE public.breeds SET
  description = 'Ferrets are playful, intelligent mustelids known for their curiosity and energy. They are social animals that need several hours of playtime daily and should be kept in pairs or groups.',
  temperament = 'Playful, curious, intelligent, mischievous, social',
  lifespan = '5–10 years',
  exercise_needs = 'Very high — minimum 3–4 hours out of enclosure daily. They need a ferret-proofed room to explore.',
  grooming = 'Moderate — regular nail trimming, ear cleaning, occasional bathing. Descented in some countries.',
  health_issues = 'Adrenal disease, insulinoma (pancreatic cancer), lymphoma, dental issues, blockages from eating foreign objects',
  origin = 'Europe (domesticated from European polecat)',
  image_url = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80',
  male_height = '40–50 cm', female_height = '40–50 cm',
  male_weight = '1–2 kg', female_weight = '0.5–1 kg',
  coat_type = 'Short, dense — sable, albino, cinnamon, silver',
  good_with_children = true, good_with_other_dogs = true
WHERE slug = 'ferret';

UPDATE public.breeds SET
  description = 'Chinchillas are soft-furred rodents native to the Andes. They are active, social, and need dust baths to keep their dense coat healthy. Not ideal for young children due to their fragility.',
  temperament = 'Active, social, timid, clean, nocturnal',
  lifespan = '10–20 years',
  exercise_needs = 'High — need a tall multi-level cage and supervised out-of-cage time in a chinchilla-safe room.',
  grooming = 'Moderate — dust baths 2–3 times per week, regular cage cleaning. Do not bathe with water.',
  health_issues = 'Dental malocclusion, heat stroke (very sensitive to heat), fur slip, respiratory infections, bumblefoot',
  origin = 'South America (Andes mountains)',
  image_url = 'https://images.unsplash.com/photo-1425082661707-3f5cb3e5e990?w=800&q=80',
  male_height = '25–35 cm', female_height = '25–35 cm',
  male_weight = '0.4–0.7 kg', female_weight = '0.4–0.7 kg',
  coat_type = 'Extremely dense, soft fur — grey, white, black, beige',
  good_with_children = false, good_with_other_dogs = true
WHERE slug = 'chinchilla';
