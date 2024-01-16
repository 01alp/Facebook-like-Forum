FROM golang:1.21.4-alpine


# Install build dependencies // cgg
RUN apk add --no-cache gcc musl-dev


# Set destination for COPY
WORKDIR /go/src/app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code.
COPY . .
# Sqlite3 will error if this is 0
ENV CGO_ENABLED=1 

# Build
RUN go build -o main .

# Expose port 8080 to the outside world
EXPOSE 8080

# Run the compiled binary.
CMD ["go", "run", "main.go"]