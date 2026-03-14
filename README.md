# PROJ-LES
Project for LES course (PL01)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed
- [Go](https://go.dev/dl/) (only needed if generating Swagger docs locally)

## Running with Docker

1. Create the environment file from the example template:
   ```bash
   cp .env.example .env
   ```
2. Fill in the `.env` file with your actual credentials (Google OAuth, session secret, etc.)

3. Generate the Swagger documentation (requires `swag`, see section below):
   ```bash
   cd server
   swag init -g cmd/main.go
   cd ..
   ```

4. Build and start all services:
   ```bash
   docker compose up --build
   ```

5. Access the application:
    - **Frontend**: http://localhost:5173
    - **Backend API**: http://localhost:8080/ping
    - **Swagger Docs**: http://localhost:8080/docs/index.html

6. To stop all services:
   ```bash
   docker compose down
   ```

> **Note:** The SQLite database is persisted in a Docker volume (`sqlite_data`). Running `docker compose down` will keep your data. To also delete the database, use `docker compose down -v`.

## Generating Swagger Documentation

1. Make sure the `swag` command can be executed on the `/server` project. If the command is not recognized, consider one of the following options:
    - Installing `swag` with: `go install github.com/swaggo/swag/cmd/swag@latest`
    - Adding `$GOPATH/bin` to your `PATH` environment variable
    - (Linux) Executing `swag` from `~/go/bin/swag`
2. Run the following command on the `/server` project: `swag init -g cmd/main.go`

After this the documentation can be read with a web browser on the endpoint `/docs/index.html`

## Project Structure (TODO)

```
├── client/             # Frontend (React + Vite + TypeScript)
│   └── Dockerfile      # Multi-stage build: Node → Nginx
├── server/             # Backend (Go + Gin)
│   └── Dockerfile      # Multi-stage build: Go + CGO → Alpine
├── docker-compose.yml  # Orchestrates frontend + backend containers
└── .env                # Environment variables (not committed to git)
```
