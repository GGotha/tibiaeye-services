# Tarefa: Criar API REST para TibiaEye

## Contexto
API REST para o sistema de telemetria TibiaEye.
Recebe dados do bot Python, serve dados para App e Backoffice.

## Stack
- Bun runtime
- NestJS framework
- SWC compiler
- TypeORM + MySQL
- Zod validation (ou class-validator)
- Swagger/OpenAPI
- Socket.io (WebSocket)
- Jest (testes)
- Bcrypt (hashing)
- JWT (autenticação)

## Arquitetura DDD (Domain-Driven Design)

Seguir padrão DDD com camadas bem definidas:

### Estrutura por Módulo

```
src/modules/users/
├── domain/                     # Camada de Domínio (regras de negócio)
│   ├── entities/
│   │   └── user.entity.ts      # Entidade de domínio
│   ├── value-objects/
│   │   └── email.vo.ts         # Value objects
│   ├── repositories/
│   │   └── user.repository.interface.ts  # Interface do repositório
│   └── errors/
│       └── user-not-found.error.ts
├── application/                # Camada de Aplicação (use cases)
│   ├── use-cases/
│   │   ├── create-user/
│   │   │   ├── create-user.use-case.ts
│   │   │   ├── create-user.use-case.spec.ts  # Teste unitário
│   │   │   └── create-user.dto.ts
│   │   ├── get-user/
│   │   │   ├── get-user.use-case.ts
│   │   │   └── get-user.use-case.spec.ts
│   │   └── update-user/
│   │       ├── update-user.use-case.ts
│   │       └── update-user.use-case.spec.ts
│   └── services/
│       └── user.service.ts     # Orquestra use cases (opcional)
├── infrastructure/             # Camada de Infraestrutura
│   ├── persistence/
│   │   ├── typeorm/
│   │   │   ├── user.typeorm.entity.ts
│   │   │   └── user.typeorm.repository.ts
│   │   └── mappers/
│   │       └── user.mapper.ts
│   └── http/
│       ├── controllers/
│       │   └── users.controller.ts
│       └── dto/
│           ├── create-user.request.dto.ts
│           └── user.response.dto.ts
└── users.module.ts
```

### Regras de Use Cases

1. **Cada use case deve ter seu teste unitário** junto (`*.use-case.spec.ts`)
2. **Use cases são independentes** - não chamam outros use cases diretamente
3. **Injeção de dependência** - use cases recebem repositórios via interface
4. **Single Responsibility** - um use case = uma ação de negócio

### Exemplo de Use Case com Teste

```typescript
// src/modules/users/application/use-cases/create-user/create-user.use-case.ts

import { Injectable, Inject } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../../domain/repositories/user.repository.interface";
import { User } from "../../../domain/entities/user.entity";
import { CreateUserDto } from "./create-user.dto";
import { EmailAlreadyExistsError } from "../../../domain/errors/email-already-exists.error";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new EmailAlreadyExistsError(dto.email);
    }

    const user = User.create({
      email: dto.email,
      name: dto.name,
      passwordHash: dto.passwordHash,
    });

    return this.userRepository.save(user);
  }
}
```

```typescript
// src/modules/users/application/use-cases/create-user/create-user.use-case.spec.ts

import { CreateUserUseCase } from "./create-user.use-case";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { EmailAlreadyExistsError } from "../../../domain/errors/email-already-exists.error";

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it("should create a new user successfully", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockImplementation(async (user) => user);

    const result = await useCase.execute({
      email: "test@example.com",
      name: "Test User",
      passwordHash: "hashed_password",
    });

    expect(result.email).toBe("test@example.com");
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it("should throw error if email already exists", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({ id: "1", email: "test@example.com" } as any);

    await expect(
      useCase.execute({
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashed_password",
      }),
    ).rejects.toThrow(EmailAlreadyExistsError);
  });
});
```

### Interface do Repositório

```typescript
// src/modules/users/domain/repositories/user.repository.interface.ts

import { User } from "../entities/user.entity";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

## Modelo de Dados

```
User (1) ──────── (N) Character (player)
  │                      │
  │                      └──── (N) Session
  │                                  │
  │                                  ├── (N) Kill
  │                                  ├── (N) Loot
  │                                  └── (N) ExperienceSnapshot
  │
  └──── (1) Subscription ──── (1) Plan
  │
  └──── (N) ApiKey (License Key)
