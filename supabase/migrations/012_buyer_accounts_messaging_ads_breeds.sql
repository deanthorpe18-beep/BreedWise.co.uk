-- Migration 012: Buyer Accounts, Messaging, Ads, Breeds, API Cache, Breeder Analytics
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. FULL UK BREEDS LOOKUP TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.breeds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  group_name text,
  size text CHECK (size IN ('small', 'medium', 'large', 'giant')),
  popularity_rank integer,
  is_popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Seed comprehensive UK breed list
INSERT INTO public.breeds (name, group_name, size, is_popular) VALUES
  ('Labrador Retriever', 'Gundog', 'large', true),
  ('French Bulldog', 'Utility', 'small', true),
  ('Cocker Spaniel', 'Gundog', 'medium', true),
  ('Dachshund', 'Hound', 'small', true),
  ('German Shepherd', 'Pastoral', 'large', true),
  ('Golden Retriever', 'Gundog', 'large', true),
  ('Poodle', 'Utility', 'medium', true),
  ('Bulldog', 'Utility', 'medium', true),
  ('Beagle', 'Hound', 'medium', true),
  ('Miniature Schnauzer', 'Utility', 'small', true),
  ('Cockapoo', 'Crossbreed', 'small', true),
  ('Border Collie', 'Pastoral', 'medium', true),
  ('Shih Tzu', 'Toy', 'small', true),
  ('Chihuahua', 'Toy', 'small', true),
  ('Pomeranian', 'Toy', 'small', true),
  ('Yorkshire Terrier', 'Toy', 'small', true),
  ('Boxer', 'Working', 'large', true),
  ('Rottweiler', 'Working', 'large', true),
  ('Dobermann', 'Working', 'large', true),
  ('Great Dane', 'Working', 'giant', true),
  ('Siberian Husky', 'Working', 'medium', true),
  ('Alaskan Malamute', 'Working', 'large', false),
  ('Samoyed', 'Working', 'large', false),
  ('Akita', 'Working', 'large', false),
  ('Chow Chow', 'Utility', 'medium', false),
  ('Shar Pei', 'Utility', 'medium', false),
  ('Basset Hound', 'Hound', 'medium', false),
  ('Bloodhound', 'Hound', 'large', false),
  ('Greyhound', 'Hound', 'large', false),
  ('Whippet', 'Hound', 'medium', false),
  ('Italian Greyhound', 'Toy', 'small', false),
  ('Saluki', 'Hound', 'large', false),
  ('Afghan Hound', 'Hound', 'large', false),
  ('Irish Wolfhound', 'Hound', 'giant', false),
  ('Scottish Deerhound', 'Hound', 'giant', false),
  ('Border Terrier', 'Terrier', 'small', false),
  ('Staffordshire Bull Terrier', 'Terrier', 'medium', true),
  ('Jack Russell Terrier', 'Terrier', 'small', true),
  ('West Highland White Terrier', 'Terrier', 'small', false),
  ('Cairn Terrier', 'Terrier', 'small', false),
  ('Scottish Terrier', 'Terrier', 'small', false),
  ('Welsh Terrier', 'Terrier', 'medium', false),
  ('Airedale Terrier', 'Terrier', 'large', false),
  ('Bedlington Terrier', 'Terrier', 'small', false),
  ('Bull Terrier', 'Terrier', 'medium', false),
  ('Fox Terrier', 'Terrier', 'small', false),
  ('Kerry Blue Terrier', 'Terrier', 'medium', false),
  ('Lakeland Terrier', 'Terrier', 'small', false),
  ('Manchester Terrier', 'Terrier', 'small', false),
  ('Norfolk Terrier', 'Terrier', 'small', false),
  ('Norwich Terrier', 'Terrier', 'small', false),
  ('Parson Russell Terrier', 'Terrier', 'small', false),
  ('Sealyham Terrier', 'Terrier', 'small', false),
  ('Skye Terrier', 'Terrier', 'small', false),
  ('Soft Coated Wheaten Terrier', 'Terrier', 'medium', false),
  (' Welsh Springer Spaniel', 'Gundog', 'medium', false),
  ('English Springer Spaniel', 'Gundog', 'medium', false),
  ('Cocker Spaniel (American)', 'Gundog', 'medium', false),
  ('English Cocker Spaniel', 'Gundog', 'medium', false),
  ('Field Spaniel', 'Gundog', 'medium', false),
  ('Clumber Spaniel', 'Gundog', 'large', false),
  ('Sussex Spaniel', 'Gundog', 'medium', false),
  ('Irish Water Spaniel', 'Gundog', 'large', false),
  ('Boykin Spaniel', 'Gundog', 'medium', false),
  ('Brittany', 'Gundog', 'medium', false),
  ('Pointer', 'Gundog', 'large', false),
  ('German Shorthaired Pointer', 'Gundog', 'large', false),
  ('German Wirehaired Pointer', 'Gundog', 'large', false),
  ('Weimaraner', 'Gundog', 'large', false),
  ('Vizsla', 'Gundog', 'large', false),
  ('Wirehaired Vizsla', 'Gundog', 'large', false),
  ('Lagotto Romagnolo', 'Gundog', 'medium', false),
  ('Barbet', 'Gundog', 'medium', false),
  ('Spinone Italiano', 'Gundog', 'large', false),
  ('Bracco Italiano', 'Gundog', 'large', false),
  ('Portuguese Pointer', 'Gundog', 'medium', false),
  ('Setter (Irish)', 'Gundog', 'large', false),
  ('Setter (English)', 'Gundog', 'large', false),
  ('Setter (Gordon)', 'Gundog', 'large', false),
  ('Setter (Irish Red and White)', 'Gundog', 'large', false),
  ('Nova Scotia Duck Tolling Retriever', 'Gundog', 'medium', false),
  ('Flat-Coated Retriever', 'Gundog', 'large', false),
  ('Curly-Coated Retriever', 'Gundog', 'large', false),
  ('Chesapeake Bay Retriever', 'Gundog', 'large', false),
  ('Toller', 'Gundog', 'medium', false),
  ('Bernese Mountain Dog', 'Working', 'giant', false),
  ('Greater Swiss Mountain Dog', 'Working', 'giant', false),
  ('Entlebucher Mountain Dog', 'Working', 'medium', false),
  ('Appenzeller Sennenhund', 'Working', 'medium', false),
  ('Saint Bernard', 'Working', 'giant', false),
  ('Newfoundland', 'Working', 'giant', false),
  ('Leonberger', 'Working', 'giant', false),
  ('Tibetan Mastiff', 'Working', 'giant', false),
  ('Pyrenean Mastiff', 'Working', 'giant', false),
  ('Spanish Mastiff', 'Working', 'giant', false),
  ('Anatolian Shepherd', 'Pastoral', 'giant', false),
  ('Kangal', 'Pastoral', 'giant', false),
  ('Caucasian Shepherd', 'Working', 'giant', false),
  ('Central Asian Shepherd', 'Working', 'giant', false),
  ('Maremma Sheepdog', 'Pastoral', 'large', false),
  ('Great Pyrenees', 'Pastoral', 'giant', false),
  ('Kuvasz', 'Working', 'giant', false),
  ('Komondor', 'Working', 'large', false),
  ('Puli', 'Pastoral', 'medium', false),
  ('Pumi', 'Pastoral', 'small', false),
  ('Mudi', 'Pastoral', 'medium', false),
  ('Bergamasco Shepherd', 'Pastoral', 'large', false),
  ('Briard', 'Pastoral', 'large', false),
  ('Beauceron', 'Pastoral', 'large', false),
  ('Bouvier des Flandres', 'Pastoral', 'large', false),
  ('Dutch Shepherd', 'Pastoral', 'large', false),
  ('Belgian Malinois', 'Pastoral', 'large', false),
  ('Belgian Shepherd', 'Pastoral', 'large', false),
  ('Belgian Tervuren', 'Pastoral', 'large', false),
  ('Belgian Laekenois', 'Pastoral', 'large', false),
  ('Collie (Rough)', 'Pastoral', 'large', false),
  ('Collie (Smooth)', 'Pastoral', 'large', false),
  ('Shetland Sheepdog', 'Pastoral', 'small', false),
  ('Welsh Corgi (Pembroke)', 'Pastoral', 'small', true),
  ('Welsh Corgi (Cardigan)', 'Pastoral', 'small', false),
  ('Australian Shepherd', 'Pastoral', 'medium', true),
  ('Miniature American Shepherd', 'Pastoral', 'small', false),
  ('English Shepherd', 'Pastoral', 'medium', false),
  ('Old English Sheepdog', 'Pastoral', 'large', false),
  ('Bearded Collie', 'Pastoral', 'medium', false),
  ('Polish Lowland Sheepdog', 'Pastoral', 'medium', false),
  ('Puli', 'Pastoral', 'medium', false),
  ('Pumi', 'Pastoral', 'small', false),
  ('Mudi', 'Pastoral', 'medium', false),
  ('Schapendoes', 'Pastoral', 'medium', false),
  ('Swedish Vallhund', 'Pastoral', 'small', false),
  ('Norwegian Buhund', 'Pastoral', 'medium', false),
  ('Icelandic Sheepdog', 'Pastoral', 'medium', false),
  ('Finnish Lapphund', 'Pastoral', 'medium', false),
  ('Swedish Lapphund', 'Pastoral', 'medium', false),
  ('Lapponian Herder', 'Pastoral', 'medium', false),
  ('Norwegian Elkhound', 'Hound', 'medium', false),
  ('Swedish Elkhound', 'Hound', 'medium', false),
  ('Finnish Spitz', 'Hound', 'medium', false),
  ('Karelian Bear Dog', 'Hound', 'medium', false),
  ('Russo-European Laika', 'Hound', 'medium', false),
  ('West Siberian Laika', 'Hound', 'medium', false),
  ('East Siberian Laika', 'Hound', 'medium', false),
  ('Jamthund', 'Hound', 'large', false),
  ('Norwegian Lundehund', 'Hound', 'small', false),
  ('Drever', 'Hound', 'small', false),
  ('Hamiltonstovare', 'Hound', 'medium', false),
  ('Schillerstovare', 'Hound', 'medium', false),
  ('Smalandstovare', 'Hound', 'small', false),
  ('Dachshund (Miniature)', 'Hound', 'small', false),
  ('Dachshund (Standard)', 'Hound', 'small', false),
  ('Dachshund (Wirehaired)', 'Hound', 'small', false),
  ('Dachshund (Longhaired)', 'Hound', 'small', false),
  ('Basset Hound', 'Hound', 'medium', false),
  ('Grand Basset Griffon Vendeen', 'Hound', 'medium', false),
  ('Petit Basset Griffon Vendeen', 'Hound', 'small', false),
  ('Pharaoh Hound', 'Hound', 'medium', false),
  ('Ibizan Hound', 'Hound', 'medium', false),
  ('Podenco Canario', 'Hound', 'medium', false),
  ('Portuguese Podengo', 'Hound', 'small', false),
  ('Cirneco dell Etna', 'Hound', 'small', false),
  ('Basenji', 'Hound', 'small', false),
  ('Rhodesian Ridgeback', 'Hound', 'large', false),
  ('Thai Ridgeback', 'Hound', 'medium', false),
  ('Plott Hound', 'Hound', 'large', false),
  ('Treeing Walker Coonhound', 'Hound', 'large', false),
  ('Black and Tan Coonhound', 'Hound', 'large', false),
  ('Redbone Coonhound', 'Hound', 'large', false),
  ('Bluetick Coonhound', 'Hound', 'large', false),
  ('English Foxhound', 'Hound', 'large', false),
  ('American Foxhound', 'Hound', 'large', false),
  ('Harrier', 'Hound', 'medium', false),
  ('Otterhound', 'Hound', 'large', false),
  ('Grand Bleu de Gascogne', 'Hound', 'large', false),
  ('Bavarian Mountain Hound', 'Hound', 'medium', false),
  ('Hanoverian Scenthound', 'Hound', 'large', false),
  ('Dogo Argentino', 'Working', 'large', false),
  ('Fila Brasileiro', 'Working', 'giant', false),
  ('Presa Canario', 'Working', 'large', false),
  ('Perro de Presa Mallorquin', 'Working', 'medium', false),
  ('Cane Corso', 'Working', 'large', true),
  ('Neapolitan Mastiff', 'Working', 'giant', false),
  ('Bullmastiff', 'Working', 'large', false),
  ('Dogue de Bordeaux', 'Working', 'large', false),
  ('Tosa Inu', 'Working', 'giant', false),
  ('Boerboel', 'Working', 'giant', false),
  ('Borzoi', 'Hound', 'giant', false),
  ('Irish Setter', 'Gundog', 'large', false),
  ('English Setter', 'Gundog', 'large', false),
  ('Gordon Setter', 'Gundog', 'large', false),
  ('Irish Red and White Setter', 'Gundog', 'large', false),
  ('Red Setter', 'Gundog', 'large', false),
  ('Havanese', 'Toy', 'small', false),
  ('Bichon Frise', 'Toy', 'small', true),
  ('Coton de Tulear', 'Toy', 'small', false),
  ('Maltese', 'Toy', 'small', false),
  ('Bolognese', 'Toy', 'small', false),
  ('Löwchen', 'Toy', 'small', false),
  ('Russian Tsvetnaya Bolonka', 'Toy', 'small', false),
  ('Japanese Chin', 'Toy', 'small', false),
  ('Pekingese', 'Toy', 'small', false),
  ('Shih Tzu', 'Toy', 'small', true),
  ('Lhasa Apso', 'Utility', 'small', false),
  ('Tibetan Spaniel', 'Utility', 'small', false),
  ('Tibetan Terrier', 'Utility', 'medium', false),
  ('Chinese Crested', 'Toy', 'small', false),
  ('Xoloitzcuintli', 'Toy', 'small', false),
  ('Peruvian Inca Orchid', 'Hound', 'small', false),
  ('American Hairless Terrier', 'Terrier', 'small', false),
  ('Hairless Khala', 'Utility', 'small', false),
  ('Affenpinscher', 'Toy', 'small', false),
  ('Brussels Griffon', 'Toy', 'small', false),
  ('Miniature Pinscher', 'Toy', 'small', false),
  ('Toy Manchester Terrier', 'Toy', 'small', false),
  ('English Toy Spaniel', 'Toy', 'small', false),
  ('Italian Greyhound', 'Toy', 'small', false),
  ('Papillon', 'Toy', 'small', false),
  ('Phalène', 'Toy', 'small', false),
  ('Poodle (Toy)', 'Toy', 'small', false),
  ('Poodle (Miniature)', 'Utility', 'small', false),
  ('Poodle (Standard)', 'Utility', 'large', false),
  ('Schnauzer (Miniature)', 'Utility', 'small', false),
  ('Schnauzer (Standard)', 'Utility', 'medium', false),
  ('Schnauzer (Giant)', 'Working', 'large', false),
  ('Keeshond', 'Utility', 'medium', false),
  ('Samoyed', 'Working', 'large', false),
  ('American Eskimo Dog', 'Utility', 'small', false),
  ('Finnish Spitz', 'Utility', 'medium', false),
  ('Norwegian Elkhound', 'Hound', 'medium', false),
  ('Swedish Vallhund', 'Pastoral', 'small', false),
  ('Lancashire Heeler', 'Pastoral', 'small', false),
  ('Australian Cattle Dog', 'Pastoral', 'medium', false),
  ('Australian Kelpie', 'Pastoral', 'medium', false),
  ('Australian Stumpy Tail Cattle Dog', 'Pastoral', 'medium', false),
  ('Koolie', 'Pastoral', 'medium', false),
  ('Smithfield', 'Pastoral', 'medium', false),
  ('Stumpy Tail Cattle Dog', 'Pastoral', 'medium', false),
  ('Catahoula Leopard Dog', 'Pastoral', 'large', false),
  ('Carolina Dog', 'Utility', 'medium', false),
  ('Native American Indian Dog', 'Utility', 'large', false),
  ('Tamaskan', 'Utility', 'large', false),
  ('Northern Inuit Dog', 'Utility', 'large', false),
  ('Utonagan', 'Utility', 'large', false),
  ('Czechoslovakian Wolfdog', 'Working', 'large', false),
  ('Saarloos Wolfdog', 'Working', 'large', false),
  ('Wolfdog', 'Working', 'large', false),
  ('Jackapoo', 'Crossbreed', 'small', false),
  ('Cavapoo', 'Crossbreed', 'small', true),
  ('Maltipoo', 'Crossbreed', 'small', false),
  ('Labradoodle', 'Crossbreed', 'medium', true),
  ('Goldendoodle', 'Crossbreed', 'medium', true),
  ('Springerdoodle', 'Crossbreed', 'medium', false),
  ('Bernedoodle', 'Crossbreed', 'large', false),
  ('Sheepadoodle', 'Crossbreed', 'large', false),
  ('Newfypoo', 'Crossbreed', 'giant', false),
  ('Saint Berdoodle', 'Crossbreed', 'giant', false),
  ('Pomsky', 'Crossbreed', 'small', true),
  ('Huskydoodle', 'Crossbreed', 'medium', false),
  ('Aussiedoodle', 'Crossbreed', 'medium', false),
  ('Cavachon', 'Crossbreed', 'small', false),
  ('Cavapoochon', 'Crossbreed', 'small', false),
  ('Zuchon', 'Crossbreed', 'small', false),
  ('Shih-poo', 'Crossbreed', 'small', false),
  ('Yorkipoo', 'Crossbreed', 'small', false),
  ('Morkie', 'Crossbreed', 'small', false),
  ('Chorkie', 'Crossbreed', 'small', false),
  ('Puggle', 'Crossbreed', 'small', false),
  ('Schnoodle', 'Crossbreed', 'small', false),
  ('Chug', 'Crossbreed', 'small', false),
  ('Jug', 'Crossbreed', 'small', false),
  ('Frug', 'Crossbreed', 'small', false),
  ('Bullpug', 'Crossbreed', 'small', false),
  ('Frenchie Pug', 'Crossbreed', 'small', false),
  ('Beaglier', 'Crossbreed', 'small', false),
  ('Corgipoo', 'Crossbreed', 'small', false),
  ('Corgidor', 'Crossbreed', 'medium', false),
  ('Golden Corgi', 'Crossbreed', 'medium', false),
  ('Cockerdor', 'Crossbreed', 'medium', false),
  ('Springador', 'Crossbreed', 'medium', false),
  ('Labsky', 'Crossbreed', 'medium', false),
  ('Huskador', 'Crossbreed', 'medium', false),
  ('German Shepherd Lab Mix', 'Crossbreed', 'large', false),
  ('Golden Shepherd', 'Crossbreed', 'large', false),
  ('Border Collie Lab Mix', 'Crossbreed', 'medium', false),
  ('Borgi', 'Crossbreed', 'medium', false),
  ('Aussie Corgi', 'Crossbreed', 'medium', false),
  ('Aussie Pom', 'Crossbreed', 'small', false),
  ('Aussiedor', 'Crossbreed', 'large', false),
  ('Border Aussie', 'Crossbreed', 'medium', false),
  ('Texas Heeler', 'Crossbreed', 'medium', false),
  ('Border Collie Corgi Mix', 'Crossbreed', 'medium', false),
  ('Great Dane Lab Mix', 'Crossbreed', 'giant', false),
  ('Great Dane German Shepherd Mix', 'Crossbreed', 'giant', false),
  ('Doberdor', 'Crossbreed', 'large', false),
  ('Rottador', 'Crossbreed', 'large', false),
  ('Bullmastiff Lab Mix', 'Crossbreed', 'large', false),
  ('Mastador', 'Crossbreed', 'large', false),
  ('Boxador', 'Crossbreed', 'large', false),
  ('Boxmas', 'Crossbreed', 'large', false),
  ('Bull Boxer', 'Crossbreed', 'large', false),
  ('Golden Boxer', 'Crossbreed', 'large', false),
  ('Boxsky', 'Crossbreed', 'medium', false),
  ('Siberian Retriever', 'Crossbreed', 'medium', false),
  ('Goberian', 'Crossbreed', 'medium', false),
  ('Gerberian Shepsky', 'Crossbreed', 'medium', false),
  ('Alusky', 'Crossbreed', 'large', false),
  ('Hug', 'Crossbreed', 'medium', false),
  ('Chusky', 'Crossbreed', 'medium', false),
  ('Shiba Inu', 'Utility', 'small', true),
  ('Akita Inu', 'Working', 'large', false),
  ('Jindo', 'Utility', 'medium', false),
  ('Kai Ken', 'Utility', 'medium', false),
  ('Hokkaido', 'Utility', 'medium', false),
  ('Shikoku', 'Utility', 'medium', false),
  ('Kishu Ken', 'Utility', 'medium', false),
  ('Tosa', 'Working', 'giant', false),
  ('Chinook', 'Working', 'large', false),
  ('American Bulldog', 'Utility', 'large', false),
  ('Olde English Bulldogge', 'Utility', 'medium', false),
  ('Victorian Bulldog', 'Utility', 'medium', false),
  ('Alapaha Blue Blood Bulldog', 'Utility', 'large', false),
  ('Dogo Cubano', 'Working', 'large', false),
  ('Dogo Guatemalteco', 'Working', 'large', false),
  ('Pug', 'Toy', 'small', true),
  ('Boston Terrier', 'Utility', 'small', true),
  ('French Bulldog', 'Utility', 'small', true),
  ('English Bulldog', 'Utility', 'medium', true),
  ('American Bully', 'Utility', 'medium', false),
  ('Staffordshire Bull Terrier', 'Terrier', 'medium', true),
  ('American Staffordshire Terrier', 'Terrier', 'medium', false),
  ('American Pit Bull Terrier', 'Terrier', 'medium', false),
  ('Bull Terrier', 'Terrier', 'medium', false),
  ('Miniature Bull Terrier', 'Terrier', 'small', false),
  ('Staffy Bull', 'Terrier', 'medium', false),
  ('Patterdale Terrier', 'Terrier', 'small', false),
  ('Lakeland Terrier', 'Terrier', 'small', false),
  ('Welsh Terrier', 'Terrier', 'medium', false),
  ('Irish Terrier', 'Terrier', 'medium', false),
  ('Kerry Blue Terrier', 'Terrier', 'medium', false),
  ('Soft Coated Wheaten Terrier', 'Terrier', 'medium', false),
  ('Glen of Imaal Terrier', 'Terrier', 'small', false),
  ('Rat Terrier', 'Terrier', 'small', false),
  ('Teddy Roosevelt Terrier', 'Terrier', 'small', false),
  ('Feist', 'Terrier', 'small', false),
  ('Mountain Feist', 'Terrier', 'small', false),
  ('Treeing Feist', 'Terrier', 'small', false),
  ('Danish-Swedish Farmdog', 'Terrier', 'small', false),
  ('Biewer Terrier', 'Toy', 'small', false),
  ('Russian Toy', 'Toy', 'small', false),
  ('English Toy Terrier', 'Toy', 'small', false),
  ('Toy Fox Terrier', 'Toy', 'small', false),
  ('Chihuahua (Long Coat)', 'Toy', 'small', false),
  ('Chihuahua (Smooth Coat)', 'Toy', 'small', false),
  ('Pomeranian', 'Toy', 'small', true),
  ('German Spitz', 'Utility', 'small', false),
  ('Japanese Spitz', 'Utility', 'small', false),
  ('Indian Spitz', 'Utility', 'small', false),
  ('Volpino Italiano', 'Utility', 'small', false),
  ('Norwegian Lundehund', 'Hound', 'small', false),
  ('Swedish Vallhund', 'Pastoral', 'small', false),
  ('Icelandic Sheepdog', 'Pastoral', 'medium', false),
  ('Greenland Dog', 'Working', 'large', false),
  ('Canadian Eskimo Dog', 'Working', 'large', false),
  ('Seppala Siberian Sleddog', 'Working', 'medium', false),
  ('Alaskan Klee Kai', 'Utility', 'small', false),
  ('Pomsky', 'Crossbreed', 'small', true),
  ('Chiweenie', 'Crossbreed', 'small', false),
  ('Dorkie', 'Crossbreed', 'small', false),
  ('Doxiepoo', 'Crossbreed', 'small', false),
  ('Doxle', 'Crossbreed', 'small', false),
  ('Chi-Poo', 'Crossbreed', 'small', false),
  ('Cheagle', 'Crossbreed', 'small', false),
  ('Chug', 'Crossbreed', 'small', false),
  ('French Bullhuahua', 'Crossbreed', 'small', false),
  ('Chizer', 'Crossbreed', 'small', false),
  ('Bassador', 'Crossbreed', 'medium', false),
  ('Beaski', 'Crossbreed', 'medium', false),
  ('Beaglemation', 'Crossbreed', 'medium', false),
  ('Beagle Shepherd', 'Crossbreed', 'large', false),
  ('Beaski', 'Crossbreed', 'medium', false),
  ('Beaglier', 'Crossbreed', 'small', false),
  ('Poogle', 'Crossbreed', 'small', false),
  ('Peagle', 'Crossbreed', 'small', false),
  ('Bocker', 'Crossbreed', 'small', false),
  ('Cockapoo', 'Crossbreed', 'small', true),
  ('Cavapoo', 'Crossbreed', 'small', true),
  ('Maltipoo', 'Crossbreed', 'small', false),
  ('Yorkipoo', 'Crossbreed', 'small', false),
  ('Shih-poo', 'Crossbreed', 'small', false),
  ('Schnoodle', 'Crossbreed', 'small', false),
  ('Corgipoo', 'Crossbreed', 'small', false),
  ('Pomapoo', 'Crossbreed', 'small', false),
  ('Poochon', 'Crossbreed', 'small', false),
  ('Maltichon', 'Crossbreed', 'small', false),
  ('Cavachon', 'Crossbreed', 'small', false),
  ('Cavapoochon', 'Crossbreed', 'small', false),
  ('Pugapoo', 'Crossbreed', 'small', false),
  ('Doxiepoo', 'Crossbreed', 'small', false),
  ('Poogle', 'Crossbreed', 'small', false),
  ('Cocker Spaniel Poodle Mix', 'Crossbreed', 'medium', false),
  ('Labradoodle', 'Crossbreed', 'medium', true),
  ('Goldendoodle', 'Crossbreed', 'medium', true),
  ('Bernedoodle', 'Crossbreed', 'large', false),
  ('Sheepadoodle', 'Crossbreed', 'large', false),
  ('Saint Berdoodle', 'Crossbreed', 'giant', false),
  ('Newfypoo', 'Crossbreed', 'giant', false),
  ('Bordoodle', 'Crossbreed', 'medium', false),
  ('Aussiedoodle', 'Crossbreed', 'medium', false),
  ('Irish Doodle', 'Crossbreed', 'medium', false),
  ('Whoodle', 'Crossbreed', 'medium', false),
  ('Schnoodle', 'Crossbreed', 'small', false),
  ('Westiepoo', 'Crossbreed', 'small', false),
  ('Yorkipoo', 'Crossbreed', 'small', false),
  ('Jackapoo', 'Crossbreed', 'small', false),
  ('Havapoo', 'Crossbreed', 'small', false),
  ('Eskipoo', 'Crossbreed', 'small', false),
  ('Chipoo', 'Crossbreed', 'small', false),
  ('Pomapoo', 'Crossbreed', 'small', false),
  ('Pugapoo', 'Crossbreed', 'small', false),
  ('Poogle', 'Crossbreed', 'small', false),
  ('Poodle Mix', 'Crossbreed', 'medium', false),
  ('Cockapoo (F1)', 'Crossbreed', 'small', false),
  ('Cockapoo (F1b)', 'Crossbreed', 'small', false),
  ('Cockapoo (F2)', 'Crossbreed', 'small', false),
  ('Labradoodle (F1)', 'Crossbreed', 'medium', false),
  ('Labradoodle (F1b)', 'Crossbreed', 'medium', false),
  ('Labradoodle (Australian)', 'Crossbreed', 'medium', false),
  ('Goldendoodle (F1)', 'Crossbreed', 'medium', false),
  ('Goldendoodle (F1b)', 'Crossbreed', 'medium', false),
  ('Goldendoodle (Mini)', 'Crossbreed', 'small', false),
  ('Cavapoo (F1)', 'Crossbreed', 'small', false),
  ('Cavapoo (F1b)', 'Crossbreed', 'small', false),
  ('Maltipoo (F1)', 'Crossbreed', 'small', false),
  ('Maltipoo (F1b)', 'Crossbreed', 'small', false),
  ('Cavachon (F1)', 'Crossbreed', 'small', false),
  ('Cavachon (F1b)', 'Crossbreed', 'small', false),
  ('Bernedoodle (F1)', 'Crossbreed', 'large', false),
  ('Bernedoodle (F1b)', 'Crossbreed', 'large', false),
  ('Bernedoodle (Mini)', 'Crossbreed', 'medium', false),
  ('Sheepadoodle (F1)', 'Crossbreed', 'large', false),
  ('Sheepadoodle (F1b)', 'Crossbreed', 'large', false),
  ('Aussiedoodle (F1)', 'Crossbreed', 'medium', false),
  ('Aussiedoodle (F1b)', 'Crossbreed', 'medium', false),
  ('Aussiedoodle (Mini)', 'Crossbreed', 'small', false),
  ('Pomsky (F1)', 'Crossbreed', 'small', false),
  ('Pomsky (F1b)', 'Crossbreed', 'small', false),
  ('Pomsky (50/50)', 'Crossbreed', 'small', false),
  ('Pomsky (75/25)', 'Crossbreed', 'small', false)
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_breeds_popular ON public.breeds(is_popular);
CREATE INDEX IF NOT EXISTS idx_breeds_group ON public.breeds(group_name);

