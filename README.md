# SoundStage — Instrument Store

Four containers on one bridge network (`store-net`): `proxy` (Nginx, the only published port, 8080), `frontend` (React + Nginx), `backend` (Node/Express) and `db` (MySQL 8, named volume `db-data`, not exposed to the host; schema baked into the image from `db/schema.sql`).

## Run
```
docker compose up --build
```
- Store UI (single entry point via proxy): http://localhost:8080
- API health: http://localhost:8080/api/health
- Products: http://localhost:8080/api/products

Credentials default to the values in `.env.example`; copy it to `.env` to override.
The schema only runs on first start; to reseed run `docker compose down -v`.

## Test an order
```
curl -X POST http://localhost:8080/api/orders -H "Content-Type: application/json" \
  -d '{"customer_name":"Ana","items":[{"id":1,"quantity":1}]}'
```

## Unit tests
`cd backend && npm install && npm test` / `cd frontend && npm install && npm test`

## Jenkins (in Docker)
```
cd infra/jenkins && docker compose up -d --build
```
UI at http://localhost:8081 (initial password: `docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`).
Create a Pipeline job pointing at this repo's `Jenkinsfile`. Stages: Checkout → Test (`docker build --target test`) → Build Images (tag = build number) → Deploy → Smoke Test.