```

**Conceitos:**
- **User**: Conta do cliente (email, senha, role)
- **Character**: Personagem do Tibia (nome, world)
- **Session**: Uma execução do bot (início, fim, stats)
- **ApiKey**: Chave de licença mensal (valida por 30 dias)

## Estrutura de Arquivos
```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── abacatepay.config.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── api-key.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── api-key.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── decorators/
│   │   │       ├── current-user.decorator.ts
│   │   │       └── roles.decorator.ts
│   │   ├── characters/
│   │   │   ├── characters.module.ts
│   │   │   ├── characters.controller.ts
│   │   │   ├── characters.service.ts
│   │   │   └── entities/character.entity.ts
│   │   ├── license/
│   │   │   ├── license.module.ts
│   │   │   ├── license.controller.ts
│   │   │   └── license.service.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/user.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── subscriptions/
│   │   │   ├── subscriptions.module.ts
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   └── entities/
│   │   │       ├── subscription.entity.ts
│   │   │       └── plan.entity.ts
│   │   ├── api-keys/
│   │   │   ├── api-keys.module.ts
│   │   │   ├── api-keys.controller.ts
│   │   │   ├── api-keys.service.ts
│   │   │   └── entities/api-key.entity.ts
│   │   ├── sessions/
│   │   │   ├── sessions.module.ts
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.service.ts
│   │   │   └── entities/session.entity.ts
│   │   ├── events/
│   │   │   ├── events.module.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── events.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── kill.entity.ts
│   │   │   │   ├── loot.entity.ts
│   │   │   │   ├── experience-snapshot.entity.ts
│   │   │   │   └── event.entity.ts
│   │   │   └── dto/batch-events.dto.ts
│   │   ├── analytics/
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts
│   │   │   └── analytics.service.ts
│   │   ├── payments/
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   └── abacatepay.service.ts
│   │   ├── admin/
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── admin.service.ts
│   │   └── realtime/
│   │       ├── realtime.module.ts
│   │       └── realtime.gateway.ts
│   └── common/
│       ├── filters/http-exception.filter.ts
│       ├── interceptors/transform.interceptor.ts
│       └── pipes/validation.pipe.ts
├── test/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── bunfig.toml
├── Dockerfile
└── docker-compose.yml
```

## Endpoints

### Auth
```
POST   /api/v1/auth/register          # Criar conta
POST   /api/v1/auth/login             # Login
POST   /api/v1/auth/refresh           # Refresh token
POST   /api/v1/auth/forgot-password   # Solicitar reset
POST   /api/v1/auth/reset-password    # Reset password
```

### Users
```
GET    /api/v1/users/me               # Dados do usuário atual
PATCH  /api/v1/users/me               # Atualizar perfil
DELETE /api/v1/users/me               # Deletar conta
```

### Subscriptions
```
GET    /api/v1/subscriptions/current  # Subscription atual
POST   /api/v1/subscriptions/cancel   # Cancelar subscription
POST   /api/v1/subscriptions/activate # Ativar subscription (chamado pelo webhook)
```

### Characters (Players)
```
GET    /api/v1/characters             # Listar characters do usuário
POST   /api/v1/characters             # Adicionar character
GET    /api/v1/characters/:id         # Detalhes do character
DELETE /api/v1/characters/:id         # Remover character
GET    /api/v1/characters/:id/sessions # Sessões do character
GET    /api/v1/characters/active      # Character com sessão ativa (se houver)
```

### API Keys (License Keys)
```
GET    /api/v1/api-keys               # Listar keys do usuário
POST   /api/v1/api-keys               # Criar nova key (gera license)
DELETE /api/v1/api-keys/:id           # Revogar key
GET    /api/v1/api-keys/:id/status    # Status da license (dias restantes)
```

### License (para o Bot validar)
```
POST   /api/v1/license/validate       # Valida API key e retorna status
GET    /api/v1/license/status         # Status da license atual (autenticado)
```

### Sessions
```
GET    /api/v1/sessions               # Listar sessões do usuário (com paginação)
GET    /api/v1/sessions/active        # Sessão ativa atual (se houver)
POST   /api/v1/sessions               # Criar nova sessão (Bot -> API, requer characterId)
GET    /api/v1/sessions/:id           # Detalhes da sessão
PATCH  /api/v1/sessions/:id           # Atualizar sessão (finalizar, crash)
DELETE /api/v1/sessions/:id           # Deletar sessão
```

### Events (Bot -> API, autenticado por API Key)
```
POST   /api/v1/events/batch           # Batch de eventos
```

### Analytics
```
GET    /api/v1/analytics/experience/hourly    # XP/h por sessão
GET    /api/v1/analytics/kills/by-creature    # Kills por criatura
GET    /api/v1/analytics/loot/summary         # Resumo de loot
```

### Admin
```
GET    /api/v1/admin/users                    # Listar todos usuários
GET    /api/v1/admin/users/:id                # Detalhes do usuário
PATCH  /api/v1/admin/users/:id/suspend        # Suspender usuário
PATCH  /api/v1/admin/users/:id/unsuspend      # Reativar usuário
DELETE /api/v1/admin/users/:id                # Deletar usuário
POST   /api/v1/admin/users/:id/impersonate    # Impersonar usuário

GET    /api/v1/admin/subscriptions            # Listar subscriptions
PATCH  /api/v1/admin/subscriptions/:id/cancel # Cancelar
PATCH  /api/v1/admin/subscriptions/:id/extend # Estender

GET    /api/v1/admin/plans                    # Listar planos
POST   /api/v1/admin/plans                    # Criar plano
PATCH  /api/v1/admin/plans/:id                # Atualizar plano
PATCH  /api/v1/admin/plans/:id/deactivate     # Desativar plano

GET    /api/v1/admin/api-keys                 # Todas as API keys
DELETE /api/v1/admin/api-keys/:id             # Revogar qualquer key

GET    /api/v1/admin/analytics/platform       # Stats da plataforma
GET    /api/v1/admin/analytics/usage          # Métricas de uso
GET    /api/v1/admin/analytics/revenue        # Métricas de revenue
GET    /api/v1/admin/analytics/bots-online    # Bots ativos
GET    /api/v1/admin/analytics/endpoints      # Stats por endpoint

# User Management Extended
PATCH  /api/v1/admin/users/:id/role           # Mudar role (user/admin)
POST   /api/v1/admin/users/:id/give-plan      # Dar plano gratuito
GET    /api/v1/admin/users/:id/characters     # Characters do usuário
GET    /api/v1/admin/users/:id/licenses       # Licenses do usuário
POST   /api/v1/admin/users/:id/generate-license # Gerar nova license

# License Management
GET    /api/v1/admin/licenses                 # Todas as licenses
GET    /api/v1/admin/licenses/stats           # Stats de licenses
PATCH  /api/v1/admin/licenses/:id/extend      # Estender license
PATCH  /api/v1/admin/licenses/:id/revoke      # Revogar license
POST   /api/v1/admin/licenses/bulk-extend     # Estender múltiplas

# Settings
GET    /api/v1/admin/settings/feature-flags   # Feature flags
PATCH  /api/v1/admin/settings/feature-flags   # Atualizar feature flags
PATCH  /api/v1/admin/settings/maintenance     # Modo manutenção
```

### Payments (Webhooks)
```
POST   /api/v1/payments/webhook               # AbacatePay webhook
```

### WebSocket
```
WS     /ws                                    # Real-time updates
```

## Entities

### User
```typescript
// src/modules/users/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { Subscription } from "../../subscriptions/entities/subscription.entity";
import { ApiKey } from "../../api-keys/entities/api-key.entity";
import { Character } from "../../characters/entities/character.entity";

// Enum para roles
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// Enum para status
export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => Subscription, (subscription) => subscription.user)
  subscription: Subscription;

  @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
  apiKeys: ApiKey[];

  @OneToMany(() => Character, (character) => character.user)
  characters: Character[];
}
```

### Character (Player)
```typescript
// src/modules/characters/entities/character.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Session } from "../../sessions/entities/session.entity";