-- ============================================================================
-- 2. BUYER ACCOUNTS: SAVED BREEDERS / FAVOURITES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saved_breeders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(user_id, breeder_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_breeders_user ON public.saved_breeders(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_breeders_breeder ON public.saved_breeders(breeder_id);

ALTER TABLE public.saved_breeders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own saved breeders" ON public.saved_breeders;
CREATE POLICY "Users can manage own saved breeders"
  ON public.saved_breeders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all saved breeders" ON public.saved_breeders;
CREATE POLICY "Admins can view all saved breeders"
  ON public.saved_breeders
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 3. BUYER ACCOUNTS: RECENT SEARCHES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recent_searches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query text,
  breed text,
  max_distance text,
  user_lat numeric(10,6),
  user_lng numeric(10,6),
  result_count integer,
  searched_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recent_searches_user ON public.recent_searches(user_id, searched_at DESC);

ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recent searches" ON public.recent_searches;
CREATE POLICY "Users can manage own recent searches"
  ON public.recent_searches
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 4. BUYER ACCOUNTS: SAVED SEARCHES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  query text,
  breed text,
  max_distance text,
  sort_by text DEFAULT 'relevance',
  notify_new boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_notified_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own saved searches" ON public.saved_searches;
CREATE POLICY "Users can manage own saved searches"
  ON public.saved_searches
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 5. BREEDER CLAIMING: CLAIM EVIDENCE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.claim_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id uuid NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  evidence_type text NOT NULL CHECK (evidence_type IN ('licence', 'kennel_club', 'ownership_proof', 'supporting_doc')),
  file_url text NOT NULL,
  file_name text,
  file_size integer,
  mime_type text,
  uploaded_at timestamptz DEFAULT now(),
  admin_reviewed boolean DEFAULT false,
  admin_notes text
);

CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON public.claim_evidence(claim_id);

ALTER TABLE public.claim_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own claim evidence" ON public.claim_evidence;
CREATE POLICY "Users can view own claim evidence"
  ON public.claim_evidence
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.claims c
    WHERE c.id = claim_evidence.claim_id
    AND (c.claimant_user_id = auth.uid() OR is_admin())
  ));

