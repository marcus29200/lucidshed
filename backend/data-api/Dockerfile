# Use an official Python runtime as a parent image
FROM python:3.12.5-slim

# Copy only the pyproject.toml and poetry.lock files to the container first
COPY . /app

# Set the working directory in the container
WORKDIR /app

# Install system dependencies needed for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential

# Install Poetry
RUN pip install --no-cache-dir poetry

# Disable virtual environments in Poetry
RUN poetry config virtualenvs.create false

# create new user
RUN useradd -m lucid

USER lucid

# Install dependencies with --no-dev if you don't need development dependencies
RUN poetry install --no-dev

# Expose the port the app runs on (if sapplicable)
EXPOSE 8080

# Define the command to run your application
ENTRYPOINT ["poetry", "run", "api"]
