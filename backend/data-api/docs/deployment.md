#### General Info
The purpose of this doc is to outline how the data api application is deployed.

#### Technologies
- Everything is currently in GCP
- Cloud run
- CloudSQL (Postgres)

#### Deployment Info
- Cloud run
    - The main app is hosted here.
    - Any scheduled commands or upgrades will also probably run here (none as of this writing).
- CloudSQL
    - Our main database, this is where organization databases and the user database is held.

#### Release Methodology
- To deploy a new version of the data api:
    - Push your changes to `main`.
    - Wait for test checks to pass.
    - Create a new tag + release in Github.
        - This will trigger an action to deploy to GCP.
    - Wait for build to run, and changes should automatically deploy to Cloud Run.

#### Configuration
- All configuration should be done via environment variables
    - These are configured inside of the Cloud Run revision management screen.
    - Anything sensitive should be configured as a secret. 