# Спецификация бекенда StreetEye

**Версия:** 1.0  
**Дата:** 10 марта 2026 г.  
**Статус:** Готово к разработке

---

## 1. Архитектура системы

### 1.1. Обзор архитектуры

```mermaid
graph TB
    subgraph Client
        Mobile[Mobile App - React Native]
        Watch[Smart Watch]
    end
    
    subgraph API Gateway
        Gateway[API Gateway - NestJS]
    end
    
    subgraph Services
        Auth[Auth Service]
        User[User Service]
        Challenge[Challenge Service]
        Marathon[Marathon Service]
        Progress[Progress Service]
        AI[AI Service - Python]
        Notification[Notification Service]
        Geo[Geo Service]
        File[File Service]
        Analytics[Analytics Service]
    end
    
    subgraph Data
        PG[(PostgreSQL)]
        Redis[(Redis)]
        S3[(S3 Storage)]
        MQ[(RabbitMQ)]
    end
    
    Mobile --> Gateway
    Watch --> Gateway
    Gateway --> Auth
    Gateway --> User
    Gateway --> Challenge
    Gateway --> Marathon
    Gateway --> Progress
    Gateway --> AI
    Gateway --> Notification
    Gateway --> Geo
    Gateway --> File
    Gateway --> Analytics
    
    Auth --> PG
    User --> PG
    Challenge --> PG
    Marathon --> PG
    Progress --> PG
    AI --> PG
    Notification --> Redis
    Geo --> PG
    File --> S3
    Analytics --> PG
    
    Auth --> Redis
    User --> Redis
    Challenge --> Redis
    
    Challenge -.-> MQ
    Marathon -.-> MQ
    Progress -.-> MQ
    AI -.-> MQ
    Notification -.-> MQ
    Analytics -.-> MQ
```

### 1.2. Микросервисы

| Сервис | Порт | Протокол | Технологии | Ответственность |
|--------|------|----------|------------|-----------------|
| **Auth Service** | 3001 | REST | NestJS, JWT, bcrypt | Аутентификация, авторизация, токены |
| **User Service** | 3002 | REST | NestJS, TypeORM | Профили, подписки, тарифы |
| **Challenge Service** | 3003 | REST | NestJS, TypeORM | Задания, генерация, категории |
| **Marathon Service** | 3004 | REST | NestJS, TypeORM | Марафоны, прогресс по дням |
| **Progress Service** | 3005 | REST | NestJS, TypeORM | Дневник, статистика, достижения |
| **AI Service** | 3006 | REST/gRPC | FastAPI, PyTorch | Анализ фото, рекомендации |
| **Notification Service** | 3007 | REST | NestJS, FCM, APNs | Push-уведомления |
| **Geo Service** | 3008 | REST | NestJS, PostGIS | Location-based задания |
| **File Service** | 3009 | REST | NestJS, AWS S3 SDK | Загрузка, хранение фото |
| **Analytics Service** | 3010 | REST/gRPC | NestJS, ClickHouse | Метрики, события, телеметрия |

---

### 1.3. Детальное описание сервисов

#### Auth Service

**Зона ответственности:**
- Регистрация и аутентификация пользователей
- Выдача и валидация JWT токенов
- Refresh token ротация
- Восстановление доступа
- Блокировка подозрительных сессий

**Основные endpoints:**

```
POST /api/v1/auth/register
Auth: none
Request: { email: string, password: string, language: 'ru' | 'en' }
Response: { userId: string, accessToken: string, refreshToken: string }
Errors: [EMAIL_EXISTS, WEAK_PASSWORD, INVALID_EMAIL]
Rate limit: 5 запросов в минуту

POST /api/v1/auth/login
Auth: none
Request: { email: string, password: string }
Response: { userId: string, accessToken: string, refreshToken: string }
Errors: [INVALID_CREDENTIALS, ACCOUNT_LOCKED]
Rate limit: 10 запросов в минуту

POST /api/v1/auth/refresh
Auth: none (refresh token в cookie)
Request: { refreshToken: string }
Response: { accessToken: string, refreshToken: string }
Errors: [INVALID_TOKEN, TOKEN_EXPIRED]
Rate limit: 30 запросов в минуту

POST /api/v1/auth/logout
Auth: required
Request: { refreshToken: string }
Response: { success: boolean }
Errors: [INVALID_TOKEN]
Rate limit: 10 запросов в минуту

POST /api/v1/auth/password/reset
Auth: none
Request: { email: string }
Response: { success: boolean }
Errors: [EMAIL_NOT_FOUND]
Rate limit: 3 запроса в час
```

**Взаимодействие:**
- User Service: получение данных пользователя
- Notification Service: отправка email для восстановления пароля
- Analytics Service: логирование событий входа

---

#### User Service

**Зона ответственности:**
- Управление профилями пользователей
- Подписки и тарифы (Free/Premium/Masterclass)
- Настройки языка и предпочтений
- История покупок (Masterclass курсы)

**Основные endpoints:**

```
GET /api/v1/users/:id/profile
Auth: required
Request: -
Response: { 
  id: string, 
  email: string, 
  subscriptionTier: 'free' | 'premium' | 'masterclass',
  subscriptionExpiresAt: Date,
  language: 'ru' | 'en',
  createdAt: Date,
  stats: { totalChallenges: number, completedMarathons: number }
}
Errors: [USER_NOT_FOUND, UNAUTHORIZED]
Rate limit: 60 запросов в минуту

PUT /api/v1/users/:id/profile
Auth: required
Request: { language?: string, notificationsEnabled?: boolean }
Response: { id: string, language: string, notificationsEnabled: boolean }
Errors: [USER_NOT_FOUND, INVALID_DATA]
Rate limit: 10 запросов в минуту

GET /api/v1/users/:id/subscription
Auth: required
Request: -
Response: { 
  tier: 'free' | 'premium' | 'masterclass',
  status: 'active' | 'cancelled' | 'expired',
  expiresAt: Date,
  autoRenew: boolean
}
Errors: [USER_NOT_FOUND, SUBSCRIPTION_NOT_FOUND]
Rate limit: 30 запросов в минуту

POST /api/v1/users/:id/subscription/upgrade
Auth: required
Request: { tier: 'premium' | 'masterclass', paymentMethodId: string }
Response: { tier: string, expiresAt: Date, transactionId: string }
Errors: [INVALID_TIER, PAYMENT_FAILED, USER_NOT_FOUND]
Rate limit: 5 запросов в минуту

GET /api/v1/users/:id/purchases
Auth: required
Request: -
Response: [{ id: string, courseId: string, courseName: string, purchasedAt: Date, price: number }]
Errors: [USER_NOT_FOUND]
Rate limit: 30 запросов в минуту
```

**Взаимодействие:**
- Auth Service: валидация токенов
- Progress Service: получение статистики пользователя
- File Service: загрузка аватара
- Notification Service: уведомления о подписке

---

#### Challenge Service

**Зона ответственности:**
- CRUD операций с заданиями
- Умная генерация случайных заданий
- Фильтрация по категориям и сложности
- Режимы Quick Walk и Heat Mode
- Кэширование популярных заданий

**Основные endpoints:**

