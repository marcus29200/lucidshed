## TODO
- Pull out org id to control which db we connect to when doing a request?
- Implement auth
- Implement history api
- Primary key on id/org id?
- Add support for a header that allows us to retrieve deleted items
- Handling for disabled objects
- Tie engineering items to actual users (replace the test@test.com stuff)


## Prerequisites

Install these before getting started

- [Docker Compose](https://docs.docker.com/compose/install/)
- [Poetry](https://python-poetry.org/)
- [Pyenv](https://github.com/pyenv/pyenv)


## Running the project

### Setup

- Set up Python 3.12 using pyenv 
- Run `poetry shell` to start your virtual env
- Run `make install` in this directory to install packages


### Running project

- Run `docker compose up` inside `data-api/`
- Run `make api` in another terminal inside `data-api/`, which starts the API on localhost:8080
