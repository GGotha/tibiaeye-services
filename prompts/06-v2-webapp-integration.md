# Fase 2 + 3: Integrar Bot Status Realtime e Analytics Avancados na Webapp

## Contexto

A webapp TibiaEye (API Fastify + Dashboard React) precisa receber dados do bot Python
e exibir em tempo real. Este doc cobre SOMENTE mudancas na webapp (API + Dashboard).
Para mudancas no bot Python, veja: `prompts/06-v2-python-bot-integration.md`

O bot Python JA envia via WebSocket mensagens do tipo `"position"` e `"status"`.
A API JA suporta `"position"`. Este doc adiciona suporte a `"status"` e features novas.

## Fluxo E2E Completo

```
ESTADO ATUAL (ja funciona):
  - Bot envia "position" via WS -> API broadcast -> Dashboard mostra no Live Map
  - Bot envia events via POST /api/v1/events/batch -> API salva kills/loot/xp
  - Dashboard mostra "stats" (totalKills, totalExperience, totalLootValue, xpPerHour)
  - Dashboard mostra sessions, analytics, live map

O QUE ESTE DOC ADICIONA:

FASE 2a - Bot Status Realtime (Prioridade alta):
  1. API: Suportar mensagem "status" no WebSocket controller
  2. API: Broadcast "status" para subscribers do dashboard
  3. Dashboard: Hook useRealtimeSession recebe "status"
  4. Dashboard: Componente BotStatusCard mostra HP/Mana bars + estado do bot
  5. Dashboard: ActiveSessionBanner mostra estado do bot inline

FASE 2b - Novos Tipos de Evento (Prioridade media):
  6. API: Adicionar "death", "level_up", "refill" ao EventSchema
  7. API: Criar GameEventEntity para eventos genericos
  8. API: Endpoint GET /api/v1/analytics/events para timeline detalhada
  9. Dashboard: Timeline tab usa dados reais com novos tipos

FASE 3 - Profit Calculator + Session Comparison (Prioridade baixa):
  10. API: Endpoint GET /api/v1/analytics/profit
  11. API: Endpoint GET /api/v1/analytics/compare
  12. Dashboard: Pagina /dashboard/profit com profit chart
  13. Dashboard: Pagina /dashboard/compare com session comparator
```

---

## PADOES DO PROJETO (referencia obrigatoria)

Antes de implementar qualquer codigo, seguir estes padroes EXATOS do projeto:

### API (Fastify + TypeORM + Zod)

**Controller pattern** - arquivo: `apps/api/src/modules/<name>/controller.ts`
```typescript
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const myController: FastifyPluginAsyncZod = async (app) => {
  const myRepo = app.getRepository(MyEntity);

  app.get("/", {
    onRequest: [app.authenticate],  // JWT auth para dashboard
    schema: {
      tags: ["MyTag"],
      summary: "Description",
      security: [{ bearerAuth: [] }],
      querystring: MyQuerySchema,       // Zod schema
      response: { 200: MyResponseSchema },
    },
  }, async (request) => {
    const useCase = new MyUseCase(myRepo);
    return useCase.execute(request.user.sub, request.query);
  });
};
```

**Schema pattern** - arquivo: `apps/api/src/modules/<name>/schemas.ts`
```typescript
import { z } from "zod";

export const MySchema = z.object({
  field: z.string(),
  count: z.number().int(),
});
export type MyType = z.infer<typeof MySchema>;
```

**Entity pattern** - arquivo: `apps/api/src/entities/<name>.entity.ts`
```typescript
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("table_name")
@Index(["sessionId", "createdAt"])
export class MyEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "uuid" })
  sessionId: string;

  @ManyToOne(() => SessionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: SessionEntity;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Use-case pattern** - arquivo: `apps/api/src/modules/<name>/use-cases/<action>.use-case.ts`
```typescript
export class MyUseCase {
  constructor(private readonly repo: Repository<MyEntity>) {}
  async execute(userId: string, input: MyInput): Promise<MyOutput> {
    // validation, business logic, return DTO
  }
}
```

**Registrar controller** em `apps/api/src/app.ts`:
```typescript
import { myController } from "./modules/my/controller.js";
// Dentro do bloco async (api) => { ... }:
await api.register(myController, { prefix: "/my" });
```

### Dashboard (React + TanStack Router + TanStack Query)

**Route pattern** - arquivo: `apps/app/src/routes/dashboard/<name>/index.tsx`
```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/<name>/")({
  component: MyPage,
});

function MyPage() { /* ... */ }
```

**Hook pattern** - arquivo: `apps/app/src/hooks/use-<name>.ts`
```typescript
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useMyData(id?: string) {
  return useQuery({
    queryKey: ["my-data", id],
    queryFn: () => api.getMyData(id!),
    enabled: !!id,
    refetchInterval: 30000,  // opcional: polling
  });
}
```

**API client** - arquivo: `apps/app/src/lib/api.ts` (singleton ApiClient)
```typescript
// Adicionar metodo na classe ApiClient:
async getMyData(id: string): Promise<MyType> {
  const { data } = await this.client.get<MyType>(`/api/v1/my/${id}`);
  return data;
}
```

**Component pattern** - Tailwind + Shadcn/ui:
```typescript
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatDuration } from "@/lib/utils";