```
GET /api/v1/challenges/random
Auth: required (optional для free пользователей)
Request: { 
  category?: 'technical' | 'visual' | 'social' | 'restriction',
  difficulty?: 'beginner' | 'intermediate' | 'pro',
  mode?: 'quick_walk' | 'heat_mode' | 'location_based',
  location?: { lat: number, lng: number }
}
Response: {
  id: string,
  title: string,
  category: string,
  difficulty: string,
  description: string,
  tips: string,
  examples: string[],
  tags: string[],
  estimatedTime: number
}
Errors: [NO_CHALLENGES_AVAILABLE, PREMIUM_REQUIRED]
Rate limit: 30 запросов в минуту

GET /api/v1/challenges/:id
Auth: optional
Request: -
Response: {
  id: string,
  title: string,
  category: string,
  difficulty: string,
  description: string,
  tips: string,
  examples: string[],
  tags: string[]
}
Errors: [CHALLENGE_NOT_FOUND]
Rate limit: 60 запросов в минуту

GET /api/v1/challenges
Auth: optional
Request: { 
  category?: string, 
  difficulty?: string, 
  page?: number, 
  limit?: number 
}
Response: {
  challenges: Challenge[],
  total: number,
  page: number,
  limit: number
}
Errors: [INVALID_FILTER]
Rate limit: 30 запросов в минуту

POST /api/v1/challenges
Auth: required (admin only)
Request: {
  title: string,
  category: string,
  difficulty: string,
  description: string,
  tips: string,
  tags: string[]
}
Response: { id: string, title: string }
Errors: [INVALID_DATA, UNAUTHORIZED]
Rate limit: 10 запросов в минуту

PUT /api/v1/challenges/:id
Auth: required (admin only)
Request: { title?: string, description?: string, ... }
Response: { id: string, title: string }
Errors: [CHALLENGE_NOT_FOUND, INVALID_DATA, UNAUTHORIZED]
Rate limit: 10 запросов в минуту

GET /api/v1/challenges/categories
Auth: none
Request: -
Response: [{ id: string, name: string, description: string, count: number }]
Rate limit: 60 запросов в минуту

GET /api/v1/challenges/heat-mode/active
Auth: required
Request: -
Response: {
  sessionId: string,
  currentChallenge: Challenge,
  challengesCompleted: number,
  sessionStartedAt: Date,
  nextChallengeAt: Date
}
Errors: [NO_ACTIVE_SESSION, PREMIUM_REQUIRED]
Rate limit: 60 запросов в минуту

POST /api/v1/challenges/heat-mode/start
Auth: required
Request: { duration: number }
Response: { sessionId: string, challenge: Challenge, nextAt: Date }
Errors: [PREMIUM_REQUIRED, INVALID_DURATION]
Rate limit: 10 запросов в минуту
```

**Взаимодействие:**
- Geo Service: location-based фильтрация заданий
- User Service: проверка уровня подписки
- Progress Service: обновление статистики
- Redis: кэширование заданий
- RabbitMQ: события выполнения заданий

---

#### Marathon Service

**Зона ответственности:**
- CRUD марафонов
- Управление прогрессом пользователей
- Ежедневная проверка активности
- Начисление бонусов за завершение

**Основные endpoints:**

```
GET /api/v1/marathons
Auth: optional
Request: { page?: number, limit?: number }
Response: {
  marathons: [{
    id: string,
    title: string,
    description: string,
    durationDays: number,
    difficulty: string,
    enrolledCount: number,
    isPremium: boolean
  }],
  total: number
}
Rate limit: 30 запросов в минуту

GET /api/v1/marathons/:id
Auth: optional
Request: -
Response: {
  id: string,
  title: string,
  description: string,
  durationDays: number,
  difficulty: string,
  days: [{
    dayNumber: number,
    challengeId: string,
    challengeTitle: string,
    description: string
  }],
  bonus: string
}
Errors: [MARATHON_NOT_FOUND]
Rate limit: 30 запросов в минуту

POST /api/v1/marathons/:id/enroll
Auth: required
Request: -
Response: { enrollmentId: string, marathonId: string, startedAt: Date }
Errors: [MARATHON_NOT_FOUND, ALREADY_ENROLLED, PREMIUM_REQUIRED]
Rate limit: 10 запросов в минуту

GET /api/v1/marathons/:id/progress
Auth: required
Request: -
Response: {
  enrollmentId: string,
  currentDay: number,
  completedDays: number[],
  status: 'active' | 'completed' | 'failed',
  startedAt: Date,
  expiresAt: Date
}
Errors: [NOT_ENROLLED, MARATHON_NOT_FOUND]
Rate limit: 60 запросов в минуту

POST /api/v1/marathons/:id/days/:dayNumber/complete
Auth: required
Request: { challengeCompletionId: string }
Response: { 
  success: boolean, 
  nextDay?: { dayNumber: number, challengeId: string },
  isComplete?: boolean,
  bonusEarned?: string
}
Errors: [NOT_ENROLLED, INVALID_DAY, CHALLENGE_NOT_COMPLETED]
Rate limit: 30 запросов в минуту

GET /api/v1/marathons/user/:userId
Auth: required
Request: -
Response: {
  active: MarathonProgress[],
  completed: MarathonProgress[]
}
Errors: [UNAUTHORIZED]
Rate limit: 30 запросов в минуту
```

**Взаимодействие:**
- Challenge Service: получение заданий для дней
- Progress Service: проверка выполнения заданий
- Notification Service: напоминания о ежедневных заданиях
- RabbitMQ: ежедневная проверка прогресса

---

#### Progress Service

**Зона ответственности:**
- Дневник прогресса пользователя
- Статистика и достижения
- Бейджи за серии заданий
- История выполненных заданий

**Основные endpoints:**

```
POST /api/v1/progress/challenges/:challengeId/complete
Auth: required
Request: {
  photoUrl: string,
  notes?: string,
  location?: { lat: number, lng: number },
  marathonDay?: { marathonId: string, dayNumber: number }
}
Response: {
  completionId: string,
  xp: number,
  newAchievements: Achievement[],
  streak: number
}
Errors: [CHALLENGE_NOT_FOUND, INVALID_DATA, PREMIUM_REQUIRED]
Rate limit: 30 запросов в минуту

GET /api/v1/progress/challenges
Auth: required
Request: { 
  page?: number, 
  limit?: number,
  category?: string,
  fromDate?: Date,
  toDate?: Date
}
Response: {
  completions: [{
    id: string,
    challengeId: string,
    challengeTitle: string,
    photoUrl: string,
    notes: string,
    completedAt: Date,
    xp: number
  }],
  total: number
}
Errors: [UNAUTHORIZED]
Rate limit: 60 запросов в минуту

GET /api/v1/progress/stats
Auth: required
Request: -
Response: {
  totalChallengesCompleted: number,
  totalMarathonsCompleted: number,
  totalXp: number,
  currentStreak: number,
  longestStreak: number,
  challengesByCategory: { technical: number, visual: number, social: number, restriction: number },
  averagePhotosPerWeek: number
}
Errors: [UNAUTHORIZED]
Rate limit: 60 запросов в минуту

GET /api/v1/progress/achievements
Auth: required
Request: -
Response: {
  achievements: [{
    id: string,
    title: string,
    description: string,
    iconUrl: string,
    earnedAt: Date | null,
    progress: number,
    required: number
  }]
}
Rate limit: 60 запросов в минуту

GET /api/v1/progress/streak
Auth: required
Request: -
Response: {
  currentStreak: number,
  lastCompletionDate: Date,
  nextCompletionDeadline: Date
}
Rate limit: 60 запросов в минуту

DELETE /api/v1/progress/challenges/:completionId
Auth: required
Request: -
Response: { success: boolean }
Errors: [COMPLETION_NOT_FOUND, UNAUTHORIZED]
Rate limit: 10 запросов в минуту

POST /api/v1/progress/export
Auth: required
Request: { format: 'pdf' | 'json', includePhotos: boolean }
Response: { downloadUrl: string, expiresAt: Date }
Errors: [PREMIUM_REQUIRED, NO_DATA]
Rate limit: 5 запросов в день
```

**Взаимодействие:**
- Challenge Service: валидация заданий
- User Service: обновление статистики
- File Service: загрузка фото
- AI Service: анализ загруженных фото
- RabbitMQ: события для аналитики

---

#### AI Service (Python/FastAPI)

