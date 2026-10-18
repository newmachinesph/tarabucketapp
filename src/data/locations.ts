// Philippine locations for the discovery location picker.
// ponytail: comprehensive curated list (all major cities + popular destinations),
// grouped by region and searchable — not an exhaustive enumeration of all 1,600+
// municipalities. Add more entries here if a specific town is needed.

export type LocationGroup = { region: string; places: string[] };

export const PH_LOCATIONS: LocationGroup[] = [
  {
    region: 'Metro Manila',
    places: [
      'Makati', 'Bonifacio Global City', 'Ortigas', 'Quezon City', 'Manila',
      'Pasig', 'Mandaluyong', 'San Juan', 'Parañaque', 'Muntinlupa (Alabang)',
      'Pasay', 'Las Piñas', 'Marikina', 'Taguig', 'Pateros', 'Caloocan',
      'Valenzuela', 'Malabon', 'Navotas',
    ],
  },
  {
    region: 'Luzon',
    places: [
      'Baguio', 'Angeles (Clark)', 'San Fernando (Pampanga)', 'Subic', 'Olongapo',
      'Tarlac City', 'Cabanatuan', 'Dagupan', 'San Fernando (La Union)', 'Vigan',
      'Laoag', 'Tuguegarao', 'Batangas City', 'Lipa', 'Tagaytay', 'Lucena',
      'Calamba', 'Santa Rosa (Laguna)', 'Antipolo', 'Naga', 'Legazpi', 'Sorsogon City',
    ],
  },
  {
    region: 'Popular escapes',
    places: [
      'El Nido', 'Coron', 'Puerto Princesa', 'Boracay (Aklan)', 'Siargao',
      'Sagada', 'La Union (San Juan)', 'Baler', 'Puerto Galera', 'Camiguin',
      'Bantayan Island', 'Siquijor', 'Batanes',
    ],
  },
  {
    region: 'Visayas',
    places: [
      'Cebu City', 'Mandaue', 'Lapu-Lapu', 'Iloilo City', 'Bacolod', 'Tacloban',
      'Dumaguete', 'Tagbilaran (Bohol)', 'Roxas City', 'Kalibo', 'Ormoc',
    ],
  },
  {
    region: 'Mindanao',
    places: [
      'Davao City', 'Cagayan de Oro', 'Zamboanga City', 'General Santos', 'Butuan',
      'Iligan', 'Cotabato City', 'Surigao City', 'Dipolog', 'Pagadian', 'Koronadal', 'Valencia',
    ],
  },
];

export const DEFAULT_LOCATION = 'Makati';
