# Makefile for Riverly Monorepo

# --- Variables ---
# Use ?= to allow overriding from the command line (e.g., make console-build APP_NAME=my-app)

# Console App Variables
CONSOLE_APP_NAME ?= riverly-console
CONSOLE_TAG ?= latest
CONSOLE_PORT ?= 3000
CONSOLE_DOCKERFILE ?= apps/console/Dockerfile
CONSOLE_ENV_FILE ?= apps/console/.env

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
