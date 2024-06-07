POETRY ?= poetry

install-dev:
	$(POETRY) install --no-cache

install:
	$(POETRY) install --no-dev --no-cache

format:
	$(POETRY) run isort .
	$(POETRY) run black .
	$(POETRY) run flake8 data_api tests
	$(POETRY) run mypy -p data_api