**Зона ответственности:**
- Анализ фотографий на соответствие заданию
- Классификация композиции, света, цвета
- Генерация рекомендаций
- Обучение моделей на основе фидбека

**Основные endpoints:**

```
POST /api/v1/ai/analyze
Auth: required (Premium+)
Request: {
  photoUrl: string,
  challengeId: string,
  challengeCategory: string
}
Response: {
  analysisId: string,
  score: number,
  matchesChallenge: boolean,
  categories: {
    composition: number,
    lighting: number,
    color: number,
    subject: number
  },
  feedback: string,
  recommendations: string[],
  detectedElements: string[]
}
Errors: [PREMIUM_REQUIRED, INVALID_IMAGE, ANALYSIS_FAILED]
Rate limit: 10 запросов в день (Premium), 50 (Masterclass)

POST /api/v1/ai/recommend-next
Auth: required (Premium+)
Request: {
  userId: string,
  lastCompletions: Completion[],
  weakAreas: string[]
}
Response: {
  recommendedChallengeId: string,
  reason: string,
  focusArea: string
}
Errors: [PREMIUM_REQUIRED, INSUFFICIENT_DATA]
Rate limit: 30 запросов в минуту

GET /api/v1/ai/models/health
Auth: none
Request: -
Response: {
  status: 'healthy' | 'degraded',
  modelVersion: string,
  lastTrainedAt: Date,
  accuracy: number
}
Rate limit: 60 запросов в минуту
```

**Взаимодействие:**
- File Service: загрузка фото для анализа
- Progress Service: сохранение результатов
- User Service: проверка подписки

**Технологии:**
- FastAPI для REST API
- PyTorch для ML моделей
- OpenCV для предобработки изображений
- ONNX для оптимизации инференса

---

#### Notification Service

**Зона ответственности:**
- Push-уведомления (FCM, APNs)
- Email уведомления
- Триггеры уведомлений
- Управление подписками

**Основные endpoints:**

```
POST /api/v1/notifications/subscribe
Auth: required
Request: {
  deviceType: 'ios' | 'android',
  pushToken: string,
  topics: string[]
}
Response: { subscriptionId: string }
Errors: [INVALID_TOKEN, DUPLICATE_SUBSCRIPTION]
Rate limit: 10 запросов в минуту

DELETE /api/v1/notifications/subscribe/:subscriptionId
Auth: required
Request: -
Response: { success: boolean }
Errors: [SUBSCRIPTION_NOT_FOUND]
Rate limit: 10 запросов в минуту

POST /api/v1/notifications/send
Auth: required (internal only)
Request: {
  userId: string,
  type: 'marathon_reminder' | 'achievement' | 'challenge_complete' | 'subscription',
  title: string,
  body: string,
  data: object
}
Response: { notificationId: string, status: 'sent' | 'queued' }
Errors: [USER_NOT_FOUND, INVALID_TYPE]
Rate limit: 100 запросов в минуту

GET /api/v1/notifications/preferences
Auth: required
Request: -
Response: {
  marathonReminders: boolean,
  achievements: boolean,
  tipsAndTricks: boolean,
  quietHours: { start: string, end: string }
}
Rate limit: 60 запросов в минуту

PUT /api/v1/notifications/preferences
Auth: required
Request: {
  marathonReminders?: boolean,
  achievements?: boolean,
  quietHours?: { start: string, end: string }
}
Response: { updated: boolean }
Errors: [INVALID_DATA]
Rate limit: 10 запросов в минуту
```

**Взаимодействие:**
- RabbitMQ: потребление событий для уведомлений
- User Service: получение данных пользователя
- Marathon Service: триггеры напоминаний

---

#### Geo Service

**Зона ответственности:**
- Location-based задания
- Гео-запросы с PostGIS
- Проверка местоположения для заданий
- История локаций пользователя

**Основные endpoints:**

```
GET /api/v1/geo/challenges/nearby
Auth: required (Premium+)
Request: {
  lat: number,
  lng: number,
  radius: number (в метрах, default 1000)
}
Response: {
  challenges: [{
    id: string,
    title: string,
    distance: number,
    location: { lat: number, lng: number },
    description: string
  }]
}
Errors: [PREMIUM_REQUIRED, INVALID_LOCATION]
Rate limit: 30 запросов в минуту

POST /api/v1/geo/locations
Auth: required (admin only)
Request: {
  title: string,
  description: string,
  location: { lat: number, lng: number },
  challengeIds: string[]
}
Response: { locationId: string }
Errors: [INVALID_DATA, UNAUTHORIZED]
Rate limit: 10 запросов в минуту

GET /api/v1/geo/history
Auth: required
Request: {
  fromDate?: Date,
  toDate?: Date
}
Response: {
  locations: [{
    lat: number,
    lng: number,
    timestamp: Date,
    challengeId?: string
  }]
}
Errors: [PREMIUM_REQUIRED]
Rate limit: 30 запросов в минуту
```

**Взаимодействие:**
- Challenge Service: привязка заданий к локациям
- Progress Service: сохранение истории локаций

---

#### File Service

**Зона ответственности:**
- Загрузка файлов в S3
- Генерация presigned URLs
- CDN интеграция
- Lifecycle management

**Основные endpoints:**

```
POST /api/v1/files/upload-url
Auth: required
Request: {
  fileType: string,
  fileSize: number,
  purpose: 'challenge_photo' | 'avatar' | 'ai_analysis'
}
Response: {
  uploadUrl: string,
  fileUrl: string,
  fileId: string,
  expiresAt: Date
}
Errors: [INVALID_FILE_TYPE, FILE_TOO_LARGE, PREMIUM_REQUIRED]
Rate limit: 30 запросов в минуту

POST /api/v1/files/:fileId/confirm
Auth: required
Request: { etag: string }
Response: { fileUrl: string, cdnUrl: string }
Errors: [FILE_NOT_FOUND, INVALID_ETAG]
Rate limit: 30 запросов в минуту

DELETE /api/v1/files/:fileId
Auth: required
Request: -
Response: { success: boolean }
Errors: [FILE_NOT_FOUND, UNAUTHORIZED]
Rate limit: 10 запросов в минуту

GET /api/v1/files/:fileId/url
Auth: required
Request: { expiresIn?: number }
Response: { url: string, expiresAt: Date }
Errors: [FILE_NOT_FOUND, UNAUTHORIZED]
Rate limit: 60 запросов в минуту
```

**Взаимодействие:**
- S3: хранение файлов
- CDN: доставка контента
- Progress Service: фото выполненных заданий

---

#### Analytics Service

**Зона ответственности:**
- Сбор событий аналитики
- Метрики использования
- Конверсия в подписку
- A/B тестирование

**Основные endpoints:**

```
POST /api/v1/analytics/events
Auth: none (но требуется userId в теле)
Request: {
  userId: string,
  events: [{
    type: string,
    timestamp: Date,
    properties: object
  }]
}
Response: { received: number }
Rate limit: 100 запросов в минуту

GET /api/v1/analytics/dashboard
Auth: required (admin only)
Request: {
  fromDate: Date,
  toDate: Date,
  metrics: string[]
}
Response: {
  dau: number,
  mau: number,
  conversionRate: number,
  averageSessionTime: number,
  challengesCompleted: number,
  marathonsCompleted: number
}
Errors: [UNAUTHORIZED]
Rate limit: 30 запросов в минуту

GET /api/v1/analytics/user/:userId
Auth: required (admin only)
Request: -
Response: {
  totalSessions: number,
  averageSessionTime: number,
  challengesCompleted: number,
  subscriptionHistory: [],
  events: []
}
Errors: [UNAUTHORIZED, USER_NOT_FOUND]
Rate limit: 30 запросов в минуту
```

