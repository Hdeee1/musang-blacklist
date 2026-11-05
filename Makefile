.PHONY: setup dev build test lint typecheck format format-fix clean

setup:
	pnpm install

dev:
	pnpm run dev

build:
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

clean:
	rm -rf .next out dist coverage
