import { db } from '@/lib/db';
import { airports } from '@/lib/db/schema';
import { readFileSync } from 'fs';
import { join } from 'path';

interface AirportRow {
  code: string;
  name: string;
  cityCode: string;
  cityName: string;
  country: string;
  type: 'AIRPORT' | 'CITY';
}

const SAMPLE_AIRPORTS: AirportRow[] = [
  { code: 'MAD', name: 'Adolfo Suarez Madrid-Barajas', cityCode: 'MAD', cityName: 'Madrid', country: 'Spain', type: 'AIRPORT' },
  { code: 'BCN', name: 'Barcelona El Prat', cityCode: 'BCN', cityName: 'Barcelona', country: 'Spain', type: 'AIRPORT' },
  { code: 'LHR', name: 'London Heathrow', cityCode: 'LON', cityName: 'London', country: 'United Kingdom', type: 'AIRPORT' },
  { code: 'LGW', name: 'London Gatwick', cityCode: 'LON', cityName: 'London', country: 'United Kingdom', type: 'AIRPORT' },
  { code: 'STN', name: 'London Stansted', cityCode: 'LON', cityName: 'London', country: 'United Kingdom', type: 'AIRPORT' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', cityCode: 'PAR', cityName: 'Paris', country: 'France', type: 'AIRPORT' },
  { code: 'ORY', name: 'Paris Orly', cityCode: 'PAR', cityName: 'Paris', country: 'France', type: 'AIRPORT' },
  { code: 'FRA', name: 'Frankfurt am Main', cityCode: 'FRA', cityName: 'Frankfurt', country: 'Germany', type: 'AIRPORT' },
  { code: 'MUC', name: 'Munich', cityCode: 'MUC', cityName: 'Munich', country: 'Germany', type: 'AIRPORT' },
  { code: 'AMS', name: 'Amsterdam Schiphol', cityCode: 'AMS', cityName: 'Amsterdam', country: 'Netherlands', type: 'AIRPORT' },
  { code: 'FCO', name: 'Rome Fiumicino', cityCode: 'ROM', cityName: 'Rome', country: 'Italy', type: 'AIRPORT' },
  { code: 'CIA', name: 'Rome Ciampino', cityCode: 'ROM', cityName: 'Rome', country: 'Italy', type: 'AIRPORT' },
  { code: 'LIS', name: 'Lisbon Humberto Delgado', cityCode: 'LIS', cityName: 'Lisbon', country: 'Portugal', type: 'AIRPORT' },
  { code: 'DUB', name: 'Dublin', cityCode: 'DUB', cityName: 'Dublin', country: 'Ireland', type: 'AIRPORT' },
  { code: 'ZRH', name: 'Zurich', cityCode: 'ZRH', cityName: 'Zurich', country: 'Switzerland', type: 'AIRPORT' },
  { code: 'GVA', name: 'Geneva', cityCode: 'GVA', cityName: 'Geneva', country: 'Switzerland', type: 'AIRPORT' },
  { code: 'VIE', name: 'Vienna International', cityCode: 'VIE', cityName: 'Vienna', country: 'Austria', type: 'AIRPORT' },
  { code: 'CPH', name: 'Copenhagen Kastrup', cityCode: 'CPH', cityName: 'Copenhagen', country: 'Denmark', type: 'AIRPORT' },
  { code: 'ARN', name: 'Stockholm Arlanda', cityCode: 'STO', cityName: 'Stockholm', country: 'Sweden', type: 'AIRPORT' },
  { code: 'OSL', name: 'Oslo Gardermoen', cityCode: 'OSL', cityName: 'Oslo', country: 'Norway', type: 'AIRPORT' },
  { code: 'WAW', name: 'Warsaw Chopin', cityCode: 'WAW', cityName: 'Warsaw', country: 'Poland', type: 'AIRPORT' },
  { code: 'PRG', name: 'Prague Vaclav Havel', cityCode: 'PRG', cityName: 'Prague', country: 'Czech Republic', type: 'AIRPORT' },
  { code: 'BUD', name: 'Budapest Ferenc Liszt', cityCode: 'BUD', cityName: 'Budapest', country: 'Hungary', type: 'AIRPORT' },
  { code: 'ATH', name: 'Athens Eleftherios Venizelos', cityCode: 'ATH', cityName: 'Athens', country: 'Greece', type: 'AIRPORT' },
  { code: 'BRU', name: 'Brussels National', cityCode: 'BRU', cityName: 'Brussels', country: 'Belgium', type: 'AIRPORT' },
  { code: 'HEL', name: 'Helsinki Vantaa', cityCode: 'HEL', cityName: 'Helsinki', country: 'Finland', type: 'AIRPORT' },
  { code: 'JFK', name: 'New York John F Kennedy', cityCode: 'NYC', cityName: 'New York', country: 'United States', type: 'AIRPORT' },
  { code: 'EWR', name: 'New York Newark', cityCode: 'NYC', cityName: 'New York', country: 'United States', type: 'AIRPORT' },
  { code: 'LAX', name: 'Los Angeles International', cityCode: 'LAX', cityName: 'Los Angeles', country: 'United States', type: 'AIRPORT' },
  { code: 'SFO', name: 'San Francisco International', cityCode: 'SFO', cityName: 'San Francisco', country: 'United States', type: 'AIRPORT' },
  { code: 'ORD', name: 'Chicago O Hare', cityCode: 'CHI', cityName: 'Chicago', country: 'United States', type: 'AIRPORT' },
  { code: 'MIA', name: 'Miami International', cityCode: 'MIA', cityName: 'Miami', country: 'United States', type: 'AIRPORT' },
  { code: 'GRU', name: 'Sao Paulo Guarulhos', cityCode: 'SAO', cityName: 'Sao Paulo', country: 'Brazil', type: 'AIRPORT' },
  { code: 'EZE', name: 'Buenos Aires Ezeiza', cityCode: 'BUE', cityName: 'Buenos Aires', country: 'Argentina', type: 'AIRPORT' },
  { code: 'MEX', name: 'Mexico City International', cityCode: 'MEX', cityName: 'Mexico City', country: 'Mexico', type: 'AIRPORT' },
  { code: 'NRT', name: 'Tokyo Narita', cityCode: 'TYO', cityName: 'Tokyo', country: 'Japan', type: 'AIRPORT' },
  { code: 'HND', name: 'Tokyo Haneda', cityCode: 'TYO', cityName: 'Tokyo', country: 'Japan', type: 'AIRPORT' },
  { code: 'HKG', name: 'Hong Kong International', cityCode: 'HKG', cityName: 'Hong Kong', country: 'Hong Kong', type: 'AIRPORT' },
  { code: 'SIN', name: 'Singapore Changi', cityCode: 'SIN', cityName: 'Singapore', country: 'Singapore', type: 'AIRPORT' },
  { code: 'DXB', name: 'Dubai International', cityCode: 'DXB', cityName: 'Dubai', country: 'UAE', type: 'AIRPORT' },
  { code: 'IST', name: 'Istanbul Airport', cityCode: 'IST', cityName: 'Istanbul', country: 'Turkey', type: 'AIRPORT' },
  { code: 'LON', name: 'London (all airports)', cityCode: 'LON', cityName: 'London', country: 'United Kingdom', type: 'CITY' },
  { code: 'PAR', name: 'Paris (all airports)', cityCode: 'PAR', cityName: 'Paris', country: 'France', type: 'CITY' },
  { code: 'ROM', name: 'Rome (all airports)', cityCode: 'ROM', cityName: 'Rome', country: 'Italy', type: 'CITY' },
  { code: 'STO', name: 'Stockholm (all airports)', cityCode: 'STO', cityName: 'Stockholm', country: 'Sweden', type: 'CITY' },
  { code: 'NYC', name: 'New York (all airports)', cityCode: 'NYC', cityName: 'New York', country: 'United States', type: 'CITY' },
  { code: 'TYO', name: 'Tokyo (all airports)', cityCode: 'TYO', cityName: 'Tokyo', country: 'Japan', type: 'CITY' },
  { code: 'SAO', name: 'Sao Paulo (all airports)', cityCode: 'SAO', cityName: 'Sao Paulo', country: 'Brazil', type: 'CITY' },
  { code: 'CHI', name: 'Chicago (all airports)', cityCode: 'CHI', cityName: 'Chicago', country: 'United States', type: 'CITY' },
  { code: 'BUE', name: 'Buenos Aires (all airports)', cityCode: 'BUE', cityName: 'Buenos Aires', country: 'Argentina', type: 'CITY' },
];

async function seedAirports() {
  console.log('Seeding airports...');

  let csvPath: string | null = null;
  try {
    csvPath = join(process.cwd(), 'data', 'airports.csv');
    readFileSync(csvPath);
  } catch {
    console.log('No airports.csv found, using built-in sample data');
  }

  const rows = SAMPLE_AIRPORTS.map((a) => ({ ...a }));

  for (const row of rows) {
    await db
      .insert(airports)
      .values(row)
      .onConflictDoUpdate({
        target: airports.code,
        set: {
          name: row.name,
          cityCode: row.cityCode,
          cityName: row.cityName,
          country: row.country,
          type: row.type,
        },
      });
  }

  console.log(`Seeded ${rows.length} airports.`);
}

seedAirports().then(() => process.exit(0)).catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
