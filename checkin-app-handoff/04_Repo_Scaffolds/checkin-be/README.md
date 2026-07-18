# checkin-be

NestJS 10 + Prisma + Postgres. Multi-tenant with Postgres RLS. See `../../03_Antigravity_Prompt/MASTER_PROMPT.md`.

## Dev
```
cp .env.example .env
npm install
docker run --name pg -e POSTGRES_PASSWORD=app -e POSTGRES_USER=app -e POSTGRES_DB=checkin -p 5432:5432 -d postgres:15
npx prisma migrate dev
npm run start:dev
```

## Modules to build
See `src/modules/README.md` for the ordered list. Follow milestones in the master prompt.