**Взаимодействие:**
- RabbitMQ: потребление событий
- ClickHouse: хранение аналитики
- Все сервисы: отправка событий

---

## 2. Схема базы данных

### 2.1. ER-диаграмма

```mermaid
erDiagram
    users ||--o{ subscriptions : has
    users ||--o{ user_challenges : completes
    users ||--o{ user_marathon_progress : participates
    users ||--o{ user_achievements : earns
    users ||--o{ ai_analysis_results : requests
    users ||--o{ notifications : receives
    users ||--o{ device_subscriptions : has
    
    challenges ||--o{ user_challenges : completed_by
    challenges ||--o{ marathon_days : included_in
    challenges ||--o{ challenge_locations : has
    
    marathons ||--o{ marathon_days : contains
    marathons ||--o{ user_marathon_progress : tracked_by
    
    achievements ||--o{ user_achievements : earned_by
    
    challenge_categories ||--o{ challenges : contains
    
    device_subscriptions ||--o{ notifications : receives
```

### 2.2. Описание таблиц

#### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
    language VARCHAR(5) NOT NULL DEFAULT 'ru',
    notifications_enabled BOOLEAN DEFAULT true,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_created_at ON users(created_at);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| email | VARCHAR(255) | Email пользователя (уникальный) |
| password_hash | VARCHAR(255) | Хэш пароля (bcrypt/argon2) |
| subscription_tier | VARCHAR(20) | Уровень подписки: free/premium/masterclass |
| language | VARCHAR(5) | Язык интерфейса: ru/en |
| notifications_enabled | BOOLEAN | Флаг включения уведомлений |
| avatar_url | VARCHAR(500) | URL аватара в S3 |
| created_at | TIMESTAMP | Дата создания аккаунта |
| updated_at | TIMESTAMP | Дата последнего обновления |
| last_login_at | TIMESTAMP | Последний вход |
| deleted_at | TIMESTAMP | Soft delete (NULL = активен) |

---

#### subscriptions

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    payment_provider VARCHAR(50),
    payment_subscription_id VARCHAR(255),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE UNIQUE INDEX idx_subscriptions_user_active ON subscriptions(user_id) WHERE status = 'active';
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Foreign key к users |
| tier | VARCHAR(20) | Уровень: free/premium/masterclass |
| status | VARCHAR(20) | Статус: active/cancelled/expired |
| started_at | TIMESTAMP | Начало подписки |
| expires_at | TIMESTAMP | Окончание подписки |
| auto_renew | BOOLEAN | Автопродление |
| payment_provider | VARCHAR(50) | Платёжный провайдер (Stripe, Apple, Google) |
| payment_subscription_id | VARCHAR(255) | ID в платёжной системе |
| cancelled_at | TIMESTAMP | Дата отмены |

---

#### challenge_categories

```sql
CREATE TABLE challenge_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0
);

INSERT INTO challenge_categories (id, name, name_ru, name_en, description, sort_order) VALUES
('technical', 'Technical', 'Технические', 'Technical', 'Работа с камерой и настройками', 1),
('visual', 'Visual', 'Визуальные', 'Visual', 'Композиция, свет, цвет', 2),
('social', 'Social', 'Социальные', 'Social', 'Люди, взаимодействия, истории', 3),
('restriction', 'Restriction', 'Ограничения', 'Restriction', 'Искусственные ограничения', 4);
```

---

#### challenges

```sql
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES challenge_categories(id),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'pro')),
    description TEXT NOT NULL,
    description_ru TEXT NOT NULL,
    description_en TEXT NOT NULL,
    tips TEXT,
    tips_ru TEXT,
    tips_en TEXT,
    tags TEXT[] DEFAULT '{}',
    estimated_time_minutes INT DEFAULT 30,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    example_photo_urls VARCHAR(500)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_challenges_category ON challenges(category_id);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_is_premium ON challenges(is_premium);
CREATE INDEX idx_challenges_is_active ON challenges(is_active);
CREATE INDEX idx_challenges_tags ON challenges USING GIN(tags);
CREATE INDEX idx_challenges_random ON challenges(is_active, category_id, difficulty);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| title | VARCHAR(255) | Название (EN) |
| title_ru | VARCHAR(255) | Название (RU) |
| title_en | VARCHAR(255) | Название (EN) |
| category_id | VARCHAR(50) | Foreign key к challenge_categories |
| difficulty | VARCHAR(20) | Уровень: beginner/intermediate/pro |
| description | TEXT | Описание задания (EN) |
| description_ru | TEXT | Описание задания (RU) |
| description_en | TEXT | Описание задания (EN) |
| tips | TEXT | Советы (EN) |
| tips_ru | TEXT | Советы (RU) |
| tips_en | TEXT | Советы (EN) |
| tags | TEXT[] | Теги для фильтрации |
| estimated_time_minutes | INT | Оценка времени в минутах |
| is_premium | BOOLEAN | Требуется Premium подписка |
| is_active | BOOLEAN | Активно ли задание |
| example_photo_urls | VARCHAR[] | URL примеров работ |

---

#### marathons

```sql
CREATE TABLE marathons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    description_ru TEXT NOT NULL,
    description_en TEXT NOT NULL,
    duration_days INT NOT NULL DEFAULT 7,
    difficulty VARCHAR(20) NOT NULL,
    is_premium BOOLEAN DEFAULT true,
    bonus_description TEXT,
    bonus_description_ru TEXT,
    bonus_description_en TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_marathons_is_premium ON marathons(is_premium);
CREATE INDEX idx_marathons_is_active ON marathons(is_active);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| title | VARCHAR(255) | Название марафона |
| description | TEXT | Описание цели |
| duration_days | INT | Длительность (7 дней) |
| difficulty | VARCHAR(20) | Уровень сложности |
| is_premium | BOOLEAN | Требуется Premium |
| bonus_description | TEXT | Описание итогового бонуса |
| icon_url | VARCHAR(500) | URL иконки |
| is_active | BOOLEAN | Активен ли марафон |

---

#### marathon_days

```sql
CREATE TABLE marathon_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marathon_id UUID NOT NULL REFERENCES marathons(id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    description TEXT,
    description_ru TEXT,
    description_en TEXT,
    connection_to_previous TEXT,
    connection_to_previous_ru TEXT,
    connection_to_previous_en TEXT,
    UNIQUE(marathon_id, day_number)
);

CREATE INDEX idx_marathon_days_marathon_id ON marathon_days(marathon_id);
CREATE INDEX idx_marathon_days_challenge_id ON marathon_days(challenge_id);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| marathon_id | UUID | Foreign key к marathons |
| day_number | INT | Номер дня (1-7) |
| challenge_id | UUID | Foreign key к challenges |
| description | TEXT | Описание задания на день |
| connection_to_previous | TEXT | Связь с предыдущим днём |

---

#### user_challenges

```sql
CREATE TABLE user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    photo_url VARCHAR(500),
    notes TEXT,
    notes_ru TEXT,
    notes_en TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    xp_earned INT DEFAULT 0,
    ai_analysis_id UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);
CREATE INDEX idx_user_challenges_completed_at ON user_challenges(completed_at);
CREATE INDEX idx_user_challenges_user_status ON user_challenges(user_id, status);
CREATE INDEX idx_user_challenges_location ON user_challenges USING GIST (
    ll_to_earth(location_lat, location_lng)
);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Foreign key к users |
| challenge_id | UUID | Foreign key к challenges |
| status | VARCHAR(20) | Статус: in_progress/completed/abandoned |
| photo_url | VARCHAR(500) | URL фото в S3 |
| notes | TEXT | Заметки пользователя (EN) |
| notes_ru | TEXT | Заметки пользователя (RU) |
| notes_en | TEXT | Заметки пользователя (EN) |
| location_lat | DECIMAL | Широта места съёмки |
| location_lng | DECIMAL | Долгота места съёмки |
| xp_earned | INT | Полученный опыт |
| ai_analysis_id | UUID | Ссылка на AI анализ |
| completed_at | TIMESTAMP | Дата завершения |

