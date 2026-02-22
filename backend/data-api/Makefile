install-dev:
	uv sync

install:
	uv sync --no-dev

format:
	uv run isort .
	uv run black .
	uv run flake8 app tests
	uv run mypy -p app

docker-test:
	docker build .

db-up:
	docker compose up -d db

db-down:
	docker compose down

api:
	uv run api

test:
	uv run pytest -n auto

coverage:
	uv run pytest -n auto --cov=app --cov-report=html