// Cores padrao:
// - bg-slate-900/50 border-slate-800 (cards)
// - text-white (valores), text-slate-400 (labels), text-slate-500 (descriptions)
// - text-emerald-400 (positivo/online), text-red-400 (negativo/offline)
// - text-yellow-400 (gold/loot)
// - bg-emerald-500/10 text-emerald-400 border-emerald-500/20 (badges verdes)
```

**Types** - arquivo: `apps/app/src/types/index.ts`

**Sidebar** - arquivo: `apps/app/src/components/layout/sidebar.tsx` (array `navItems`)

**Utils disponiveis** em `apps/app/src/lib/utils.ts`:
- `cn()` - classnames merge
- `formatNumber(n)` - 1000 -> "1.0k", 1000000 -> "1.0M"
- `formatDuration(seconds)` - "2h 30m" ou "45m 12s"
- `formatDate(date)` - "Jan 15, 2025"
- `formatDateTime(date)` - "Jan 15, 2025, 10:30 AM"
- `formatTime(date)` - "10:30 AM"
- `getRelativeTime(date)` - "2h ago"

---

## FASE 2a: Bot Status Realtime

### Passo 1: Adicionar interface StatusMessage no WebSocket controller

**Arquivo**: `apps/api/src/modules/realtime/controller.ts`

Adicionar APOS a interface `LeaveSessionMessage` (linha 33):

```typescript
interface StatusMessage {
  type: "status";
  sessionId: string;
  hpPercent: number;
  manaPercent: number;
  botState: string;
  targetCreature?: string;
  currentTask?: string;
  timestamp: string;
}
```

Atualizar o type union `ClientMessage` (linha 35):

```typescript
type ClientMessage = PositionMessage | JoinSessionMessage | LeaveSessionMessage | StatusMessage;
```

### Passo 2: Adicionar case "status" no switch do message handler

**Arquivo**: `apps/api/src/modules/realtime/controller.ts`

Dentro do `switch (message.type)`, APOS o case `"leave-session"` e ANTES do `default`:

```typescript
          case "status": {
            await handleStatus(socket, userId, message, sessionRepo);
            break;
          }
```

### Passo 3: Criar funcao handleStatus

**Arquivo**: `apps/api/src/modules/realtime/controller.ts`

Adicionar APOS a funcao `handlePosition` (final do arquivo):

```typescript
async function handleStatus(
  socket: WebSocket,
  userId: string,
  message: StatusMessage,
  sessionRepo: Repository<SessionEntity>,
): Promise<void> {
  const session = await sessionRepo.findOne({
    where: { id: message.sessionId },
    relations: ["character"],
  });

  if (!session || session.character.userId !== userId) {
    return; // Silently ignore invalid status - not critical
  }

  if (session.status !== SessionStatus.ACTIVE) {
    return;
  }

  broadcastToRoom(
    message.sessionId,
    {
      type: "status",
      sessionId: message.sessionId,
      hpPercent: message.hpPercent,
      manaPercent: message.manaPercent,
      botState: message.botState,
      targetCreature: message.targetCreature ?? null,
      currentTask: message.currentTask ?? null,
      timestamp: message.timestamp || new Date().toISOString(),
    },
    socket, // exclude sender
  );
}
```

### Passo 4: Adicionar room-manager lastStatus

**Arquivo**: `apps/api/src/shared/realtime/room-manager.ts`

Atualizar interface `SessionRoom` (linha 3):

```typescript
interface SessionRoom {
  subscribers: Set<WebSocket>;
  lastPosition?: { x: number; y: number; z: number; timestamp: string };
  lastStatus?: {
    hpPercent: number;
    manaPercent: number;
    botState: string;
    targetCreature: string | null;
    currentTask: string | null;
    timestamp: string;
  };
}
```

Adicionar funcao `updateRoomStatus` APOS `updateRoomPosition`:

```typescript
export function updateRoomStatus(
  sessionId: string,
  status: {
    hpPercent: number;
    manaPercent: number;
    botState: string;
    targetCreature: string | null;
    currentTask: string | null;
    timestamp: string;
  },
): void {
  let room = rooms.get(sessionId);
  if (!room) {
    room = { subscribers: new Set() };
    rooms.set(sessionId, room);
  }
  room.lastStatus = status;
}
```

Atualizar funcao `joinRoom` - enviar lastStatus para novos subscribers.
APOS o bloco `if (room.lastPosition) { ... }` (linha 25):

```typescript
  if (room.lastStatus) {
    ws.send(
      JSON.stringify({
        type: "status",
        sessionId,
        ...room.lastStatus,
      }),
    );
  }
```

### Passo 5: Atualizar handleStatus para salvar lastStatus

**Arquivo**: `apps/api/src/modules/realtime/controller.ts`

Adicionar import de `updateRoomStatus`:

```typescript
import {
  joinRoom,
  leaveRoom,
  removeFromAllRooms,
  updateRoomPosition,
  updateRoomStatus,
  broadcastToRoom,
} from "../../shared/realtime/room-manager.js";
```

Na funcao `handleStatus`, ANTES de `broadcastToRoom(...)`:

```typescript
  updateRoomStatus(message.sessionId, {
    hpPercent: message.hpPercent,
    manaPercent: message.manaPercent,
    botState: message.botState,
    targetCreature: message.targetCreature ?? null,
    currentTask: message.currentTask ?? null,
    timestamp: message.timestamp || new Date().toISOString(),
  });
```

### Passo 6: Atualizar hook useRealtimeSession no Dashboard

**Arquivo**: `apps/app/src/hooks/use-realtime.ts`

Adicionar interface BotStatus APOS `RealtimeStats`:

```typescript
interface BotStatus {
  hpPercent: number;
  manaPercent: number;
  botState: string;
  targetCreature: string | null;
  currentTask: string | null;
}
```

Adicionar state dentro de `useRealtimeSession`:

```typescript
const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
```

Adicionar case `"status"` no switch dentro de `ws.onmessage`, APOS case `"stats"`:

```typescript
          case "status":
            setBotStatus({
              hpPercent: data.hpPercent,
              manaPercent: data.manaPercent,
              botState: data.botState,
              targetCreature: data.targetCreature,
              currentTask: data.currentTask,
            });
            break;
```

Atualizar return:

```typescript
  return { position, stats, botStatus, isConnected };
