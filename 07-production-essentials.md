# Tarefa: Adicionar Features Essenciais para Produção

## Contexto
Este prompt adiciona features críticas que faltam nos outros prompts para tornar o sistema production-ready.

**IMPORTANTE**: Este prompt deve ser executado APÓS os prompts 01-06.

---

## 1. Sistema de Email (API)

### Estrutura
```
apps/api/src/modules/email/
├── email.module.ts
├── email.service.ts
├── templates/
│   ├── welcome.hbs
│   ├── password-reset.hbs
│   ├── license-expiring.hbs
│   ├── license-expired.hbs
│   ├── payment-failed.hbs
│   └── payment-receipt.hbs
└── jobs/
    └── license-expiring.job.ts
```

### Email Service
```typescript
// src/modules/email/email.service.ts

import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.loadTemplates();
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, "templates");
    const templateFiles = ["welcome", "password-reset", "license-expiring", "license-expired", "payment-failed", "payment-receipt"];

    for (const name of templateFiles) {
      const filePath = path.join(templatesDir, `${name}.hbs`);
      if (fs.existsSync(filePath)) {
        const source = fs.readFileSync(filePath, "utf-8");
        this.templates.set(name, handlebars.compile(source));
      }
    }
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      const template = this.templates.get(options.template);
      if (!template) {
        this.logger.error(`Template not found: ${options.template}`);
        return false;
      }

      const html = template(options.context);

      await this.transporter.sendMail({
        from: `"TibiaEye" <${process.env.SMTP_FROM}>`,
        to: options.to,
        subject: options.subject,
        html,
      });

      this.logger.log(`Email sent: ${options.template} to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  // Convenience methods
  async sendWelcome(email: string, name: string) {
    return this.send({
      to: email,
      subject: "Welcome to TibiaEye!",
      template: "welcome",
      context: { name, loginUrl: `${process.env.APP_URL}/auth/login` },
    });
  }

  async sendPasswordReset(email: string, token: string) {
    return this.send({
      to: email,
      subject: "Reset your password",
      template: "password-reset",
      context: { resetUrl: `${process.env.APP_URL}/auth/reset-password?token=${token}` },
    });
  }

  async sendLicenseExpiring(email: string, daysRemaining: number) {
    return this.send({
      to: email,
      subject: `Your license expires in ${daysRemaining} days`,
      template: "license-expiring",
      context: { daysRemaining, renewUrl: `${process.env.APP_URL}/dashboard/license` },
    });
  }

  async sendLicenseExpired(email: string) {
    return this.send({
      to: email,
      subject: "Your TibiaEye license has expired",
      template: "license-expired",
      context: { renewUrl: `${process.env.APP_URL}/dashboard/license` },
    });
  }

  async sendPaymentFailed(email: string) {
    return this.send({
      to: email,
      subject: "Payment failed - Action required",
      template: "payment-failed",
      context: { billingUrl: `${process.env.APP_URL}/dashboard/settings/billing` },
    });
  }
}
```

### Email Templates
```handlebars
{{!-- templates/license-expiring.hbs --}}
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #1e293b; border-radius: 12px; padding: 32px; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 24px; }
    h1 { color: #f8fafc; font-size: 24px; margin-bottom: 16px; }
    p { color: #94a3b8; line-height: 1.6; }
    .warning { background: #fbbf24; color: #1e293b; padding: 16px; border-radius: 8px; margin: 24px 0; font-weight: 500; }
    .button { display: inline-block; background: #10b981; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">TibiaEye</div>
      <h1>Your license is expiring soon</h1>
      <div class="warning">
        Your license expires in {{daysRemaining}} days
      </div>
      <p>To continue using TibiaEye without interruption, please renew your subscription.</p>
      <a href="{{renewUrl}}" class="button">Renew Now</a>
    </div>
  </div>
</body>
</html>
```

---

## 2. Rate Limiting (API)

### Configuração
```typescript
// src/common/guards/throttle.guard.ts

import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // Use API key se disponível, senão IP
    return Promise.resolve(req.headers["authorization"] || req.ip);
  }
}
```

```typescript
// app.module.ts

import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,  // 1 segundo
        limit: 10,  // 10 requests
      },
      {
        name: "medium",
        ttl: 60000, // 1 minuto
        limit: 100,
      },
      {
        name: "long",
        ttl: 3600000, // 1 hora
        limit: 1000,
      },
    ]),
  ],
})
```

### Rate Limits por Endpoint
```typescript
// src/modules/events/events.controller.ts