DROP POLICY IF EXISTS "Admins can manage claim evidence" ON public.claim_evidence;
CREATE POLICY "Admins can manage claim evidence"
  ON public.claim_evidence
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 6. BREEDER "JUST CLAIMED" STATUS
-- ============================================================================
ALTER TABLE public.breeders
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS claim_approved_by uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_breeders_claimed_at ON public.breeders(claimed_at);

-- ============================================================================
-- 7. BREEDER ANALYTICS DASHBOARD
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.breeder_analytics_daily (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  date date NOT NULL,
  page_views integer DEFAULT 0,
  website_clicks integer DEFAULT 0,
  phone_clicks integer DEFAULT 0,
  favourites_count integer DEFAULT 0,
  search_impressions integer DEFAULT 0,
  message_count integer DEFAULT 0,
  UNIQUE(breeder_id, date)
);

CREATE INDEX IF NOT EXISTS idx_breeder_analytics_breeder ON public.breeder_analytics_daily(breeder_id, date DESC);

ALTER TABLE public.breeder_analytics_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Breeders can view own analytics" ON public.breeder_analytics_daily;
CREATE POLICY "Breeders can view own analytics"
  ON public.breeder_analytics_daily
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.breeders b
    WHERE b.id = breeder_analytics_daily.breeder_id
    AND b.claimed = true
    AND EXISTS (
      SELECT 1 FROM public.claims c
      WHERE c.breeder_slug = b.slug
      AND c.claimant_user_id = auth.uid()
      AND c.status = 'approved'
    )
  ));

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.breeder_analytics_daily;
CREATE POLICY "Admins can view all analytics"
  ON public.breeder_analytics_daily
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 8. MESSAGING SYSTEM
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  breeder_id uuid NOT NULL REFERENCES public.breeders(id) ON DELETE CASCADE,
  breeder_user_id uuid REFERENCES auth.users(id),
  subject text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  buyer_unread_count integer DEFAULT 0,
  breeder_unread_count integer DEFAULT 0,
  UNIQUE(buyer_id, breeder_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON public.conversations(buyer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_breeder ON public.conversations(breeder_id, updated_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid()
    OR breeder_user_id = auth.uid()
    OR is_admin()
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (
    buyer_id = auth.uid()
    OR breeder_user_id = auth.uid()
    OR is_admin()
  )
  WITH CHECK (
    buyer_id = auth.uid()
    OR breeder_user_id = auth.uid()
    OR is_admin()
  );

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('buyer', 'breeder', 'system')),
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  report_reason text,
  reported_at timestamptz,
  reported_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = auth.uid() OR c.breeder_user_id = auth.uid() OR is_admin())
  ));

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = auth.uid() OR c.breeder_user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can update own messages (report)" ON public.messages;
CREATE POLICY "Users can update own messages (report)"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = auth.uid() OR c.breeder_user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;
CREATE POLICY "Admins can manage all messages"
  ON public.messages
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 9. GOOGLE PLACES CACHE (API Cost Protection)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.google_places_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id text NOT NULL UNIQUE,
  place_data jsonb NOT NULL,
  reviews_data jsonb,
  photos_data jsonb,
  cached_at timestamptz DEFAULT now(),
  refreshed_at timestamptz,
  refresh_count integer DEFAULT 0,
  last_accessed_at timestamptz DEFAULT now(),
  admin_refreshed_at timestamptz,
  admin_refreshed_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_google_places_cache_place_id ON public.google_places_cache(place_id);