```

Atualizar `useRealtimePosition`:

```typescript
export function useRealtimePosition(sessionId: string) {
  const { position, isConnected } = useRealtimeSession(sessionId);
  return { position, isConnected };
}
```

### Passo 7: Adicionar tipo BotStatus em types

**Arquivo**: `apps/app/src/types/index.ts`

Adicionar NO FINAL do arquivo:

```typescript
export interface BotStatus {
  hpPercent: number;
  manaPercent: number;
  botState: "running" | "paused" | "reconnecting" | "stopped";
  targetCreature: string | null;
  currentTask: string | null;
}
```

### Passo 8: Criar componente BotStatusCard

**Arquivo**: `apps/app/src/components/cards/bot-status-card.tsx` (NOVO)

```typescript
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Droplets, Crosshair, Cog } from "lucide-react";

interface BotStatusCardProps {
  hpPercent: number;
  manaPercent: number;
  botState: string;
  targetCreature: string | null;
  currentTask: string | null;
  isConnected: boolean;
}

const stateConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  running: {
    label: "Running",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  paused: {
    label: "Paused",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  reconnecting: {
    label: "Reconnecting",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  stopped: {
    label: "Stopped",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

export function BotStatusCard({
  hpPercent,
  manaPercent,
  botState,
  targetCreature,
  currentTask,
  isConnected,
}: BotStatusCardProps) {
  const state = stateConfig[botState] ?? stateConfig.stopped;

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-400">Bot Status</h3>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-emerald-500" : "bg-red-500"
              )}
            />
            <Badge className={cn(state.bg, state.color, state.border)}>
              {state.label}
            </Badge>
          </div>
        </div>

        {/* HP Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs text-slate-400">HP</span>
            </div>
            <span className="text-xs font-medium text-white">{hpPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                hpPercent > 50 ? "bg-red-500" : hpPercent > 25 ? "bg-orange-500" : "bg-red-600"
              )}
              style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
            />
          </div>
        </div>

        {/* Mana Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs text-slate-400">Mana</span>
            </div>
            <span className="text-xs font-medium text-white">{manaPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, manaPercent))}%` }}
            />
          </div>
        </div>

        {/* Target + Task */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          {targetCreature && (
            <div className="flex items-center gap-2 text-sm">
              <Crosshair className="h-3.5 w-3.5 text-red-400" />
              <span className="text-slate-400">Target:</span>
              <span className="text-white font-medium">{targetCreature}</span>
            </div>
          )}
          {currentTask && (
            <div className="flex items-center gap-2 text-sm">
              <Cog className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Task:</span>
              <span className="text-white">{currentTask}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Passo 9: Atualizar ActiveSessionBanner para mostrar bot status

**Arquivo**: `apps/app/src/components/cards/active-session-banner.tsx`

Atualizar destructuring do hook (linha 15):

```typescript
  const { position, stats, botStatus, isConnected } = useRealtimeSession(session.id);
```

Adicionar bot status display APOS o bloco de stats (apos `</div>` que fecha `gap-8`),
ANTES dos botoes (`<div className="flex items-center gap-2">`):

```typescript
          {botStatus && (
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Heart className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-slate-500">HP</span>
                </div>
                <div className="w-16 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-500"
                    style={{ width: `${botStatus.hpPercent}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-white mt-0.5">{botStatus.hpPercent}%</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Droplets className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-slate-500">Mana</span>
                </div>
                <div className="w-16 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${botStatus.manaPercent}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-white mt-0.5">{botStatus.manaPercent}%</p>
              </div>
            </div>
          )}
```

Adicionar import de `Heart, Droplets` no topo:

```typescript
import { Activity, Clock, Coins, Droplets, Eye, Heart, Sword } from "lucide-react";
```

### Passo 10: Adicionar BotStatusCard na pagina de session detail

**Arquivo**: `apps/app/src/routes/dashboard/sessions/$sessionId.tsx`

Adicionar imports no topo:

```typescript
import { BotStatusCard } from "@/components/cards/bot-status-card";
import { useRealtimeSession } from "@/hooks/use-realtime";
```

Dentro de `SessionDetailPage`, APOS `const { data: lootData }`:

```typescript
  const { botStatus, isConnected } = useRealtimeSession(
    session?.status === "active" ? sessionId : ""
  );
```

Adicionar BotStatusCard APOS o grid de 4 stats cards (APOS `</div>` que fecha `grid-cols-4`),
apenas para sessoes ativas:

```typescript
      {session.status === "active" && botStatus && (
        <BotStatusCard
          hpPercent={botStatus.hpPercent}
          manaPercent={botStatus.manaPercent}
          botState={botStatus.botState}
          targetCreature={botStatus.targetCreature}
          currentTask={botStatus.currentTask}
          isConnected={isConnected}
        />
      )}
```

### Passo 11: Adicionar BotStatusCard na pagina Dashboard Overview

**Arquivo**: `apps/app/src/routes/dashboard/index.tsx`

Adicionar imports:

```typescript
import { BotStatusCard } from "@/components/cards/bot-status-card";
import { useRealtimeSession } from "@/hooks/use-realtime";
```

Dentro de `DashboardOverview`, APOS `const { data: experienceData }`:

```typescript
  const { botStatus, isConnected } = useRealtimeSession(activeSession?.id ?? "");
```

Adicionar BotStatusCard APOS `{activeSession && <ActiveSessionBanner session={activeSession} />}`:

```typescript
      {activeSession && botStatus && (
        <BotStatusCard
          hpPercent={botStatus.hpPercent}
          manaPercent={botStatus.manaPercent}
          botState={botStatus.botState}
          targetCreature={botStatus.targetCreature}
          currentTask={botStatus.currentTask}
          isConnected={isConnected}
        />
      )}
```

---

## FASE 2b: Novos Tipos de Evento

### Passo 12: Adicionar event schemas

**Arquivo**: `apps/api/src/modules/events/schemas.ts`

Adicionar APOS `ExperienceSnapshotEventSchema` (linha 26):

```typescript
export const DeathEventSchema = z.object({
  type: z.literal("death"),
  killer: z.string().optional(),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
  positionZ: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});

export const LevelUpEventSchema = z.object({
  type: z.literal("level_up"),
  newLevel: z.number().int().positive(),
  timestamp: z.string().datetime().optional(),
});

export const RefillEventSchema = z.object({
  type: z.literal("refill"),
  potionsBought: z.number().int().optional(),
  goldSpent: z.number().int().optional(),
  timestamp: z.string().datetime().optional(),
});
```

Atualizar `EventSchema` discriminated union:

```typescript
export const EventSchema = z.discriminatedUnion("type", [
  KillEventSchema,
  LootEventSchema,
  ExperienceSnapshotEventSchema,
  DeathEventSchema,
  LevelUpEventSchema,
  RefillEventSchema,
]);
```

Adicionar type exports:

```typescript
export type DeathEvent = z.infer<typeof DeathEventSchema>;
export type LevelUpEvent = z.infer<typeof LevelUpEventSchema>;
export type RefillEvent = z.infer<typeof RefillEventSchema>;
```

### Passo 13: Criar GameEventEntity

**Arquivo**: `apps/api/src/entities/game-event.entity.ts` (NOVO)

```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SessionEntity } from "./session.entity.js";

@Entity("game_events")
@Index(["sessionId", "type"])
@Index(["sessionId", "createdAt"])
export class GameEventEntity {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string;

  @Column({ type: "uuid" })
  sessionId: string;

  @ManyToOne(() => SessionEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sessionId" })
  session: SessionEntity;

  @Column({ type: "varchar", length: 50 })
  type: string;

  @Column({ type: "simple-json", nullable: true })
  data: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Passo 14: Registrar entity no database config

**Arquivo**: `apps/api/src/config/database.ts`

Adicionar import:

```typescript
import { GameEventEntity } from "../entities/game-event.entity.js";
```

Adicionar `GameEventEntity` ao array `entities` do DataSource options.

### Passo 15: Processar novos tipos no ProcessBatchUseCase

**Arquivo**: `apps/api/src/modules/events/use-cases/process-batch.use-case.ts`

Adicionar import:

```typescript
import { GameEventEntity } from "../../../entities/game-event.entity.js";
```

Atualizar constructor para receber `gameEventRepo`:

```typescript
export class ProcessBatchUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
    private readonly killRepo: Repository<KillEntity>,
    private readonly lootRepo: Repository<LootEntity>,
    private readonly experienceRepo: Repository<ExperienceSnapshotEntity>,
    private readonly gameEventRepo: Repository<GameEventEntity>,
  ) {}
```

No metodo `processEvent`, adicionar cases APOS `case "experience"`:

```typescript
      case "death": {
        const gameEvent = new GameEventEntity();
        gameEvent.sessionId = sessionId;
        gameEvent.type = "death";
        gameEvent.data = {
          killer: event.killer ?? null,
          positionX: event.positionX ?? null,
          positionY: event.positionY ?? null,
          positionZ: event.positionZ ?? null,
        };
        if (event.timestamp) {
          gameEvent.createdAt = new Date(event.timestamp);
        }
        gameEvents.push(gameEvent);
        break;
      }

      case "level_up": {
        const gameEvent = new GameEventEntity();
        gameEvent.sessionId = sessionId;
        gameEvent.type = "level_up";
        gameEvent.data = { newLevel: event.newLevel };
        if (event.timestamp) {
          gameEvent.createdAt = new Date(event.timestamp);
        }
        gameEvents.push(gameEvent);
        break;
      }

      case "refill": {
        const gameEvent = new GameEventEntity();
        gameEvent.sessionId = sessionId;
        gameEvent.type = "refill";
        gameEvent.data = {
          potionsBought: event.potionsBought ?? null,
          goldSpent: event.goldSpent ?? null,
        };
        if (event.timestamp) {
          gameEvent.createdAt = new Date(event.timestamp);
        }
        gameEvents.push(gameEvent);
        break;
      }
```

No metodo `execute`, adicionar array `gameEvents` e batch insert:

```typescript
    const gameEvents: GameEventEntity[] = [];

    // ... (processEvent ja popula gameEvents via novo parametro)

    if (gameEvents.length > 0) {
      await this.gameEventRepo.save(gameEvents);
    }
```

Atualizar `processEvent` signature para incluir `gameEvents: GameEventEntity[]` como parametro.

### Passo 16: Atualizar events controller para passar gameEventRepo

**Arquivo**: `apps/api/src/modules/events/controller.ts`

Adicionar import:

```typescript
import { GameEventEntity } from "../../entities/game-event.entity.js";
```

Adicionar repo:

```typescript
  const gameEventRepo = app.getRepository(GameEventEntity);
```

Atualizar instanciacao do use-case:

```typescript
      const useCase = new ProcessBatchUseCase(
        sessionRepo,
        characterRepo,
        killRepo,
        lootRepo,
        experienceRepo,
        gameEventRepo,
      );
```

### Passo 17: Criar endpoint GET /api/v1/analytics/events

**Arquivo**: `apps/api/src/modules/analytics/schemas.ts`

Adicionar schemas:

```typescript
export const GameEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
});

export const GameEventListSchema = z.array(GameEventSchema);
```

**Arquivo**: `apps/api/src/modules/analytics/controller.ts`

Adicionar import:

```typescript
import { GameEventEntity } from "../../entities/game-event.entity.js";
import { GameEventListSchema } from "./schemas.js";
```

Adicionar repo:

```typescript
  const gameEventRepo = app.getRepository(GameEventEntity);
```

Adicionar endpoint APOS o ultimo `app.get(...)`:

```typescript
  // GET /api/v1/analytics/events
  app.get(
    "/events",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get game events (deaths, level ups, refills)",
        security: [{ bearerAuth: [] }],
        querystring: AnalyticsQuerySchema,
        response: { 200: GameEventListSchema },
      },
    },
    async (request) => {
      const query = request.query;
      const where: Record<string, unknown> = {};

      if (query.sessionId) {
        where.sessionId = query.sessionId;
      }

      const events = await gameEventRepo.find({
        where,
        order: { createdAt: "DESC" },
        take: 100,
      });

      return events.map((e) => ({
        id: e.id,
        type: e.type,
        data: e.data,
        createdAt: e.createdAt.toISOString(),
      }));
    },
  );
```

### Passo 18: Adicionar tipo GameEvent no dashboard

**Arquivo**: `apps/app/src/types/index.ts`

Adicionar:

```typescript
export interface GameEvent {
  id: string;
  type: "death" | "level_up" | "refill";
  data: Record<string, unknown> | null;
  createdAt: string;
}
```

### Passo 19: Adicionar API method e hook

**Arquivo**: `apps/app/src/lib/api.ts`

Adicionar metodo na classe ApiClient:

```typescript
  async getGameEvents(sessionId?: string): Promise<GameEvent[]> {
    const params: Record<string, string> = {};
    if (sessionId) params.sessionId = sessionId;
    const { data } = await this.client.get<GameEvent[]>("/api/v1/analytics/events", { params });
    return data;
  }
```

Adicionar import de `GameEvent` no topo do arquivo.

**Arquivo**: `apps/app/src/hooks/use-analytics.ts`

Adicionar:

```typescript
export function useGameEvents(sessionId?: string) {
  return useQuery({
    queryKey: ["game-events", sessionId],
    queryFn: () => api.getGameEvents(sessionId),
    enabled: !!sessionId,
  });
}
```

---

## FASE 3: Profit Calculator + Session Comparison

### Passo 20: Criar endpoint GET /api/v1/analytics/profit

**Arquivo**: `apps/api/src/modules/analytics/schemas.ts`

Adicionar:

```typescript
export const ProfitQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
  characterId: z.string().uuid().optional(),
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export const ProfitDataSchema = z.object({
  totalRevenue: z.number(),
  totalCost: z.number(),
  netProfit: z.number(),
  profitPerHour: z.number(),
  sessions: z.array(z.object({
    sessionId: z.string(),
    huntLocation: z.string().nullable(),
    duration: z.number(),
    lootValue: z.number(),
    suppliesCost: z.number(),
    netProfit: z.number(),
    startedAt: z.string().datetime(),
  })),
});

export type ProfitQuery = z.infer<typeof ProfitQuerySchema>;
export type ProfitData = z.infer<typeof ProfitDataSchema>;
```

**Arquivo**: `apps/api/src/modules/analytics/use-cases/get-profit.use-case.ts` (NOVO)

```typescript
import type { Repository } from "typeorm";
import { SessionEntity } from "../../../entities/session.entity.js";
import { GameEventEntity } from "../../../entities/game-event.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { ProfitData, ProfitQuery } from "../schemas.js";

export class GetProfitUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly gameEventRepo: Repository<GameEventEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: ProfitQuery): Promise<ProfitData> {
    const userCharacters = await this.characterRepo.find({
      where: { userId },
      select: ["id"],
    });
    const characterIds = userCharacters.map((c) => c.id);

    if (characterIds.length === 0) {
      return { totalRevenue: 0, totalCost: 0, netProfit: 0, profitPerHour: 0, sessions: [] };
    }

    const qb = this.sessionRepo.createQueryBuilder("s")
      .where("s.characterId IN (:...characterIds)", { characterIds })
      .andWhere("s.status = :status", { status: "completed" });

    if (query.sessionId) {
      qb.andWhere("s.id = :sessionId", { sessionId: query.sessionId });
    }
    if (query.characterId) {
      qb.andWhere("s.characterId = :characterId", { characterId: query.characterId });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - query.days);
    qb.andWhere("s.startedAt >= :cutoff", { cutoff });

    qb.orderBy("s.startedAt", "DESC");

    const sessions = await qb.getMany();

    // Get refill costs for these sessions
    const sessionIds = sessions.map((s) => s.id);
    let refillCosts = new Map<string, number>();

    if (sessionIds.length > 0) {
      const refills = await this.gameEventRepo
        .createQueryBuilder("e")
        .where("e.sessionId IN (:...sessionIds)", { sessionIds })
        .andWhere("e.type = :type", { type: "refill" })
        .getMany();

      for (const refill of refills) {
        const cost = (refill.data as { goldSpent?: number })?.goldSpent ?? 0;
        const current = refillCosts.get(refill.sessionId) ?? 0;
        refillCosts.set(refill.sessionId, current + cost);
      }
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let totalDuration = 0;

    const sessionData = sessions.map((s) => {
      const suppliesCost = refillCosts.get(s.id) ?? 0;
      const lootValue = s.totalLootValue;
      const net = lootValue - suppliesCost;

      totalRevenue += lootValue;
      totalCost += suppliesCost;
      totalDuration += s.duration;

      return {
        sessionId: s.id,
        huntLocation: s.huntLocation,
        duration: s.duration,
        lootValue,
        suppliesCost,
        netProfit: net,
        startedAt: s.startedAt.toISOString(),
      };
    });

    const netProfit = totalRevenue - totalCost;
    const hours = totalDuration / 3600;
    const profitPerHour = hours > 0 ? Math.round(netProfit / hours) : 0;

    return {
      totalRevenue,
      totalCost,
      netProfit,
      profitPerHour,
      sessions: sessionData,
    };
  }
}
```

**Arquivo**: `apps/api/src/modules/analytics/controller.ts`

Adicionar imports:

```typescript
import { GameEventEntity } from "../../entities/game-event.entity.js";
import { ProfitQuerySchema, ProfitDataSchema, GameEventListSchema } from "./schemas.js";
import { GetProfitUseCase } from "./use-cases/get-profit.use-case.js";
```

Adicionar endpoint:

```typescript
  // GET /api/v1/analytics/profit
  app.get(
    "/profit",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Get profit analysis",
        security: [{ bearerAuth: [] }],
        querystring: ProfitQuerySchema,
        response: { 200: ProfitDataSchema },
      },
    },
    async (request) => {
      const useCase = new GetProfitUseCase(sessionRepo, gameEventRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );
```

### Passo 21: Criar endpoint GET /api/v1/analytics/compare

**Arquivo**: `apps/api/src/modules/analytics/schemas.ts`

Adicionar:

```typescript
export const CompareQuerySchema = z.object({
  sessionIds: z.string(), // comma-separated UUIDs
});

export const CompareSessionSchema = z.object({
  sessionId: z.string(),
  characterName: z.string(),
  huntLocation: z.string().nullable(),
  duration: z.number(),
  totalKills: z.number(),
  totalExperience: z.number(),
  totalLootValue: z.number(),
  xpPerHour: z.number(),
  killsPerHour: z.number(),
  lootPerHour: z.number(),
  startedAt: z.string().datetime(),
});

export const CompareDataSchema = z.object({
  sessions: z.array(CompareSessionSchema),
});

export type CompareQuery = z.infer<typeof CompareQuerySchema>;
export type CompareData = z.infer<typeof CompareDataSchema>;
```

**Arquivo**: `apps/api/src/modules/analytics/use-cases/get-compare.use-case.ts` (NOVO)

```typescript
import type { Repository } from "typeorm";
import { In } from "typeorm";
import { SessionEntity } from "../../../entities/session.entity.js";
import { CharacterEntity } from "../../../entities/character.entity.js";
import type { CompareData, CompareQuery } from "../schemas.js";
import { ForbiddenError } from "../../../shared/errors/index.js";

export class GetCompareUseCase {
  constructor(
    private readonly sessionRepo: Repository<SessionEntity>,
    private readonly characterRepo: Repository<CharacterEntity>,
  ) {}

  async execute(userId: string, query: CompareQuery): Promise<CompareData> {
    const sessionIds = query.sessionIds.split(",").map((s) => s.trim()).filter(Boolean);

    if (sessionIds.length < 2 || sessionIds.length > 5) {
      throw new ForbiddenError("Provide 2-5 session IDs to compare");
    }

    const sessions = await this.sessionRepo.find({
      where: { id: In(sessionIds) },
      relations: ["character"],
    });

    // Verify all sessions belong to user
    for (const session of sessions) {
      if (session.character.userId !== userId) {
        throw new ForbiddenError("You do not own all selected sessions");
      }
    }

    return {
      sessions: sessions.map((s) => {
        const hours = s.duration / 3600;
        return {
          sessionId: s.id,
          characterName: s.character.name,
          huntLocation: s.huntLocation,
          duration: s.duration,
          totalKills: s.totalKills,
          totalExperience: Number(s.totalExperience),
          totalLootValue: s.totalLootValue,
          xpPerHour: s.xpPerHour,
          killsPerHour: hours > 0 ? Math.round(s.totalKills / hours) : 0,
          lootPerHour: hours > 0 ? Math.round(s.totalLootValue / hours) : 0,
          startedAt: s.startedAt.toISOString(),
        };
      }),
    };
  }
}
```

**Arquivo**: `apps/api/src/modules/analytics/controller.ts`

Adicionar imports:

```typescript
import { CompareQuerySchema, CompareDataSchema } from "./schemas.js";
import { GetCompareUseCase } from "./use-cases/get-compare.use-case.js";
```

Adicionar endpoint:

```typescript
  // GET /api/v1/analytics/compare
  app.get(
    "/compare",
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ["Analytics"],
        summary: "Compare multiple sessions",
        security: [{ bearerAuth: [] }],
        querystring: CompareQuerySchema,
        response: { 200: CompareDataSchema },
      },
    },
    async (request) => {
      const useCase = new GetCompareUseCase(sessionRepo, characterRepo);
      return useCase.execute(request.user.sub, request.query);
    },
  );
```

### Passo 22: Dashboard - API methods e hooks para Profit + Compare

**Arquivo**: `apps/app/src/types/index.ts`

Adicionar:

```typescript
export interface ProfitSession {
  sessionId: string;
  huntLocation: string | null;
  duration: number;
  lootValue: number;
  suppliesCost: number;
  netProfit: number;
  startedAt: string;
}

export interface ProfitData {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitPerHour: number;
  sessions: ProfitSession[];
}

export interface CompareSession {
  sessionId: string;
  characterName: string;
  huntLocation: string | null;
  duration: number;
  totalKills: number;
  totalExperience: number;
  totalLootValue: number;
  xpPerHour: number;
  killsPerHour: number;
  lootPerHour: number;
  startedAt: string;
}

export interface CompareData {
  sessions: CompareSession[];
}
```

**Arquivo**: `apps/app/src/lib/api.ts`

Adicionar metodos na classe ApiClient:

```typescript
  async getProfit(params?: { sessionId?: string; characterId?: string; days?: number }): Promise<ProfitData> {
    const { data } = await this.client.get<ProfitData>("/api/v1/analytics/profit", { params });
    return data;
  }

  async compareSessions(sessionIds: string[]): Promise<CompareData> {
    const { data } = await this.client.get<CompareData>("/api/v1/analytics/compare", {
      params: { sessionIds: sessionIds.join(",") },
    });
    return data;
  }
```

Adicionar imports de `ProfitData`, `CompareData` no topo.

**Arquivo**: `apps/app/src/hooks/use-analytics.ts`

Adicionar:

```typescript
export function useProfit(params?: { sessionId?: string; characterId?: string; days?: number }) {
  return useQuery({
    queryKey: ["profit", params],
    queryFn: () => api.getProfit(params),
  });
}

export function useCompareSessions(sessionIds: string[]) {
  return useQuery({
    queryKey: ["compare-sessions", sessionIds],
    queryFn: () => api.compareSessions(sessionIds),
    enabled: sessionIds.length >= 2,
  });
}
```

### Passo 23: Dashboard - Pagina Profit

**Arquivo**: `apps/app/src/routes/dashboard/profit/index.tsx` (NOVO)

```typescript
import { StatsCard } from "@/components/cards/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCharacters } from "@/hooks/use-characters";
import { useProfit } from "@/hooks/use-analytics";
import { cn, formatDate, formatDuration, formatNumber } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/profit/")({
  component: ProfitPage,
});

function ProfitPage() {
  const [days, setDays] = useState(7);
  const [characterId, setCharacterId] = useState<string | undefined>();
  const { data: characters } = useCharacters();
  const { data: profitData, isLoading } = useProfit({ days, characterId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Profit Calculator</h1>
        <div className="flex items-center gap-2">
          <select
            value={characterId ?? ""}
            onChange={(e) => setCharacterId(e.target.value || undefined)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
          >
            <option value="">All Characters</option>
            {characters?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatNumber(profitData?.totalRevenue ?? 0)}
          icon={Coins}
          description="Loot value"
        />
        <StatsCard
          title="Total Cost"
          value={formatNumber(profitData?.totalCost ?? 0)}
          icon={ShoppingCart}
          description="Supplies spent"
        />
        <StatsCard
          title="Net Profit"
          value={formatNumber(profitData?.netProfit ?? 0)}
          icon={DollarSign}
          description="Revenue - Cost"
          trend={profitData ? {
            value: profitData.totalRevenue > 0
              ? Math.round((profitData.netProfit / profitData.totalRevenue) * 100)
              : 0,
            isPositive: (profitData?.netProfit ?? 0) >= 0,
          } : undefined}
        />
        <StatsCard
          title="Profit/Hour"
          value={formatNumber(profitData?.profitPerHour ?? 0)}
          icon={TrendingUp}
          description="Gold per hour"
        />
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Hunt Location</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400 text-right">Loot</TableHead>
                <TableHead className="text-slate-400 text-right">Supplies</TableHead>
                <TableHead className="text-slate-400 text-right">Profit</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitData?.sessions.map((s) => (
                <TableRow key={s.sessionId} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <Link
                      to="/dashboard/sessions/$sessionId"
                      params={{ sessionId: s.sessionId }}
                      className="text-white hover:text-emerald-400"
                    >
                      {s.huntLocation || "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-300">{formatDuration(s.duration)}</TableCell>
                  <TableCell className="text-right text-yellow-400">{formatNumber(s.lootValue)}</TableCell>
                  <TableCell className="text-right text-red-400">{formatNumber(s.suppliesCost)}</TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    s.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {s.netProfit >= 0 ? "+" : ""}{formatNumber(s.netProfit)}
                  </TableCell>
                  <TableCell className="text-slate-500">{formatDate(s.startedAt)}</TableCell>
                </TableRow>
              ))}
              {(!profitData || profitData.sessions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    No completed sessions in this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Passo 24: Dashboard - Pagina Compare

**Arquivo**: `apps/app/src/routes/dashboard/compare/index.tsx` (NOVO)

```typescript
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessions } from "@/hooks/use-sessions";
import { useCompareSessions } from "@/hooks/use-analytics";
import { cn, formatDate, formatDuration, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { GitCompareArrows } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/compare/")({
  component: ComparePage,
});

function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: sessionsData } = useSessions({ limit: 50, status: "completed" });
  const { data: compareData } = useCompareSessions(selectedIds);

  const toggleSession = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const sessions = sessionsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Compare Sessions</h1>
        <span className="text-sm text-slate-400">
          {selectedIds.length}/5 selected
        </span>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <p className="text-sm text-slate-400 mb-3">Select 2-5 sessions to compare:</p>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => (
              <Button
                key={s.id}
                variant="outline"
                size="sm"
                onClick={() => toggleSession(s.id)}
                className={cn(
                  "border-slate-700 text-sm",
                  selectedIds.includes(s.id) && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}
              >
                {s.characterName} - {s.huntLocation || "Unknown"} ({formatDate(s.startedAt)})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {compareData && compareData.sessions.length >= 2 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Metric</TableHead>
                  {compareData.sessions.map((s) => (
                    <TableHead key={s.sessionId} className="text-slate-400 text-center">
                      <div>{s.characterName}</div>
                      <div className="text-xs text-slate-500">{s.huntLocation || "Unknown"}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <CompareRow label="Duration" values={compareData.sessions.map((s) => formatDuration(s.duration))} />
                <CompareRow label="Total Kills" values={compareData.sessions.map((s) => formatNumber(s.totalKills))} highlight="max" rawValues={compareData.sessions.map((s) => s.totalKills)} />
                <CompareRow label="XP/Hour" values={compareData.sessions.map((s) => formatNumber(s.xpPerHour))} highlight="max" rawValues={compareData.sessions.map((s) => s.xpPerHour)} />
                <CompareRow label="Kills/Hour" values={compareData.sessions.map((s) => formatNumber(s.killsPerHour))} highlight="max" rawValues={compareData.sessions.map((s) => s.killsPerHour)} />
                <CompareRow label="Loot Value" values={compareData.sessions.map((s) => formatNumber(s.totalLootValue))} highlight="max" rawValues={compareData.sessions.map((s) => s.totalLootValue)} />
                <CompareRow label="Loot/Hour" values={compareData.sessions.map((s) => formatNumber(s.lootPerHour))} highlight="max" rawValues={compareData.sessions.map((s) => s.lootPerHour)} />
                <CompareRow label="Total XP" values={compareData.sessions.map((s) => formatNumber(s.totalExperience))} highlight="max" rawValues={compareData.sessions.map((s) => s.totalExperience)} />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedIds.length > 0 && selectedIds.length < 2 && (
        <div className="text-center py-8 text-slate-400">
          Select at least 2 sessions to compare.
        </div>
      )}
    </div>
  );
}

function CompareRow({
  label,
  values,
  highlight,
  rawValues,
}: {
  label: string;
  values: string[];
  highlight?: "max";
  rawValues?: number[];
}) {
  const maxIdx = rawValues ? rawValues.indexOf(Math.max(...rawValues)) : -1;

  return (
    <TableRow className="border-slate-800 hover:bg-slate-800/50">
      <TableCell className="font-medium text-slate-300">{label}</TableCell>
      {values.map((v, i) => (
        <TableCell
          key={`${label}-${i}`}
          className={cn(
            "text-center",
            highlight === "max" && i === maxIdx ? "text-emerald-400 font-semibold" : "text-white"
          )}
        >
          {v}
        </TableCell>
      ))}
    </TableRow>
  );
}
```

### Passo 25: Adicionar rotas na sidebar

**Arquivo**: `apps/app/src/components/layout/sidebar.tsx`

Adicionar imports:

```typescript
import { DollarSign, GitCompareArrows } from "lucide-react";
```

Adicionar ao array `navItems`, APOS `{ icon: TrendingUp, label: "Analytics", ... }`:

```typescript
  { icon: DollarSign, label: "Profit", href: "/dashboard/profit" },
  { icon: GitCompareArrows, label: "Compare", href: "/dashboard/compare" },
```

---

## Resumo de Arquivos

### Arquivos a Modificar (API)

| Arquivo | Mudanca |
|---------|---------|
| `apps/api/src/modules/realtime/controller.ts` | Adicionar StatusMessage, case "status", handleStatus |
| `apps/api/src/shared/realtime/room-manager.ts` | Adicionar lastStatus, updateRoomStatus, enviar status no join |
| `apps/api/src/modules/events/schemas.ts` | Adicionar DeathEvent, LevelUpEvent, RefillEvent schemas |
| `apps/api/src/modules/events/controller.ts` | Passar gameEventRepo ao use-case |
| `apps/api/src/modules/events/use-cases/process-batch.use-case.ts` | Processar death/level_up/refill |
| `apps/api/src/modules/analytics/schemas.ts` | Adicionar GameEvent, Profit, Compare schemas |
| `apps/api/src/modules/analytics/controller.ts` | Adicionar endpoints /events, /profit, /compare |
| `apps/api/src/config/database.ts` | Registrar GameEventEntity |
| `apps/api/src/app.ts` | Nenhuma mudanca (analytics ja esta registrado) |

### Arquivos a Criar (API)

| Arquivo | Descricao |
|---------|-----------|
| `apps/api/src/entities/game-event.entity.ts` | Entity para eventos genericos (death, level_up, refill) |
| `apps/api/src/modules/analytics/use-cases/get-profit.use-case.ts` | Profit calculator use-case |
| `apps/api/src/modules/analytics/use-cases/get-compare.use-case.ts` | Session comparison use-case |

### Arquivos a Modificar (Dashboard)

| Arquivo | Mudanca |
|---------|---------|
| `apps/app/src/hooks/use-realtime.ts` | Adicionar BotStatus state + case "status" |
| `apps/app/src/hooks/use-analytics.ts` | Adicionar useGameEvents, useProfit, useCompareSessions |
| `apps/app/src/types/index.ts` | Adicionar BotStatus, GameEvent, ProfitData, CompareData types |
| `apps/app/src/lib/api.ts` | Adicionar getGameEvents, getProfit, compareSessions methods |
| `apps/app/src/components/cards/active-session-banner.tsx` | Mostrar HP/Mana bars inline |
| `apps/app/src/routes/dashboard/index.tsx` | Adicionar BotStatusCard |
| `apps/app/src/routes/dashboard/sessions/$sessionId.tsx` | Adicionar BotStatusCard para sessoes ativas |
| `apps/app/src/components/layout/sidebar.tsx` | Adicionar Profit e Compare no nav |

### Arquivos a Criar (Dashboard)

| Arquivo | Descricao |
|---------|-----------|
| `apps/app/src/components/cards/bot-status-card.tsx` | Card com HP/Mana bars + bot state |
| `apps/app/src/routes/dashboard/profit/index.tsx` | Pagina de profit calculator |
| `apps/app/src/routes/dashboard/compare/index.tsx` | Pagina de comparacao de sessoes |

---

## Ordem de Implementacao

1. **Fase 2a** (Passos 1-11): Bot Status Realtime
   - Comece pela API (passos 1-5): suporte a "status" no WS
   - Depois Dashboard (passos 6-11): hook + componentes

2. **Fase 2b** (Passos 12-19): Novos Tipos de Evento
   - API primeiro (passos 12-17): schemas + entity + endpoints
   - Depois Dashboard (passos 18-19): types + hooks

3. **Fase 3** (Passos 20-25): Profit + Compare
   - API primeiro (passos 20-21): endpoints
   - Depois Dashboard (passos 22-25): pages + sidebar

Cada fase pode ser implementada e testada independentemente.

## Como Verificar

### Fase 2a
1. Iniciar API: `cd apps/api && bun run dev`
2. Iniciar Dashboard: `cd apps/app && bun run dev`
3. Iniciar Bot Python com telemetria configurada
4. No dashboard, ir para `/dashboard` - ActiveSessionBanner deve mostrar HP/Mana
5. Ir para `/dashboard/sessions/<id>` de sessao ativa - BotStatusCard deve aparecer

### Fase 2b
1. Bot envia `track_death()` ou `track_level_up()` -> API processa e salva em `game_events`
2. `GET /api/v1/analytics/events?sessionId=<id>` retorna eventos

### Fase 3
1. `GET /api/v1/analytics/profit?days=7` retorna dados de profit
2. `GET /api/v1/analytics/compare?sessionIds=id1,id2` retorna comparacao
3. Dashboard mostra `/dashboard/profit` e `/dashboard/compare` no sidebar

## Nao Fazer

- Nao usar Socket.io - o projeto usa WebSocket nativo (`@fastify/websocket` + `new WebSocket()`)
- Nao criar migration files - o projeto usa `synchronize: true` em dev
- Nao alterar o CSS theme - usar as cores existentes (slate, emerald, red, yellow, blue)
- Nao usar classes de UI customizadas - usar Shadcn/ui components (Card, Badge, Table, etc.)
- Nao criar context providers - usar TanStack Query hooks
- Nao usar `useEffect` para data fetching - usar `useQuery`/`useMutation`
- Nao instalar pacotes novos no Dashboard - tudo ja esta disponivel
- Nao alterar a estrutura de pastas existente
