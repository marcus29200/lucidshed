FROM python:3.11.1-slim


RUN mkdir /app 
COPY /app /app
COPY pyproject.toml /app 

WORKDIR /app

ENV PYTHONPATH=${PYTHONPATH}:${PWD} 

RUN pip3 install poetry
RUN poetry config virtualenvs.create false

# Eventually we want a dev and prod build, one to run tests against and another to release
RUN poetry install --no-dev

ENTRYPOINT ["poetry", "run", "api"]