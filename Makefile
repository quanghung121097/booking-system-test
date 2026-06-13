.PHONY: setup up down build install fresh logs shell-php shell-mysql migrate seed key optimize test

setup:      ## First-time setup (env + build + up + install + key + migrate + seed)
	@test -f .env || cp .env.docker.example .env
	@test -f backend/.env || cp .env.docker.example backend/.env
	@test -f frontend/.env || cp frontend/.env.example frontend/.env
	docker compose up -d --build
	@echo "Đang chờ MySQL khởi động..."
	@sleep 10
	$(MAKE) install
	@if ! grep -q '^APP_KEY=.\+' backend/.env; then $(MAKE) key; fi
	$(MAKE) migrate
	$(MAKE) seed
	@echo ""
	@echo "Setup xong."
	@echo "  App:      http://localhost:8080"
	@echo "  Email:    test@example.com"
	@echo "  Mật khẩu: password"

up:         ## Start all containers
	docker compose up -d

down:       ## Stop all containers
	docker compose down

build:      ## Rebuild all images (no cache)
	docker compose build --no-cache

install:    ## Install PHP dependencies (run after first make up)
	docker compose exec php composer install --prefer-dist

fresh:      ## Full reset: down + up + migrate + seed
	docker compose down -v
	docker compose up -d --build
	@echo "Đang chờ MySQL khởi động..."
	@sleep 10
	$(MAKE) install
	@if ! grep -q '^APP_KEY=.\+' backend/.env; then $(MAKE) key; fi
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
	docker compose exec php php artisan key:generate --force

optimize:   ## Cache config / routes / views
	docker compose exec php php artisan optimize

test:       ## Run PHP tests
	docker compose exec php php artisan test