import { Throttle, SkipThrottle } from "@nestjs/throttler";

@Controller("api/v1/events")
export class EventsController {
  @Post("batch")
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 batches/minuto
  async processBatch(@Body() dto: BatchEventsDto) {
    // ...
  }
}

// src/modules/auth/auth.controller.ts

@Controller("api/v1/auth")
export class AuthController {
  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentativas/minuto
  async login(@Body() dto: LoginDto) {
    // ...
  }
}
```

---

## 3. Concurrent Session Handling (API)

### Validação ao Criar Sessão
```typescript
// src/modules/sessions/sessions.service.ts

async create(userId: string, dto: CreateSessionDto): Promise<Session> {
  // 1. Verifica se já existe sessão ativa para este character
  const existingSession = await this.sessionRepo.findOne({
    where: {
      characterId: dto.characterId,
      status: SessionStatus.ACTIVE,
    },
  });

  if (existingSession) {
    // Opção A: Bloquear
    // throw new ConflictException("Character already has an active session");

    // Opção B: Fechar a anterior (mais user-friendly)
    existingSession.status = SessionStatus.CRASHED;
    existingSession.endedAt = new Date();
    await this.sessionRepo.save(existingSession);
    this.logger.warn(`Force-closed stale session ${existingSession.id}`);
  }

  // 2. Cria nova sessão
  const session = this.sessionRepo.create({
    characterId: dto.characterId,
    // ...
  });

  return this.sessionRepo.save(session);
}
```

### Job para Limpar Sessões Órfãs
```typescript
// src/modules/sessions/jobs/cleanup-stale-sessions.job.ts

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Session, SessionStatus } from "../entities/session.entity";

@Injectable()
export class CleanupStaleSessionsJob {
  private readonly logger = new Logger(CleanupStaleSessionsJob.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    // Sessões "active" sem atividade há mais de 30 minutos = crashed
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const staleSessions = await this.sessionRepo.find({
      where: {
        status: SessionStatus.ACTIVE,
        updatedAt: LessThan(thirtyMinutesAgo),
      },
    });

    for (const session of staleSessions) {
      session.status = SessionStatus.CRASHED;
      session.endedAt = new Date();
      await this.sessionRepo.save(session);
      this.logger.warn(`Marked stale session as crashed: ${session.id}`);
    }

    if (staleSessions.length > 0) {
      this.logger.log(`Cleaned up ${staleSessions.length} stale sessions`);
    }
  }
}
```

---

## 4. Plan Limits Enforcement (API)

### Middleware de Limites
```typescript
// src/modules/subscriptions/guards/plan-limits.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { SubscriptionsService } from "../subscriptions.service";

@Injectable()
export class MaxCharactersGuard implements CanActivate {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const { allowed, current, limit } = await this.subscriptionsService.checkCharacterLimit(userId);

    if (!allowed) {
      throw new ForbiddenException(
        `Character limit reached. Your plan allows ${limit} characters. Upgrade to add more.`
      );
    }

    return true;
  }
}
```

```typescript
// src/modules/subscriptions/subscriptions.service.ts

async checkCharacterLimit(userId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  const subscription = await this.subscriptionRepo.findOne({
    where: { userId },
    relations: ["plan"],
  });

  const limit = subscription?.plan?.maxCharacters || 1; // Free = 1

  const currentCount = await this.characterRepo.count({
    where: { userId, isActive: true },
  });

  return {
    allowed: currentCount < limit,
    current: currentCount,
    limit,
  };
}

async checkApiRequestLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const subscription = await this.subscriptionRepo.findOne({
    where: { userId },
    relations: ["plan"],
  });

  const limit = subscription?.plan?.apiRequestsPerDay || 100;

  // Conta requests de hoje (usando Redis seria melhor)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const used = await this.apiKeyRepo
    .createQueryBuilder("key")
    .where("key.userId = :userId", { userId })
    .andWhere("key.lastUsedAt >= :today", { today })
    .getCount();

  return {
    allowed: used < limit,
    used,
    limit,
  };
}
```

### Usar no Controller
```typescript
// src/modules/characters/characters.controller.ts

@Post()
@UseGuards(JwtAuthGuard, MaxCharactersGuard) // <-- Adicionar guard
async create(@CurrentUser() user: { id: string }, @Body() dto: CreateCharacterDto) {
  return this.charactersService.create(user.id, dto);
}
```

---

## 5. Data Retention / Cleanup Job (API)

```typescript
// src/modules/cleanup/cleanup.job.ts

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Session } from "../sessions/entities/session.entity";
import { Kill } from "../events/entities/kill.entity";
import { Loot } from "../events/entities/loot.entity";
import { Subscription } from "../subscriptions/entities/subscription.entity";

