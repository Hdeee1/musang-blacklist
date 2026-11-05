.PHONY: setup dev build test lint typecheck format format-fix db-generate db-migrate db-push db-seed clean

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

clean:
	rm -rf .next out dist coverage

