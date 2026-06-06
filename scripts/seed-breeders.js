const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://zbvwqsjgasgxpphljahs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidndxc2pnYXNneHBwaGxqYWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MzQwNywiZXhwIjoyMDk2MjM5NDA3fQ.f9oVqi1wfcFXVg4i6eYtQH1mHxKZIk-mcwmjRuKH0E8', {
  auth: { autoRefreshToken: false, persistSession: false }
});

const breeders = [
  { name: 'Chichester Labrador Kennels', town: 'Chichester', postcode: 'PO19 1PU', lat: 50.8369, lng: -0.7795, website: 'https://chichesterlabs.co.uk', email: 'hello@chichesterlabs.co.uk', phone: '01243 111222', rating: 4.9, breeds: ['Labrador Retriever'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Family-run Labrador breeder in West Sussex with KC support and health-tested pedigrees.', location_notes: 'Located within easy reach of the South Downs national park.' },
  { name: 'Worthing Golden Acres', town: 'Worthing', postcode: 'BN11 1AF', lat: 50.8170, lng: -0.3750, website: 'https://worthinggoldenacres.co.uk', email: 'info@worthinggoldenacres.co.uk', phone: '01903 222333', rating: 4.8, breeds: ['Golden Retriever'], kennel_club: 'Mentioned', council_licence: 'Not found', health_testing: 'Mentioned', about: 'Trusted Golden Retriever breeders offering family homes, training support and transparent health histories.', location_notes: 'Close to the seafront and coastal countryside.' },
  { name: 'Crawley Cocker Classics', town: 'Crawley', postcode: 'RH10 1XU', lat: 51.1091, lng: -0.1872, website: 'https://crawleycockers.co.uk', email: 'contact@crawleycockers.co.uk', phone: '01293 333444', rating: 4.7, breeds: ['Cocker Spaniel'], kennel_club: 'Not found', council_licence: 'Not found', health_testing: 'Mentioned', about: 'Dedicated Cocker Spaniel family, raising happy puppies with socialisation from day one.', location_notes: 'Easy access from Gatwick and local green spaces.' },
  { name: 'Horsham Springer Fields', town: 'Horsham', postcode: 'RH12 1NQ', lat: 51.0620, lng: -0.3245, website: 'https://horshamspringers.co.uk', email: 'springer@horshamfields.co.uk', phone: '01403 444555', rating: 4.9, breeds: ['English Springer Spaniel'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Springer specialists with KC registrations and full health screening for every litter.', location_notes: 'Based on a rural farm close to the South Downs.' },
  { name: 'Haywards Heath Vizsla House', town: 'Haywards Heath', postcode: 'RH16 1BN', lat: 50.9957, lng: -0.1112, website: 'https://vizslahouse.co.uk', email: 'team@vizslahouse.co.uk', phone: '01444 555666', rating: 4.7, breeds: ['Vizsla'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Energetic Vizsla breeder offering intelligent, well-socialised pups for active families.', location_notes: 'Set in quiet countryside with easy commuter links.' },
  { name: 'Burgess Hill King Charles Cattery', town: 'Burgess Hill', postcode: 'RH15 8QX', lat: 50.9577, lng: -0.1521, website: 'https://burgesshillcavaliers.co.uk', email: 'hello@burgesshillcavaliers.co.uk', phone: '01444 666777', rating: 4.6, breeds: ['Cavalier King Charles Spaniel'], kennel_club: 'Mentioned', council_licence: 'Not found', health_testing: 'Mentioned', about: 'Small-scale breeder of Cavaliers with strong emphasis on temperament and health checks.', location_notes: 'Close to local parks and family-friendly amenities.' },
  { name: 'Bognor French Companion Kennels', town: 'Bognor Regis', postcode: 'PO21 1NN', lat: 50.7873, lng: -0.6710, website: 'https://bognorfrenchbulldogs.co.uk', email: 'petcare@frenchcompanion.co.uk', phone: '01243 777888', rating: 4.8, breeds: ['French Bulldog'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Premium French Bulldog breeder emphasising clean lines, strong hips and calm socialisation.', location_notes: 'Near the coast with spacious indoor and outdoor puppy areas.' },
  { name: 'Shoreham Pug Gardens', town: 'Shoreham-by-Sea', postcode: 'BN43 5NY', lat: 50.8351, lng: -0.2896, website: 'https://shorehampugs.co.uk', email: 'care@shorehampugs.co.uk', phone: '01273 888999', rating: 4.5, breeds: ['Pug'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Not found', about: 'Family daughters raising compact, affectionate pugs with social experience from birth.', location_notes: 'Short distance from the estuary and local parks.' },
  { name: 'Littlehampton Dachshund Dales', town: 'Littlehampton', postcode: 'BN17 5EA', lat: 50.8127, lng: -0.5433, website: 'https://littlehamptondachshunds.co.uk', email: 'studio@dachshunddales.co.uk', phone: '01903 999000', rating: 4.7, breeds: ['Dachshund'], kennel_club: 'Mentioned', council_licence: 'Not found', health_testing: 'Mentioned', about: 'Dachshund breeders offering long- and smooth-haired puppies with clear medical histories.', location_notes: 'Rural setting with secure runs and plenty of social time.' },
  { name: 'East Grinstead Shih Tzu Studio', town: 'East Grinstead', postcode: 'RH19 1SA', lat: 51.1240, lng: -0.0050, website: 'https://eastgrinsteadshihtzus.co.uk', email: 'info@shihtzustudio.co.uk', phone: '01342 000111', rating: 4.6, breeds: ['Shih Tzu'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Shih Tzu breeders with a focus on socialisation, grooming prep and calm family homes.', location_notes: 'Well located for countryside walks and village life.' },
  { name: 'Midhurst Pomeranian Place', town: 'Midhurst', postcode: 'GU29 9DT', lat: 50.9893, lng: -0.7352, website: 'https://midhurstpomsk.co.uk', email: 'puppies@midhurstpomsk.co.uk', phone: '01730 111222', rating: 4.9, breeds: ['Pomeranian'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Boutique Pomeranian breeder with show-quality lines and strong temperament screening.', location_notes: 'A quiet village atmosphere with attentive care.' },
  { name: 'Petworth Chihuahua Cottage', town: 'Petworth', postcode: 'GU28 0AX', lat: 50.9770, lng: -0.6052, website: 'https://petworthchihuahuas.co.uk', email: 'hello@petworthchihuahuas.co.uk', phone: '01798 222333', rating: 4.8, breeds: ['Chihuahua'], kennel_club: 'Not found', council_licence: 'Not found', health_testing: 'Mentioned', about: 'Chihuahua breeder offering small family litters with dedicated aftercare support.', location_notes: 'Near National Trust land with calm country living.' },
  { name: 'Arundel Shepherd Services', town: 'Arundel', postcode: 'BN18 9BL', lat: 50.8552, lng: -0.5557, website: 'https://arundelshepherds.co.uk', email: 'contact@arundelshepherds.co.uk', phone: '01903 333444', rating: 4.7, breeds: ['German Shepherd'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'German Shepherd breeder with experienced working lines, KC heritage and full hip scoring.', location_notes: 'Rural property with extensive training paddocks.' },
  { name: 'Steyning Border Collies', town: 'Steyning', postcode: 'BN44 3PJ', lat: 50.8589, lng: -0.3258, website: 'https://steyningbordercollies.co.uk', email: 'hello@bordercollies.co.uk', phone: '01903 444555', rating: 4.6, breeds: ['Border Collie'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Border Collie breeder producing alert, trainable pups for active households.', location_notes: 'Near the South Downs with plenty of work space.' },
  { name: 'Pulborough Jack Russell Kennels', town: 'Pulborough', postcode: 'RH20 1AN', lat: 50.9569, lng: -0.6111, website: 'https://pulboroughjackrussells.co.uk', email: 'team@pulboroughjackrussells.co.uk', phone: '01798 555666', rating: 4.5, breeds: ['Jack Russell Terrier'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Not found', about: 'Jack Russell breeder known for spirited, healthy terriers raised in family homes.', location_notes: 'Set near rolling Sussex farmland.' },
  { name: 'Billingshurst Staffordshire Bulls', town: 'Billingshurst', postcode: 'RH14 9PP', lat: 50.9795, lng: -0.5330, website: 'https://billingshurststaffies.co.uk', email: 'contact@staffies.co.uk', phone: '01403 555777', rating: 4.8, breeds: ['Staffordshire Bull Terrier'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Staffordshire Bull Terrier specialists with health-tested parents and secure, family-focused homes.', location_notes: 'Near village amenities with large exercise fields.' },
  { name: 'Henfield Boxer House', town: 'Henfield', postcode: 'BN5 9NZ', lat: 50.9417, lng: -0.3439, website: 'https://henfieldboxers.co.uk', email: 'info@henfieldboxers.co.uk', phone: '01273 666888', rating: 4.7, breeds: ['Boxer'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Boxer breeder with strong veterinary care and early puppy handling programmes.', location_notes: 'Based in a quiet Sussex village with safe outdoor access.' },
  { name: 'Selsey Rottweiler Ridges', town: 'Selsey', postcode: 'PO20 0RQ', lat: 50.7389, lng: -0.7656, website: 'https://selseyrottweilers.co.uk', email: 'hello@selseyrottweilers.co.uk', phone: '01243 888999', rating: 4.9, breeds: ['Rottweiler'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Rottweiler breeder offering well-socialised, confident puppies from stable home environments.', location_notes: 'Close to coastal walks and green buffer land.' },
  { name: 'Southwater Doberman Lodge', town: 'Southwater', postcode: 'RH13 9LA', lat: 51.0411, lng: -0.3519, website: 'https://southwaterdobermans.co.uk', email: 'care@southwaterdobermans.co.uk', phone: '01403 777888', rating: 4.8, breeds: ['Doberman'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Doberman breeder with focus on temperament, training guidance and trusted family placements.', location_notes: 'Set near woodland and quiet roads.' },
  { name: 'Storrington Cockapoo Cottage', town: 'Storrington', postcode: 'RH20 4JX', lat: 50.9515, lng: -0.4928, website: 'https://storringtoncockapoos.co.uk', email: 'hello@storringtoncockapoos.co.uk', phone: '01903 777000', rating: 4.7, breeds: ['Cockapoo'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Cockapoo breeder with family-orientated care and allergy-friendly lines.', location_notes: 'Quiet rural plot with easy dog walking nearby.' },
  { name: 'Adur Cavapoo Corner', town: 'Adur', postcode: 'BN43 6NZ', lat: 50.8239, lng: -0.2740, website: 'https://adurcavapoos.co.uk', email: 'support@adurcavapoos.co.uk', phone: '01273 000222', rating: 4.6, breeds: ['Cavapoo'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Cavapoo breeder producing family-friendly pups with early social experience.', location_notes: 'Located in convenient coastal suburb.' },
  { name: 'Lancing Labradoodles', town: 'Lancing', postcode: 'BN15 8RZ', lat: 50.8266, lng: -0.3284, website: 'https://lancinglabradoodles.co.uk', email: 'hello@lancinglabradoodles.co.uk', phone: '01903 111333', rating: 4.8, breeds: ['Labradoodle'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Labradoodle breeder offering intelligent, affectionate dogs from trusted ancestry.', location_notes: 'Based close to coastal and parkland walks.' },
  { name: 'Goring Goldendoodles', town: 'Goring-by-Sea', postcode: 'BN12 4LG', lat: 50.8286, lng: -0.4224, website: 'https://goringgoldendoodles.co.uk', email: 'goldie@goringgoldendoodles.co.uk', phone: '01903 222444', rating: 4.7, breeds: ['Goldendoodle'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Goldendoodle breeder with patient socialisation and balanced temperament focus.', location_notes: 'A calm seaside village setting.' },
  { name: 'East Preston Maltipoos', town: 'East Preston', postcode: 'BN16 1AS', lat: 50.8231, lng: -0.4258, website: 'https://eastprestonmaltipoos.co.uk', email: 'contact@eastprestonmaltipoos.co.uk', phone: '01903 333555', rating: 4.8, breeds: ['Maltipoo'], kennel_club: 'Not found', council_licence: 'Not found', health_testing: 'Mentioned', about: 'Maltipoo breeder providing small, well-cared-for litters and personalised puppy support.', location_notes: 'Close to quiet residential green spaces.' },
  { name: 'Angmering Mini Schnauzers', town: 'Angmering', postcode: 'BN16 4DE', lat: 50.8288, lng: -0.4655, website: 'https://angmeringminiatureschnauzers.co.uk', email: 'hello@minischnauzers.co.uk', phone: '01903 444666', rating: 4.7, breeds: ['Miniature Schnauzer'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Miniature Schnauzer breeder with elegant lines and family socialisation programmes.', location_notes: 'Within a village setting with good road access.' },
  { name: 'Rustington Beagles', town: 'Rustington', postcode: 'BN16 3DZ', lat: 50.8288, lng: -0.4700, website: 'https://rustingtonbeagles.co.uk', email: 'info@rustingtonbeagles.co.uk', phone: '01903 555777', rating: 4.6, breeds: ['Beagle'], kennel_club: 'Not found', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Beagle breeder focusing on sound, attentive pups and open communication with buyers.', location_notes: 'Located near coastal countryside suitable for active dogs.' },
  { name: 'Westergate Border Terriers', town: 'Westergate', postcode: 'PO20 3RQ', lat: 50.8540, lng: -0.5763, website: 'https://westergateborderterriers.co.uk', email: 'team@borderterriers.co.uk', phone: '01243 666777', rating: 4.6, breeds: ['Border Terrier'], kennel_club: 'Mentioned', council_licence: 'Not found', health_testing: 'Mentioned', about: 'Border Terrier breeder raising alert, happy pups for countryside-loving families.', location_notes: 'Near farmland and hedgerow trails.' },
  { name: 'Fernhurst Whippet Works', town: 'Fernhurst', postcode: 'GU27 3JD', lat: 51.0448, lng: -0.6461, website: 'https://fernhurstwhippets.co.uk', email: 'support@fernhurstwhippets.co.uk', phone: '01428 777888', rating: 4.7, breeds: ['Whippet'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Whippet breeder with racing-bred lines and calm family temperaments.', location_notes: 'Set in tranquil countryside with secure exercise paddocks.' },
  { name: 'Copthorne Westie House', town: 'Copthorne', postcode: 'RH10 3RB', lat: 51.1370, lng: -0.0906, website: 'https://copthornewesties.co.uk', email: 'hello@copthornewesties.co.uk', phone: '01342 888999', rating: 4.8, breeds: ['West Highland Terrier'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Westie breeder delivering confident, well-groomed puppies with clear health documentation.', location_notes: 'Village home with plentiful dog walking routes.' },
  { name: 'Partridge Green Berners', town: 'Partridge Green', postcode: 'RH13 8GA', lat: 50.9380, lng: -0.3870, website: 'https://partridgegreenberners.co.uk', email: 'info@berners.co.uk', phone: '01273 999111', rating: 4.9, breeds: ['Bernese Mountain Dog'], kennel_club: 'Mentioned', council_licence: 'Mentioned', health_testing: 'Mentioned', about: 'Bernese breeder raising robust, family-oriented puppies with strong health focus.', location_notes: 'Set in spacious country grounds with secure paddocks.' }
];

function slugify(text) {
  return text.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  for (const b of breeders) {
    const slug = slugify(b.name + ' ' + b.town);
    const address = b.town + ' ' + b.postcode + ', West Sussex';

    const { data: breeder, error: bErr } = await supabase.from('breeders').insert({
      slug,
      name: b.name,
      address,
      town: b.town,
      postcode: b.postcode,
      county: 'West Sussex',
      region: 'England',
      country: 'england',
      lat: b.lat,
      lng: b.lng,
      website: b.website,
      phone: b.phone,
      email: b.email,
      google_rating: b.rating,
      kennel_club: b.kennel_club,
      council_licence: b.council_licence,
      health_testing: b.health_testing,
      about: b.about,
      location_notes: b.location_notes,
      status: 'public_listing',
      claimed: false,
      source_tags: ['seed'],
      confidence_score: 0.88
    }).select().single();

    if (bErr) {
      if (bErr.message.includes('duplicate') || bErr.code === '23505') {
        console.log('Skipped (exists):', b.name);
        continue;
      }
      console.error('Error inserting ' + b.name + ':', bErr.message);
      continue;
    }

    for (const breed of b.breeds) {
      const { error: brErr } = await supabase.from('breeder_breeds').insert({
        breeder_id: breeder.id,
        breed
      });
      if (brErr && !brErr.message.includes('duplicate') && brErr.code !== '23505') {
        console.error('Error inserting breed for ' + b.name + ':', brErr.message);
      }
    }

    console.log('Inserted:', b.name);
  }
}

main().catch(err => console.error('Fatal:', err));
