# Prompt: Написание спецификации API Gateway для StreetEye

## Контекст и роль

Ты — **Senior Backend Architect** с 10+ годами опыта проектирования распределённых систем и микросервисной архитектуры. Твоя специализация — API Gateway, балансировка нагрузки и маршрутизация запросов для высоконагруженных мобильных приложений.

Ты работаешь над проектом **StreetEye** — мобильным приложением-тренажёром для стрит-фотографов.

## Задача

Напиши **полную, детальную спецификацию API Gateway** — центрального шлюза для маршрутизации запросов ко всем микросервисам платформы StreetEye.

## Входные данные

### 1. Общая информация о проекте

Прочитай и проанализируй следующие документы:

- `specs/spec.md` — общая спецификация проекта (цели, ЦА, функциональность)
- `specs/backend-spec.md` — архитектура бэкенда, описание всех микросервисов
- `specs/auth-service-spec.md` — пример спецификации Auth Service
- `specs/user-service-spec.md` — пример спецификации User Service
- `specs/challenge-service-spec.md` — пример спецификации Challenge Service

### 2. Требования из существующих документов

Из `backend-spec.md` извлеки следующую информацию о архитектуре:

```
API Gateway:
- Центральный шлюз для всех клиентских запросов
- Маршрутизация к микросервисам (Auth, User, Challenge, Marathon, Progress, AI, Notification, Geo, File, Analytics)
- Аутентификация и авторизация запросов
- Rate limiting и throttling
- Кэширование ответов
- Логирование и мониторинг
- Технологии: NestJS, Redis, RabbitMQ
```

### 3. Микросервисы для маршрутизации

| Сервис | Порт | Протокол | Ответственность |
|--------|------|----------|-----------------|
| **Auth Service** | 3001 | REST | Аутентификация, авторизация, токены |
| **User Service** | 3002 | REST | Профили, подписки, тарифы |
| **Challenge Service** | 3003 | REST | Задания, генерация, категории |
| **Marathon Service** | 3004 | REST | Марафоны, прогресс по дням |
| **Progress Service** | 3005 | REST | Дневник, статистика, достижения |
| **AI Service** | 3006 | REST/gRPC | Анализ фото, рекомендации |
| **Notification Service** | 3007 | REST | Push-уведомления |
| **Geo Service** | 3008 | REST | Location-based задания |
| **File Service** | 3009 | REST | Загрузка, хранение фото |
| **Analytics Service** | 3010 | REST/gRPC | Метрики, события, телеметрия |

### 4. Требования к API Gateway

Учти следующие требования:

**Маршрутизация:**
- Префикс `/api/v1/auth/*` → Auth Service (порт 3001)
- Префикс `/api/v1/users/*` → User Service (порт 3002)
- Префикс `/api/v1/challenges/*` → Challenge Service (порт 3003)
- Префикс `/api/v1/marathons/*` → Marathon Service (порт 3004)
- Префикс `/api/v1/progress/*` → Progress Service (порт 3005)
- Префикс `/api/v1/ai/*` → AI Service (порт 3006)
- Префикс `/api/v1/notifications/*` → Notification Service (порт 3007)
- Префикс `/api/v1/geo/*` → Geo Service (порт 3008)
- Префикс `/api/v1/files/*` → File Service (порт 3009)
- Префикс `/api/v1/analytics/*` → Analytics Service (порт 3010)

**Безопасность:**
- JWT валидация токенов
- Rate limiting (100 запросов/мин для анонимных, 1000 запросов/мин для аутентифицированных)
- CORS для мобильных приложений
- HTTPS termination
- Request/Response валидация

**Производительность:**
- Кэширование GET запросов в Redis (TTL 5 минут)
- Compression (gzip)
- Connection pooling к микросервисам
- Circuit breaker для отказоустойчивости

**Мониторинг:**
- Логирование всех запросов
- Метрики производительности
- Трассировка запросов между сервисами
- Alerting при ошибках

## Структура спецификации

Спецификация должна содержать следующие разделы:

### 1. Архитектура API Gateway (20-25% объёма)