---

#### user_marathon_progress

```sql
CREATE TABLE user_marathon_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    marathon_id UUID NOT NULL REFERENCES marathons(id) ON DELETE CASCADE,
    current_day INT NOT NULL DEFAULT 1 CHECK (current_day >= 1 AND current_day <= 7),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    bonus_earned BOOLEAN DEFAULT false,
    UNIQUE(user_id, marathon_id)
);

CREATE INDEX idx_user_marathon_progress_user_id ON user_marathon_progress(user_id);
CREATE INDEX idx_user_marathon_progress_marathon_id ON user_marathon_progress(marathon_id);
CREATE INDEX idx_user_marathon_progress_status ON user_marathon_progress(status);
CREATE INDEX idx_user_marathon_progress_expires_at ON user_marathon_progress(expires_at);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Foreign key к users |
| marathon_id | UUID | Foreign key к marathons |
| current_day | INT | Текущий день (1-7) |
| status | VARCHAR(20) | Статус: active/completed/failed/paused |
| started_at | TIMESTAMP | Дата начала |
| completed_at | TIMESTAMP | Дата завершения |
| expires_at | TIMESTAMP | Дата истечения (started_at + 14 дней) |
| bonus_earned | BOOLEAN | Получен ли бонус |

---

#### marathon_day_completions

```sql
CREATE TABLE marathon_day_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_marathon_progress_id UUID NOT NULL REFERENCES user_marathon_progress(id) ON DELETE CASCADE,
    day_number INT NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
    user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_marathon_progress_id, day_number)
);

CREATE INDEX idx_marathon_day_completions_progress_id ON marathon_day_completions(user_marathon_progress_id);
CREATE INDEX idx_marathon_day_completions_challenge_id ON marathon_day_completions(user_challenge_id);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_marathon_progress_id | UUID | Foreign key к user_marathon_progress |
| day_number | INT | Номер дня |
| user_challenge_id | UUID | Foreign key к user_challenges |
| completed_at | TIMESTAMP | Дата завершения дня |

---

#### achievements

```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    description_ru TEXT NOT NULL,
    description_en TEXT NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    criteria JSONB NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_is_hidden ON achievements(is_hidden);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| title | VARCHAR(255) | Название достижения |
| description | TEXT | Описание |
| icon_url | VARCHAR(500) | URL иконки |
| category | VARCHAR(50) | Категория: streak/category/marathon/etc |
| criteria | JSONB | Критерии получения (JSON) |
| is_hidden | BOOLEAN | Скрытое достижение |

**Пример criteria:**
```json
{
  "type": "count",
  "field": "challenges_completed",
  "required": 10
}
```

---

#### user_achievements

```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INT DEFAULT 0,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Foreign key к users |
| achievement_id | UUID | Foreign key к achievements |
| earned_at | TIMESTAMP | Дата получения |
| progress | INT | Текущий прогресс (0 = не получено) |

---

#### ai_analysis_results

```sql
CREATE TABLE ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE SET NULL,
    photo_url VARCHAR(500) NOT NULL,
    challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    overall_score DECIMAL(3, 2),
    matches_challenge BOOLEAN,
    composition_score DECIMAL(3, 2),
    lighting_score DECIMAL(3, 2),
    color_score DECIMAL(3, 2),
    subject_score DECIMAL(3, 2),
    feedback TEXT,
    feedback_ru TEXT,
    feedback_en TEXT,
    recommendations TEXT[],
    detected_elements TEXT[],
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_analysis_user_id ON ai_analysis_results(user_id);
CREATE INDEX idx_ai_analysis_challenge_id ON ai_analysis_results(challenge_id);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis_results(created_at);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Foreign key к users |
| user_challenge_id | UUID | Foreign key к user_challenges |
| photo_url | VARCHAR(500) | URL проанализированного фото |
| challenge_id | UUID | Foreign key к challenges |
| overall_score | DECIMAL | Общий балл (0-1) |
| matches_challenge | BOOLEAN | Соответствует ли заданию |
| composition_score | DECIMAL | Оценка композиции |
| lighting_score | DECIMAL | Оценка света |
| color_score | DECIMAL | Оценка цвета |
| subject_score | DECIMAL | Оценка объекта |
| feedback | TEXT | Текстовый фидбек (EN) |
| feedback_ru | TEXT | Текстовый фидбек (RU) |
| recommendations | TEXT[] | Рекомендации |
| detected_elements | TEXT[] | Распознанные элементы |
| model_version | VARCHAR(50) | Версия модели |

---

#### notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255),
    title_en VARCHAR(255),
    body TEXT NOT NULL,
    body_ru TEXT,
    body_en TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Foreign key к users |
| type | VARCHAR(50) | Тип: marathon_reminder/achievement/etc |
| title | VARCHAR(255) | Заголовок |
| body | TEXT | Текст уведомления |
| data | JSONB | Дополнительные данные |
| is_read | BOOLEAN | Прочитано ли |
| sent_at | TIMESTAMP | Дата отправки |

---

#### device_subscriptions

```sql
CREATE TABLE device_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('ios', 'android')),
    push_token VARCHAR(500) NOT NULL,
    topics TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, push_token)
);

CREATE INDEX idx_device_subscriptions_user_id ON device_subscriptions(user_id);
CREATE INDEX idx_device_subscriptions_device_type ON device_subscriptions(device_type);
CREATE INDEX idx_device_subscriptions_is_active ON device_subscriptions(is_active);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| user_id | UUID | Foreign key к users |
| device_type | VARCHAR(20) | Тип устройства: ios/android |
| push_token | VARCHAR(500) | Токен для push |
| topics | TEXT[] | Темы подписки |
| is_active | BOOLEAN | Активна ли подписка |
| last_seen_at | TIMESTAMP | Последняя активность |

---

#### challenge_locations

```sql
CREATE TABLE challenge_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    radius_meters INT DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_challenge_locations_challenge_id ON challenge_locations(challenge_id);
CREATE INDEX idx_challenge_locations_location ON challenge_locations USING GIST (
    ll_to_earth(location_lat, location_lng)
);
CREATE INDEX idx_challenge_locations_is_active ON challenge_locations(is_active);
```

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID | Первичный ключ |
| challenge_id | UUID | Foreign key к challenges |
| title | VARCHAR(255) | Название локации |
| description | TEXT | Описание |
| location_lat | DECIMAL | Широта |
| location_lng | DECIMAL | Долгота |
| radius_meters | INT | Радиус активности |
| is_active | BOOLEAN | Активна ли локация |

---

#### user_stats (денормализованная таблица для быстрого доступа)

```sql
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_challenges_completed INT DEFAULT 0,
    total_marathons_completed INT DEFAULT 0,
    total_xp INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    challenges_technical INT DEFAULT 0,
    challenges_visual INT DEFAULT 0,
    challenges_social INT DEFAULT 0,
    challenges_restriction INT DEFAULT 0,
    average_photos_per_week DECIMAL(5, 2) DEFAULT 0,
    last_completion_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_stats_total_xp ON user_stats(total_xp DESC);
CREATE INDEX idx_user_stats_current_streak ON user_stats(current_streak DESC);
```

---

## 3. Очереди и асинхронные задачи (RabbitMQ)

### 3.1. Топология очередей

