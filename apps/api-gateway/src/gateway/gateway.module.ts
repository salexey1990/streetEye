import { Module } from '@nestjs/common';

import { GatewayController } from './controllers/gateway.controller';
import { HealthController } from './controllers/health.controller';
import { ProxyService } from './services/proxy.service';
import { HealthService } from './services/health.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { ServiceDiscoveryService } from './services/service-discovery.service';

@Module({
  controllers: [GatewayController, HealthController],
  providers: [
    ProxyService,
    HealthService,
    CircuitBreakerService,
    ServiceDiscoveryService,
  ],
  exports: [
    ProxyService,
    HealthService,
    CircuitBreakerService,
    ServiceDiscoveryService,
  ],
})
export class GatewayModule {}