@Entity("characters")
@Index(["userId"])
@Index(["name", "world"], { unique: true })
export class Character {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.characters, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @Column({ type: "varchar", length: 50 })
  name: string;

  @Column({ type: "varchar", length: 50 })
  world: string;

  @Column({ type: "int", nullable: true })
  level: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  vocation: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.character)
  sessions: Session[];
}
```

### Plan
```typescript
// src/modules/subscriptions/entities/plan.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("decimal", { precision: 10, scale: 2 })
  priceMonthly: number;

  @Column("decimal", { precision: 10, scale: 2 })
  priceYearly: number;

  @Column("int")
  maxCharacters: number;

  @Column("int")
  historyDays: number;

  @Column("int")
  apiRequestsPerDay: number;

  @Column("simple-json")
  features: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Subscription
```typescript
// src/modules/subscriptions/entities/subscription.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Plan } from "./plan.entity";

@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.subscription)
  @JoinColumn()
  user: User;

  @Column()
  planId: string;

  @ManyToOne(() => Plan)
  @JoinColumn()
  plan: Plan;

  @Column({
    type: "enum",
    enum: ["active", "cancelled", "past_due", "trialing"],
    default: "active",
  })
  status: "active" | "cancelled" | "past_due" | "trialing";

  @Column({ nullable: true })
  externalId: string; // AbacatePay subscription ID

  @Column()
  currentPeriodStart: Date;

  @Column()
  currentPeriodEnd: Date;

  @Column({ default: false })
  cancelAtPeriodEnd: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

### ApiKey (License Key)
```typescript
// src/modules/api-keys/entities/api-key.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

// Status da licença
export enum LicenseStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

@Entity("api_keys")
@Index(["userId"])
export class ApiKey {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.apiKeys, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @Column()
  name: string;

  @Column()
  keyHash: string; // bcrypt hash da key completa

  @Column({ type: "varchar", length: 8 })
  keyPrefix: string; // Primeiros 8 chars para display (tm_xxxx)

  @Column({ type: "enum", enum: LicenseStatus, default: LicenseStatus.ACTIVE })
  status: LicenseStatus;

  // License info
  @Column({ type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date;

  @Column({ type: "varchar", length: 50, nullable: true })
  lastUsedIp: string;

  @Column({ default: 0 })
  totalRequests: number;

  // Para vincular ao pagamento
  @Column({ type: "varchar", nullable: true })
  subscriptionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed: dias restantes
  get daysRemaining(): number {
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get isExpired(): boolean {
    return this.status === LicenseStatus.EXPIRED || new Date() > this.expiresAt;
  }

  get isValid(): boolean {
    return this.status === LicenseStatus.ACTIVE && !this.isExpired;
  }
}
```

### Session
```typescript
// src/modules/sessions/entities/session.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Character } from "../../characters/entities/character.entity";
import { Kill } from "../../events/entities/kill.entity";
import { Loot } from "../../events/entities/loot.entity";
import { ExperienceSnapshot } from "../../events/entities/experience-snapshot.entity";

export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CRASHED = "crashed",
}

@Entity("sessions")
@Index(["characterId", "status"])
@Index(["status", "startedAt"])
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  characterId: string;

  @ManyToOne(() => Character, (character) => character.sessions, { onDelete: "CASCADE" })
  @JoinColumn()
  character: Character;

  @Column({ nullable: true })
  huntLocation: string;

  @Column({ type: "enum", enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  endedAt: Date;

  @Column({ type: "int", nullable: true })
  initialLevel: number;

  @Column({ type: "bigint", nullable: true })
  initialExperience: string;

  @Column({ type: "int", nullable: true })
  finalLevel: number;

  @Column({ type: "bigint", nullable: true })
  finalExperience: string;

  // Stats calculados (cache para performance)
  @Column({ type: "int", default: 0 })
  totalKills: number;

  @Column({ type: "bigint", default: "0" })
  totalExperience: string;

  @Column({ type: "int", default: 0 })
  totalLootValue: number;

  @OneToMany(() => Kill, (kill) => kill.session)
  kills: Kill[];

  @OneToMany(() => Loot, (loot) => loot.session)
  loot: Loot[];

  @OneToMany(() => ExperienceSnapshot, (exp) => exp.session)
  experienceSnapshots: ExperienceSnapshot[];

  // Computed
  get duration(): number {
    const end = this.endedAt || new Date();
    return Math.round((end.getTime() - this.startedAt.getTime()) / 1000);
  }

  get xpPerHour(): number {
    const hours = this.duration / 3600;
    if (hours < 0.01) return 0;
    return Math.round(Number(this.totalExperience) / hours);
  }
}
```

### Kill
```typescript
// src/modules/events/entities/kill.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Session } from "../../sessions/entities/session.entity";

@Entity("kills")
@Index(["sessionId", "killedAt"])
@Index(["creatureName"])
export class Kill {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "char", length: 36 })
  sessionId: string;

  @ManyToOne(() => Session, (session) => session.kills, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: Session;

  @Column({ type: "varchar", length: 100 })
  creatureName: string;

  @Column({ type: "int", nullable: true })
  experienceGained: number | null;

  @Column({ type: "int", nullable: true })
  positionX: number | null;

  @Column({ type: "int", nullable: true })
  positionY: number | null;

  @Column({ type: "tinyint", nullable: true })
  positionZ: number | null;

  @CreateDateColumn({ type: "timestamp" })
  killedAt: Date;
}
```

### Loot
```typescript
// src/modules/events/entities/loot.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Session } from "../../sessions/entities/session.entity";

@Entity("loot")
@Index(["sessionId"])
@Index(["itemName"])
export class Loot {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "char", length: 36 })
  sessionId: string;