```mermaid
graph LR
    subgraph Exchanges
        CE[challenge.events - topic]
        ME[marathon.events - topic]
        NE[notification.events - fanout]
        AE[analytics.events - topic]
    end
    
    subgraph Queues
        CQ[challenge.completion]
        AQ[ai.analysis.queue]
        NQ[notifications.send]
        MQ[marathon.progress.check]
        ANQ[analytics.events]
        EQ[achievements.check]
    end
    
    CE --> CQ
    CE --> AQ
    NE --> NQ
    ME --> MQ
    AE --> ANQ
    CE --> EQ
```

### 3.2. Описание очередей

#### challenge.completion

| Параметр | Значение |
|----------|----------|
| **Exchange** | challenge.events (topic) |
| **Routing Key** | challenge.completed |
| **Продюсеры** | Progress Service |
| **Консьюмеры** | Analytics Service, Achievement Service |
| **Durable** | Yes |
| **Prefetch** | 10 |

**Формат сообщения:**
```json
{
  "eventId": "uuid",
  "timestamp": "2026-03-10T12:00:00Z",
  "data": {
    "userId": "uuid",
    "challengeId": "uuid",
    "completionId": "uuid",
    "photoUrl": "https://...",
    "category": "technical",
    "difficulty": "beginner",
    "xpEarned": 10,
    "isMarathonDay": false,
    "marathonId": null,
    "marathonDay": null
  }
}
```

**Политика retry:**
- Max retries: 3
- Delay: exponential backoff (1s, 2s, 4s)
- Dead letter queue: challenge.completion.dlx

---

#### ai.analysis.queue

| Параметр | Значение |
|----------|----------|
| **Exchange** | challenge.events (topic) |
| **Routing Key** | challenge.completed.ai_required |
| **Продюсеры** | Progress Service |
| **Консьюмеры** | AI Service |
| **Durable** | Yes |
| **Prefetch** | 5 (AI медленно обрабатывает) |

**Формат сообщения:**
```json
{
  "eventId": "uuid",
  "timestamp": "2026-03-10T12:00:00Z",
  "data": {
    "analysisId": "uuid",
    "userId": "uuid",
    "challengeId": "uuid",
    "photoUrl": "https://...",
    "challengeCategory": "visual",
    "userLanguage": "ru",
    "callbackUrl": "http://progress-service/api/v1/ai/callbacks"
  }
}
```

**Политика retry:**
- Max retries: 2
- Delay: 5s, 10s
- Dead letter queue: ai.analysis.dlx
- Alert при попадании в DLQ

---

#### notifications.send

| Параметр | Значение |
|----------|----------|
| **Exchange** | notification.events (fanout) |
| **Продюсеры** | Все сервисы |
| **Консьюмеры** | Notification Service |
| **Durable** | Yes |
| **Prefetch** | 50 |

**Формат сообщения:**
```json
{
  "eventId": "uuid",
  "timestamp": "2026-03-10T12:00:00Z",
  "priority": "normal",
  "data": {
    "userId": "uuid",
    "type": "marathon_reminder",
    "title": "День 3 марафона",
    "body": "Не забудь выполнить задание!",
    "data": {
      "marathonId": "uuid",
      "dayNumber": 3,
      "deepLink": "streeteye://marathon/uuid/day/3"
    }
  }
}
```

**Политика retry:**
- Max retries: 3
- Delay: 10s, 30s, 60s
- Dead letter queue: notifications.dlx

---

#### marathon.progress.check

| Параметр | Значение |
|----------|----------|
| **Exchange** | marathon.events (topic) |
| **Routing Key** | marathon.daily_check |
| **Продюсеры** | Cron Scheduler (раз в сутки) |
| **Консьюмеры** | Marathon Service |
| **Durable** | Yes |
| **Prefetch** | 100 |

**Формат сообщения:**
```json
{
  "eventId": "uuid",
  "timestamp": "2026-03-10T00:00:00Z",
  "data": {
    "checkType": "daily",
    "cutoffDate": "2026-03-09T23:59:59Z"
  }
}
```

**Политика retry:**
- Max retries: 5
- Delay: 1m, 5m, 15m, 30m, 60m
- Alert при неудаче

---

#### analytics.events

| Параметр | Значение |
|----------|----------|
| **Exchange** | analytics.events (topic) |
| **Routing Key** | event.{eventType} |
| **Продюсеры** | Все сервисы |
| **Консьюмеры** | Analytics Service |
| **Durable** | Yes |
| **Prefetch** | 100 |

**Формат сообщения:**
```json
{
  "eventId": "uuid",
  "timestamp": "2026-03-10T12:00:00Z",
  "eventType": "challenge_started",
  "userId": "uuid",
  "properties": {
    "challengeId": "uuid",
    "category": "visual",
    "difficulty": "intermediate",
    "mode": "quick_walk"
  }
}
```

**Политика retry:**
- Max retries: 1 (аналитика не критична)
- Delay: 5s
- Потеря сообщений допустима

---

#### achievements.check

| Параметр | Значение |
|----------|----------|
| **Exchange** | challenge.events (topic) |
| **Routing Key** | achievement.check |
| **Продюсеры** | Progress Service |
| **Консьюмеры** | Achievement Service (часть Progress) |
| **Durable** | Yes |
| **Prefetch** | 10 |

**Формат сообщения:**
```json
{
  "eventId": "uuid",
  "timestamp": "2026-03-10T12:00:00Z",
  "data": {
    "userId": "uuid",
    "triggerEvent": "challenge_completed",
    "context": {
      "totalCompleted": 15,
      "currentStreak": 5,
      "categoriesCompleted": ["technical", "visual"]
    }
  }
}
```

---

## 4. Кэширование (Redis)

### 4.1. Стратегии кэширования

| Ключ | Pattern | TTL | Данные | Инвалидация |
|------|---------|-----|--------|-------------|
| **Сессии** | | | | |
| JWT Blacklist | `session:blacklist:{jti}` | до expiry токена | - | Автоматически по TTL |
| Refresh Tokens | `session:refresh:{userId}` | 30 дней | { tokenId, expiresAt, deviceId } | При logout, смене пароля |
| **Пользователи** | | | | |
| Профиль | `user:profile:{userId}` | 5 мин | { email, tier, language, ... } | При обновлении профиля |
| Подписка | `user:subscription:{userId}` | 1 мин | { tier, status, expiresAt } | При изменении подписки |
| Статистика | `user:stats:{userId}` | 1 мин | { totalChallenges, streak, ... } | При завершении задания |
| **Задания** | | | | |
| Задание по ID | `challenge:{challengeId}` | 1 час | Полные данные задания | При обновлении задания |
| Случайное задание | `challenge:random:{category}:{difficulty}` | 5 мин | challengeId | При добавлении заданий |
| Категории | `challenge:categories` | 1 час | Список категорий | При изменении категорий |
| **Марафоны** | | | | |
| Марафон по ID | `marathon:{marathonId}` | 1 час | Данные марафона с днями | При обновлении марафона |
| Прогресс | `marathon:progress:{userId}:{marathonId}` | 30 сек | { currentDay, status } | При завершении дня |
| **Heat Mode** | | | | |
| Активная сессия | `heatmode:session:{sessionId}` | 2 часа | { userId, challengeId, nextAt } | По истечении сессии |
| Сессии пользователя | `heatmode:user:{userId}` | 2 часа | [sessionId] | При завершении сессии |
| **Rate Limiting** | | | | |
| По IP | `ratelimit:ip:{ip}:{endpoint}` | 1 мин | count | Автоматически по TTL |
| По пользователю | `ratelimit:user:{userId}:{endpoint}` | 1 мин | count | Автоматически по TTL |
| **Геолокация** | | | | |
| Nearby challenges | `geo:nearby:{lat5}:{lng5}` | 5 мин | [challengeId] | При изменении локации |
| **Уведомления** | | | | |
| Непрочитанные | `notifications:unread:{userId}` | 1 мин | count | При чтении уведомления |
| **AI** | | | | |
| Результат анализа | `ai:analysis:{analysisId}` | 24 часа | Результат анализа | Однократное чтение |
| **Контент** | | | | |
| Tips & Tricks | `content:tips:{challengeId}` | 1 день | Советы для задания | При обновлении контента |
| Примеры | `content:examples:{category}` | 1 день | Примеры работ | При обновлении контента |

