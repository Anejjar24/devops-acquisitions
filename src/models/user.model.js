import { timestamp, unique } from 'drizzle-orm/pg-core';
import { serial, varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const users=pgTable('users',
  {
    id:serial('id').primaryKey(),
    name:varchar('name',{length:255}).notNull(),
    email:varchar('email',{length:255}).notNull().unique(),
    password:varchar('password',{length:255}).notNull(),
    role:varchar('role',{length:255}).notNull().default('user'),
    created_at:timestamp().defaultNow().notNull(),
    undated_at:timestamp().defaultNow().notNull(),

  }
);