@Injectable()
export class DataCleanupJob {
  private readonly logger = new Logger(DataCleanupJob.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldData() {
    this.logger.log("Starting data cleanup job");

    // Para cada usuário, verifica o limite de histórico do plano
    const subscriptions = await this.subscriptionRepo.find({
      relations: ["plan", "user"],
    });

    for (const sub of subscriptions) {
      const historyDays = sub.plan?.historyDays || 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - historyDays);

      // Deleta sessões antigas (cascade deleta kills, loot, etc)
      const result = await this.sessionRepo
        .createQueryBuilder()
        .delete()
        .where("userId = :userId", { userId: sub.userId })
        .andWhere("endedAt < :cutoff", { cutoff: cutoffDate })
        .andWhere("status != :active", { active: "active" })
        .execute();

      if (result.affected > 0) {
        this.logger.log(`Deleted ${result.affected} old sessions for user ${sub.userId}`);
      }
    }

    this.logger.log("Data cleanup job completed");
  }
}
```

---

## 6. License Expiring Notifications Job (API)

```typescript
// src/modules/license/jobs/license-notifications.job.ts

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThan } from "typeorm";
import { ApiKey, LicenseStatus } from "../../api-keys/entities/api-key.entity";
import { EmailService } from "../../email/email.service";

@Injectable()
export class LicenseNotificationsJob {
  private readonly logger = new Logger(LicenseNotificationsJob.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async notifyExpiringLicenses() {
    this.logger.log("Checking for expiring licenses...");

    // Licenses expirando em 7 dias
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringIn7Days = await this.apiKeyRepo.find({
      where: {
        status: LicenseStatus.ACTIVE,
        expiresAt: Between(new Date(), sevenDaysFromNow),
      },
      relations: ["user"],
    });

    for (const key of expiringIn7Days) {
      const daysRemaining = Math.ceil(
        (key.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Enviar apenas para 7, 3, 1 dias restantes
      if ([7, 3, 1].includes(daysRemaining)) {
        await this.emailService.sendLicenseExpiring(key.user.email, daysRemaining);
        this.logger.log(`Sent expiring notice to ${key.user.email} (${daysRemaining} days)`);
      }
    }

    // Licenses que acabaram de expirar (últimas 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const justExpired = await this.apiKeyRepo.find({
      where: {
        status: LicenseStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
      relations: ["user"],
    });

    for (const key of justExpired) {
      // Marca como expirada
      key.status = LicenseStatus.EXPIRED;
      await this.apiKeyRepo.save(key);

      // Envia email
      await this.emailService.sendLicenseExpired(key.user.email);
      this.logger.log(`License expired for ${key.user.email}`);
    }
  }
}
```

---

## 7. Health Check Endpoint (API)

```typescript
// src/modules/health/health.controller.ts

import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator } from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck("database"),
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024), // 150MB
    ]);
  }

  @Get("ready")
  ready() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
```

---

## 8. Graceful Shutdown (Python Bot)

```python
# src/telemetry/client.py - Adicionar ao TelemetryClient

import signal
import atexit

