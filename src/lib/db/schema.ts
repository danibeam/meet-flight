import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const searches = sqliteTable('searches', {
  id: text('id').primaryKey(),
  status: text('status', { enum: ['pending', 'in_progress', 'completed'] }).notNull().default('pending'),
  dateRangeStart: text('date_range_start').notNull(),
  dateRangeEnd: text('date_range_end').notNull(),
  durationMin: integer('duration_min').notNull().default(2),
  durationMax: integer('duration_max').notNull().default(4),
  nonStop: integer('non_stop', { mode: 'boolean' }).notNull().default(false),
  resultsJson: text('results_json'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  resolvedAt: text('resolved_at'),
});

export const travelers = sqliteTable('travelers', {
  id: text('id').primaryKey(),
  searchId: text('search_id').notNull().references(() => searches.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  originCode: text('origin_code'),
  isLocal: integer('is_local', { mode: 'boolean' }).notNull().default(false),
});

export const destinations = sqliteTable('destinations', {
  id: text('id').primaryKey(),
  searchId: text('search_id').notNull().references(() => searches.id, { onDelete: 'cascade' }),
  cityCode: text('city_code').notNull(),
  cityName: text('city_name').notNull(),
});

export const airports = sqliteTable('airports', {
  code: text('code').primaryKey(),
  name: text('name').notNull(),
  cityCode: text('city_code'),
  cityName: text('city_name'),
  country: text('country'),
  type: text('type', { enum: ['AIRPORT', 'CITY'] }).notNull(),
});

export const exchangeRates = sqliteTable('exchange_rates', {
  currency: text('currency').primaryKey(),
  rateToEur: real('rate_to_eur').notNull(),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Search = typeof searches.$inferSelect;
export type NewSearch = typeof searches.$inferInsert;
export type Traveler = typeof travelers.$inferSelect;
export type NewTraveler = typeof travelers.$inferInsert;
export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
export type Airport = typeof airports.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
