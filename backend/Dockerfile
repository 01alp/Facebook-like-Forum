FROM golang:1.21.4-alpine


# Install build dependencies // cgg
RUN apk add --no-cache gcc musl-dev


# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code.
COPY . .
# Sqlite3 will error if this is 0
ENV CGO_ENABLED=1 

# Build
RUN go build -o main