class TelemetryClient:
    def __init__(self, ...):
        # ... existing code ...

        # Register shutdown handlers
        atexit.register(self._on_exit)
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully."""
        logger.info(f"Received signal {signum}, shutting down...")
        self.end_session()
        sys.exit(0)

    def _on_exit(self):
        """Called when Python exits."""
        if self._session_id:
            logger.info("Flushing remaining events before exit...")
            if self._worker:
                self._worker.stop(timeout=5.0)  # Wait up to 5s for flush
```

---

## 9. Structured Logging (API)

```typescript
// src/common/logger/logger.service.ts

import { Injectable, LoggerService } from "@nestjs/common";
import * as winston from "winston";

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      defaultMeta: { service: "tibia-api" },
      transports: [
        new winston.transports.Console(),
        // Em produção, adicionar:
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
```

---

## 10. Webhook Idempotency (API)

```typescript
// src/modules/payments/payments.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

// Tabela para guardar eventos já processados
@Entity("webhook_events")
export class WebhookEvent {
  @PrimaryColumn()
  eventId: string;

  @Column()
  type: string;

  @Column({ type: "json" })
  payload: any;

  @CreateDateColumn()
  processedAt: Date;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepo: Repository<WebhookEvent>,
  ) {}

  async processWebhook(eventId: string, type: string, payload: any): Promise<boolean> {
    // Verifica se já processou este evento
    const existing = await this.webhookEventRepo.findOne({
      where: { eventId },
    });

    if (existing) {
      this.logger.warn(`Webhook event ${eventId} already processed, skipping`);
      return false; // Já processado
    }

    // Processa o evento
    switch (type) {
      case "subscription.created":
        await this.handleSubscriptionCreated(payload);
        break;
      case "subscription.cancelled":
        await this.handleSubscriptionCancelled(payload);
        break;
      case "payment.failed":
        await this.handlePaymentFailed(payload);
        break;
    }

    // Marca como processado
    await this.webhookEventRepo.save({
      eventId,
      type,
      payload,
    });

    return true;
  }
}
```

---

## 11. Redis Cache (API)

### Configuração
```typescript
// src/config/redis.config.ts

import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";

export const cacheConfig = CacheModule.register({
  store: redisStore,
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  ttl: 60, // 60 segundos default
});
```

### Uso
```typescript
// src/modules/license/license.service.ts

import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class LicenseService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async validate(apiKey: string): Promise<LicenseValidationResult> {
    // Tenta cache primeiro
    const cached = await this.cache.get<LicenseValidationResult>(`license:${apiKey}`);
    if (cached) {
      return cached;
    }

    // Valida no banco
    const result = await this.validateFromDb(apiKey);

    // Cacheia por 5 minutos
    await this.cache.set(`license:${apiKey}`, result, 300);

    return result;
  }
}
```

---

## 12. Environment Variables Completas

```bash
# .env.example COMPLETO

# ===========================================
# DATABASE
# ===========================================
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=tibia_telemetry

# ===========================================
# REDIS
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379

# ===========================================
# JWT
# ===========================================
JWT_SECRET=change-this-in-production-use-64-chars-minimum
JWT_EXPIRES_IN=7d

# ===========================================
# EMAIL (SMTP)
# ===========================================
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=re_xxxxx
SMTP_FROM=noreply@tibiaeye.com

# ===========================================
# ABACATEPAY
# ===========================================
ABACATEPAY_API_KEY=
ABACATEPAY_WEBHOOK_SECRET=
ABACATEPAY_PRO_MONTHLY_PRICE_ID=
ABACATEPAY_PRO_YEARLY_PRICE_ID=
ABACATEPAY_ENTERPRISE_MONTHLY_PRICE_ID=
ABACATEPAY_ENTERPRISE_YEARLY_PRICE_ID=

# ===========================================
# URLS
# ===========================================
APP_URL=http://localhost:3001
API_URL=http://localhost:4000
LANDING_URL=http://localhost:3000

# ===========================================
# INTERNAL
# ===========================================
API_INTERNAL_TOKEN=change-this-for-internal-api-calls

# ===========================================
# MONITORING (opcional)
# ===========================================
SENTRY_DSN=
LOG_LEVEL=info
```

---

## Dependências a Adicionar

### API (package.json)
```json
{
  "dependencies": {
    "@nestjs/throttler": "^5.1.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/terminus": "^10.2.0",
    "@nestjs/cache-manager": "^2.2.0",
    "cache-manager": "^5.3.0",
    "cache-manager-redis-store": "^3.0.0",
    "nodemailer": "^6.9.0",
    "handlebars": "^4.7.0",
    "winston": "^3.11.0"
  }
}
```

---

## Checklist de Implementação

```markdown
## Crítico (antes do launch)
- [ ] Email service + templates
- [ ] Rate limiting em todos os endpoints
- [ ] Concurrent session handling
- [ ] Plan limits enforcement
- [ ] Webhook idempotency
- [ ] Data cleanup job
- [ ] License expiring notifications

## Importante (primeira semana)
- [ ] Health check endpoint
- [ ] Graceful shutdown no bot
- [ ] Structured logging
- [ ] Redis cache
- [ ] Sentry integration

## Nice to have
- [ ] API versioning
- [ ] Request correlation IDs
- [ ] Metrics (Prometheus)
```

---

## Ordem de Execução

1. Executar prompts 01-06 primeiro
2. Adicionar Redis ao docker-compose
3. Implementar email service
4. Adicionar rate limiting
5. Implementar jobs (schedule)
6. Adicionar health checks
7. Configurar monitoring

---

## Não Fazer
- Não adicionar complexidade desnecessária
- Não otimizar prematuramente
- Emojis no código
