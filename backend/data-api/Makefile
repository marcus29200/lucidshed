POETRY ?= poetry

install-dev:
	$(POETRY) install --no-cache

install:
	$(POETRY) install --no-dev --no-cache

format:
	$(POETRY) run isort .
	$(POETRY) run black .
	$(POETRY) run flake8 app tests
	$(POETRY) run mypy -p app

api:
	$(POETRY) run api