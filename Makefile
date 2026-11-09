.PHONY: setup dev build test lint typecheck format format-fix db-generate db-migrate db-push db-seed docker-up docker-down docker-build clean

setup:
	pnpm install
	pnpm run db:generate

dev:
	pnpm run dev

build:
	pnpm run db:generate
	pnpm run build

test:
	pnpm run test

lint:
	pnpm run lint

typecheck:
	pnpm run typecheck

format:
	pnpm run format

format-fix:
	pnpm run format:fix

db-generate:
	pnpm run db:generate

db-migrate:
	pnpm run db:migrate

db-push:
	pnpm run db:push

db-seed:
	pnpm run db:seed

docker-up:
	@if docker compose version >/dev/null 2>&1; then \
		docker compose up -d postgres; \
	elif command -v docker-compose >/dev/null 2>&1; then \
		docker-compose up -d postgres; \
	else \
		docker run -d --name musang-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgrespassword -e POSTGRES_DB=musang_blacklist -p 5432:5432 -v pgdata:/var/lib/postgresql/data --restart unless-stopped postgres:16-alpine; \
	fi

docker-down:
	@if docker compose version >/dev/null 2>&1; then \
		docker compose down; \
	elif command -v docker-compose >/dev/null 2>&1; then \
		docker-compose down; \
	else \
		docker stop musang-postgres 2>/dev/null || true; \
		docker rm musang-postgres 2>/dev/null || true; \
	fi

docker-build:
	docker compose up -d --build

clean:
	rm -rf .next out dist coverage
