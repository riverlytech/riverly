# Makefile for Riverly Monorepo

# --- Variables ---
# Use ?= to allow overriding from the command line (e.g., make console-build APP_NAME=my-app)

# Console App Variables
CONSOLE_APP_NAME ?= riverly-console
CONSOLE_TAG ?= latest
CONSOLE_PORT ?= 3000
CONSOLE_DOCKERFILE ?= apps/console/Dockerfile
CONSOLE_ENV_FILE ?= apps/console/.env

# API App Variables
API_APP_NAME ?= riverly-api
API_TAG ?= latest
API_PORT ?= 5000
API_DOCKERFILE ?= apps/api/Dockerfile
API_ENV_FILE ?= apps/api/.env

# --- Docker Targets for Console App ---

.PHONY: console-build
console-build:
	@echo "Building console Docker image..."
	docker build -t $(CONSOLE_APP_NAME):$(CONSOLE_TAG) -f $(CONSOLE_DOCKERFILE) .

.PHONY: console-run
console-run:
	@docker rm -f $(CONSOLE_APP_NAME) >/dev/null 2>&1 || true
	@echo "Running console Docker container..."
	docker run -d --rm --name $(CONSOLE_APP_NAME) -p $(CONSOLE_PORT):3000 --env-file $(CONSOLE_ENV_FILE) $(CONSOLE_APP_NAME):$(CONSOLE_TAG)

.PHONY: console-stop
console-stop:
	@echo "Stopping console Docker container..."
	docker stop $(CONSOLE_APP_NAME)

.PHONY: console-logs
console-logs:
	@echo "Showing logs for console Docker container..."
	docker logs -f $(CONSOLE_APP_NAME)

.PHONY: console-dev
console-dev: console-build console-run console-logs

# --- Docker Targets for API App ---

.PHONY: api-build
api-build:
	@echo "Building API Docker image..."
	docker build -t $(API_APP_NAME):$(API_TAG) -f $(API_DOCKERFILE) .

.PHONY: api-run
api-run:
	@docker rm -f $(API_APP_NAME) >/dev/null 2>&1 || true
	@echo "Running API Docker container..."
	docker run -d --rm --name $(API_APP_NAME) -p $(API_PORT):$(API_PORT) --env-file $(API_ENV_FILE) $(API_APP_NAME):$(API_TAG)

.PHONY: api-stop
api-stop:
	@echo "Stopping API Docker container..."
	docker stop $(API_APP_NAME)

.PHONY: api-logs
api-logs:
	@echo "Showing logs for API Docker container..."
	docker logs -f $(API_APP_NAME)

.PHONY: api-dev
api-dev: api-build api-run api-logs

# --- Help ---
.PHONY: help
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Console App Targets:"
	@echo "  console-build   Build the console Docker image."
	@echo "  console-run     Run the console Docker container in detached mode."
	@echo "  console-stop    Stop the console Docker container."
	@echo "  console-logs    Follow the logs of the console container."
	@echo "  console-dev     Build, run, and follow logs for the console app."
	@echo ""
	@echo "API App Targets:"
	@echo "  api-build       Build the API Docker image."
	@echo "  api-run         Run the API Docker container in detached mode."
	@echo "  api-stop        Stop the API Docker container."
	@echo "  api-logs        Follow the logs of the API container."
	@echo "  api-dev         Build, run, and follow logs for the API app."
