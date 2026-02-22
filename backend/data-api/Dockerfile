# Use an official Python runtime as a parent image
FROM python:3.13.12-slim

# Install system dependencies needed for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential

# Install UV
RUN pip install --no-cache-dir uv

# create new user
RUN useradd -m lucid

USER lucid

COPY --chown=lucid . /app

# Set the working directory in the container
WORKDIR /app

RUN uv sync

# Expose the port the app runs on (if sapplicable)
EXPOSE 8080

# Define the command to run your application
ENTRYPOINT ["uv", "run", "api"]
