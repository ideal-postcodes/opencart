.DEFAULT_GOAL := help

## -- Container Launch --

## Bootstrap containers and compile opencart internals
.PHONY: bootstrap
bootstrap: up init

## Initialise repository - run install-opencart
.PHONY: init
init:
	docker-compose exec -T web dockerize -wait tcp://db:3306 -timeout 60m /var/www/html/install.sh

## Launch docker-compose as background daemon
.PHONY: up
up:
	docker-compose up -d

## Shut down docker-compose services
.PHONY: down
down:
	docker-compose down

## -- Development Methods --

## Launch bash shell into opencart container
.PHONY: shell
shell:
	docker-compose exec web bash

## Tail logs
.PHONY: logs
logs:
	docker-compose logs -f

## Tail opencart logs only
.PHONY: logs-opencart
logs-opencart:
	docker-compose logs -f web

## -- Misc --

## Update repository against origin/master
.PHONY: update
update:
	git fetch
	git merge --ff-only origin/master

## Bundle module
.PHONY: bundle
bundle:
	cd src && zip -r -D idealpostcodes.ocmod.zip upload install.xml && mv idealpostcodes.ocmod.zip ../

## How to use this Makefile
.PHONY: help
help:
	@printf "Usage\n";

	@awk '{ \
			if ($$0 ~ /^.PHONY: [a-zA-Z\-\_0-9]+$$/) { \
				helpCommand = substr($$0, index($$0, ":") + 2); \
				if (helpMessage) { \
					printf "\033[36m%-20s\033[0m %s\n", \
						helpCommand, helpMessage; \
					helpMessage = ""; \
				} \
			} else if ($$0 ~ /^[a-zA-Z\-\_0-9.]+:/) { \
				helpCommand = substr($$0, 0, index($$0, ":")); \
				if (helpMessage) { \
					printf "\033[36m%-20s\033[0m %s\n", \
						helpCommand, helpMessage; \
					helpMessage = ""; \
				} \
			} else if ($$0 ~ /^##/) { \
				if (helpMessage) { \
					helpMessage = helpMessage"\n                     "substr($$0, 3); \
				} else { \
					helpMessage = substr($$0, 3); \
				} \
			} else { \
				if (helpMessage) { \
					print "\n                     "helpMessage"\n" \
				} \
				helpMessage = ""; \
			} \
		}' \
		$(MAKEFILE_LIST)