```markdown
## 1. Архитектура API Gateway

### 1.1. Обзор и зона ответственности
- Что входит в зону ответственности
- Что НЕ входит в зону ответственности
- Паттерны (API Gateway, BFF, Reverse Proxy)

### 1.2. Взаимодействие с микросервисами
- Sequence diagram (Mermaid) для маршрутизации запроса
- Таблица маршрутизации (префикс → сервис → порт)
- Health checks микросервисов

### 1.3. Внутренняя структура модулей
- Структура проекта (дерево файлов)
- Middleware (Auth, Logging, RateLimit, Cache)
- Modules для каждого микросервиса
```

### 2. Конфигурация маршрутизации (25-30% объёма)

Для **каждого маршрута** укажи:

```markdown
#### /api/v1/{service}/*

**Target Service:** Service Name (порт)

**Method Forwarding:**
- GET → GET
- POST → POST
- PUT → PUT
- DELETE → DELETE

**Authentication:** required|optional|none

**Rate Limiting:**
- Anonymous: N запросов/мин
- Authenticated: N запросов/мин

**Caching:**
- Enabled: true|false
- TTL: N секунд
- Cache Key: {method}:{path}:{userId}

**Timeout:** N секунд

**Retry Policy:**
- Max retries: N
- Backoff: exponential|linear
```

**Обязательные маршруты:**
- `/api/v1/auth/*` → Auth Service
- `/api/v1/users/*` → User Service
- `/api/v1/challenges/*` → Challenge Service
- `/api/v1/marathons/*` → Marathon Service
- `/api/v1/progress/*` → Progress Service
- `/api/v1/ai/*` → AI Service
- `/api/v1/notifications/*` → Notification Service
- `/api/v1/geo/*` → Geo Service
- `/api/v1/files/*` → File Service
- `/api/v1/analytics/*` → Analytics Service

### 3. Middleware (15-20% объёма)

```markdown
## 3. Middleware

### 3.1. Authentication Middleware
- JWT валидация
- Извлечение user context
- Passing user info к микросервисам

### 3.2. Rate Limiting Middleware
- Алгоритм (sliding window, token bucket)
- Лимиты по типам пользователей
- Redis storage для counters

### 3.3. Logging Middleware
- Формат логов (JSON)
- Request/Response логирование
- Correlation ID для трассировки

### 3.4. Caching Middleware
- Cache strategies
- Cache invalidation
- Redis integration

### 3.5. Error Handling Middleware
- Unified error responses
- Error code mapping
- Retry logic
```

### 4. Безопасность (15-20% объёма)

```markdown
## 4. Безопасность

### 4.1. JWT Валидация
- Token verification
- Signature validation
- Expiration check
- Refresh token handling

### 4.2. Rate Limiting
- Алгоритмы
- Лимиты
- Блокировки при превышении

### 4.3. CORS
- Allowed origins
- Allowed methods
- Allowed headers
- Credentials

### 4.4. Input Validation
- Request body validation
- Query params validation
- Sanitization
```

### 5. Производительность (10-15% объёма)

```markdown
## 5. Производительность

### 5.1. Кэширование
- Cacheable endpoints
- Cache invalidation strategies
- Redis configuration

### 5.2. Compression
- gzip/brotli
- Threshold settings

### 5.3. Connection Pooling
- Pool size
- Timeout settings
- Keep-alive

### 5.4. Circuit Breaker
- Failure threshold
- Recovery timeout
- Fallback responses
```

### 6. Мониторинг и логирование (10-15% объёма)

```markdown
## 6. Мониторинг и логирование

### 6.1. Логирование
- Формат (JSON)
- Уровни (debug, info, warn, error)
- Correlation ID

### 6.2. Метрики
- Request count
- Response time
- Error rate
- Cache hit rate

### 6.3. Health Checks
- Service health endpoints
- Aggregated health status
- Dependency checks

### 6.4. Alerting
- Error thresholds
- Response time thresholds
- Service availability
```

## Стиль и формат

### Требования к стилю

1. **Профессиональный технический язык**
   - Избегай разговорных выражений
   - Используй терминологию предметной области
   - Пиши кратко и по делу

2. **Структурированность**
   - Используй заголовки H1-H4
   - Применяй списки и таблицы
   - Вставляй диаграммы Mermaid где уместно

