## Prerequisites

Install these before getting started

- [Docker Compose](https://docs.docker.com/compose/install/)
- [Poetry](https://python-poetry.org/)
- [Pyenv](https://github.com/pyenv/pyenv)



## Running the project

### Running project for frontend development

- Run `docker compose up` inside `backend/data-api/`, this should start the db and api on http://localhost:8080

### Prereq to backend dev
- Clone the project into a directory
`git clone git@github.com:LucidShed/shed.git`
- Set up pyenv, use python 3.12
`cd backend/data-api;`
`pyenv local 3.12.3`
- Create a venv in the `backend/data-api` directory
`pyenv exec python3 -m venv .venv`
- Activate your `venv`
`source .venv/bin/activate`

### Running project for backend development

- Set up Python 3.12 using pyenv 
- Run `make install-dev` in `backend/data-api/` to install packages
- Run `docker compose up -d db` inside `backend/data-api/`
- Run `make api` to start the api inside `backend/data-api/`

### Running tests
- Run `poetry run pytest -n auto` to run all tests or define a specific test to run
