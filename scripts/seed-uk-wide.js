/**
 * Comprehensive UK-Wide Dog Breeder Seeder
 *
 * Searches all UK regions with major cities and towns.
 * Uses Google Places API (New) with multiple query types per location.
 * Less strict breeder detection to catch more legitimate businesses.
 *
 * Run with: GOOGLE_PLACES_API_KEY=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-uk-wide.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zbvwqsjgasgxpphljahs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpidndxc2pnYXNneHBwaGxqYWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDY2MzQwNywiZXhwIjoyMDk2MjM5NDA3fQ.f9oVqi1wfcFXVg4i6eYtQH1mHxKZIk-mcwmjRuKH0E8';
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyCy96kjGFWrK-2_EpX4-HvYyIY0l9fuxnA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Comprehensive UK locations — every major region
const SEARCH_LOCATIONS = [
  // === LONDON & SOUTH EAST ===
  { town: "London", lat: 51.5074, lng: -0.1278, radius: 25000 },
  { town: "Croydon", lat: 51.3762, lng: -0.0982, radius: 15000 },
  { town: "Bromley", lat: 51.4060, lng: 0.0152, radius: 15000 },
  { town: "Enfield", lat: 51.6521, lng: -0.0815, radius: 15000 },
  { town: "Watford", lat: 51.6565, lng: -0.3903, radius: 15000 },
  { town: "Reading", lat: 51.4543, lng: -0.9781, radius: 20000 },
  { town: "Guildford", lat: 51.2362, lng: -0.5704, radius: 20000 },
  { town: "Maidstone", lat: 51.2704, lng: 0.5232, radius: 20000 },
  { town: "Canterbury", lat: 51.2802, lng: 1.0789, radius: 20000 },
  { town: "Brighton", lat: 50.8229, lng: -0.1363, radius: 20000 },
  { town: "Portsmouth", lat: 50.8198, lng: -1.0880, radius: 20000 },
  { town: "Southampton", lat: 50.9097, lng: -1.4044, radius: 20000 },
  { town: "Basingstoke", lat: 51.2665, lng: -1.0924, radius: 20000 },
  { town: "Oxford", lat: 51.7520, lng: -1.2577, radius: 20000 },
  { town: "Slough", lat: 51.5105, lng: -0.5950, radius: 15000 },
  { town: "Milton Keynes", lat: 52.0406, lng: -0.7594, radius: 20000 },
  { town: "Luton", lat: 51.8783, lng: -0.4142, radius: 15000 },
  { town: "High Wycombe", lat: 51.6286, lng: -0.7482, radius: 15000 },
  { town: "Aylesbury", lat: 51.8156, lng: -0.8084, radius: 15000 },
  { town: "Chelmsford", lat: 51.7356, lng: 0.4685, radius: 20000 },
  { town: "Colchester", lat: 51.8959, lng: 0.8919, radius: 20000 },
  { town: "Ipswich", lat: 52.0567, lng: 1.1482, radius: 20000 },
  { town: "Norwich", lat: 52.6309, lng: 1.2974, radius: 25000 },
  { town: "Cambridge", lat: 52.2053, lng: 0.1218, radius: 20000 },
  { town: "Bedford", lat: 52.1359, lng: -0.4667, radius: 20000 },
  { town: "St Albans", lat: 51.7527, lng: -0.3394, radius: 15000 },
  { town: "Hemel Hempstead", lat: 51.7537, lng: -0.4752, radius: 15000 },

  // === SOUTH WEST ===
  { town: "Bristol", lat: 51.4545, lng: -2.5879, radius: 25000 },
  { town: "Bath", lat: 51.3814, lng: -2.3597, radius: 15000 },
  { town: "Exeter", lat: 50.7184, lng: -3.5339, radius: 25000 },
  { town: "Plymouth", lat: 50.3755, lng: -4.1427, radius: 20000 },
  { town: "Taunton", lat: 51.0153, lng: -3.1068, radius: 20000 },
  { town: "Yeovil", lat: 50.9422, lng: -2.6337, radius: 20000 },
  { town: "Swindon", lat: 51.5684, lng: -1.7722, radius: 20000 },
  { town: "Gloucester", lat: 51.8642, lng: -2.2380, radius: 20000 },
  { town: "Cheltenham", lat: 51.8994, lng: -2.0783, radius: 20000 },
  { town: "Bournemouth", lat: 50.7192, lng: -1.8808, radius: 20000 },
  { town: "Poole", lat: 50.7150, lng: -1.9872, radius: 15000 },
  { town: "Salisbury", lat: 51.0688, lng: -1.7945, radius: 20000 },
  { town: "Truro", lat: 50.2632, lng: -5.0510, radius: 25000 },
  { town: "Penzance", lat: 50.1188, lng: -5.5376, radius: 20000 },
  { town: "Torquay", lat: 50.4619, lng: -3.5253, radius: 15000 },
  { town: "Newton Abbot", lat: 50.5294, lng: -3.6100, radius: 15000 },
  { town: "Tiverton", lat: 50.9020, lng: -3.4912, radius: 15000 },
  { town: "Wells", lat: 51.2093, lng: -2.6446, radius: 15000 },
  { town: "Chippenham", lat: 51.4580, lng: -2.1161, radius: 15000 },
  { town: "Stroud", lat: 51.7457, lng: -2.2178, radius: 15000 },

  // === EAST MIDLANDS ===
  { town: "Leicester", lat: 52.6369, lng: -1.1398, radius: 25000 },
  { town: "Nottingham", lat: 52.9548, lng: -1.1581, radius: 25000 },
  { town: "Derby", lat: 52.9225, lng: -1.4746, radius: 20000 },
  { town: "Northampton", lat: 52.2405, lng: -0.9027, radius: 20000 },
  { town: "Lincoln", lat: 53.2307, lng: -0.5406, radius: 25000 },
  { town: "Stoke-on-Trent", lat: 53.0027, lng: -2.1794, radius: 25000 },
  { town: "Peterborough", lat: 52.5695, lng: -0.2405, radius: 25000 },
  { town: "Coventry", lat: 52.4068, lng: -1.5197, radius: 20000 },
  { town: "Nuneaton", lat: 52.5205, lng: -1.4653, radius: 15000 },
  { town: "Rugby", lat: 52.3709, lng: -1.2650, radius: 15000 },
  { town: "Kettering", lat: 52.3986, lng: -0.7301, radius: 15000 },
  { town: "Corby", lat: 52.4882, lng: -0.6965, radius: 15000 },
  { town: "Grantham", lat: 52.9120, lng: -0.6437, radius: 15000 },
  { town: "Boston", lat: 52.9789, lng: -0.0266, radius: 15000 },
  { town: "Loughborough", lat: 52.7721, lng: -1.2062, radius: 15000 },
  { town: "Melton Mowbray", lat: 52.7661, lng: -0.8859, radius: 15000 },
  { town: "Chesterfield", lat: 53.2350, lng: -1.4216, radius: 15000 },
  { town: "Mansfield", lat: 53.1442, lng: -1.1964, radius: 15000 },

  // === WEST MIDLANDS ===
  { town: "Birmingham", lat: 52.4862, lng: -1.8904, radius: 30000 },
  { town: "Wolverhampton", lat: 52.5870, lng: -2.1288, radius: 20000 },
  { town: "Coventry", lat: 52.4068, lng: -1.5197, radius: 20000 },
  { town: "Walsall", lat: 52.5862, lng: -1.9829, radius: 15000 },
  { town: "Dudley", lat: 52.5123, lng: -2.0811, radius: 15000 },
  { town: "Solihull", lat: 52.4118, lng: -1.7776, radius: 15000 },
  { town: "West Bromwich", lat: 52.5187, lng: -1.9923, radius: 15000 },
  { town: "Stourbridge", lat: 52.4570, lng: -2.1479, radius: 15000 },
  { town: "Hereford", lat: 52.0560, lng: -2.7156, radius: 20000 },
  { town: "Worcester", lat: 52.1920, lng: -2.2200, radius: 20000 },
  { town: "Kidderminster", lat: 52.3882, lng: -2.2499, radius: 15000 },
  { town: "Redditch", lat: 52.3086, lng: -1.9379, radius: 15000 },
  { town: "Shrewsbury", lat: 52.7073, lng: -2.7553, radius: 20000 },
  { town: "Telford", lat: 52.6784, lng: -2.4453, radius: 20000 },
  { town: "Stafford", lat: 52.8067, lng: -2.1201, radius: 20000 },
  { town: "Cannock", lat: 52.6886, lng: -2.0293, radius: 15000 },
  { town: "Burton upon Trent", lat: 52.8019, lng: -1.6310, radius: 15000 },
  { town: "Tamworth", lat: 52.6340, lng: -1.6950, radius: 15000 },

  // === EAST OF ENGLAND ===
  { town: "Norwich", lat: 52.6309, lng: 1.2974, radius: 25000 },
  { town: "Cambridge", lat: 52.2053, lng: 0.1218, radius: 20000 },
  { town: "Ipswich", lat: 52.0567, lng: 1.1482, radius: 20000 },
  { town: "Chelmsford", lat: 51.7356, lng: 0.4685, radius: 20000 },
  { town: "Southend-on-Sea", lat: 51.5459, lng: 0.7077, radius: 15000 },
  { town: "Luton", lat: 51.8783, lng: -0.4142, radius: 20000 },
  { town: "St Albans", lat: 51.7527, lng: -0.3394, radius: 15000 },
  { town: "Bedford", lat: 52.1359, lng: -0.4667, radius: 20000 },
  { town: "Huntingdon", lat: 52.3315, lng: -0.1816, radius: 15000 },
  { town: "Kings Lynn", lat: 52.7517, lng: 0.4023, radius: 20000 },
  { town: "Great Yarmouth", lat: 52.6083, lng: 1.7365, radius: 15000 },
  { town: "Lowestoft", lat: 52.4800, lng: 1.7500, radius: 15000 },
  { town: "Bury St Edmunds", lat: 52.2464, lng: 0.7185, radius: 15000 },
  { town: "Stevenage", lat: 51.9038, lng: -0.1966, radius: 15000 },
  { town: "Welwyn Garden City", lat: 51.8032, lng: -0.2086, radius: 15000 },
  { town: "Harlow", lat: 51.7678, lng: 0.0878, radius: 15000 },

  // === YORKSHIRE & HUMBER ===
  { town: "Leeds", lat: 53.8008, lng: -1.5491, radius: 30000 },
  { town: "Sheffield", lat: 53.3811, lng: -1.4701, radius: 25000 },
  { town: "Bradford", lat: 53.7960, lng: -1.7594, radius: 25000 },
  { town: "York", lat: 53.9600, lng: -1.0873, radius: 25000 },
  { town: "Hull", lat: 53.7676, lng: -0.3274, radius: 25000 },
  { town: "Doncaster", lat: 53.5228, lng: -1.1285, radius: 20000 },
  { town: "Rotherham", lat: 53.4300, lng: -1.3570, radius: 15000 },
  { town: "Barnsley", lat: 53.5526, lng: -1.4797, radius: 15000 },
  { town: "Wakefield", lat: 53.6840, lng: -1.4937, radius: 15000 },
  { town: "Harrogate", lat: 53.9921, lng: -1.5418, radius: 20000 },
  { town: "Scarborough", lat: 54.2820, lng: -0.4010, radius: 20000 },
  { town: "Halifax", lat: 53.7270, lng: -1.8575, radius: 15000 },
  { town: "Huddersfield", lat: 53.6458, lng: -1.7850, radius: 15000 },
  { town: "Dewsbury", lat: 53.6897, lng: -1.6297, radius: 15000 },
  { town: "Batley", lat: 53.7113, lng: -1.6257, radius: 15000 },
  { town: "Keighley", lat: 53.8678, lng: -1.9123, radius: 15000 },
  { town: "Skipton", lat: 53.9614, lng: -2.0175, radius: 15000 },
  { town: "Ripon", lat: 54.1356, lng: -1.5203, radius: 15000 },
  { town: "Thirsk", lat: 54.2326, lng: -1.3420, radius: 15000 },
  { town: "Malton", lat: 54.1356, lng: -0.7978, radius: 15000 },
  { town: "Pickering", lat: 54.2438, lng: -0.7759, radius: 15000 },
  { town: "Bridlington", lat: 54.0855, lng: -0.2009, radius: 15000 },
  { town: "Grimsby", lat: 53.5675, lng: -0.0808, radius: 20000 },
  { town: "Scunthorpe", lat: 53.5883, lng: -0.6544, radius: 20000 },

  // === NORTH WEST ===
  { town: "Manchester", lat: 53.4808, lng: -2.2426, radius: 30000 },
  { town: "Liverpool", lat: 53.4084, lng: -2.9916, radius: 25000 },
  { town: "Bolton", lat: 53.5769, lng: -2.4282, radius: 20000 },
  { town: "Wigan", lat: 53.5443, lng: -2.6310, radius: 15000 },
  { town: "St Helens", lat: 53.4563, lng: -2.7371, radius: 15000 },
  { town: "Salford", lat: 53.4875, lng: -2.2901, radius: 15000 },
  { town: "Oldham", lat: 53.5409, lng: -2.1114, radius: 15000 },
  { town: "Rochdale", lat: 53.6097, lng: -2.1561, radius: 15000 },
  { town: "Stockport", lat: 53.4106, lng: -2.1575, radius: 15000 },
  { town: "Bury", lat: 53.5933, lng: -2.2966, radius: 15000 },
  { town: "Preston", lat: 53.7632, lng: -2.7031, radius: 25000 },
  { town: "Blackpool", lat: 53.8161, lng: -3.0559, radius: 20000 },
  { town: "Lancaster", lat: 54.0466, lng: -2.8007, radius: 20000 },
  { town: "Blackburn", lat: 53.7486, lng: -2.4875, radius: 15000 },
  { town: "Burnley", lat: 53.7891, lng: -2.2446, radius: 15000 },
  { town: "Warrington", lat: 53.3900, lng: -2.5970, radius: 15000 },
  { town: "Chester", lat: 53.1934, lng: -2.8930, radius: 20000 },
  { town: "Crewe", lat: 53.0990, lng: -2.4430, radius: 20000 },
  { town: "Carlisle", lat: 54.8925, lng: -2.9329, radius: 25000 },
  { town: "Barrow-in-Furness", lat: 54.1110, lng: -3.2260, radius: 15000 },
  { town: "Kendal", lat: 54.3280, lng: -2.7463, radius: 15000 },
  { town: "Penrith", lat: 54.6641, lng: -2.7547, radius: 15000 },

  // === NORTH EAST ===
  { town: "Newcastle", lat: 54.9783, lng: -1.6178, radius: 25000 },
  { town: "Sunderland", lat: 54.9069, lng: -1.3838, radius: 20000 },
  { town: "Durham", lat: 54.7753, lng: -1.5849, radius: 20000 },
  { town: "Middlesbrough", lat: 54.5742, lng: -1.2350, radius: 20000 },
  { town: "Stockton-on-Tees", lat: 54.5705, lng: -1.3280, radius: 15000 },
  { town: "Darlington", lat: 54.5242, lng: -1.5504, radius: 15000 },
  { town: "Gateshead", lat: 54.9523, lng: -1.6340, radius: 15000 },
  { town: "Washington", lat: 54.9020, lng: -1.5202, radius: 15000 },
  { town: "South Shields", lat: 54.9994, lng: -1.4274, radius: 15000 },
  { town: "North Shields", lat: 55.0090, lng: -1.4470, radius: 15000 },
  { town: "Hexham", lat: 54.9698, lng: -2.1060, radius: 15000 },
  { town: "Alnwick", lat: 55.4127, lng: -1.7063, radius: 15000 },
  { town: "Morpeth", lat: 55.1680, lng: -1.6870, radius: 15000 },
  { town: "Blyth", lat: 55.1268, lng: -1.5133, radius: 15000 },
  { town: "Berwick-upon-Tweed", lat: 55.7711, lng: -2.0056, radius: 15000 },
  { town: "Hartlepool", lat: 54.6917, lng: -1.2129, radius: 15000 },
  { town: "Redcar", lat: 54.6168, lng: -1.0700, radius: 15000 },

  // === SCOTLAND ===
  { town: "Glasgow", lat: 55.8609, lng: -4.2514, radius: 30000 },
  { town: "Edinburgh", lat: 55.9533, lng: -3.1883, radius: 30000 },
  { town: "Aberdeen", lat: 57.1497, lng: -2.0943, radius: 25000 },
  { town: "Dundee", lat: 56.4620, lng: -2.9707, radius: 25000 },
  { town: "Inverness", lat: 57.4778, lng: -4.2247, radius: 25000 },
  { town: "Stirling", lat: 56.1165, lng: -3.9369, radius: 20000 },
  { town: "Perth", lat: 56.3950, lng: -3.4308, radius: 20000 },
  { town: "Falkirk", lat: 56.0019, lng: -3.7839, radius: 15000 },
  { town: "Paisley", lat: 55.8473, lng: -4.4401, radius: 15000 },
  { town: "Hamilton", lat: 55.7776, lng: -4.0537, radius: 15000 },
  { town: "East Kilbride", lat: 55.7644, lng: -4.1769, radius: 15000 },
  { town: "Ayr", lat: 55.4586, lng: -4.6292, radius: 20000 },
  { town: "Kilmarnock", lat: 55.6147, lng: -4.4987, radius: 15000 },
  { town: "Greenock", lat: 55.9565, lng: -4.7719, radius: 15000 },
  { town: "Livingston", lat: 55.9007, lng: -3.5181, radius: 15000 },
  { town: "Dunfermline", lat: 56.0717, lng: -3.4521, radius: 20000 },
  { town: "Kirkcaldy", lat: 56.1165, lng: -3.1589, radius: 15000 },
  { town: "Elgin", lat: 57.6494, lng: -3.3143, radius: 15000 },
  { town: "Forres", lat: 57.6090, lng: -3.6165, radius: 15000 },
  { town: "Oban", lat: 56.4152, lng: -5.4710, radius: 15000 },
  { town: "Fort William", lat: 56.8198, lng: -5.1052, radius: 15000 },
  { town: "Aviemore", lat: 57.1957, lng: -3.8223, radius: 15000 },
  { town: "Dumfries", lat: 55.0700, lng: -3.6030, radius: 20000 },
  { town: "Stranraer", lat: 54.9034, lng: -5.0248, radius: 15000 },
  { town: "Galashiels", lat: 55.6147, lng: -2.8068, radius: 15000 },
  { town: "Hawick", lat: 55.4229, lng: -2.7856, radius: 15000 },
  { town: "Peebles", lat: 55.6515, lng: -3.1903, radius: 15000 },

  // === WALES ===
  { town: "Cardiff", lat: 51.4816, lng: -3.1791, radius: 25000 },
  { town: "Swansea", lat: 51.6214, lng: -3.9436, radius: 25000 },
  { town: "Newport", lat: 51.5842, lng: -2.9980, radius: 20000 },
  { town: "Wrexham", lat: 53.0430, lng: -2.9925, radius: 20000 },
  { town: "Bangor", lat: 53.2274, lng: -4.1293, radius: 15000 },
  { town: "Aberystwyth", lat: 52.4153, lng: -4.0829, radius: 15000 },
  { town: "Carmarthen", lat: 51.8576, lng: -4.3121, radius: 20000 },
  { town: "Llanelli", lat: 51.6809, lng: -4.1603, radius: 15000 },
  { town: "Merthyr Tydfil", lat: 51.7487, lng: -3.3817, radius: 15000 },
  { town: "Pontypridd", lat: 51.6008, lng: -3.3423, radius: 15000 },
  { town: "Caerphilly", lat: 51.5785, lng: -3.2181, radius: 15000 },
  { town: "Bridgend", lat: 51.5043, lng: -3.5769, radius: 15000 },
  { town: "Neath", lat: 51.6620, lng: -3.8043, radius: 15000 },
  { town: "Barry", lat: 51.3995, lng: -3.2715, radius: 15000 },
  { town: "Colwyn Bay", lat: 53.2932, lng: -3.7276, radius: 15000 },
  { town: "Rhyl", lat: 53.3191, lng: -3.4916, radius: 15000 },
  { town: "Prestatyn", lat: 53.3370, lng: -3.4078, radius: 15000 },
  { town: "Llandudno", lat: 53.3241, lng: -3.8276, radius: 15000 },
  { town: "Caernarfon", lat: 53.1397, lng: -4.2739, radius: 15000 },
  { town: "Porthmadog", lat: 52.9281, lng: -4.1337, radius: 15000 },
  { town: "Machynlleth", lat: 52.5903, lng: -3.8533, radius: 15000 },
  { town: "Newtown", lat: 52.5153, lng: -3.3125, radius: 15000 },
  { town: "Welshpool", lat: 52.6605, lng: -3.1460, radius: 15000 },

  // === NORTHERN IRELAND ===
  { town: "Belfast", lat: 54.5973, lng: -5.9301, radius: 25000 },
  { town: "Derry", lat: 54.9966, lng: -7.3086, radius: 20000 },
  { town: "Lisburn", lat: 54.5120, lng: -6.0311, radius: 15000 },
  { town: "Newry", lat: 54.1751, lng: -6.3402, radius: 15000 },
  { town: "Armagh", lat: 54.3503, lng: -6.6528, radius: 15000 },
  { town: "Enniskillen", lat: 54.3438, lng: -7.6310, radius: 20000 },
  { town: "Omagh", lat: 54.5977, lng: -7.3100, radius: 15000 },
  { town: "Coleraine", lat: 55.1326, lng: -6.6646, radius: 15000 },
  { town: "Ballymena", lat: 54.8636, lng: -6.2786, radius: 15000 },
  { town: "Banbridge", lat: 54.3487, lng: -6.2700, radius: 15000 },
];

const SEARCH_QUERIES = [
  "dog breeder",
  "puppy breeder",
  "dog kennels",
  "puppy kennel",
  "breeder",
];

const BREED_QUERIES = [
  "labrador breeder", "cockapoo breeder", "cocker spaniel breeder",
  "springer spaniel breeder", "golden retriever breeder", "border collie breeder",
  "cavapoo breeder", "french bulldog breeder", "dachshund breeder",
  "german shepherd breeder", "beagle breeder", "poodle breeder",
  "staffordshire bull terrier breeder", "jack russell breeder",
  "corgi breeder", "husky breeder", "rottweiler breeder",
  "boxer breeder", "dobermann breeder", "weimaraner breeder",
  "vizsla breeder", "setter breeder", "pointer breeder",
  "whippet breeder", "lurcher breeder", "schnauzer breeder",
  "shih tzu breeder", "chihuahua breeder", "bichon frise breeder",
  "pug breeder", "bulldog breeder", "mastiff breeder",
  "terrier breeder", "spaniel breeder", "retriever breeder",
  "gundog breeder", "hound breeder",
];

const ALL_QUERIES = [...SEARCH_QUERIES, ...BREED_QUERIES];

const REJECT_KEYWORDS = [
  "boarding", "dog hotel", "doggy day care", "daycare",
  "grooming", "rescue centre", "animal rescue", "dog rescue",
  "rehoming centre", "veterinary", "vet clinic", "vet practice",
  "pet shop", "pet store", "pet supplies", "dog trainer",
  "dog training", "puppy school", "pet crematorium",
  "dog walking", "dog walker", "dog sitter", "pet sitting",
  "animal sanctuary", "RSPCA", "Blue Cross", "Battersea",
  "Dogs Trust", "kennel club", "dog show", "agility",
  "puppy farm",
];

function isBreeder(place) {
  const name = (place.displayName?.text || place.name || "").toLowerCase();
  const types = (place.types || []).map(t => t.toLowerCase());

  if (!types.includes("establishment")) return false;

  for (const kw of REJECT_KEYWORDS) {
    if (name.includes(kw)) return false;
  }

  // Accept if name contains ANY dog-related keyword
  const acceptKeywords = [
    "breeder", "breeding", "breeders", "kennel", "kennels",
    "puppy", "puppies", "pups", "stud", "litter", "pedigree",
    "labrador", "spaniel", "cockapoo", "cavapoo", "retriever",
    "bulldog", "poodle", "dachshund", "german shepherd", "collie",
    "terrier", "pomeranian", "maltese", "vizsla", "gundog",
    "gun dog", "hound", "springer", "cocker", "golden",
    "frenchie", "beagle", "boxer", "dalmatian", "dobermann",
    "pug", "shih tzu", "chihuahua", "bichon", "corgi", "husky",
    "rottweiler", "mastiff", "setter", "pointer", "weimaraner",
    "whippet", "greyhound", "lurcher", "schnauzer", "jack russell",
    "staffordshire", "staffy", "sbt", "westie", "yorkshire terrier",
    "malamute", "akita", "bernese", "newfoundland", "leonberger",
    "samoyed", "shiba", "australian shepherd", "border terrier",
    "cairn terrier", "fox terrier", "irish setter", "english setter",
    "gordon setter", "clumber spaniel", "sussex spaniel", "field spaniel",
    "welsh springer", "brittany", "german shorthaired pointer",
    "german wirehaired pointer", "vizsla", "weimaraner", "pointer",
    "english pointer", "irish wolfhound", "deerhound", "bloodhound",
    "basset hound", "beagle", "harrier", "foxhound", " otterhound",
    "saluki", "afghan hound", "borzoi", "greyhound", "whippet",
    "italian greyhound", "lurcher", "saluki", "whippet",
    "bull terrier", "staffordshire bull terrier", "american bulldog",
    "old tyme bulldog", "bullmastiff", "mastiff", "neapolitan mastiff",
    "cane corso", "dogue de bordeaux", "rottweiler", "dobermann",
    "german shepherd", "belgian malinois", "dutch shepherd",
    "tibetan mastiff", "chow chow", "shar pei", "akita",
    "alaskan malamute", "siberian husky", "samoyed", "finnish lapphund",
    "swedish vallhund", "norwegian elkhound", "icelandic sheepdog",
    "shetland sheepdog", "collie", "border collie", "bearded collie",
    "rough collie", "smooth collie", "welsh collie", "australian cattle dog",
    "kelpie", "corgi", "pembroke corgi", "cardigan corgi",
    "old english sheepdog", "beauceron", "briard", "bouvier des flandres",
    "giant schnauzer", "standard schnauzer", "miniature schnauzer",
    "poodle", "standard poodle", "miniature poodle", "toy poodle",
    "bichon frise", "havanese", "maltese", "shih tzu", "lhasa apso",
    "tibetan terrier", "cavalier king charles spaniel", "king charles spaniel",
    "papillon", "pekingese", "pomeranian", "japanese chin",
    "chihuahua", "yorkshire terrier", "norfolk terrier", "norwich terrier",
    "border terrier", "cairn terrier", "west highland white terrier",
    "scottish terrier", "skye terrier", "dandie dinmont terrier",
    "bedlington terrier", "lakeland terrier", "welsh terrier",
    "airedale terrier", "wire fox terrier", "smooth fox terrier",
    "parson russell terrier", "jack russell terrier", "rat terrier",
    "tenterfield terrier", "miniature pinscher", "affenpinscher",
    "brussels griffon", "english toy terrier", "russian toy",
    "italian greyhound", "chinese crested", "xoloitzcuintli",
    "mexican hairless", "peruvian inca orchid", "basenji",
    "pharaoh hound", "ibizan hound", "podenco", "cirneco dell'etna",
    "grand basset griffon vendeen", "petit basset griffon vendeen",
    "basset hound", "bloodhound", "otterhound", "english foxhound",
    "american foxhound", "harrier", "beagle", "treeing walker coonhound",
    "black and tan coonhound", "bluetick coonhound", "redbone coonhound",
    "plott hound", "rhodesian ridgeback", "thai ridgeback",
    "fila brasileiro", "tosa inu", "presa canario", "dogo argentino",
    "central asian shepherd", "caucasian shepherd", "anatolian shepherd",
    "kangal", "great pyrenees", "maremma sheepdog", "kuvasz",
    "komondor", "puli", "pumi", "mudhol hound", "rajapalayam",
    "kanni", "chippiparai", "kombai", "caravan hound",
    "rampur greyhound", "bhotia", "gaddi", "bhutia",
    "himalayan sheepdog", "tibetan spaniel", "tibetan mastiff",
    "tibetan terrier", "lhasa apso", "shih tzu", "pekingese",
    "pug", "chinese crested", "shar pei", "chow chow",
  ];

  for (const kw of acceptKeywords) {
    if (name.includes(kw)) return true;
  }

  // If name has "dog" or "pup" and looks like a business, accept
  if ((name.includes("dog") || name.includes("pup")) && types.includes("establishment")) {
    return true;
  }

  return false;
}

function parseAddressComponents(place) {
  const components = {};
  for (const c of (place.addressComponents || [])) {
    for (const t of (c.types || [])) {
      components[t] = c.longText;
      components[t + "_short"] = c.shortText;
    }
  }
  return components;
}

function extractPostcode(address) {
  if (!address) return null;
  const match = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s?\d[ABD-HJLNP-UW-Z]{2}/i);
  return match ? match[0].toUpperCase() : null;
}

async function searchGooglePlaces(query, lat, lng, radius) {
  const url = new URL("https://places.googleapis.com/v1/places:searchText");
  const body = {
    textQuery: query,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: radius,
      },
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.rating,places.userRatingCount,places.websiteUri,places.internationalPhoneNumber,places.primaryType,places.types,places.photos",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Google API error: ${res.status} - ${err.slice(0, 200)}`);
      return [];
    }

    const data = await res.json();
    return data.places || [];
  } catch (err) {
    console.error(`Search error: ${err.message}`);
    return [];
  }
}

function generateSlug(name, postcode, town) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const cleanLocation = (postcode || town || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${cleanName}-${cleanLocation}`.replace(/-+/g, "-").slice(0, 100);
}

async function main() {
  console.log("=== UK-Wide Dog Breeder Seeder ===\n");
  console.log(`Searching ${SEARCH_LOCATIONS.length} locations`);
  console.log(`Using ${ALL_QUERIES.length} query types per location`);
  console.log(`Total searches: ${SEARCH_LOCATIONS.length * ALL_QUERIES.length}\n`);

  const seenPlaceIds = new Set();
  const seenSlugs = new Set();
  const breeders = [];
  let searchesDone = 0;

  const { data: existing } = await supabase.from("breeders").select("google_place_id, slug").neq("status", "archived");
  existing?.forEach(b => {
    if (b.google_place_id) seenPlaceIds.add(b.google_place_id);
    if (b.slug) seenSlugs.add(b.slug);
  });
  console.log(`Existing active breeders: ${existing?.length || 0}`);
  console.log(`Existing place IDs: ${seenPlaceIds.size}\n`);

  for (const loc of SEARCH_LOCATIONS) {
    const locBreeders = [];

    for (const query of ALL_QUERIES) {
      const fullQuery = `${query} near ${loc.town}, UK`;
      const places = await searchGooglePlaces(fullQuery, loc.lat, loc.lng, loc.radius);
      searchesDone++;

      for (const place of places) {
        if (seenPlaceIds.has(place.id)) continue;
        if (!isBreeder(place)) continue;

        const components = parseAddressComponents(place);
        const address = place.formattedAddress || "";
        const postcode = extractPostcode(address);
        const town = components.locality || components.sublocality || loc.town;
        const county = components.administrative_area_level_2 || "";
        const region = components.administrative_area_level_1 || "";
        const country = components.country || "UK";
        const name = place.displayName?.text || place.name || "Unknown Breeder";
        const slug = generateSlug(name, postcode, town);

        if (seenSlugs.has(slug)) continue;

        seenPlaceIds.add(place.id);
        seenSlugs.add(slug);

        const breeder = {
          google_place_id: place.id,
          slug,
          name,
          address,
          town,
          postcode,
          county,
          region,
          country: country.toLowerCase().includes("united kingdom") || country.toLowerCase().includes("uk") || country.toLowerCase().includes("england") || country.toLowerCase().includes("scotland") || country.toLowerCase().includes("wales") ? "united_kingdom" : country.toLowerCase().replace(/\s+/g, "_"),
          lat: place.location?.latitude || null,
          lng: place.location?.longitude || null,
          website: place.websiteUri || null,
          phone: place.internationalPhoneNumber || null,
          google_rating: place.rating || null,
          google_review_count: place.userRatingCount || null,
          business_type: place.primaryType || (place.types && place.types[0]) || null,
          status: "public_listing",
          source_tags: ["google_places", "uk_wide"],
          confidence_score: 0.85,
        };

        locBreeders.push(breeder);
        breeders.push(breeder);
      }

      await new Promise(r => setTimeout(r, 150));
    }

    if (locBreeders.length > 0) {
      console.log(`${loc.town}: ${locBreeders.length} new breeders (${searchesDone}/${SEARCH_LOCATIONS.length * ALL_QUERIES.length})`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total searches: ${searchesDone}`);
  console.log(`New breeders found: ${breeders.length}`);

  if (breeders.length === 0) {
    console.log("\nNo new breeders found.");
    return;
  }

  console.log("\nInserting breeders into database...");
  let inserted = 0;
  const batchSize = 20;

  for (let i = 0; i < breeders.length; i += batchSize) {
    const batch = breeders.slice(i, i + batchSize);
    const { error } = await supabase.from("breeders").insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${breeders.length}...`);
    }
  }

  console.log(`\nDone!`);
  console.log(`New breeders inserted: ${inserted}`);
  console.log(`Total active breeders now: ${(existing?.length || 0) + inserted}`);
}

main().catch(console.error);