3. **Примеры конфигурации**
   - Для каждого middleware приводи примеры кода
   - Используй реалистичные данные
   - Показывай как успешные, так и ошибочные сценарии

4. **Валидация**
   - Для всех endpoints указывай лимиты
   - Описывай все возможные ошибки
   - Указывай timeout и retry policies

### Объём

**Целевой объём:** 1500-2500 строк (как `challenge-service-spec.md`)

**Баланс разделов:**
- Архитектура: 20-25%
- Маршрутизация: 25-30%
- Middleware: 15-20%
- Безопасность: 15-20%
- Производительность: 10-15%
- Мониторинг: 10-15%

## Критерии качества

Перед завершением проверь спецификацию по чек-листу:

### Полнота
- [ ] Все микросервисы описаны
- [ ] Все маршруты настроены
- [ ] Все middleware описаны
- [ ] Обработка ошибок описана

### Консистентность
- [ ] Стиль соответствует другим спецификациям
- [ ] Терминология единообразна
- [ ] Формат маршрутов одинаков
- [ ] Ссылки на сервисы корректны

### Практичность
- [ ] Можно реализовать по этой спецификации
- [ ] Все параметры конфигурации указаны
- [ ] Rate limits реалистичны
- [ ] Примеры кода рабочие

### Безопасность
- [ ] JWT валидация описана
- [ ] Rate limiting настроен
- [ ] CORS конфигурирован
- [ ] Audit logging предусмотрен

## Формат вывода

Сохрани результат в файл: `specs/api-gateway-spec.md`

Используй **Markdown** с following conventions:
- Код в тройные backticks с указанием языка
- Таблицы с выравниванием по заголовкам
- Диаграммы Mermaid в тройные backticks с `mermaid`
- Ссылки на другие документы относительные

## Дополнительные указания

### Интеграция с микросервисами

Учти следующие взаимодействия:

1. **Auth Service**
   - Валидация JWT токенов
   - Passing user context к другим сервисам
   - Token refresh proxying

2. **Все сервисы**
   - Health check polling
   - Request forwarding
   - Response caching
   - Error handling

3. **Redis**
   - Rate limit counters
   - Response cache
   - Session storage

4. **RabbitMQ**
   - Event publishing для analytics
   - Async request handling

### Особые сценарии

Опиши подробно следующие сценарии:

1. **Маршрутизация аутентифицированного запроса**
   - JWT валидация
   - User context извлечение
   - Forwarding к целевому сервису
   - Response кэширование

2. **Rate limit превышение**
   - Detection
   - Response (429 Too Many Requests)
   - Retry-After header
   - Logging

3. **Микросервис недоступен**
   - Circuit breaker activation
   - Fallback response
   - Alert triggering
   - Recovery process

4. **Кэш miss/hit**
   - Cache key generation
   - Cache population
   - Cache invalidation
   - Stale-while-revalidate

## Начало работы

Прежде чем писать спецификацию:

1. **Прочитай входные документы** (`spec.md`, `backend-spec.md`, `auth-service-spec.md`)
2. **Выпиши ключевые требования** из этих документов
3. **Составь план** спецификации (оглавление)
4. **Начни с архитектуры**, затем маршрутизация, затем middleware, затем безопасность

## Пример начала

```markdown
# Спецификация API Gateway

**Версия:** 1.0
**Дата:** [текущая дата]
**Статус:** Готово к разработке

---

## 1. Архитектура API Gateway

### 1.1. Обзор и зона ответственности

**API Gateway** — это центральный шлюз для маршрутизации всех клиентских запросов
к микросервисам платформы StreetEye.

**Входит в зону ответственности:**
- ✅ Маршрутизация запросов к микросервисам
- ✅ JWT аутентификация и авторизация
- ✅ Rate limiting и throttling
- ✅ Кэширование ответов
- ✅ Логирование и мониторинг
- ✅ CORS и HTTPS termination
- ✅ Request/Response валидация

**НЕ входит в зону ответственности:**
- ❌ Бизнес-логика (в микросервисах)
- ❌ Хранение данных (в микросервисах)
- ❌ Обработка платежей (в User Service)
...
```

---

**Приступай к написанию спецификации!**
