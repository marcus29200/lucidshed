FROM python:3.11.1-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the project files to the working directory
COPY backend/data-api/ .

# Install Poetry
RUN pip install poetry

# List files in the working directory to debug
RUN ls -al /usr/src/app

# Configure Poetry to not create virtual environments
RUN poetry config virtualenvs.create false

# Install dependencies (for production, excluding dev dependencies)
RUN poetry install --no-dev

# Set the entrypoint to run the application using Poetry
ENTRYPOINT ["poetry", "run", "api"]