  @ManyToOne(() => Session, (session) => session.loot, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: Session;

  @Column({ type: "varchar", length: 100 })
  itemName: string;

  @Column({ type: "int", default: 1 })
  quantity: number;

  @Column({ type: "int", nullable: true })
  estimatedValue: number | null;

  @CreateDateColumn({ type: "timestamp" })
  lootedAt: Date;
}
```

### ExperienceSnapshot
```typescript
// src/modules/events/entities/experience-snapshot.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Session } from "../../sessions/entities/session.entity";

@Entity("experience_snapshots")
@Index(["sessionId", "recordedAt"])
export class ExperienceSnapshot {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "char", length: 36 })
  sessionId: string;

  @ManyToOne(() => Session, (session) => session.experienceSnapshots, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: Session;

  @Column({ type: "bigint" })
  experience: string;

  @Column({ type: "int" })
  level: number;

  @CreateDateColumn({ type: "timestamp" })
  recordedAt: Date;
}
```

### GenericEvent (para death, level_up, refill, etc)
```typescript
// src/modules/events/entities/generic-event.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Session } from "../../sessions/entities/session.entity";

@Entity("generic_events")
@Index(["sessionId", "eventType"])
export class GenericEvent {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "char", length: 36 })
  sessionId: string;

  @ManyToOne(() => Session, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: Session;

  @Column({ type: "varchar", length: 50 })
  eventType: string; // death, level_up, refill, etc

  @Column({ type: "json", nullable: true })
  data: Record<string, any>;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
```

## Services

### Auth Service
```typescript
// src/modules/auth/auth.service.ts

import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { User } from "../users/entities/user.entity";
import { RegisterDto, LoginDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    await this.userRepo.save(user);

    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.status !== "active") {
      throw new UnauthorizedException("Account is suspended");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return { message: "If the email exists, a reset link will be sent" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await this.userRepo.save(user);

    // TODO: Send email with reset link

    return { message: "If the email exists, a reset link will be sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepo.save(user);

    return { message: "Password reset successfully" };
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private sanitizeUser(user: User) {
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...sanitized } = user;
    return sanitized;
  }
}
```

### Events Service (Bulk Insert)
```typescript
// src/modules/events/events.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Kill } from "./entities/kill.entity";
import { Loot } from "./entities/loot.entity";
import { ExperienceSnapshot } from "./entities/experience-snapshot.entity";
import { GenericEvent } from "./entities/generic-event.entity";
import { Session } from "../sessions/entities/session.entity";
import { BatchEventsDto, BatchEventsResponseDto } from "./dto/batch-events.dto";

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Kill)
    private readonly killRepo: Repository<Kill>,
    @InjectRepository(Loot)
    private readonly lootRepo: Repository<Loot>,
    @InjectRepository(ExperienceSnapshot)
    private readonly expRepo: Repository<ExperienceSnapshot>,
    @InjectRepository(GenericEvent)
    private readonly genericEventRepo: Repository<GenericEvent>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async processBatch(dto: BatchEventsDto): Promise<BatchEventsResponseDto> {
    const kills: Partial<Kill>[] = [];
    const loots: Partial<Loot>[] = [];
    const experiences: Partial<ExperienceSnapshot>[] = [];
    const genericEvents: Partial<GenericEvent>[] = [];

    for (const event of dto.events) {
      const timestamp = new Date(event.timestamp * 1000);

      switch (event.type) {
        case "kill":
          kills.push({
            sessionId: dto.sessionId,
            creatureName: event.data.creatureName,
            experienceGained: event.data.experienceGained,
            positionX: event.data.position?.x,
            positionY: event.data.position?.y,
            positionZ: event.data.position?.z,
            killedAt: timestamp,
          });
          break;

        case "loot":
          loots.push({
            sessionId: dto.sessionId,
            itemName: event.data.itemName,
            quantity: event.data.quantity ?? 1,
            estimatedValue: event.data.estimatedValue,
            lootedAt: timestamp,
          });
          break;

        case "experience":
          experiences.push({
            sessionId: dto.sessionId,
            experience: event.data.experience.toString(),
            level: event.data.level,
            recordedAt: timestamp,
          });
          break;

        case "session_start":
          // Atualiza dados iniciais da sessão
          await this.sessionRepo.update(dto.sessionId, {
            characterName: event.data.characterName,
            huntLocation: event.data.huntLocation,
            initialLevel: event.data.initialLevel,
            initialExperience: event.data.initialExperience?.toString(),
          });
          break;

        case "session_end":
          // Finaliza a sessão
          await this.sessionRepo.update(dto.sessionId, {
            status: "completed",
            endedAt: timestamp,
            finalLevel: event.data.finalLevel,
            finalExperience: event.data.finalExperience?.toString(),
          });
          break;

        // Eventos genéricos: death, level_up, refill, etc
        case "death":
        case "level_up":
        case "refill":
        default:
          if (event.type !== "session_start" && event.type !== "session_end") {
            genericEvents.push({
              sessionId: dto.sessionId,
              eventType: event.type,
              data: event.data,
              createdAt: timestamp,
            });
          }
          break;
      }
    }

    // Bulk insert using transaction
    await this.dataSource.transaction(async (manager) => {
      if (kills.length > 0) {
        await manager.insert(Kill, kills);
      }
      if (loots.length > 0) {
        await manager.insert(Loot, loots);
      }
      if (experiences.length > 0) {
        await manager.insert(ExperienceSnapshot, experiences);
      }
      if (genericEvents.length > 0) {
        await manager.insert(GenericEvent, genericEvents);
      }
    });

    this.logger.debug(
      `Processed batch: ${kills.length} kills, ${loots.length} loots, ${experiences.length} exp, ${genericEvents.length} generic`,
    );

    return {
      processed: dto.events.length,
      kills: kills.length,
      loots: loots.length,
      experiences: experiences.length,
      genericEvents: genericEvents.length,
    };
  }
}
```

### Subscriptions Service (activate/cancel)
```typescript
// src/modules/subscriptions/subscriptions.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Subscription } from "./entities/subscription.entity";
import { Plan } from "./entities/plan.entity";

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async getCurrentSubscription(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId },
      relations: ["plan"],
    });

    return subscription;
  }

  async activate(data: {
    userId: string;
    planId: string;
    externalId: string;
  }) {
    const plan = await this.planRepo.findOne({ where: { id: data.planId } });
    if (!plan) {
      throw new NotFoundException("Plan not found");
    }

    // Verifica se já existe subscription
    let subscription = await this.subscriptionRepo.findOne({
      where: { userId: data.userId },
    });

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    if (subscription) {
      // Atualiza subscription existente
      subscription.planId = data.planId;
      subscription.externalId = data.externalId;
      subscription.status = "active";
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
      subscription.cancelAtPeriodEnd = false;
    } else {
      // Cria nova subscription
      subscription = this.subscriptionRepo.create({
        userId: data.userId,
        planId: data.planId,
        externalId: data.externalId,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
    }

    return this.subscriptionRepo.save(subscription);
  }

  async cancel(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    subscription.cancelAtPeriodEnd = true;
    return this.subscriptionRepo.save(subscription);
  }

  async cancelByExternalId(externalId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { externalId },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    subscription.status = "cancelled";
    subscription.cancelAtPeriodEnd = false;
    return this.subscriptionRepo.save(subscription);
  }
}
```

### Subscriptions Controller
```typescript
// src/modules/subscriptions/subscriptions.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { SubscriptionsService } from "./subscriptions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("Subscriptions")
@Controller("api/v1/subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("current")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCurrent(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.getCurrentSubscription(user.id);
  }

  @Post("cancel")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  async cancel(@CurrentUser() user: { id: string }) {
    return this.subscriptionsService.cancel(user.id);
  }

  // Chamado pelo webhook da landing page para ativar
  @Post("activate")
  @HttpCode(200)
  async activate(
    @Body() body: { userId: string; planId: string; externalId: string },
  ) {
    // IMPORTANTE: Este endpoint deve ser protegido por token interno
    // O header Authorization deve conter o API_INTERNAL_TOKEN
    return this.subscriptionsService.activate(body);
  }

  // Chamado pelo webhook da landing page para cancelar
  @Post("cancel-by-external")
  @HttpCode(200)
  async cancelByExternal(
    @Body() body: { externalId: string },
  ) {
    // IMPORTANTE: Este endpoint deve ser protegido por token interno
    return this.subscriptionsService.cancelByExternalId(body.externalId);
  }
}
```

### Analytics Service
```typescript
// src/modules/analytics/analytics.service.ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Kill } from "../events/entities/kill.entity";
import { Loot } from "../events/entities/loot.entity";
import { ExperienceSnapshot } from "../events/entities/experience-snapshot.entity";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Kill)
    private readonly killRepo: Repository<Kill>,
    @InjectRepository(Loot)
    private readonly lootRepo: Repository<Loot>,
    @InjectRepository(ExperienceSnapshot)
    private readonly expRepo: Repository<ExperienceSnapshot>,
  ) {}

  async getKillsByCreature(params: { sessionId?: string; userId?: string }) {
    const query = this.killRepo
      .createQueryBuilder("kill")
      .select("kill.creatureName", "creatureName")
      .addSelect("COUNT(*)", "totalKills")
      .addSelect("SUM(kill.experienceGained)", "totalExperience")
      .groupBy("kill.creatureName")
      .orderBy("COUNT(*)", "DESC");

    if (params.sessionId) {
      query.where("kill.sessionId = :sessionId", { sessionId: params.sessionId });
    }

    return query.getRawMany();
  }

  async getExperienceHourly(sessionId: string) {
    const snapshots = await this.expRepo.find({
      where: { sessionId },
      order: { recordedAt: "ASC" },
    });

    if (snapshots.length < 2) {
      return { xpPerHourAverage: 0, dataPoints: [] };
    }

    const dataPoints = [];

    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];

      const timeDiffHours =
        (curr.recordedAt.getTime() - prev.recordedAt.getTime()) / (1000 * 60 * 60);

      if (timeDiffHours > 0) {
        const xpDiff = Number(curr.experience) - Number(prev.experience);
        const xpPerHour = Math.round(xpDiff / timeDiffHours);

        dataPoints.push({
          timestamp: curr.recordedAt.toISOString(),
          xpPerHour,
          level: curr.level,
        });
      }
    }

    const avgXpPerHour =
      dataPoints.length > 0
        ? Math.round(dataPoints.reduce((sum, p) => sum + p.xpPerHour, 0) / dataPoints.length)
        : 0;

    return {
      xpPerHourAverage: avgXpPerHour,
      dataPoints,
    };
  }

  async getLootSummary(sessionId?: string) {
    const query = this.lootRepo
      .createQueryBuilder("loot")
      .select("loot.itemName", "itemName")
      .addSelect("SUM(loot.quantity)", "totalQuantity")
      .addSelect("SUM(loot.estimatedValue * loot.quantity)", "totalValue")
      .groupBy("loot.itemName")
      .orderBy("SUM(loot.estimatedValue * loot.quantity)", "DESC");

    if (sessionId) {
      query.where("loot.sessionId = :sessionId", { sessionId });
    }

    const items = await query.getRawMany();
    const totalValue = items.reduce((sum, item) => sum + (Number(item.totalValue) || 0), 0);

    return { items, totalValue };
  }
}
```

### Realtime Gateway (com autenticação)
```typescript
// src/modules/realtime/realtime.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { ApiKeysService } from "../api-keys/api-keys.service";

