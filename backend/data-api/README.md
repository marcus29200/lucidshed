## Prerequisites

Install these before getting started

- [Docker Compose](https://docs.docker.com/compose/install/)
- [UV](https://docs.astral.sh/uv/getting-started/installation/)
- [Pyenv](https://github.com/pyenv/pyenv)


## Running the project

### Prereq to backend development
- Clone the project into a directory
  - `git clone git@github.com:LucidShed/shed.git`
- Set up pyenv, use python 3.13
  - `cd backend/data-api`
  - `pyenv local 3.13`

### Running project for backend development and frontend development

- Set up Python 3.13 using pyenv 
- Run `make install-dev` in `backend/data-api/` to install packages
- Run `docker compose up -d db` inside `backend/data-api/`
- Run `make api` to start the api inside `backend/data-api/`

### Running tests
- Run `uv run pytest -n auto` to run all tests or define a specific test to run
  - Exclude `-n auto` if you don't want to run them in parallel.
