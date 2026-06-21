/**
 * UK-wide search hubs for Places Text Search seeding (deduped by town).
 * Used by seed-cat-breeders, seed-fish-breeders, and seed-uk-wide.
 */

const UK_SEARCH_LOCATIONS = [
  {
    "town": "London",
    "lat": 51.5074,
    "lng": -0.1278,
    "radius": 25000
  },
  {
    "town": "Croydon",
    "lat": 51.3762,
    "lng": -0.0982,
    "radius": 15000
  },
  {
    "town": "Bromley",
    "lat": 51.406,
    "lng": 0.0152,
    "radius": 15000
  },
  {
    "town": "Enfield",
    "lat": 51.6521,
    "lng": -0.0815,
    "radius": 15000
  },
  {
    "town": "Watford",
    "lat": 51.6565,
    "lng": -0.3903,
    "radius": 15000
  },
  {
    "town": "Reading",
    "lat": 51.4543,
    "lng": -0.9781,
    "radius": 20000
  },
  {
    "town": "Guildford",
    "lat": 51.2362,
    "lng": -0.5704,
    "radius": 20000
  },
  {
    "town": "Maidstone",
    "lat": 51.2704,
    "lng": 0.5232,
    "radius": 20000
  },
  {
    "town": "Canterbury",
    "lat": 51.2802,
    "lng": 1.0789,
    "radius": 20000
  },
  {
    "town": "Brighton",
    "lat": 50.8229,
    "lng": -0.1363,
    "radius": 20000
  },
  {
    "town": "Portsmouth",
    "lat": 50.8198,
    "lng": -1.088,
    "radius": 20000
  },
  {
    "town": "Southampton",
    "lat": 50.9097,
    "lng": -1.4044,
    "radius": 20000
  },
  {
    "town": "Basingstoke",
    "lat": 51.2665,
    "lng": -1.0924,
    "radius": 20000
  },
  {
    "town": "Oxford",
    "lat": 51.752,
    "lng": -1.2577,
    "radius": 20000
  },
  {
    "town": "Slough",
    "lat": 51.5105,
    "lng": -0.595,
    "radius": 15000
  },
  {
    "town": "Milton Keynes",
    "lat": 52.0406,
    "lng": -0.7594,
    "radius": 20000
  },
  {
    "town": "Luton",
    "lat": 51.8783,
    "lng": -0.4142,
    "radius": 15000
  },
  {
    "town": "High Wycombe",
    "lat": 51.6286,
    "lng": -0.7482,
    "radius": 15000
  },
  {
    "town": "Aylesbury",
    "lat": 51.8156,
    "lng": -0.8084,
    "radius": 15000
  },
  {
    "town": "Chelmsford",
    "lat": 51.7356,
    "lng": 0.4685,
    "radius": 20000
  },
  {
    "town": "Colchester",
    "lat": 51.8959,
    "lng": 0.8919,
    "radius": 20000
  },
  {
    "town": "Ipswich",
    "lat": 52.0567,
    "lng": 1.1482,
    "radius": 20000
  },
  {
    "town": "Norwich",
    "lat": 52.6309,
    "lng": 1.2974,
    "radius": 25000
  },
  {
    "town": "Cambridge",
    "lat": 52.2053,
    "lng": 0.1218,
    "radius": 20000
  },
  {
    "town": "Bedford",
    "lat": 52.1359,
    "lng": -0.4667,
    "radius": 20000
  },
  {
    "town": "St Albans",
    "lat": 51.7527,
    "lng": -0.3394,
    "radius": 15000
  },
  {
    "town": "Hemel Hempstead",
    "lat": 51.7537,
    "lng": -0.4752,
    "radius": 15000
  },
  {
    "town": "Bristol",
    "lat": 51.4545,
    "lng": -2.5879,
    "radius": 25000
  },
  {
    "town": "Bath",
    "lat": 51.3814,
    "lng": -2.3597,
    "radius": 15000
  },
  {
    "town": "Exeter",
    "lat": 50.7184,
    "lng": -3.5339,
    "radius": 25000
  },
  {
    "town": "Plymouth",
    "lat": 50.3755,
    "lng": -4.1427,
    "radius": 20000
  },
  {
    "town": "Taunton",
    "lat": 51.0153,
    "lng": -3.1068,
    "radius": 20000
  },
  {
    "town": "Yeovil",
    "lat": 50.9422,
    "lng": -2.6337,
    "radius": 20000
  },
  {
    "town": "Swindon",
    "lat": 51.5684,
    "lng": -1.7722,
    "radius": 20000
  },
  {
    "town": "Gloucester",
    "lat": 51.8642,
    "lng": -2.238,
    "radius": 20000
  },
  {
    "town": "Cheltenham",
    "lat": 51.8994,
    "lng": -2.0783,
    "radius": 20000
  },
  {
    "town": "Bournemouth",
    "lat": 50.7192,
    "lng": -1.8808,
    "radius": 20000
  },
  {
    "town": "Poole",
    "lat": 50.715,
    "lng": -1.9872,
    "radius": 15000
  },
  {
    "town": "Salisbury",
    "lat": 51.0688,
    "lng": -1.7945,
    "radius": 20000
  },
  {
    "town": "Truro",
    "lat": 50.2632,
    "lng": -5.051,
    "radius": 25000
  },
  {
    "town": "Penzance",
    "lat": 50.1188,
    "lng": -5.5376,
    "radius": 20000
  },
  {
    "town": "Torquay",
    "lat": 50.4619,
    "lng": -3.5253,
    "radius": 15000
  },
  {
    "town": "Newton Abbot",
    "lat": 50.5294,
    "lng": -3.61,
    "radius": 15000
  },
  {
    "town": "Tiverton",
    "lat": 50.902,
    "lng": -3.4912,
    "radius": 15000
  },
  {
    "town": "Wells",
    "lat": 51.2093,
    "lng": -2.6446,
    "radius": 15000
  },
  {
    "town": "Chippenham",
    "lat": 51.458,
    "lng": -2.1161,
    "radius": 15000
  },
  {
    "town": "Stroud",
    "lat": 51.7457,
    "lng": -2.2178,
    "radius": 15000
  },
  {
    "town": "Leicester",
    "lat": 52.6369,
    "lng": -1.1398,
    "radius": 25000
  },
  {
    "town": "Nottingham",
    "lat": 52.9548,
    "lng": -1.1581,
    "radius": 25000
  },
  {
    "town": "Derby",
    "lat": 52.9225,
    "lng": -1.4746,
    "radius": 20000
  },
  {
    "town": "Northampton",
    "lat": 52.2405,
    "lng": -0.9027,
    "radius": 20000
  },
  {
    "town": "Lincoln",
    "lat": 53.2307,
    "lng": -0.5406,
    "radius": 25000
  },
  {
    "town": "Stoke-on-Trent",
    "lat": 53.0027,
    "lng": -2.1794,
    "radius": 25000
  },
  {
    "town": "Peterborough",
    "lat": 52.5695,
    "lng": -0.2405,
    "radius": 25000
  },
  {
    "town": "Coventry",
    "lat": 52.4068,
    "lng": -1.5197,
    "radius": 20000
  },
  {
    "town": "Nuneaton",
    "lat": 52.5205,
    "lng": -1.4653,
    "radius": 15000
  },
  {
    "town": "Rugby",
    "lat": 52.3709,
    "lng": -1.265,
    "radius": 15000
  },
  {
    "town": "Kettering",
    "lat": 52.3986,
    "lng": -0.7301,
    "radius": 15000
  },
  {
    "town": "Corby",
    "lat": 52.4882,
    "lng": -0.6965,
    "radius": 15000
  },
  {
    "town": "Grantham",
    "lat": 52.912,
    "lng": -0.6437,
    "radius": 15000
  },
  {
    "town": "Boston",
    "lat": 52.9789,
    "lng": -0.0266,
    "radius": 15000
  },
  {
    "town": "Loughborough",
    "lat": 52.7721,
    "lng": -1.2062,
    "radius": 15000
  },
  {
    "town": "Melton Mowbray",
    "lat": 52.7661,
    "lng": -0.8859,
    "radius": 15000
  },
  {
    "town": "Chesterfield",
    "lat": 53.235,
    "lng": -1.4216,
    "radius": 15000
  },
  {
    "town": "Mansfield",
    "lat": 53.1442,
    "lng": -1.1964,
    "radius": 15000
  },
  {
    "town": "Birmingham",
    "lat": 52.4862,
    "lng": -1.8904,
    "radius": 30000
  },
  {
    "town": "Wolverhampton",
    "lat": 52.587,
    "lng": -2.1288,
    "radius": 20000
  },
  {
    "town": "Walsall",
    "lat": 52.5862,
    "lng": -1.9829,
    "radius": 15000
  },
  {
    "town": "Dudley",
    "lat": 52.5123,
    "lng": -2.0811,
    "radius": 15000
  },
  {
    "town": "Solihull",
    "lat": 52.4118,
    "lng": -1.7776,
    "radius": 15000
  },
  {
    "town": "West Bromwich",
    "lat": 52.5187,
    "lng": -1.9923,
    "radius": 15000
  },
  {
    "town": "Stourbridge",
    "lat": 52.457,
    "lng": -2.1479,
    "radius": 15000
  },
  {
    "town": "Hereford",
    "lat": 52.056,
    "lng": -2.7156,
    "radius": 20000
  },
  {
    "town": "Worcester",
    "lat": 52.192,
    "lng": -2.22,
    "radius": 20000
  },
  {
    "town": "Kidderminster",
    "lat": 52.3882,
    "lng": -2.2499,
    "radius": 15000
  },
  {
    "town": "Redditch",
    "lat": 52.3086,
    "lng": -1.9379,
    "radius": 15000
  },
  {
    "town": "Shrewsbury",
    "lat": 52.7073,
    "lng": -2.7553,
    "radius": 20000
  },
  {
    "town": "Telford",
    "lat": 52.6784,
    "lng": -2.4453,
    "radius": 20000
  },
  {
    "town": "Stafford",
    "lat": 52.8067,
    "lng": -2.1201,
    "radius": 20000
  },
  {
    "town": "Cannock",
    "lat": 52.6886,
    "lng": -2.0293,
    "radius": 15000
  },
  {
    "town": "Burton upon Trent",
    "lat": 52.8019,
    "lng": -1.631,
    "radius": 15000
  },
  {
    "town": "Tamworth",
    "lat": 52.634,
    "lng": -1.695,
    "radius": 15000
  },
  {
    "town": "Southend-on-Sea",
    "lat": 51.5459,
    "lng": 0.7077,
    "radius": 15000
  },
  {
    "town": "Huntingdon",
    "lat": 52.3315,
    "lng": -0.1816,
    "radius": 15000
  },
  {
    "town": "Kings Lynn",
    "lat": 52.7517,
    "lng": 0.4023,
    "radius": 20000
  },
  {
    "town": "Great Yarmouth",
    "lat": 52.6083,
    "lng": 1.7365,
    "radius": 15000
  },
  {
    "town": "Lowestoft",
    "lat": 52.48,
    "lng": 1.75,
    "radius": 15000
  },
  {
    "town": "Bury St Edmunds",
    "lat": 52.2464,
    "lng": 0.7185,
    "radius": 15000
  },
  {
    "town": "Stevenage",
    "lat": 51.9038,
    "lng": -0.1966,
    "radius": 15000
  },
  {
    "town": "Welwyn Garden City",
    "lat": 51.8032,
    "lng": -0.2086,
    "radius": 15000
  },
  {
    "town": "Harlow",
    "lat": 51.7678,
    "lng": 0.0878,
    "radius": 15000
  },
  {
    "town": "Leeds",
    "lat": 53.8008,
    "lng": -1.5491,
    "radius": 30000
  },
  {
    "town": "Sheffield",
    "lat": 53.3811,
    "lng": -1.4701,
    "radius": 25000
  },
  {
    "town": "Bradford",
    "lat": 53.796,
    "lng": -1.7594,
    "radius": 25000
  },
  {
    "town": "York",
    "lat": 53.96,
    "lng": -1.0873,
    "radius": 25000
  },
  {
    "town": "Hull",
    "lat": 53.7676,
    "lng": -0.3274,
    "radius": 25000
  },
  {
    "town": "Doncaster",
    "lat": 53.5228,
    "lng": -1.1285,
    "radius": 20000
  },
  {
    "town": "Rotherham",
    "lat": 53.43,
    "lng": -1.357,
    "radius": 15000
  },
  {
    "town": "Barnsley",
    "lat": 53.5526,
    "lng": -1.4797,
    "radius": 15000
  },
  {
    "town": "Wakefield",
    "lat": 53.684,
    "lng": -1.4937,
    "radius": 15000
  },
  {
    "town": "Harrogate",
    "lat": 53.9921,
    "lng": -1.5418,
    "radius": 20000
  },
  {
    "town": "Scarborough",
    "lat": 54.282,
    "lng": -0.401,
    "radius": 20000
  },
  {
    "town": "Halifax",
    "lat": 53.727,
    "lng": -1.8575,
    "radius": 15000
  },
  {
    "town": "Huddersfield",
    "lat": 53.6458,
    "lng": -1.785,
    "radius": 15000
  },
  {
    "town": "Dewsbury",
    "lat": 53.6897,
    "lng": -1.6297,
    "radius": 15000
  },
  {
    "town": "Batley",
    "lat": 53.7113,
    "lng": -1.6257,
    "radius": 15000
  },
  {
    "town": "Keighley",
    "lat": 53.8678,
    "lng": -1.9123,
    "radius": 15000
  },
  {
    "town": "Skipton",
    "lat": 53.9614,
    "lng": -2.0175,
    "radius": 15000
  },
  {
    "town": "Ripon",
    "lat": 54.1356,
    "lng": -1.5203,
    "radius": 15000
  },
  {
    "town": "Thirsk",
    "lat": 54.2326,
    "lng": -1.342,
    "radius": 15000
  },
  {
    "town": "Malton",
    "lat": 54.1356,
    "lng": -0.7978,
    "radius": 15000
  },
  {
    "town": "Pickering",
    "lat": 54.2438,
    "lng": -0.7759,
    "radius": 15000
  },
  {
    "town": "Bridlington",
    "lat": 54.0855,
    "lng": -0.2009,
    "radius": 15000
  },
  {
    "town": "Grimsby",
    "lat": 53.5675,
    "lng": -0.0808,
    "radius": 20000
  },
  {
    "town": "Scunthorpe",
    "lat": 53.5883,
    "lng": -0.6544,
    "radius": 20000
  },
  {
    "town": "Manchester",
    "lat": 53.4808,
    "lng": -2.2426,
    "radius": 30000
  },
  {
    "town": "Liverpool",
    "lat": 53.4084,
    "lng": -2.9916,
    "radius": 25000
  },
  {
    "town": "Bolton",
    "lat": 53.5769,
    "lng": -2.4282,
    "radius": 20000
  },
  {
    "town": "Wigan",
    "lat": 53.5443,
    "lng": -2.631,
    "radius": 15000
  },
  {
    "town": "St Helens",
    "lat": 53.4563,
    "lng": -2.7371,
    "radius": 15000
  },
  {
    "town": "Salford",
    "lat": 53.4875,
    "lng": -2.2901,
    "radius": 15000
  },
  {
    "town": "Oldham",
    "lat": 53.5409,
    "lng": -2.1114,
    "radius": 15000
  },
  {
    "town": "Rochdale",
    "lat": 53.6097,
    "lng": -2.1561,
    "radius": 15000
  },
  {
    "town": "Stockport",
    "lat": 53.4106,
    "lng": -2.1575,
    "radius": 15000
  },
  {
    "town": "Bury",
    "lat": 53.5933,
    "lng": -2.2966,
    "radius": 15000
  },
  {
    "town": "Preston",
    "lat": 53.7632,
    "lng": -2.7031,
    "radius": 25000
  },
  {
    "town": "Blackpool",
    "lat": 53.8161,
    "lng": -3.0559,
    "radius": 20000
  },
  {
    "town": "Lancaster",
    "lat": 54.0466,
    "lng": -2.8007,
    "radius": 20000
  },
  {
    "town": "Blackburn",
    "lat": 53.7486,
    "lng": -2.4875,
    "radius": 15000
  },
  {
    "town": "Burnley",
    "lat": 53.7891,
    "lng": -2.2446,
    "radius": 15000
  },
  {
    "town": "Warrington",
    "lat": 53.39,
    "lng": -2.597,
    "radius": 15000
  },
  {
    "town": "Chester",
    "lat": 53.1934,
    "lng": -2.893,
    "radius": 20000
  },
  {
    "town": "Crewe",
    "lat": 53.099,
    "lng": -2.443,
    "radius": 20000
  },
  {
    "town": "Carlisle",
    "lat": 54.8925,
    "lng": -2.9329,
    "radius": 25000
  },
  {
    "town": "Barrow-in-Furness",
    "lat": 54.111,
    "lng": -3.226,
    "radius": 15000
  },
  {
    "town": "Kendal",
    "lat": 54.328,
    "lng": -2.7463,
    "radius": 15000
  },
  {
    "town": "Penrith",
    "lat": 54.6641,
    "lng": -2.7547,
    "radius": 15000
  },
  {
    "town": "Newcastle",
    "lat": 54.9783,
    "lng": -1.6178,
    "radius": 25000
  },
  {
    "town": "Sunderland",
    "lat": 54.9069,
    "lng": -1.3838,
    "radius": 20000
  },
  {
    "town": "Durham",
    "lat": 54.7753,
    "lng": -1.5849,
    "radius": 20000
  },
  {
    "town": "Middlesbrough",
    "lat": 54.5742,
    "lng": -1.235,
    "radius": 20000
  },
  {
    "town": "Stockton-on-Tees",
    "lat": 54.5705,
    "lng": -1.328,
    "radius": 15000
  },
  {
    "town": "Darlington",
    "lat": 54.5242,
    "lng": -1.5504,
    "radius": 15000
  },
  {
    "town": "Gateshead",
    "lat": 54.9523,
    "lng": -1.634,
    "radius": 15000
  },
  {
    "town": "Washington",
    "lat": 54.902,
    "lng": -1.5202,
    "radius": 15000
  },
  {
    "town": "South Shields",
    "lat": 54.9994,
    "lng": -1.4274,
    "radius": 15000
  },
  {
    "town": "North Shields",
    "lat": 55.009,
    "lng": -1.447,
    "radius": 15000
  },
  {
    "town": "Hexham",
    "lat": 54.9698,
    "lng": -2.106,
    "radius": 15000
  },
  {
    "town": "Alnwick",
    "lat": 55.4127,
    "lng": -1.7063,
    "radius": 15000
  },
  {
    "town": "Morpeth",
    "lat": 55.168,
    "lng": -1.687,
    "radius": 15000
  },
  {
    "town": "Blyth",
    "lat": 55.1268,
    "lng": -1.5133,
    "radius": 15000
  },
  {
    "town": "Berwick-upon-Tweed",
    "lat": 55.7711,
    "lng": -2.0056,
    "radius": 15000
  },
  {
    "town": "Hartlepool",
    "lat": 54.6917,
    "lng": -1.2129,
    "radius": 15000
  },
  {
    "town": "Redcar",
    "lat": 54.6168,
    "lng": -1.07,
    "radius": 15000
  },
  {
    "town": "Glasgow",
    "lat": 55.8609,
    "lng": -4.2514,
    "radius": 30000
  },
  {
    "town": "Edinburgh",
    "lat": 55.9533,
    "lng": -3.1883,
    "radius": 30000
  },
  {
    "town": "Aberdeen",
    "lat": 57.1497,
    "lng": -2.0943,
    "radius": 25000
  },
  {
    "town": "Dundee",
    "lat": 56.462,
    "lng": -2.9707,
    "radius": 25000
  },
  {
    "town": "Inverness",
    "lat": 57.4778,
    "lng": -4.2247,
    "radius": 25000
  },
  {
    "town": "Stirling",
    "lat": 56.1165,
    "lng": -3.9369,
    "radius": 20000
  },
  {
    "town": "Perth",
    "lat": 56.395,
    "lng": -3.4308,
    "radius": 20000
  },
  {
    "town": "Falkirk",
    "lat": 56.0019,
    "lng": -3.7839,
    "radius": 15000
  },
  {
    "town": "Paisley",
    "lat": 55.8473,
    "lng": -4.4401,
    "radius": 15000
  },
  {
    "town": "Hamilton",
    "lat": 55.7776,
    "lng": -4.0537,
    "radius": 15000
  },
  {
    "town": "East Kilbride",
    "lat": 55.7644,
    "lng": -4.1769,
    "radius": 15000
  },
  {
    "town": "Ayr",
    "lat": 55.4586,
    "lng": -4.6292,
    "radius": 20000
  },
  {
    "town": "Kilmarnock",
    "lat": 55.6147,
    "lng": -4.4987,
    "radius": 15000
  },
  {
    "town": "Greenock",
    "lat": 55.9565,
    "lng": -4.7719,
    "radius": 15000
  },
  {
    "town": "Livingston",
    "lat": 55.9007,
    "lng": -3.5181,
    "radius": 15000
  },
  {
    "town": "Dunfermline",
    "lat": 56.0717,
    "lng": -3.4521,
    "radius": 20000
  },
  {
    "town": "Kirkcaldy",
    "lat": 56.1165,
    "lng": -3.1589,
    "radius": 15000
  },
  {
    "town": "Elgin",
    "lat": 57.6494,
    "lng": -3.3143,
    "radius": 15000
  },
  {
    "town": "Forres",
    "lat": 57.609,
    "lng": -3.6165,
    "radius": 15000
  },
  {
    "town": "Oban",
    "lat": 56.4152,
    "lng": -5.471,
    "radius": 15000
  },
  {
    "town": "Fort William",
    "lat": 56.8198,
    "lng": -5.1052,
    "radius": 15000
  },
  {
    "town": "Aviemore",
    "lat": 57.1957,
    "lng": -3.8223,
    "radius": 15000
  },
  {
    "town": "Dumfries",
    "lat": 55.07,
    "lng": -3.603,
    "radius": 20000
  },
  {
    "town": "Stranraer",
    "lat": 54.9034,
    "lng": -5.0248,
    "radius": 15000
  },
  {
    "town": "Galashiels",
    "lat": 55.6147,
    "lng": -2.8068,
    "radius": 15000
  },
  {
    "town": "Hawick",
    "lat": 55.4229,
    "lng": -2.7856,
    "radius": 15000
  },
  {
    "town": "Peebles",
    "lat": 55.6515,
    "lng": -3.1903,
    "radius": 15000
  },
  {
    "town": "Cardiff",
    "lat": 51.4816,
    "lng": -3.1791,
    "radius": 25000
  },
  {
    "town": "Swansea",
    "lat": 51.6214,
    "lng": -3.9436,
    "radius": 25000
  },
  {
    "town": "Newport",
    "lat": 51.5842,
    "lng": -2.998,
    "radius": 20000
  },
  {
    "town": "Wrexham",
    "lat": 53.043,
    "lng": -2.9925,
    "radius": 20000
  },
  {
    "town": "Bangor",
    "lat": 53.2274,
    "lng": -4.1293,
    "radius": 15000
  },
  {
    "town": "Aberystwyth",
    "lat": 52.4153,
    "lng": -4.0829,
    "radius": 15000
  },
  {
    "town": "Carmarthen",
    "lat": 51.8576,
    "lng": -4.3121,
    "radius": 20000
  },
  {
    "town": "Llanelli",
    "lat": 51.6809,
    "lng": -4.1603,
    "radius": 15000
  },
  {
    "town": "Merthyr Tydfil",
    "lat": 51.7487,
    "lng": -3.3817,
    "radius": 15000
  },
  {
    "town": "Pontypridd",
    "lat": 51.6008,
    "lng": -3.3423,
    "radius": 15000
  },
  {
    "town": "Caerphilly",
    "lat": 51.5785,
    "lng": -3.2181,
    "radius": 15000
  },
  {
    "town": "Bridgend",
    "lat": 51.5043,
    "lng": -3.5769,
    "radius": 15000
  },
  {
    "town": "Neath",
    "lat": 51.662,
    "lng": -3.8043,
    "radius": 15000
  },
  {
    "town": "Barry",
    "lat": 51.3995,
    "lng": -3.2715,
    "radius": 15000
  },
  {
    "town": "Colwyn Bay",
    "lat": 53.2932,
    "lng": -3.7276,
    "radius": 15000
  },
  {
    "town": "Rhyl",
    "lat": 53.3191,
    "lng": -3.4916,
    "radius": 15000
  },
  {
    "town": "Prestatyn",
    "lat": 53.337,
    "lng": -3.4078,
    "radius": 15000
  },
  {
    "town": "Llandudno",
    "lat": 53.3241,
    "lng": -3.8276,
    "radius": 15000
  },
  {
    "town": "Caernarfon",
    "lat": 53.1397,
    "lng": -4.2739,
    "radius": 15000
  },
  {
    "town": "Porthmadog",
    "lat": 52.9281,
    "lng": -4.1337,
    "radius": 15000
  },
  {
    "town": "Machynlleth",
    "lat": 52.5903,
    "lng": -3.8533,
    "radius": 15000
  },
  {
    "town": "Newtown",
    "lat": 52.5153,
    "lng": -3.3125,
    "radius": 15000
  },
  {
    "town": "Welshpool",
    "lat": 52.6605,
    "lng": -3.146,
    "radius": 15000
  },
  {
    "town": "Belfast",
    "lat": 54.5973,
    "lng": -5.9301,
    "radius": 25000
  },
  {
    "town": "Derry",
    "lat": 54.9966,
    "lng": -7.3086,
    "radius": 20000
  },
  {
    "town": "Lisburn",
    "lat": 54.512,
    "lng": -6.0311,
    "radius": 15000
  },
  {
    "town": "Newry",
    "lat": 54.1751,
    "lng": -6.3402,
    "radius": 15000
  },
  {
    "town": "Armagh",
    "lat": 54.3503,
    "lng": -6.6528,
    "radius": 15000
  },
  {
    "town": "Enniskillen",
    "lat": 54.3438,
    "lng": -7.631,
    "radius": 20000
  },
  {
    "town": "Omagh",
    "lat": 54.5977,
    "lng": -7.31,
    "radius": 15000
  },
  {
    "town": "Coleraine",
    "lat": 55.1326,
    "lng": -6.6646,
    "radius": 15000
  },
  {
    "town": "Ballymena",
    "lat": 54.8636,
    "lng": -6.2786,
    "radius": 15000
  },
  {
    "town": "Banbridge",
    "lat": 54.3487,
    "lng": -6.27,
    "radius": 15000
  }
];

module.exports = { UK_SEARCH_LOCATIONS };
