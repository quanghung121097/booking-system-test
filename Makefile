.PHONY: up down build fresh logs shell-php shell-mysql migrate seed key optimize test

up:         ## Start all containers
	docker compose up -d

down:       ## Stop all containers
	docker compose down

build:      ## Rebuild all images (no cache)
	docker compose build --no-cache

fresh:      ## Full reset: down + up + migrate + seed
	docker compose down -v
	docker compose up -d
	sleep 5
	$(MAKE) migrate
	$(MAKE) seed

logs:       ## Tail all container logs
	docker compose logs -f

shell-php:  ## Shell into PHP container
	docker compose exec php bash

shell-mysql: ## Shell into MySQL
	docker compose exec mysql mysql -u booking_user -pbooking_pass booking_db

migrate:    ## Run migrations
	docker compose exec php php artisan migrate --force

seed:       ## Run seeders
	docker compose exec php php artisan db:seed --force

key:        ## Generate application key
	docker compose exec php php artisan key:generate

optimize:   ## Cache config / routes / views
	docker compose exec php php artisan optimize

test:       ## Run PHP tests
	docker compose exec php php artisan test