interface PositionUpdate {
  x: number;
  y: number;
  z: number;
  sessionId: string;
}

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3002"],
  },
  namespace: "/ws",
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private positions = new Map<string, PositionUpdate>();

  constructor(private readonly apiKeysService: ApiKeysService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    const sessionId = client.handshake.query.session as string;

    // Valida API key (para bot) ou JWT (para dashboard)
    if (token) {
      const isValid = await this.apiKeysService.validateKey(token);
      if (!isValid) {
        this.logger.warn(`Invalid token for client: ${client.id}`);
        client.disconnect();
        return;
      }
    }

    if (sessionId) {
      client.join(`session:${sessionId}`);

      // Send last known position
      const lastPosition = this.positions.get(sessionId);
      if (lastPosition) {
        client.emit("position", lastPosition);
      }
    }

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("position")
  handlePosition(client: Socket, payload: PositionUpdate) {
    this.positions.set(payload.sessionId, payload);
    this.server.to(`session:${payload.sessionId}`).emit("position", payload);
  }
}
```

### Sessions Service (criar/atualizar sessão)
```typescript
// src/modules/sessions/sessions.service.ts

import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Session } from "./entities/session.entity";
import { CreateSessionDto, UpdateSessionDto } from "./dto";

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async create(userId: string, dto: CreateSessionDto): Promise<Session> {
    const session = this.sessionRepo.create({
      userId,
      characterName: dto.characterName,
      huntLocation: dto.huntLocation,
      initialLevel: dto.initialLevel,
      initialExperience: dto.initialExperience?.toString(),
      status: "active",
    });

    return this.sessionRepo.save(session);
  }

  async findAllByUser(userId: string, params: { page?: number; limit?: number; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.sessionRepo.createQueryBuilder("session")
      .where("session.userId = :userId", { userId })
      .orderBy("session.startedAt", "DESC")
      .skip(skip)
      .take(limit);

    if (params.status) {
      query.andWhere("session.status = :status", { status: params.status });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Session> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ["kills", "loot", "experienceSnapshots"],
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    if (session.userId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    return session;
  }

  async update(id: string, userId: string, dto: UpdateSessionDto): Promise<Session> {
    const session = await this.findOne(id, userId);

    Object.assign(session, dto);
    if (dto.status === "completed" && !session.endedAt) {
      session.endedAt = new Date();
    }

    return this.sessionRepo.save(session);
  }

  async delete(id: string, userId: string): Promise<void> {
    const session = await this.findOne(id, userId);
    await this.sessionRepo.remove(session);
  }
}
```

### Sessions Controller
```typescript
// src/modules/sessions/sessions.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { SessionsService } from "./sessions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiKeyGuard } from "../auth/guards/api-key.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateSessionDto, UpdateSessionDto, SessionQueryDto } from "./dto";

@ApiTags("Sessions")
@Controller("api/v1/sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  // Para o Bot criar sessão (usa API Key)
  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.create(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query() query: SessionQueryDto,
  ) {
    return this.sessionsService.findAllByUser(user.id, query);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    return this.sessionsService.findOne(id, user.id);
  }

  // Para o Bot atualizar/finalizar sessão (usa API Key)
  @Patch(":id")
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  async update(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, user.id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async delete(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    return this.sessionsService.delete(id, user.id);
  }
}
```

### Sessions DTOs
```typescript
// src/modules/sessions/dto/create-session.dto.ts

import { IsString, IsOptional, IsInt, IsNumber, IsUUID } from "class-validator";

export class CreateSessionDto {
  @IsUUID()
  characterId: string; // Agora requer o ID do character

  @IsOptional()
  @IsString()
  huntLocation?: string;

  @IsOptional()
  @IsInt()
  initialLevel?: number;

  @IsOptional()
  @IsNumber()
  initialExperience?: number;
}

// src/modules/sessions/dto/update-session.dto.ts

import { IsString, IsOptional, IsInt, IsNumber, IsIn } from "class-validator";

export class UpdateSessionDto {
  @IsOptional()
  @IsIn(["active", "completed", "crashed"])
  status?: "active" | "completed" | "crashed";

  @IsOptional()
  @IsInt()
  finalLevel?: number;

  @IsOptional()
  @IsNumber()
  finalExperience?: number;
}

// src/modules/sessions/dto/session-query.dto.ts

import { IsOptional, IsInt, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class SessionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  characterId?: string;
}
```

### Characters Service
```typescript
// src/modules/characters/characters.service.ts

import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Character } from "./entities/character.entity";
import { Session, SessionStatus } from "../sessions/entities/session.entity";

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepo: Repository<Character>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async create(userId: string, data: { name: string; world: string; vocation?: string }) {
    // Verifica se já existe character com mesmo nome+world
    const existing = await this.characterRepo.findOne({
      where: { name: data.name, world: data.world },
    });

    if (existing) {
      throw new ConflictException("Character already registered");
    }

    const character = this.characterRepo.create({
      userId,
      name: data.name,
      world: data.world,
      vocation: data.vocation,
    });

    return this.characterRepo.save(character);
  }

  async findAllByUser(userId: string) {
    const characters = await this.characterRepo.find({
      where: { userId, isActive: true },
      order: { createdAt: "DESC" },
    });

    // Adiciona info de sessão ativa para cada character
    const result = await Promise.all(
      characters.map(async (char) => {
        const activeSession = await this.sessionRepo.findOne({
          where: { characterId: char.id, status: SessionStatus.ACTIVE },
        });

        return {
          ...char,
          hasActiveSession: !!activeSession,
          activeSessionId: activeSession?.id,
        };
      })
    );

    return result;
  }

  async findOne(id: string, userId: string) {
    const character = await this.characterRepo.findOne({
      where: { id, userId },
    });

    if (!character) {
      throw new NotFoundException("Character not found");
    }

    return character;
  }

  async findActiveCharacter(userId: string) {
    // Encontra character que tem sessão ativa
    const activeSession = await this.sessionRepo.findOne({
      where: { status: SessionStatus.ACTIVE },
      relations: ["character"],
    });

    if (!activeSession || activeSession.character.userId !== userId) {
      return null;
    }

    return {
      character: activeSession.character,
      session: activeSession,
    };
  }

  async getCharacterSessions(id: string, userId: string, params: { page?: number; limit?: number }) {
    await this.findOne(id, userId); // Verifica permissão

    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [sessions, total] = await this.sessionRepo.findAndCount({
      where: { characterId: id },
      order: { startedAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      data: sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(id: string, userId: string) {
    const character = await this.findOne(id, userId);
    character.isActive = false; // Soft delete
    return this.characterRepo.save(character);
  }

  async updateLevel(id: string, level: number) {
    await this.characterRepo.update(id, { level });
  }
}
```

### Characters Controller
```typescript
// src/modules/characters/characters.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CharactersService } from "./characters.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("Characters")
@Controller("api/v1/characters")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  async create(
    @CurrentUser() user: { id: string },
    @Body() body: { name: string; world: string; vocation?: string },
  ) {
    return this.charactersService.create(user.id, body);
  }

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.charactersService.findAllByUser(user.id);
  }

  @Get("active")
  async findActive(@CurrentUser() user: { id: string }) {
    return this.charactersService.findActiveCharacter(user.id);
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    return this.charactersService.findOne(id, user.id);
  }

  @Get(":id/sessions")
  async getSessions(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Query() query: { page?: number; limit?: number },
  ) {
    return this.charactersService.getCharacterSessions(id, user.id, query);
  }

  @Delete(":id")
  async delete(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
  ) {
    return this.charactersService.delete(id, user.id);
  }
}
```

### License Service (Validação de Key)
```typescript
// src/modules/license/license.service.ts

import { Injectable, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { ApiKey, LicenseStatus } from "../api-keys/entities/api-key.entity";
import { User } from "../users/entities/user.entity";

export interface LicenseValidationResult {
  valid: boolean;
  userId?: string;
  status?: LicenseStatus;
  expiresAt?: Date;
  daysRemaining?: number;
  message?: string;
}

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Valida uma API key e retorna info da licença.
   * Usado pelo bot Python no startup.
   */
  async validate(apiKey: string): Promise<LicenseValidationResult> {
    // API key format: tm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    if (!apiKey || !apiKey.startsWith("tm_")) {
      return { valid: false, message: "Invalid key format" };
    }

    // Busca todas as keys ativas para comparar hash
    const activeKeys = await this.apiKeyRepo.find({
      where: { status: LicenseStatus.ACTIVE },
      relations: ["user"],
    });

    for (const key of activeKeys) {
      const isMatch = await bcrypt.compare(apiKey, key.keyHash);
      if (!isMatch) continue;

      // Verifica expiração
      const now = new Date();
      if (now > key.expiresAt) {
        // Marca como expirada
        key.status = LicenseStatus.EXPIRED;
        await this.apiKeyRepo.save(key);

        return {
          valid: false,
          status: LicenseStatus.EXPIRED,
          message: "License expired",
          expiresAt: key.expiresAt,
        };
      }

      // Verifica se usuário está ativo
      if (key.user.status !== "active") {
        return {
          valid: false,
          message: "User account suspended",
        };
      }

      // Atualiza last used
      key.lastUsedAt = now;
      key.totalRequests++;
      await this.apiKeyRepo.save(key);

      const daysRemaining = Math.ceil(
        (key.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        valid: true,
        userId: key.userId,
        status: key.status,
        expiresAt: key.expiresAt,
        daysRemaining,
      };
    }

    return { valid: false, message: "Invalid license key" };
  }

  /**
   * Retorna status da licença para o dashboard.
   */
  async getStatus(userId: string) {
    const keys = await this.apiKeyRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });

    const activeKey = keys.find((k) => k.status === LicenseStatus.ACTIVE && !k.isExpired);

    if (!activeKey) {
      return {
        hasLicense: false,
        status: null,
        expiresAt: null,
        daysRemaining: 0,
        keys: keys.map((k) => ({
          id: k.id,
          name: k.name,
          keyPrefix: k.keyPrefix,
          status: k.isExpired ? LicenseStatus.EXPIRED : k.status,
          expiresAt: k.expiresAt,
          createdAt: k.createdAt,
        })),
      };
    }

    return {
      hasLicense: true,
      status: activeKey.status,
      expiresAt: activeKey.expiresAt,
      daysRemaining: activeKey.daysRemaining,
      keys: keys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        status: k.isExpired ? LicenseStatus.EXPIRED : k.status,
        expiresAt: k.expiresAt,
        createdAt: k.createdAt,
      })),
    };
  }

  /**
   * Gera uma nova license key.
   * Chamado quando pagamento é confirmado.
   */
  async generateKey(userId: string, name: string, durationDays: number = 30): Promise<{ key: string; apiKey: ApiKey }> {
    // Gera key aleatória
    const rawKey = `tm_${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = await bcrypt.hash(rawKey, 10);
    const keyPrefix = rawKey.substring(0, 8); // tm_xxxx

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const apiKey = this.apiKeyRepo.create({
      userId,
      name,
      keyHash,
      keyPrefix,
      status: LicenseStatus.ACTIVE,
      expiresAt,
    });

    await this.apiKeyRepo.save(apiKey);

    return { key: rawKey, apiKey };
  }

  /**
   * Renova uma license key por mais 30 dias.
   * Chamado quando pagamento recorrente é confirmado.
   */
  async renewKey(keyId: string, durationDays: number = 30): Promise<ApiKey> {
    const key = await this.apiKeyRepo.findOne({ where: { id: keyId } });
    if (!key) {
      throw new NotFoundException("License key not found");
    }

    // Estende a partir da data atual ou da expiração (o que for maior)
    const baseDate = key.expiresAt > new Date() ? key.expiresAt : new Date();
    const newExpiration = new Date(baseDate);
    newExpiration.setDate(newExpiration.getDate() + durationDays);

    key.expiresAt = newExpiration;
    key.status = LicenseStatus.ACTIVE;

    return this.apiKeyRepo.save(key);
  }

  /**
   * Revoga uma license key.
   */
  async revokeKey(keyId: string, userId: string): Promise<void> {
    const key = await this.apiKeyRepo.findOne({ where: { id: keyId, userId } });
    if (!key) {
      throw new NotFoundException("License key not found");
    }

    key.status = LicenseStatus.REVOKED;
    await this.apiKeyRepo.save(key);
  }
}
```

### License Controller
```typescript
// src/modules/license/license.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { LicenseService } from "./license.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("License")
@Controller("api/v1/license")
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  /**
   * Valida uma API key (usado pelo bot Python).
   * Não requer autenticação - a key é a autenticação.
   */
  @Post("validate")
  @HttpCode(200)
  async validate(@Body() body: { apiKey: string }) {
    return this.licenseService.validate(body.apiKey);
  }

  /**
   * Retorna status da licença do usuário logado.
   */
  @Get("status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getStatus(@CurrentUser() user: { id: string }) {
    return this.licenseService.getStatus(user.id);
  }
}
```

### Admin Service (settings, feature flags)
```typescript
// src/modules/admin/admin.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Subscription } from "../subscriptions/entities/subscription.entity";
import { Session } from "../sessions/entities/session.entity";
import { ApiKey } from "../api-keys/entities/api-key.entity";
import { Plan } from "../subscriptions/entities/plan.entity";

// Feature flags em memória (em produção, usar Redis ou banco)
let featureFlags = {
  maintenanceMode: false,
  signupsEnabled: true,
  newPricingEnabled: false,
  betaFeaturesEnabled: false,
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  async getPlatformStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeSubscriptions,
      botsOnlineNow,
      sessionsToday,
      newUsersToday,
    ] = await Promise.all([
      this.userRepo.count(),
      this.subscriptionRepo.count({ where: { status: "active" } }),
      this.sessionRepo.count({ where: { status: "active" } }),
      this.sessionRepo.count({ where: { startedAt: MoreThan(startOfDay) } }),
      this.userRepo.count({ where: { createdAt: MoreThan(startOfDay) } }),
    ]);

    // Calcular MRR
    const subscriptions = await this.subscriptionRepo.find({
      where: { status: "active" },
      relations: ["plan"],
    });
    const monthlyRevenue = subscriptions.reduce(
      (sum, sub) => sum + (sub.plan?.priceMonthly || 0),
      0
    );

    return {
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      botsOnlineNow,
      sessionsToday,
      newUsersToday,
      churnRate: 0, // TODO: calcular churn real
    };
  }

  async getActiveBotsCount() {
    const sessions = await this.sessionRepo.find({
      where: { status: "active" },
      relations: ["user"],
      take: 100,
    });

    return {
      count: sessions.length,
      sessions: sessions.map(s => ({
        id: s.id,
        characterName: s.characterName,
        startedAt: s.startedAt,
        user: { email: s.user?.email },
      })),
    };
  }

  async giveFreePlan(userId: string, planId: string, days: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException("Plan not found");
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + days);

    let subscription = await this.subscriptionRepo.findOne({
      where: { userId },
    });

    if (subscription) {
      subscription.planId = planId;
      subscription.status = "active";
      subscription.currentPeriodStart = now;
      subscription.currentPeriodEnd = periodEnd;
    } else {
      subscription = this.subscriptionRepo.create({
        userId,
        planId,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
    }

    return this.subscriptionRepo.save(subscription);
  }

  // Feature Flags
  getFeatureFlags() {
    return featureFlags;
  }

  updateFeatureFlags(flags: Partial<typeof featureFlags>) {
    featureFlags = { ...featureFlags, ...flags };
    return featureFlags;
  }

  setMaintenanceMode(enabled: boolean) {
    featureFlags.maintenanceMode = enabled;
    return { maintenanceMode: enabled };
  }

  // Endpoint Stats (mockado - em produção usar métricas reais)
  async getEndpointStats() {
    return [
      { endpoint: "/api/v1/events/batch", method: "POST", totalRequests: 15420, avgLatency: 45, errorRate: 0.02 },
      { endpoint: "/api/v1/sessions", method: "GET", totalRequests: 8230, avgLatency: 32, errorRate: 0.01 },
      { endpoint: "/api/v1/analytics/experience/hourly", method: "GET", totalRequests: 5120, avgLatency: 85, errorRate: 0.03 },
    ];
  }
}
```

### Admin Controller
```typescript
// src/modules/admin/admin.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("Admin")
@Controller("api/v1/admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("analytics/platform")
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get("analytics/bots-online")
  async getActiveBotsCount() {
    return this.adminService.getActiveBotsCount();
  }

  @Get("analytics/endpoints")
  async getEndpointStats() {
    return this.adminService.getEndpointStats();
  }

  @Get("analytics/usage")
  async getUsageMetrics(@Query("period") period: string) {
    // TODO: implementar métricas de uso reais
    return [];
  }

  @Get("analytics/revenue")
  async getRevenueMetrics(@Query("period") period: string) {
    // TODO: implementar métricas de revenue reais
    return [];
  }

  @Post("users/:id/give-plan")
  async giveFreePlan(
    @Param("id") userId: string,
    @Body() body: { planId: string; days: number },
  ) {
    return this.adminService.giveFreePlan(userId, body.planId, body.days);
  }

  @Get("settings/feature-flags")
  getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Patch("settings/feature-flags")
  updateFeatureFlags(@Body() flags: Record<string, boolean>) {
    return this.adminService.updateFeatureFlags(flags);
  }

  @Patch("settings/maintenance")
  setMaintenanceMode(@Body() body: { enabled: boolean }) {
    return this.adminService.setMaintenanceMode(body.enabled);
  }
}
```

## Configuration

### Database Config
```typescript
// src/config/database.config.ts

import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const databaseConfig: TypeOrmModuleOptions = {
  type: "mysql",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  username: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "root",
  database: process.env.DATABASE_NAME || "tibia_telemetry",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
};
```

### Main.ts
```typescript
// src/main.ts

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle("TibiaEye API")
    .setDescription("Telemetry API for Tibia bots")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
```

## Docker

### Dockerfile
```dockerfile
FROM oven/bun:1 as builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 4000

CMD ["bun", "run", "dist/main.js"]
```

### docker-compose.yml
```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: tibia_telemetry
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: development
      DATABASE_HOST: mysql
      DATABASE_PORT: 3306
      DATABASE_USER: root
      DATABASE_PASSWORD: root
      DATABASE_NAME: tibia_telemetry
      JWT_SECRET: your-secret-key
    depends_on:
      mysql:
        condition: service_healthy

volumes:
  mysql_data:
```

## package.json
```json
{
  "name": "@tibia/api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "NODE_ENV=production node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm migration:generate -d src/config/database.config.ts",
    "migration:run": "npm run typeorm migration:run -d src/config/database.config.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^3.1.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/swagger": "^7.2.0",
    "@nestjs/typeorm": "^10.0.1",
    "@nestjs/websockets": "^10.3.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "mysql2": "^3.7.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1",
    "socket.io": "^4.7.4",
    "typeorm": "^0.3.19"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@swc/cli": "^0.1.63",
    "@swc/core": "^1.3.102",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.0",
    "@types/passport-jwt": "^4.0.0",
    "jest": "^29.7.0",
    "source-map-support": "^0.5.21",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.0"
  }
}
```

## Segurança
- JWT para autenticação de usuários (App/Backoffice)
- API Key para autenticação do bot
- Rate limiting por API key
- CORS configurado para domínios específicos
- Helmet para headers de segurança

## Entregáveis
1. Código completo de todos os arquivos
2. package.json
3. Dockerfile
4. docker-compose.yml (com MySQL)
5. Migrations TypeORM

## Não fazer
- Frontend
- Emojis no código
