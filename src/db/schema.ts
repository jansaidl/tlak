import {
  pgTable,
  text,
  timestamp,
  integer,
  serial,
  boolean,
  smallint,
  primaryKey,
  index,
  uniqueIndex,
  date,
  jsonb,
} from 'drizzle-orm/pg-core'

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),

  birthDate: date('birth_date'),
  sex: text('sex'),
  heightCm: integer('height_cm'),
  medication: text('medication'),
  locale: text('locale').default('en').notNull(),
  timezone: text('timezone').default('Europe/Prague').notNull(),
  remindMorning: boolean('remind_morning').default(true).notNull(),
  remindEvening: boolean('remind_evening').default(true).notNull(),
  remindWeightWeekly: boolean('remind_weight_weekly').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const passkeys = pgTable(
  'passkey',
  {
    credentialId: text('credential_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    publicKey: text('public_key').notNull(),
    counter: integer('counter').notNull(),
    deviceType: text('device_type').notNull(),
    backedUp: boolean('backed_up').notNull(),
    transports: text('transports'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
    label: text('label'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.credentialId] }),
    userIdx: index('passkey_user_idx').on(t.userId),
  }),
)

// Temporary storage for WebAuthn challenges during registration/login ceremony.
export const webauthnChallenges = pgTable('webauthn_challenge', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email'),
  userId: text('user_id'),
  challenge: text('challenge').notNull(),
  kind: text('kind').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
})

export const measurements = pgTable(
  'measurement',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    measuredAt: timestamp('measured_at', { withTimezone: true }).notNull(),
    systolic: smallint('systolic').notNull(),
    diastolic: smallint('diastolic').notNull(),
    pulse: smallint('pulse'),
    arm: text('arm'),
    context: text('context'),
    medsTaken: boolean('meds_taken').default(false).notNull(),
    lifestyle: jsonb('lifestyle').$type<{
      poorSleep?: boolean
      stress?: boolean
      exercise?: boolean
      alcohol?: boolean
      coffee?: boolean
      salt?: boolean
    }>(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userTimeIdx: index('measurement_user_time_idx').on(t.userId, t.measuredAt),
  }),
)

export const weightEntries = pgTable(
  'weight_entry',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    measuredAt: timestamp('measured_at', { withTimezone: true }).notNull(),
    weightKgX10: integer('weight_kg_x10').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userTimeIdx: index('weight_user_time_idx').on(t.userId, t.measuredAt),
  }),
)

export const pushSubscriptions = pgTable(
  'push_subscription',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    endpointIdx: uniqueIndex('push_endpoint_uniq').on(t.endpoint),
  }),
)

export type User = typeof users.$inferSelect
export type Passkey = typeof passkeys.$inferSelect
export type Measurement = typeof measurements.$inferSelect
export type NewMeasurement = typeof measurements.$inferInsert
export type WeightEntry = typeof weightEntries.$inferSelect
export type NewWeightEntry = typeof weightEntries.$inferInsert