### 4.2. Конфигурация Redis

```yaml
# redis.conf
maxmemory: 2gb
maxmemory-policy: allkeys-lru
appendonly: yes
appendfsync: everysec
save:
  - 900 1
  - 300 10
  - 60 10000
```

### 4.3. Redis Cluster (для продакшена)

```
3 master nodes + 3 replica nodes
Sharding по ключам:
  - {user}:xxx → слот 0-5460
  - {challenge}:xxx → слот 5461-10922
  - {session}:xxx → слот 10923-16383
```

---

## 5. Файловое хранилище (S3)

### 5.1. Buckets

#### streeteye-user-photos

| Параметр | Значение |
|----------|----------|
| **Назначение** | Фото пользователей (выполненные задания) |
| **Access** | Private (presigned URLs для доступа) |
| **Versioning** | Enabled |
| **Lifecycle** | Переход в Glacier через 90 дней |
| **CORS** | Разрешён только для CDN |

**Структура путей:**
```
s3://streeteye-user-photos/
├── user-{userId}/
│   ├── challenge-{challengeId}/
│   │   ├── {timestamp}_{uuid}.jpg
│   │   └── {timestamp}_{uuid}.jpg
│   └── avatar/
│       └── avatar_{timestamp}.jpg
```

#### streeteye-challenge-examples

| Параметр | Значение |
|----------|----------|
| **Назначение** | Примеры работ для заданий |
| **Access** | Public read (через CDN) |
| **Versioning** | Enabled |
| **Lifecycle** | Нет (постоянное хранение) |

**Структура путей:**
```
s3://streeteye-challenge-examples/
├── technical/
│   ├── beginner/
│   │   └── {challengeId}_{index}.jpg
│   ├── intermediate/
│   └── pro/
├── visual/
├── social/
└── restriction/
```

#### streeteye-ai-temp

| Параметр | Значение |
|----------|----------|
| **Назначение** | Временные фото для AI анализа |
| **Access** | Private |
| **Versioning** | Disabled |
| **Lifecycle** | Удаление через 7 дней |

**Структура путей:**
```
s3://streeteye-ai-temp/
└── analysis-{analysisId}/
    └── input.jpg
```

### 5.2. CDN интеграция

**CloudFront distribution:**
- Origin: S3 buckets
- Cache policies:
  - Challenge examples: Cache 1 год, invalidate при обновлении
  - User photos: Cache 1 час (presigned URLs bypass cache)
- Geo-restriction: Нет ограничений
- HTTPS: Обязательно

### 5.3. Presigned URLs

```typescript
// Генерация presigned URL для загрузки
const uploadUrl = await s3.getSignedUrlPromise('putObject', {
  Bucket: 'streeteye-user-photos',
  Key: `user-${userId}/challenge-${challengeId}/${timestamp}_${uuid}.jpg`,
  Expires: 300, // 5 минут
  ContentType: 'image/jpeg',
});

// Генерация presigned URL для скачивания
const downloadUrl = await s3.getSignedUrlPromise('getObject', {
  Bucket: 'streeteye-user-photos',
  Key: `user-${userId}/challenge-${challengeId}/${timestamp}_${uuid}.jpg`,
  Expires: 3600, // 1 час
});
```

---

## 6. Безопасность

### 6.1. Аутентификация

**JWT Token Structure:**

```typescript
// Access Token (15 минут)
{
  sub: "userId",
  email: "user@example.com",
  tier: "premium",
  iat: 1234567890,
  exp: 1234568790,
  jti: "unique-token-id"
}

// Refresh Token (30 дней, хранится в Redis)
{
  sub: "userId",
  tokenId: "unique-refresh-id",
  iat: 1234567890,
  exp: 1237159890,
  deviceId: "device-fingerprint"
}
```

**Конфигурация:**
```typescript
{
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: '15m',
    refreshExpiresIn: '30d',
    algorithm: 'HS256'
  }
}
```

### 6.2. Авторизация

**RBAC + Subscription-based:**

```typescript
// Guards
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@SubscribeTo('premium')
```

**Матрица доступа:**

| Endpoint | Free | Premium | Masterclass |
|----------|------|---------|-------------|
| GET /challenges/random (basic) | ✅ | ✅ | ✅ |
| GET /challenges/random (premium) | ❌ | ✅ | ✅ |
| POST /ai/analyze | ❌ | ✅ (10/day) | ✅ (50/day) |
| GET /marathons | 1 марафон | Все | Все |
| POST /progress/export | ❌ | ✅ | ✅ |
| GET /geo/challenges/nearby | ❌ | ✅ | ✅ |

### 6.3. Защита данных

**Password Hashing:**
```typescript
import * as argon2 from 'argon2';

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4
});

const valid = await argon2.verify(hash, password);
```

**Input Validation (class-validator):**
```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

class RegisterDto {
  @IsEmail()
  email: string;
  
  @MinLength(8)
  @IsString()
  password: string;
  
  @IsOptional()
  @IsString()
  language?: 'ru' | 'en';
}
```

**SQL Injection Prevention:**
- TypeORM с parameterized queries
- Все user input валидируется
- Raw queries запрещены без явного одобрения security review

**XSS/CSRF:**
- CORS настроен только для доменов приложения
- CSRF tokens для web endpoints
- Content-Type validation
- Helmet middleware для security headers

### 6.4. Rate Limiting

```typescript
// Throttler configuration
{
  throttlers: [
    {
      name: 'short',
      ttl: 1000,
      limit: 10, // 10 запросов в секунду
    },
    {
      name: 'medium',
      ttl: 60000,
      limit: 60, // 60 запросов в минуту
    },
    {
      name: 'long',
      ttl: 3600000,
      limit: 1000, // 1000 запросов в час
    },
  ],
  storage: ThrottlerStorageRedisService,
}
```

**Лимиты по endpoints:**

| Endpoint | Limit |
|----------|-------|
| POST /auth/login | 10/мин |
| POST /auth/register | 5/мин |
| POST /ai/analyze | 10/день (Premium) |
| GET /challenges/random | 30/мин |
| POST /files/upload-url | 30/мин |
| Остальные GET | 60/мин |
| Остальные POST | 30/мин |

---

## 7. Мониторинг и логирование

### 7.1. Логирование

**Структура логов (JSON):**
```json
{
  "timestamp": "2026-03-10T12:00:00.000Z",
  "level": "info",
  "service": "challenge-service",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "user789",
  "message": "Challenge generated",
  "context": {
    "challengeId": "chal123",
    "category": "visual",
    "difficulty": "intermediate",
    "durationMs": 45
  }
}
```

**Уровни логирования:**
- `error`: Ошибки, требующие вмешательства
- `warn`: Предупреждения (не критично)
- `info`: Важные события (вход, завершение задания)
- `debug`: Детали для отладки (только staging)

**Агрегация:**
- Staging: Loki + Grafana
- Production: ELK Stack (Elasticsearch, Logstash, Kibana)
- Retention: 30 дней

### 7.2. Метрики (Prometheus + Grafana)

**Основные метрики:**

```promql
# Request rate по сервисам
rate(http_requests_total{service="challenge-service"}[5m])

# Latency percentiles
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Active users
count(count by (userId) (http_requests_total))

# Challenge completion rate
rate(challenge_completed_total[1h])

# Subscription conversion
rate(subscription_upgraded_total[1d])

# Queue lengths
rabbitmq_queue_messages{queue="ai.analysis.queue"}

# AI analysis latency
histogram_quantile(0.95, rate(ai_analysis_duration_seconds_bucket[5m]))
```

