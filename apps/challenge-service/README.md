# Challenge Service

**streetEye Challenge Service** — микросервис для управления базой заданий и их умной генерации для пользователей StreetEye.

## Функциональность

- ✅ CRUD операций с заданиями (создание, чтение, обновление, удаление)
- ✅ Управление категориями и тегами заданий
- ✅ Умная генерация случайных заданий (рандомайзер)
- ✅ Фильтрация по категориям, сложности, режимам
- ✅ Режимы Quick Walk и Heat Mode
- ✅ Кэширование заданий в Redis
- ✅ Location-based фильтрация

## Запуск

### Установка зависимостей

```bash
pnpm install
```

### Запуск базы данных

```bash
# Запуск PostgreSQL для challenge-service
docker-compose up -d challenge-service-db

# Или все базы данных
docker-compose up -d
```

### Режим разработки

```bash
pnpm dev
```

Сервис будет доступен на http://localhost:3002

### Сборка

```bash
pnpm build
```

### Запуск production версии

```bash
pnpm start:prod
```

## Тестирование

```bash
# Unit тесты
pnpm test

# E2E тесты
pnpm test:e2e

# Watch mode
pnpm test:watch
```

## API Endpoints

### Challenges

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/challenges/random` | Получить случайное задание |
| GET | `/api/v1/challenges/:id` | Получить задание по ID |
| GET | `/api/v1/challenges` | Список заданий с пагинацией |
| GET | `/api/v1/challenges/categories` | Список категорий |
| POST | `/api/v1/challenges` | Создать задание (admin) |
| PUT | `/api/v1/challenges/:id` | Обновить задание (admin) |
| DELETE | `/api/v1/challenges/:id` | Удалить задание (admin) |

### Heat Mode

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/challenges/heat-mode/start` | Начать сессию Heat Mode |
| GET | `/api/v1/challenges/heat-mode/active` | Получить активную сессию |
| POST | `/api/v1/challenges/heat-mode/:sessionId/next` | Получить следующее задание |
| DELETE | `/api/v1/challenges/heat-mode/:sessionId` | Завершить сессию |

## Переменные окружения

Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
# Database
CHALLENGE_SERVICE_DB_HOST=localhost
CHALLENGE_SERVICE_DB_PORT=5434
CHALLENGE_SERVICE_DB_USERNAME=postgres
CHALLENGE_SERVICE_DB_PASSWORD=postgres
CHALLENGE_SERVICE_DB_DATABASE=challenge_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=300

# RabbitMQ
RABBITMQ_URI=amqp://localhost:5672
RABBITMQ_EXCHANGE=streetEye
```

## Архитектура

```
challenge-service/
├── src/
│   ├── main.ts                          # Точка входа
│   ├── app.module.ts                    # Главный модуль
│   ├── config/                          # Конфигурация
│   ├── challenges/                      # Основной модуль
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── dto/
│   │   ├── entities/
│   │   └── interfaces/
│   ├── shared/                          # Общие модули
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   └── services/
│   └── events/                          # События
```

## Технологии

- **NestJS** v11 - Backend framework
- **TypeORM** - ORM для PostgreSQL
- **PostgreSQL** - Основная база данных
- **Redis** - Кэширование
- **RabbitMQ** - Асинхронные события
- **TypeScript** - Строгая типизация

## Взаимодействие с сервисами

| Сервис | Направление | Тип | Описание |
|--------|-------------|-----|----------|
| User Service | Challenge → User | REST | Проверка подписки |
| Geo Service | Challenge → Geo | REST | Location-based задания |
| Redis | Challenge ↔ Redis | Native | Кэширование |
| PostgreSQL | Challenge ↔ DB | TypeORM | Хранение данных |
| RabbitMQ | Challenge → MQ | Publish | События |
