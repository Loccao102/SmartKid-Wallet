# Supabase schema files

`research_events.sql` is the canonical DDL for the first SmartKid Wallet backend slice.

It is intentionally stored as schema source until a dedicated SmartKid Supabase project is selected/created and the migration is applied through Supabase tooling.

Do not apply this file to an unrelated project.

After the dedicated project exists:
- apply the DDL as a named Supabase migration;
- run security/performance advisors;
- verify RLS and Data API grants;
- then record the resulting migration/version in this repository.
