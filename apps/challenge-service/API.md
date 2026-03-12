# Challenge Service API Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Endpoints](#3-endpoints)
4. [Data Models](#4-data-models)
5. [Error Handling](#5-error-handling)
6. [Code Examples](#6-code-examples)
7. [Pagination](#7-pagination)
8. [Filtering & Sorting](#8-filtering--sorting)
9. [Rate Limiting](#9-rate-limiting)
10. [Changelog](#10-changelog)

---

## 1. Overview

### Purpose

The Challenge Service API provides RESTful endpoints for managing photography challenges in the streetEye platform. It enables users to:

- Browse and discover photography challenges
- Get personalized challenge recommendations
- Participate in Heat Mode sessions (timed challenge marathons)
- Manage challenge categories and metadata

### Base URL

```
Development: http://localhost:3002/api/v1
Production:  https://api.streetye.com/challenges/api/v1
```

### API Version

**Current Version:** v1

### Rate Limits

| Tier | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Anonymous | 30 | 500 |
| Authenticated | 60 | 5,000 |
| Premium | 120 | 20,000 |

### Supported Formats

- **Request:** `application/json`
- **Response:** `application/json`

---

## 2. Authentication

### Overview

The Challenge Service API uses Bearer token authentication. All endpoints except public challenge browsing require authentication.

### Obtaining a Token

Tokens are issued by the streetEye Auth Service. See the [Auth Service Documentation](../auth-service/API.md) for details.

### Using Authentication

Include the token in the `Authorization` header:

```http
Authorization: Bearer <your_access_token>
```

### Example Authentication Request

```bash
curl -X POST https://api.streetye.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Security Considerations

- Always use HTTPS in production
- Store tokens securely (never in localStorage for sensitive apps)
- Implement token refresh logic
- Tokens expire after 1 hour by default

---

## 3. Endpoints

### Challenges

#### Get All Challenges

**Method:** `GET`
**Path:** `/challenges`
**Description:** Retrieve a paginated list of challenges with optional filtering.

**Authentication Required:** No

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| category | string | No | Filter by category ID | - |
| difficulty | string | No | Filter by difficulty level | - |
| isPremium | boolean | No | Filter by premium status | - |
| tags | string | No | Comma-separated tags | - |
| page | integer | No | Page number | 1 |
| limit | integer | No | Items per page | 20 |
| sortBy | string | No | Sort field | created_at |
| sortOrder | string | No | Sort order | desc |

**Valid Values:**
- `difficulty`: `beginner`, `intermediate`, `pro`
- `sortBy`: `created_at`, `difficulty`, `estimated_time`
- `sortOrder`: `asc`, `desc`

**Response:**
- Status Code: 200 OK

```json
{
  "challenges": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Golden Hour Portrait",
      "category": {
        "id": "visual",
        "name": "Visual",
        "nameRu": "Візуальне",
        "nameEn": "Visual"
      },
      "difficulty": "intermediate",
      "estimatedTimeMinutes": 45,
      "isPremium": false,
      "tags": ["portrait", "outdoor", "natural-light"]
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:3002/api/v1/challenges?difficulty=beginner&page=1&limit=10"
```

---

#### Get Challenge by ID

**Method:** `GET`
**Path:** `/challenges/:id`
**Description:** Retrieve detailed information about a specific challenge.

**Authentication Required:** No

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Challenge UUID |

**Response:**
- Status Code: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Golden Hour Portrait",
  "titleRu": "Портрет у золоту годину",
  "titleEn": "Golden Hour Portrait",
  "category": {
    "id": "visual",
    "name": "Visual",
    "nameRu": "Візуальне",
    "nameEn": "Visual"
  },
  "difficulty": "intermediate",
  "description": "Capture a stunning portrait during the golden hour...",
  "descriptionRu": "Зробіть приголомшливий портрет під час золотої години...",
  "descriptionEn": "Capture a stunning portrait during the golden hour...",
  "tips": "Find open shade and use a reflector",
  "tipsRu": "Знайдіть відкриту тінь і використовуйте рефлектор",
  "tipsEn": "Find open shade and use a reflector",
  "tags": ["portrait", "outdoor", "natural-light"],
  "estimatedTimeMinutes": 45,
  "examplePhotoUrls": ["https://example.com/photo1.jpg"],
  "isPremium": false,
  "viewCount": 1250,
  "completionCount": 340
}
```

**Error Responses:**
- 404 Not Found: Challenge with specified ID doesn't exist

```json
{
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/challenges/invalid-id",
  "error": "CHALLENGE_NOT_FOUND",
  "message": "Challenge with ID invalid-id not found"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:3002/api/v1/challenges/550e8400-e29b-41d4-a716-446655440000
```

---

#### Get Random Challenge

**Method:** `GET`
**Path:** `/challenges/random`
**Description:** Get a randomly selected challenge with intelligent weighting based on filters.

**Authentication Required:** No

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Preferred category |
| difficulty | string | No | Preferred difficulty |
| mode | string | No | Challenge mode |
| location.lat | number | No | Latitude for location-based |
| location.lng | number | No | Longitude for location-based |
| location.radius | number | No | Search radius in meters |
| excludeIds | string[] | No | Challenge IDs to exclude |

**Valid Values:**
- `difficulty`: `beginner`, `intermediate`, `pro`
- `mode`: `quick_walk`, `heat_mode`, `location_based`

**Response:**
- Status Code: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Street Reflections",
  "titleRu": "Вуличні відображення",
  "titleEn": "Street Reflections",
  "category": {
    "id": "visual",
    "name": "Visual",
    "nameRu": "Візуальне",
    "nameEn": "Visual"
  },
  "difficulty": "intermediate",
  "description": "Capture interesting reflections in urban environments...",
  "descriptionRu": "Зробіть цікаві відображення в міському середовищі...",
  "descriptionEn": "Capture interesting reflections in urban environments...",
  "tips": "Look for puddles, windows, and shiny surfaces",
  "tipsRu": "Шукайте калюжі, вікна та блискучі поверхні",
  "tipsEn": "Look for puddles, windows, and shiny surfaces",
  "tags": ["street", "reflection", "urban"],
  "estimatedTimeMinutes": 30,
  "examplePhotoUrls": ["https://example.com/reflection1.jpg"],
  "isPremium": false
}
```

**Example Request:**
```bash
curl -X GET "http://localhost:3002/api/v1/challenges/random?difficulty=beginner&category=visual"
```

---

#### Get Challenge Categories

**Method:** `GET`
**Path:** `/challenges/categories`
**Description:** Retrieve all available challenge categories with challenge counts.

**Authentication Required:** No

**Response:**
- Status Code: 200 OK

```json
{
  "categories": [
    {
      "id": "visual",
      "name": "Visual",
      "nameRu": "Візуальне",
      "nameEn": "Visual",
      "description": "Focus on visual composition and aesthetics",
      "descriptionRu": "Зосереджено на візуальній композиції та естетиці",
      "descriptionEn": "Focus on visual composition and aesthetics",
      "iconUrl": "https://cdn.streetye.com/icons/visual.svg",
      "sortOrder": 1,
      "challengesCount": {
        "total": 45,
        "byDifficulty": {
          "beginner": 15,
          "intermediate": 20,
          "pro": 10
        }
      }
    }
  ]
}
```

**Example Request:**
```bash
curl -X GET http://localhost:3002/api/v1/challenges/categories
```

---

#### Create Challenge

**Method:** `POST`
**Path:** `/challenges`
**Description:** Create a new challenge (Admin only).

**Authentication Required:** Yes (Admin role)

**Request Body:**

```json
{
  "title": "Urban Geometry",
  "titleRu": "Міська геометрія",
  "titleEn": "Urban Geometry",
  "categoryId": "visual",
  "difficulty": "intermediate",
  "description": "Find and capture interesting geometric patterns in urban architecture...",
  "descriptionRu": "Знайдіть і зробіть цікаві геометричні візерунки в міській архітектурі...",
  "descriptionEn": "Find and capture interesting geometric patterns in urban architecture...",
  "tips": "Look for repeating patterns, symmetry, and leading lines",
  "tipsRu": "Шукайте повторювані візерунки, симетрію та напрямні лінії",
  "tipsEn": "Look for repeating patterns, symmetry, and leading lines",
  "tags": ["architecture", "geometry", "urban"],
  "estimatedTimeMinutes": 60,
  "isPremium": false,
  "examplePhotoUrls": ["https://example.com/geometry1.jpg"]
}
```

**Validation Rules:**

| Field | Type | Constraints |
|-------|------|-------------|
| title | string | 5-100 characters |
| categoryId | string | Valid category ID |
| difficulty | string | `beginner`, `intermediate`, `pro` |
| description | string | 20-1000 characters |
| estimatedTimeMinutes | number | 5-180 minutes |
| tags | string[] | Max 10 tags, each max 3 chars |
| examplePhotoUrls | string[] | Max 3 URLs |

**Response:**
- Status Code: 201 Created

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "title": "Urban Geometry",
  "titleRu": "Міська геометрія",
  "titleEn": "Urban Geometry",
  "category": {
    "id": "visual",
    "name": "Visual",
    "nameRu": "Візуальне",
    "nameEn": "Visual"
  },
  "difficulty": "intermediate",
  "description": "Find and capture interesting geometric patterns...",
  "tags": ["architecture", "geometry", "urban"],
  "estimatedTimeMinutes": 60,
  "isPremium": false,
  "examplePhotoUrls": ["https://example.com/geometry1.jpg"]
}
```

**Error Responses:**
- 400 Bad Request: Validation failed
- 401 Unauthorized: Missing/invalid token
- 403 Forbidden: User lacks admin role
- 409 Conflict: Category not found

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/v1/challenges \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Urban Geometry",
    "titleRu": "Міська геометрія",
    "titleEn": "Urban Geometry",
    "categoryId": "visual",
    "difficulty": "intermediate",
    "description": "Find and capture interesting geometric patterns...",
    "descriptionRu": "...",
    "descriptionEn": "...",
    "estimatedTimeMinutes": 60,
    "tags": ["architecture", "geometry"]
  }'
```

---

#### Update Challenge

**Method:** `PUT`
**Path:** `/challenges/:id`
**Description:** Update an existing challenge (Admin only).

**Authentication Required:** Yes (Admin role)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Challenge UUID |

**Request Body:** (All fields optional)

```json
{
  "title": "Updated Urban Geometry",
  "difficulty": "pro",
  "estimatedTimeMinutes": 90
}
```

**Response:**
- Status Code: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "title": "Updated Urban Geometry",
  "difficulty": "pro",
  "estimatedTimeMinutes": 90,
  ...
}
```

**Error Responses:**
- 404 Not Found: Challenge doesn't exist
- 409 Conflict: Invalid category reference

**Example Request:**
```bash
curl -X PUT http://localhost:3002/api/v1/challenges/550e8400-e29b-41d4-a716-446655440002 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "pro",
    "estimatedTimeMinutes": 90
  }'
```

---

#### Delete Challenge

**Method:** `DELETE`
**Path:** `/challenges/:id`
**Description:** Soft delete a challenge (Admin only).

**Authentication Required:** Yes (Admin role)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Challenge UUID |

**Response:**
- Status Code: 204 No Content

**Error Responses:**
- 404 Not Found: Challenge doesn't exist

**Example Request:**
```bash
curl -X DELETE http://localhost:3002/api/v1/challenges/550e8400-e29b-41d4-a716-446655440002 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Heat Mode

Heat Mode is a timed challenge marathon where users complete a series of challenges within a set duration.

#### Start Heat Mode Session

**Method:** `POST`
**Path:** `/challenges/heat-mode/start`
**Description:** Start a new Heat Mode session.

**Authentication Required:** Yes

**Request Body:**

```json
{
  "duration": 60,
  "category": "visual",
  "difficulty": "intermediate"
}
```

**Validation Rules:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| duration | number | Yes | 15-120 minutes |
| category | string | No | Valid category ID |
| difficulty | string | No | `beginner`, `intermediate`, `pro` |

**Response:**
- Status Code: 201 Created

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440010",
  "status": "active",
  "startedAt": "2024-01-15T10:00:00.000Z",
  "expiresAt": "2024-01-15T11:00:00.000Z",
  "duration": 60,
  "intervalMinutes": 15,
  "currentChallenge": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Street Reflections",
    "category": "visual",
    "difficulty": "intermediate",
    "description": "Capture interesting reflections..."
  },
  "nextChallengeAt": "2024-01-15T10:15:00.000Z",
  "challengesRemaining": 4
}
```

**Error Responses:**
- 400 Bad Request: Invalid input
- 401 Unauthorized: Missing/invalid token
- 409 Conflict: User already has an active session

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/v1/challenges/heat-mode/start \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 60,
    "category": "visual",
    "difficulty": "intermediate"
  }'
```

---

#### Get Active Heat Mode Session

**Method:** `GET`
**Path:** `/challenges/heat-mode/active`
**Description:** Get the user's currently active Heat Mode session.

**Authentication Required:** Yes

**Response:**
- Status Code: 200 OK

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440010",
  "status": "active",
  "startedAt": "2024-01-15T10:00:00.000Z",
  "expiresAt": "2024-01-15T11:00:00.000Z",
  "currentChallenge": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Street Reflections",
    "category": "visual",
    "difficulty": "intermediate",
    "description": "Capture interesting reflections...",
    "tips": "Look for puddles, windows, and shiny surfaces"
  },
  "challengesCompleted": 1,
  "challengesTotal": 4,
  "nextChallengeAt": "2024-01-15T10:30:00.000Z",
  "timeRemaining": 1800
}
```

**Error Responses:**
- 401 Unauthorized: Missing/invalid token
- 404 Not Found: No active session exists

```json
{
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/challenges/heat-mode/active",
  "error": "NO_ACTIVE_SESSION",
  "message": "No active heat mode session found"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:3002/api/v1/challenges/heat-mode/active \
  -H "Authorization: Bearer USER_TOKEN"
```

---

#### Get Next Challenge in Heat Mode

**Method:** `POST`
**Path:** `/challenges/heat-mode/:sessionId/next`
**Description:** Get the next challenge in an active Heat Mode session.

**Authentication Required:** Yes

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | UUID | Yes | Session UUID |

**Response:**
- Status Code: 200 OK

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440010",
  "challenge": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "title": "Leading Lines",
    "category": "visual",
    "difficulty": "intermediate",
    "description": "Use natural or architectural lines...",
    "tips": "Look for roads, fences, and pathways"
  },
  "nextChallengeAt": "2024-01-15T10:45:00.000Z",
  "challengesRemaining": 2
}
```

**Error Responses:**
- 401 Unauthorized: Missing/invalid token
- 404 Not Found: Session not found or not owned by user
- 410 Gone: Session has expired

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/v1/challenges/heat-mode/550e8400-e29b-41d4-a716-446655440010/next \
  -H "Authorization: Bearer USER_TOKEN"
```

---

#### End Heat Mode Session

**Method:** `DELETE`
**Path:** `/challenges/heat-mode/:sessionId`
**Description:** End an active Heat Mode session early.

**Authentication Required:** Yes

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | UUID | Yes | Session UUID |

**Response:**
- Status Code: 200 OK

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440010",
  "status": "cancelled",
  "challengesCompleted": 2,
  "sessionDuration": 25
}
```

**Error Responses:**
- 401 Unauthorized: Missing/invalid token
- 404 Not Found: Session not found or not owned by user

**Example Request:**
```bash
curl -X DELETE http://localhost:3002/api/v1/challenges/heat-mode/550e8400-e29b-41d4-a716-446655440010 \
  -H "Authorization: Bearer USER_TOKEN"
```

---

### Health Check

#### API Health

**Method:** `GET`
**Path:** `/health`
**Description:** Check API health status.

**Authentication Required:** No

**Response:**
- Status Code: 200 OK

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:3002/api/v1/health
```

---

## 4. Data Models

### Challenge

```typescript
interface Challenge {
  /** Unique identifier */
  id: string;
  
  /** Challenge title (Ukrainian) */
  title: string;
  
  /** Challenge title (Russian) */
  titleRu: string;
  
  /** Challenge title (English) */
  titleEn: string;
  
  /** Category information */
  category: Category;
  
  /** Category ID reference */
  categoryId: string;
  
  /** Difficulty level */
  difficulty: DifficultyLevel;
  
  /** Full description (Ukrainian) */
  description: string;
  
  /** Full description (Russian) */
  descriptionRu: string;
  
  /** Full description (English) */
  descriptionEn: string;
  
  /** Tips for completing (Ukrainian) */
  tips?: string;
  
  /** Tips for completing (Russian) */
  tipsRu?: string;
  
  /** Tips for completing (English) */
  tipsEn?: string;
  
  /** Associated tags */
  tags: string[];
  
  /** Estimated completion time in minutes */
  estimatedTimeMinutes: number;
  
  /** Example photo URLs */
  examplePhotoUrls?: string[];
  
  /** Premium-only challenge flag */
  isPremium: boolean;
  
  /** View count */
  viewCount: number;
  
  /** Completion count */
  completionCount: number;
  
  /** Average rating (1-5) */
  averageRating?: number;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}
```

### DifficultyLevel

```typescript
enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  PRO = 'pro'
}
```

### Category

```typescript
interface Category {
  /** Unique identifier */
  id: string;
  
  /** Category name (Ukrainian) */
  name: string;
  
  /** Category name (Russian) */
  nameRu: string;
  
  /** Category name (English) */
  nameEn: string;
  
  /** Description (Ukrainian) */
  description?: string;
  
  /** Description (Russian) */
  descriptionRu?: string;
  
  /** Description (English) */
  descriptionEn?: string;
  
  /** Icon URL */
  iconUrl?: string;
  
  /** Display order */
  sortOrder: number;
}
```

### HeatModeSession

```typescript
interface HeatModeSession {
  /** Session unique identifier */
  sessionId: string;
  
  /** Session status */
  status: HeatModeSessionStatus;
  
  /** Session start timestamp */
  startedAt: string;
  
  /** Session expiration timestamp */
  expiresAt: string;
  
  /** Session duration in minutes */
  duration: number;
  
  /** Interval between challenges in minutes */
  intervalMinutes: number;
  
  /** Current challenge */
  currentChallenge?: HeatModeChallenge;
  
  /** Timestamp for next challenge */
  nextChallengeAt: string;
  
  /** Number of challenges remaining */
  challengesRemaining: number;
  
  /** Number of challenges completed */
  challengesCompleted?: number;
  
  /** Total challenges in session */
  challengesTotal?: number;
  
  /** Time remaining in seconds */
  timeRemaining?: number;
}
```

### HeatModeSessionStatus

```typescript
enum HeatModeSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}
```

### HeatModeChallenge

```typescript
interface HeatModeChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  tips?: string;
}
```

### Pagination

```typescript
interface Pagination {
  /** Total number of items */
  total: number;
  
  /** Current page number */
  page: number;
  
  /** Items per page */
  limit: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Has next page flag */
  hasNextPage: boolean;
  
  /** Has previous page flag */
  hasPrevPage: boolean;
}
```

### Error Response

```typescript
interface ErrorResponse {
  /** HTTP status code */
  statusCode: number;
  
  /** Error timestamp */
  timestamp: string;
  
  /** Request path */
  path: string;
  
  /** Error code */
  error: string;
  
  /** Error message */
  message: string | string[];
  
  /** Additional error code (optional) */
  code?: string;
}
```

---

## 5. Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/challenges",
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "code": "VALIDATION_ERROR"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CHALLENGE_NOT_FOUND` | 404 | Challenge with specified ID doesn't exist |
| `SESSION_NOT_FOUND` | 404 | Heat Mode session doesn't exist |
| `NO_ACTIVE_SESSION` | 404 | User has no active Heat Mode session |
| `SESSION_ALREADY_ACTIVE` | 409 | User already has an active Heat Mode session |
| `SESSION_EXPIRED` | 410 | Heat Mode session has expired |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `ADMIN_REQUIRED` | 403 | Admin role required for this operation |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Handling Errors

```typescript
// TypeScript/JavaScript example
async function getChallenge(id: string) {
  try {
    const response = await fetch(`/api/v1/challenges/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (error.code) {
        case 'CHALLENGE_NOT_FOUND':
          console.log('Challenge not found');
          break;
        case 'UNAUTHORIZED':
          // Redirect to login
          break;
        default:
          console.error('Unknown error:', error.message);
      }
      
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
  }
}
```

---

## 6. Code Examples

### JavaScript/TypeScript

```typescript
// Using fetch API
class ChallengeService {
  private baseUrl = 'http://localhost:3002/api/v1';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async getChallenges(options?: {
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams(options as Record<string, string>);
    const response = await fetch(`${this.baseUrl}/challenges?${params}`);
    return response.json();
  }

  async getRandomChallenge(filters?: {
    category?: string;
    difficulty?: string;
  }) {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await fetch(`${this.baseUrl}/challenges/random?${params}`);
    return response.json();
  }

  async startHeatMode(duration: number, options?: {
    category?: string;
    difficulty?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/challenges/heat-mode/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ duration, ...options })
    });
    return response.json();
  }
}

// Usage
const service = new ChallengeService('your-token');
const challenges = await service.getChallenges({ difficulty: 'beginner', limit: 10 });
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class ChallengeService:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })
    
    def get_challenges(
        self,
        category: Optional[str] = None,
        difficulty: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        params = {
            'category': category,
            'difficulty': difficulty,
            'page': page,
            'limit': limit
        }
        params = {k: v for k, v in params.items() if v is not None}
        
        response = self.session.get(
            f'{self.base_url}/challenges',
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_random_challenge(
        self,
        category: Optional[str] = None,
        difficulty: Optional[str] = None
    ) -> Dict[str, Any]:
        params = {
            'category': category,
            'difficulty': difficulty
        }
        params = {k: v for k, v in params.items() if v is not None}
        
        response = self.session.get(
            f'{self.base_url}/challenges/random',
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def start_heat_mode(
        self,
        duration: int,
        category: Optional[str] = None,
        difficulty: Optional[str] = None
    ) -> Dict[str, Any]:
        body = {'duration': duration}
        if category:
            body['category'] = category
        if difficulty:
            body['difficulty'] = difficulty
        
        response = self.session.post(
            f'{self.base_url}/challenges/heat-mode/start',
            json=body
        )
        response.raise_for_status()
        return response.json()

# Usage
service = ChallengeService('http://localhost:3002/api/v1', 'your-token')
challenges = service.get_challenges(difficulty='beginner', limit=10)
```

### cURL

```bash
# Get all challenges with filters
curl -X GET "http://localhost:3002/api/v1/challenges?difficulty=beginner&page=1&limit=10"

# Get random challenge
curl -X GET "http://localhost:3002/api/v1/challenges/random?category=visual"

# Get challenge by ID
curl -X GET http://localhost:3002/api/v1/challenges/550e8400-e29b-41d4-a716-446655440000

# Get categories
curl -X GET http://localhost:3002/api/v1/challenges/categories

# Start Heat Mode session (authenticated)
curl -X POST http://localhost:3002/api/v1/challenges/heat-mode/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"duration": 60, "category": "visual", "difficulty": "intermediate"}'

# Get active Heat Mode session
curl -X GET http://localhost:3002/api/v1/challenges/heat-mode/active \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get next challenge in Heat Mode
curl -X POST http://localhost:3002/api/v1/challenges/heat-mode/SESSION_ID/next \
  -H "Authorization: Bearer YOUR_TOKEN"

# End Heat Mode session
curl -X DELETE http://localhost:3002/api/v1/challenges/heat-mode/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create challenge (admin only)
curl -X POST http://localhost:3002/api/v1/challenges \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Urban Geometry",
    "titleRu": "Міська геометрія",
    "titleEn": "Urban Geometry",
    "categoryId": "visual",
    "difficulty": "intermediate",
    "description": "Find geometric patterns...",
    "descriptionRu": "...",
    "descriptionEn": "...",
    "estimatedTimeMinutes": 60,
    "tags": ["architecture", "geometry"]
  }'

# Update challenge (admin only)
curl -X PUT http://localhost:3002/api/v1/challenges/CHALLENGE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"difficulty": "pro", "estimatedTimeMinutes": 90}'

# Delete challenge (admin only)
curl -X DELETE http://localhost:3002/api/v1/challenges/CHALLENGE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Node.js (with axios)

```javascript
const axios = require('axios');

class ChallengeAPI {
  constructor(token) {
    this.client = axios.create({
      baseURL: 'http://localhost:3002/api/v1',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getChallenges(params = {}) {
    const { data } = await this.client.get('/challenges', { params });
    return data;
  }

  async getRandomChallenge(params = {}) {
    const { data } = await this.client.get('/challenges/random', { params });
    return data;
  }

  async getChallengeById(id) {
    const { data } = await this.client.get(`/challenges/${id}`);
    return data;
  }

  async startHeatMode(duration, options = {}) {
    const { data } = await this.client.post('/challenges/heat-mode/start', {
      duration,
      ...options
    });
    return data;
  }

  async getActiveHeatMode() {
    const { data } = await this.client.get('/challenges/heat-mode/active');
    return data;
  }

  async getNextChallenge(sessionId) {
    const { data } = await this.client.post(`/challenges/heat-mode/${sessionId}/next`);
    return data;
  }

  async endHeatMode(sessionId) {
    const { data } = await this.client.delete(`/challenges/heat-mode/${sessionId}`);
    return data;
  }
}

// Usage
const api = new ChallengeAPI('your-token');

async function main() {
  // Get beginner challenges
  const challenges = await api.getChallenges({ difficulty: 'beginner', limit: 5 });
  console.log('Challenges:', challenges);

  // Start a Heat Mode session
  const session = await api.startHeatMode(60, { category: 'visual' });
  console.log('Session started:', session);

  // Get next challenge
  const nextChallenge = await api.getNextChallenge(session.sessionId);
  console.log('Next challenge:', nextChallenge);
}

main().catch(console.error);
```

---

## 7. Pagination

### Overview

All list endpoints support pagination using offset-based pagination.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (1-indexed) |
| limit | integer | 20 | Items per page (max: 100) |

### Response Metadata

Pagination information is included in the response:

```json
{
  "challenges": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Pagination Fields

| Field | Type | Description |
|-------|------|-------------|
| total | integer | Total number of items across all pages |
| page | integer | Current page number |
| limit | integer | Items per page |
| totalPages | integer | Total number of pages |
| hasNextPage | boolean | True if there's a next page |
| hasPrevPage | boolean | True if there's a previous page |

### Example: Paginating Through Results

```typescript
async function getAllChallenges(service: ChallengeService) {
  const allChallenges = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await service.getChallenges({ page, limit: 20 });
    allChallenges.push(...response.challenges);
    
    hasNextPage = response.pagination.hasNextPage;
    page++;
  }

  return allChallenges;
}
```

---

## 8. Filtering & Sorting

### Filtering

Challenges can be filtered by multiple criteria:

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| category | string | Filter by category ID | `visual` |
| difficulty | string | Filter by difficulty | `beginner` |
| isPremium | boolean | Filter by premium status | `true` |
| tags | string | Comma-separated tags | `portrait,outdoor` |

#### Example: Filter by Difficulty and Category

```bash
curl -X GET "http://localhost:3002/api/v1/challenges?category=visual&difficulty=beginner"
```

#### Example: Filter by Tags

```bash
curl -X GET "http://localhost:3002/api/v1/challenges?tags=portrait,outdoor,night"
```

#### Example: Filter Premium Only

```bash
curl -X GET "http://localhost:3002/api/v1/challenges?isPremium=true"
```

### Sorting

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| sortBy | string | created_at | Field to sort by |
| sortOrder | string | desc | Sort order |

#### Valid Sort Fields

| Field | Description |
|-------|-------------|
| created_at | Sort by creation date |
| difficulty | Sort by difficulty level |
| estimated_time | Sort by estimated time |

#### Valid Sort Orders

| Value | Description |
|-------|-------------|
| asc | Ascending order |
| desc | Descending order |

#### Example: Sort by Estimated Time

```bash
curl -X GET "http://localhost:3002/api/v1/challenges?sortBy=estimated_time&sortOrder=asc"
```

#### Example: Sort by Difficulty (Descending)

```bash
curl -X GET "http://localhost:3002/api/v1/challenges?sortBy=difficulty&sortOrder=desc"
```

### Combined Filtering and Sorting

```bash
curl -X GET "http://localhost:3002/api/v1/challenges?category=visual&difficulty=intermediate&sortBy=created_at&sortOrder=desc&page=1&limit=20"
```

---

## 9. Rate Limiting

### Rate Limit Tiers

| Tier | Requests/Minute | Requests/Day |
|------|-----------------|--------------|
| Anonymous | 30 | 500 |
| Authenticated | 60 | 5,000 |
| Premium | 120 | 20,000 |

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705312200
```

| Header | Description |
|--------|-------------|
| X-RateLimit-Limit | Maximum requests allowed per window |
| X-RateLimit-Remaining | Requests remaining in current window |
| X-RateLimit-Reset | Unix timestamp when the limit resets |

### Rate Limit Exceeded Response

When rate limit is exceeded:

**Status Code:** 429 Too Many Requests

```json
{
  "statusCode": 429,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/challenges",
  "error": "TOO_MANY_REQUESTS",
  "message": "Rate limit exceeded. Try again in 30 seconds."
}
```

### Handling Rate Limits

```typescript
async function requestWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '30';
      console.log(`Rate limited. Waiting ${retryAfter} seconds...`);
      await sleep(parseInt(retryAfter) * 1000);
      continue;
    }
    
    return response.json();
  }
  
  throw new Error('Max retries exceeded');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 10. Changelog

### Version 1.0.0 (January 2024)

**Initial Release**

#### New Features
- Challenge browsing with pagination
- Random challenge selection with intelligent weighting
- Challenge categories with counts
- Heat Mode timed challenge sessions
- Full CRUD operations for challenges (admin)
- Multi-language support (Ukrainian, Russian, English)

#### Endpoints
- `GET /challenges` - List challenges
- `GET /challenges/:id` - Get challenge by ID
- `GET /challenges/random` - Get random challenge
- `GET /challenges/categories` - Get categories
- `POST /challenges` - Create challenge (admin)
- `PUT /challenges/:id` - Update challenge (admin)
- `DELETE /challenges/:id` - Delete challenge (admin)
- `POST /challenges/heat-mode/start` - Start Heat Mode
- `GET /challenges/heat-mode/active` - Get active session
- `POST /challenges/heat-mode/:sessionId/next` - Get next challenge
- `DELETE /challenges/heat-mode/:sessionId` - End session

#### Known Issues
- None

---

### Deprecation Notices

No current deprecation notices.

### Breaking Changes

No breaking changes in v1.

---

## Support

For API support, please contact:
- **Email:** api-support@streetye.com
- **Documentation:** https://docs.streetye.com
- **Status Page:** https://status.streetye.com