CREATE INDEX IF NOT EXISTS idx_google_places_cache_cached_at ON public.google_places_cache(cached_at);

ALTER TABLE public.google_places_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read cache" ON public.google_places_cache;
CREATE POLICY "Anyone can read cache"
  ON public.google_places_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can write cache" ON public.google_places_cache;
CREATE POLICY "Only admins can write cache"
  ON public.google_places_cache
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 10. AD CONFIG
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value text,
  enabled boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

INSERT INTO public.ad_config (key, value, enabled) VALUES
  ('adsense_enabled', 'false', true),
  ('adsense_client_id', '', false),
  ('adsense_desktop_skyscraper_left', '', false),
  ('adsense_desktop_skyscraper_right', '', false),
  ('adsense_mobile_banner_home', '', false),
  ('adsense_mobile_banner_search', '', false),
  ('adsense_sticky_footer_mobile', '', false)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.ad_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read ad config" ON public.ad_config;
CREATE POLICY "Anyone can read ad config"
  ON public.ad_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage ad config" ON public.ad_config;
CREATE POLICY "Only admins can manage ad config"
  ON public.ad_config
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 11. REMOVAL REQUESTS ENHANCEMENTS
-- ============================================================================
ALTER TABLE public.removals
  ADD COLUMN IF NOT EXISTS gdpr_compliant boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS gdpr_article text,
  ADD COLUMN IF NOT EXISTS admin_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_reviewed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS requester_identity_verified boolean DEFAULT false;

-- ============================================================================
-- 12. MESSAGING NOTIFICATIONS
-- ============================================================================
INSERT INTO public.email_templates (template_key, subject, html_body, text_body, description) VALUES
  ('message_received', 'New message on BreedWise', '<p>You have a new message on <strong>BreedWise</strong>.</p><p><a href="https://breedwise.co.uk/messages">Log in to read it</a></p>', 'You have a new message on BreedWise. Log in to read it.', 'Notification sent when a buyer receives a new message')
ON CONFLICT (template_key) DO NOTHING;

-- ============================================================================
-- 13. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_breeders_status_claimed ON public.breeders(status, claimed, claimed_at);