**Дашборды:**
1. **System Overview** — все сервисы, uptime, request rate
2. **Business Metrics** — регистрации, завершения заданий, конверсия
3. **AI Service** — latency, accuracy, queue depth
4. **Database** — connections, query time, locks
5. **Cache** — hit rate, memory usage, evictions

### 7.3. Distributed Tracing

**Jaeger/Zipkin:**
- Sampling rate: 10% для production, 100% для staging
- Correlation ID передаётся через все сервисы
- Trace context: `X-Trace-ID`, `X-Span-ID`

**Пример trace:**
```
User Request → API Gateway → Challenge Service → Redis
                                           ↓
                                    Progress Service → PostgreSQL
                                           ↓
                                    RabbitMQ → AI Service → S3
```

### 7.4. Alerting (PagerDuty/Slack)

**Критические алерты:**

| Алерт | Условие | Приоритет |
|-------|---------|-----------|
| Service Down | Сервис не отвечает 2 мин | P0 |
| High Error Rate | 5xx > 5% за 5 мин | P0 |
| High Latency | p95 > 1s за 10 мин | P1 |
| Queue Backlog | AI queue > 100 за 5 мин | P1 |
| Database Connections | > 80% пула | P1 |
| Cache Hit Rate | < 70% за 10 мин | P2 |
| Subscription Expiring | > 100 подписок истекает завтра | P2 |

---

## 8. Развёртывание и инфраструктура

### 8.1. Docker

**Dockerfile (универсальный для NestJS сервисов):**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY apps/challenge-service ./apps/challenge-service
COPY libs ./libs
RUN npm ci --only=production

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
USER node

EXPOSE 3000
CMD ["node", "dist/apps/challenge-service/main.js"]
```

**docker-compose.yml (локальная разработка):**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: streeteye
      POSTGRES_USER: streeteye
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

  auth-service:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        SERVICE: auth-service
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://streeteye:devpassword@postgres:5432/streeteye
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret

  challenge-service:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        SERVICE: challenge-service
    ports:
      - "3003:3000"
    depends_on:
      - postgres
      - redis
      - rabbitmq

  ai-service:
    build:
      context: ./apps/ai-service
    ports:
      - "3006:8000"
    environment:
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  minio_data:
```

### 8.2. Kubernetes (Production)

**Deployment (пример для Challenge Service):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: challenge-service
  namespace: streeteye
spec:
  replicas: 3
  selector:
    matchLabels:
      app: challenge-service
  template:
    metadata:
      labels:
        app: challenge-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
    spec:
      containers:
        - name: challenge-service
          image: registry.streeteye.com/challenge-service:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
            - name: REDIS_URL
              value: "redis://redis-cluster:6379"
            - name: RABBITMQ_URL
              valueFrom:
                secretKeyRef:
                  name: rabbitmq-secret
                  key: url
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: challenge-service
  namespace: streeteye
spec:
  selector:
    app: challenge-service
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: challenge-service-hpa
  namespace: streeteye
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: challenge-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 8.3. CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - develop
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test
      
      - name: Build
        run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
      
  deploy-staging:
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging
        run: |
          kubectl set image deployment/challenge-service \
            challenge-service=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            -n streeteye-staging

  deploy-production:
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          kubectl set image deployment/challenge-service \
            challenge-service=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            -n streeteye-production
```

---

## 9. План разработки

### 9.1. MVP (6 недель)

**Цель:** Базовый функционал для тестирования гипотез

| Неделя | Задачи |
|--------|--------|
| **1** | • Настройка монорепозитория (Nx/Turborepo)<br>• Базовая инфраструктура (Docker, docker-compose)<br>• Auth Service: регистрация, логин, JWT |
| **2** | • User Service: профиль, настройки<br>• Challenge Service: CRUD заданий<br>• Схема БД: users, challenges, categories |
| **3** | • Challenge Service: рандомайзер<br>• Progress Service: завершение заданий<br>• Redis: кэширование заданий |
| **4** | • Progress Service: статистика, история<br>• File Service: загрузка в MinIO (S3)<br>• Интеграция сервисов |
| **5** | • Тестирование (unit, integration)<br>• Исправление багов<br>• Деплой на staging |
| **6** | • Load testing<br>• Security audit<br>• Production деплой (soft launch) |

**MVP функциональность:**
- ✅ Регистрация/логин
- ✅ 50 базовых заданий (4 категории, 3 уровня)
- ✅ Quick Walk режим
- ✅ Завершение заданий с фото
- ✅ Дневник прогресса (локально)
- ✅ Базовая статистика

---

### 9.2. v1.0 (12 недель)

**Цель:** Полноценный запуск с монетизацией

| Неделя | Задачи |
|--------|--------|
| **7-8** | • Marathon Service: CRUD марафонов<br>• Прогресс по марафонам<br>• Ежедневные проверки |
| **9-10** | • Subscription Service: интеграция платежей<br>• Stripe/Apple Pay/Google Pay<br>• Subscription-based access control |
| **11-12** | • Notification Service: FCM, APNs<br>• Push-уведомления<br>• Настройки уведомлений |
| **13-14** | • File Service: AWS S3 + CloudFront<br>• Оптимизация загрузки<br>• CDN интеграция |
| **15-16** | • Тестирование монетизации<br>• A/B тесты цен<br>• Production деплой |

**v1.0 функциональность:**
- ✅ Всё из MVP
- ✅ 5 марафонов (7 дней каждый)
- ✅ Подписки (Free/Premium)
- ✅ Push-уведомления
- ✅ Heat Mode
- ✅ Экспорт статистики (Premium)

---

### 9.3. v2.0 (18+ недель)

**Цель:** Продвинутые функции и масштабирование

| Неделя | Задачи |
|--------|--------|
| **17-20** | • AI Service: базовая модель анализа<br>• Интеграция с Progress Service<br>• Рекомендации |
| **21-24** | • Geo Service: PostGIS<br>• Location-based задания<br>• История локаций |
| **25-28** | • Analytics Service: ClickHouse<br>• Дашборды метрик<br>• A/B тестирование |
| **29-32** | • Watch Integration: уведомления на часы<br>• Оффлайн-режим<br>• Синхронизация |
| **33-36** | • Masterclass курсы<br>• Видео контент<br>• Платёж за курсы |
| **37+** | • Оптимизация производительности<br>• Масштабирование<br>• Новые фичи по фидбеку |

**v2.0 функциональность:**
- ✅ Всё из v1.0
- ✅ AI-анализ фотографий
- ✅ Location-based задания
- ✅ Интеграция с Apple Watch / Android Wear
- ✅ Masterclass курсы
- ✅ Расширенная аналитика

---

## 10. Приложения

### 10.1. Глоссарий

| Термин | Определение |
|--------|-------------|
| **Challenge** | Задание для пользователя (фото-челлендж) |
| **Marathon** | Серия из 7 связанных заданий |
| **Quick Walk** | Режим: одно случайное задание на прогулку |
| **Heat Mode** | Режим: новое задание каждые 15 минут |
| **Location Based** | Задания на основе геолокации |
| **Streak** | Серия дней с выполненными заданиями |
| **XP** | Очки опыта за выполнения заданий |
| **Achievement** | Достижение/бейдж за выполнение условий |

### 10.2. Ссылки

- [Спецификация продукта](./spec.md)
- [Промпт для генерации](./prompt-for-backend-spec.md)
- [Документация NestJS](https://docs.nestjs.com)
- [Документация TypeORM](https://typeorm.io)
- [Документация RabbitMQ](https://www.rabbitmq.com/documentation.html)

---

*Спецификация бекенда StreetEye v1.0*  
*Создана: 10 марта 2026 г.*
