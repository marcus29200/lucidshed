POETRY ?= poetry

install-dev:
	$(POETRY) install --no-cache

install:
	$(POETRY) install --without dev --no-cache

format:
	$(POETRY) run isort .
	$(POETRY) run black .
	$(POETRY) run flake8 app tests
	$(POETRY) run mypy -p app

db-up:
	docker compose up -d db

db-down:
	docker compose down

api:
	$(POETRY) run api

test:
	$(POETRY) run pytest -n auto

coverage:
	$(POETRY) run pytest -n auto --cov=app --cov-report=html