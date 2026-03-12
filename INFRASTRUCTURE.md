# Infrastructure Services

This document describes the shared infrastructure services used by the streetEye microservices.

## Services

### Redis

**Purpose:** Shared cache and session storage for microservices.

**Configuration:**
- **Port:** 6379
- **Password:** `redis` (default, configurable via `REDIS_PASSWORD`)
- **Persistence:** AOF (Append Only File) enabled
- **TTL:** 300 seconds (default)

**Usage in microservices:**
```typescript
// The RedisService from @repo/api handles connection automatically
import { RedisService } from '@repo/api';

@Injectable()
export class MyService {
  constructor(private readonly redisService: RedisService) {}
  
  async getCached(key: string) {
    return await this.redisService.get(key);
  }
  
  async setCached(key: string, value: any, ttl?: number) {
    await this.redisService.set(key, value, ttl);
  }
}
```

**Environment Variables:**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis
REDIS_TTL=300
```

---

### RabbitMQ

**Purpose:** Message broker for event-driven communication between microservices.

**Configuration:**
- **AMQP Port:** 5672
- **Management UI Port:** 15672
- **Default User:** `rabbitmq`
- **Default Password:** `rabbitmq`
- **Exchange:** `streetEye` (topic exchange)

**Management UI:**
Access the RabbitMQ management UI at: http://localhost:15672

**Usage in microservices:**
```typescript
// The RabbitMQService from @repo/api handles connection automatically
import { RabbitMQService } from '@repo/api';

@Injectable()
export class EventPublisherService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}
  
  async publishEvent(event: string, data: any) {
    await this.rabbitMQService.publish({
      event,
      data,
      routingKey: event, // Optional, defaults to event name
    });
  }
}
```

**Environment Variables:**
```bash
RABBITMQ_URI=amqp://rabbitmq:rabbitmq@localhost:5672
RABBITMQ_DEFAULT_USER=rabbitmq
RABBITMQ_DEFAULT_PASS=rabbitmq
RABBITMQ_EXCHANGE=streetEye
RABBITMQ_QUEUE_PREFIX=challenge-service
```

---

## Docker Compose

### Start Infrastructure Services

```bash
# Start all services
docker-compose up -d

# Start only Redis
docker-compose up -d redis

# Start only RabbitMQ
docker-compose up -d rabbitmq

# Start Redis and RabbitMQ
docker-compose up -d redis rabbitmq
```

### View Logs

```bash
# View all logs
docker-compose logs -f

# View Redis logs
docker-compose logs -f redis

# View RabbitMQ logs
docker-compose logs -f rabbitmq
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ this will delete all data)
docker-compose down -v
```

### Health Checks

All services have health checks configured:

```bash
# Check Redis health
docker exec redis redis-cli --pass redis ping
# Expected output: PONG

# Check RabbitMQ health
docker exec rabbitmq rabbitmq-diagnostics -q ping
# Expected output: pong
```

---

## Connection from Host Machine

All services expose their ports to the host machine:

| Service | Host Port | Container Port | Connection String |
|---------|-----------|----------------|-------------------|
| Redis | 6379 | 6379 | `redis://:redis@localhost:6379` |
| RabbitMQ (AMQP) | 5672 | 5672 | `amqp://rabbitmq:rabbitmq@localhost:5672` |
| RabbitMQ (UI) | 15672 | 15672 | http://localhost:15672 |

---

## Data Persistence

Data is persisted using Docker volumes:

| Volume | Service | Purpose |
|--------|---------|---------|
| `redis_data` | Redis | Redis data (AOF) |
| `rabbitmq_data` | RabbitMQ | RabbitMQ messages and configuration |

To backup data:
```bash
# Backup Redis data
docker run --rm -v streetEye_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .

# Backup RabbitMQ data
docker run --rm -v streetEye_rabbitmq_data:/data -v $(pwd):/backup alpine tar czf /backup/rabbitmq-backup.tar.gz -C /data .
```

---

## Security Notes

⚠️ **Important:** The default passwords in this configuration are for development only. 

For production:
1. Change default passwords in `.env`
2. Use strong passwords
3. Consider using Docker secrets or a secrets manager
4. Restrict network access using firewall rules
5. Enable TLS for Redis and RabbitMQ connections
