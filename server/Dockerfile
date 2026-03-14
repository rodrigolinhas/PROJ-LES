# ============================================
# STEP 1: Build
# ============================================
# Use the official Go image based on Alpine Linux
FROM golang:1.25-alpine AS builder
WORKDIR /app

# Install C compiler and standard library headers.
# Required because the SQLite driver (mattn/go-sqlite3) is a C library
# that needs CGO (Go's C interop) to compile.
RUN apk add --no-cache gcc musl-dev

# Copy dependency files first, before source code.
# This optimizes Docker cache: dependencies are only re-downloaded
# when go.mod/go.sum change, not on every code change.
COPY go.mod go.sum ./
RUN go mod download

# Now copy the rest of the source code
COPY . .

# Compile the Go binary with CGO enabled (required for SQLite)
RUN CGO_ENABLED=1 GOOS=linux go build -o servidor ./cmd

# ============================================
# STEP 2: Runtime
# ============================================
# Use a minimal Alpine image for the final container.
# This image is ~5MB vs ~500MB for the full Go build image,
# keeping the production container small and secure.
FROM alpine:latest
WORKDIR /app

# Install C library compatibility layer.
# Needed because the binary was compiled with CGO (linked to musl libc).
RUN apk add --no-cache libc6-compat

# Copy only the compiled binary from step 1 (no source code needed)
COPY --from=builder /app/servidor .

# Create the cmd directory to maintain compatibility with the Go code.
# The app calls godotenv.Load("../.env") which expects to run from a
# subdirectory — by setting WORKDIR to /app/cmd, "../.env" resolves to /app/.env
RUN mkdir -p cmd

EXPOSE 8080

WORKDIR /app/cmd
CMD ["/app/servidor"]
