# TibiaEye API

API REST para o sistema de telemetria TibiaEye. Recebe dados do bot Python, serve dados para App e Backoffice.

## Stack

- Bun runtime
- Fastify 5.x framework
- TypeORM + MySQL
- Zod (validation)
- fastify-type-provider-zod
- @fastify/swagger + @scalar/fastify-api-reference
- @fastify/websocket
- @fastify/jwt (autenticacao)
- Bcrypt (hashing)
- Vitest (testes)

## Comandos

```bash
bun run dev        # Desenvolvimento com hot reload (tsx watch)
bun run build      # Build para producao (tsc)
bun run start      # Inicia servidor (requer build)
bun run lint       # ESLint
bun run test       # Vitest unit tests
```

## Arquitetura - Domain-Driven Design (DDD)

O projeto segue DDD com separacao clara de camadas. O Domain e o coracao da aplicacao e NUNCA depende de detalhes de infraestrutura.

### Camadas (de dentro para fora)

1. **Domain** - Regras de negocio puras, sem dependencias externas
2. **Application** - Orquestracao de use cases, depende apenas do Domain
3. **Infrastructure** - Implementacoes concretas (banco, APIs externas, etc)
4. **Presentation** - Controllers HTTP, WebSocket, schemas de request/response

### Regra de Dependencia

Dependencias apontam SEMPRE para dentro: `Presentation -> Application -> Domain <- Infrastructure`

A camada de Infrastructure implementa interfaces definidas no Domain (Dependency Inversion).

```
src/
├── app.ts                          # App factory (Fastify + plugins + routes)
├── server.ts                       # Bootstrap + composicao de dependencias
├── config/
│   ├── env.ts                      # Validacao com Zod
│   └── database.ts                 # TypeORM DataSource
├── plugins/
│   ├── database.plugin.ts          # TypeORM connection
│   ├── auth.plugin.ts              # JWT + API Key decorators
│   ├── swagger.plugin.ts           # OpenAPI docs
│   └── websocket.plugin.ts         # WebSocket
├── shared/
│   ├── constants/                  # Constantes globais (sem magic numbers)
│   └── errors/                     # AppError, UnauthorizedError, etc
└── modules/
    └── {module}/
        ├── domain/
        │   ├── entities/            # Entidades ricas com regras de negocio
        │   ├── value-objects/       # Value Objects imutaveis
        │   ├── repositories/        # Interfaces (i-*.ts): i-user-repository.ts -> IUserRepository
        │   ├── services/            # Interfaces (i-*.ts): i-payment-gateway.ts -> IPaymentGateway
        │   └── constants.ts         # Constantes do dominio
        ├── application/
        │   └── use-cases/           # Orquestracao (depende de interfaces do domain)
        ├── infrastructure/
        │   ├── repositories/        # Implementacoes TypeORM dos repositorios
        │   ├── services/            # Implementacoes de servicos externos
        │   └── mappers/             # Conversao Domain Entity <-> ORM Entity
        └── presentation/
            ├── controller.ts        # Fastify routes (HTTP adapter)
            └── schemas.ts           # Zod schemas (request/response DTOs)
```

## Principios DDD Obrigatorios

### Domain Layer (protegida)

- **Entidades ricas**: Logica de negocio vive nas entidades, NAO nos use cases. A entidade valida a si mesma.
- **Value Objects**: Usar para conceitos com identidade por valor (Email, Money, LicenseKey, ExperienceRate). Sao imutaveis.
- **Repository interfaces**: Definidas no Domain como contratos. A implementacao fica em Infrastructure.
- **Domain Services (raros)**: Apenas para logica que envolve multiplas entidades e nao pertence naturalmente a nenhuma delas. Definir como interface no Domain. NAO confundir com Application Services — a camada Application usa exclusivamente Use Cases.
- **Sem dependencia de framework**: O Domain nunca importa Fastify, TypeORM, Zod ou qualquer lib externa.
- **Sem anotacoes de ORM**: Entidades do Domain sao classes puras. Mappers convertem entre Domain Entity e ORM Entity.

### Application Layer (Use Cases, NAO Services)

- **Use Cases, nunca Services**: A camada de aplicacao e composta exclusivamente por Use Cases. NAO criar Application Services. Cada Use Case representa uma unica intencao do usuario/sistema.
- **Classes com metodo `execute()`**: Um Use Case = uma classe = uma operacao de negocio. Nome reflete a acao: `CreateSessionUseCase`, `ValidateLicenseUseCase`.
- **Dependem apenas de interfaces**: Use cases recebem repositorios/services via construtor (interfaces do Domain).
- **Orquestracao, nao logica**: Use cases orquestram chamadas a entidades de dominio e repositorios. Regras de negocio ficam nas entidades e value objects, nao no use case.
- **Sem side effects implicitos**: Se um use case precisa disparar algo alem da operacao principal (ex: enviar email), usar eventos de dominio ou tornar explicito no nome.

### Infrastructure Layer

- **Implementa interfaces do Domain**: Repositorios TypeORM implementam as interfaces definidas no Domain.
- **Mappers**: Convertem entre entidades de dominio e entidades de persistencia. Nunca vazar detalhes do ORM para o Domain.
- **Services externos**: Implementacoes concretas de gateways (email, pagamento, etc).

### Presentation Layer

- **Controllers finos**: Apenas recebem request, delegam ao use case, e retornam response.
- **Schemas Zod**: Validacao de input/output na borda. Schemas NAO sao compartilhados com o Domain.
- **Sem logica de negocio**: Zero regras de negocio nos controllers.

## Modulos

- **auth**: Autenticacao JWT (register, login, refresh, forgot/reset password)
- **users**: Perfil do usuario (get, update, delete)
- **characters**: Personagens do Tibia (create, list, delete)
- **sessions**: Sessoes de hunt (create, list, get, update, active)
- **events**: Batch de eventos (kills, loot, xp snapshots)
- **license**: License keys (validate, get-user-license, generate)
- **subscriptions**: Planos e assinaturas (current, cancel, plans)
- **payments**: Webhooks de pagamento (handle-webhook)
- **analytics**: Metricas (xp/h, kills by creature, loot summary)
- **admin**: Operacoes administrativas (stats, users, suspend, give-plan)
- **realtime**: WebSocket para posicao em tempo real

## Autenticacao

- **JWT**: Usado pelo App e Backoffice (header: `Authorization: Bearer <token>`)
- **API Key**: Usado pelo Bot (header: `Authorization: Bearer tm_xxx...`)

## Fluxo de License Key

1. Usuario paga via AbacatePay
2. Webhook `subscription.created` recebido
3. `handle-webhook.use-case.ts`:
   - Cria/atualiza subscription
   - Revoga keys antigas
   - Gera nova license key (`tm_xxx...`)
   - Salva hash bcrypt no banco
   - Envia email com a key
   - Retorna key (exibida uma vez no dashboard)
4. Usuario configura key no bot
5. Bot autentica com `Authorization: Bearer tm_xxx`
6. `validate-license.use-case.ts` verifica key + subscription

## Banco de Dados

MySQL com TypeORM. Em desenvolvimento, `synchronize: true` cria as tabelas automaticamente.

Para producao, usar migrations:
```bash
bun run migration:generate
bun run migration:run
```

## Docker

```bash
docker-compose up -d mysql  # Apenas MySQL
docker-compose up -d        # MySQL + API
```

## Variaveis de Ambiente

Copiar `.env.example` para `.env`:

```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=tibia_telemetry
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
WEBHOOK_SECRET=your-webhook-secret
```

## API Docs

Apos iniciar o servidor: http://localhost:4000/api/docs

## Clean Code e Code Smells

### Regras obrigatorias

- **Sem magic numbers/strings**: Extrair para constantes nomeadas (`constants.ts` no modulo ou em `shared/constants/`).
- **Sem ifs aninhados**: Usar early return (guard clauses) para achatar a logica. Maximo 1 nivel de if.
- **Sem else desnecessario**: Preferir early return ao inves de if/else.
- **Single Responsibility**: Cada classe/funcao faz uma coisa. Se precisa de "and" para descrever, dividir.
- **Nomes expressivos**: Variaveis, funcoes e classes com nomes que revelam intencao. Sem abreviacoes obscuras.
- **Funcoes pequenas**: Maximo ~20 linhas. Se maior, extrair metodos privados com nomes descritivos.
- **Sem code duplication**: Extrair logica repetida para funcoes/classes reutilizaveis.
- **Sem parametros booleanos**: Preferir metodos separados ou enums ao inves de `doSomething(true)`.
- **Sem side effects ocultos**: Funcoes fazem o que o nome diz, nada mais.
- **Fail fast**: Validar inputs no inicio e lancar erros cedo.
- **Sem comentarios**: Codigo deve ser autoexplicativo. Nomes de variaveis, funcoes e classes substituem comentarios. Comentarios sao permitidos APENAS para explicar decisoes nao obvias (ex: workaround por bug de lib, regra de negocio contra-intuitiva). Se precisa de comentario para explicar o que o codigo faz, refatorar o codigo.
- **Variaveis e constantes com nomes legiveis**: O nome deve contar a historia completa sem precisar ler o contexto. Preferir `remainingSessionDurationInMinutes` a `remaining` ou `dur`. Constantes descritivas: `MAX_FAILED_LOGIN_ATTEMPTS` ao inves de `3`.
- **Funcoes bem separadas**: Cada funcao faz UMA coisa e seu nome descreve exatamente o que faz. Extrair blocos logicos em funcoes privadas nomeadas ao inves de ter funcoes longas com "secoes".

### Tratamento de erros

- Erros estendem `AppError` com `statusCode` semantico.
- Nunca engolir erros silenciosamente (`catch` vazio).
- Erros de dominio sao especificos: `InvalidEmailError`, `ExpiredLicenseError`, `InsufficientPermissionError`.
- Usar Result pattern quando fizer sentido (retornar sucesso/falha explicito ao inves de throw).

## Design Patterns - Quando Usar

Aplicar patterns com intencao, nao por habito. Cada pattern resolve um problema especifico:

### Builder
**Quando**: Construcao de objetos complexos com muitos parametros opcionais ou validacoes encadeadas.
**Onde usar**: Entidades com muitas propriedades, objetos de configuracao, queries complexas.
```
// Exemplo: construir uma Session com validacao incremental
SessionBuilder.create()
  .forCharacter(characterId)
  .withHuntType(HuntType.SOLO)
  .startedAt(now)
  .build()  // valida e retorna Session ou erro
```

### Strategy
**Quando**: Multiplos comportamentos intercambiaveis selecionados em runtime. Substitui cadeias de if/else ou switch.
**Onde usar**: Calculo de analytics com formulas diferentes por tipo, processamento de eventos por categoria, regras de validacao variaveis.
```
// Ao inves de: if (type === 'xp') { ... } else if (type === 'loot') { ... }
// Usar: analyticsStrategyMap[type].calculate(data)
```

### Factory
**Quando**: Criacao de objetos que dependem de condicoes ou configuracao, especialmente servicos externos que podem ser trocados.
**Onde usar**: Criar instancias de servicos de pagamento, email, notificacao. Facilita trocar implementacoes (ex: trocar provedor de email).
```
// PaymentGatewayFactory.create('abacatepay') -> AbacatePayGateway
// PaymentGatewayFactory.create('stripe') -> StripeGateway
```

### Repository (obrigatorio)
**Quando**: Sempre. Todo acesso a dados passa por uma interface de repositorio.
**Onde usar**: Cada aggregate root tem seu repositorio. Interface no Domain, implementacao na Infrastructure.

### Mapper
**Quando**: Sempre que houver conversao entre camadas (Domain Entity <-> ORM Entity, Domain Entity <-> DTO).
**Onde usar**: Na Infrastructure para converter entre TypeORM entities e Domain entities.

### Outros patterns (usar quando necessario)
- **Observer/EventEmitter**: Para desacoplar side effects (enviar email apos criar subscription).
- **Specification**: Para encapsular regras de negocio compostas reutilizaveis.
- **Value Object**: Para conceitos identificados por valor, nao por ID.

## Postura ao Codar - Principal Software Engineer

Ao escrever ou modificar codigo neste projeto, atuar como um **Principal Software Engineer**:

- **Decisoes arquiteturais corretas**: Avaliar trade-offs antes de implementar. Escolher a solucao que melhor equilibra simplicidade, manutenibilidade e extensibilidade. Nao over-engineer, mas tambem nao criar divida tecnica.
- **Estrutura impecavel**: Cada arquivo, classe e funcao no lugar certo conforme as camadas DDD. Se algo esta na camada errada, mover antes de continuar.
- **Codigo que outros seniors aprovariam em code review**: Legibilidade acima de tudo. Qualquer dev deve entender o codigo sem precisar perguntar. Se hesitou sobre a clareza, refatorar.
- **Pensar em extensibilidade sem especular**: Usar interfaces e abstrair nos pontos onde mudanca e provavel (servicos externos, regras de negocio variaveis). NAO abstrair onde nao ha indicacao de mudanca.
- **Zero tolerancia a code smells**: Long methods, god classes, feature envy, data clumps, primitive obsession — identificar e corrigir imediatamente.
- **Consistencia com o que ja existe**: Antes de implementar, entender os patterns ja usados no projeto e seguir o mesmo estilo. Nao introduzir abordagens conflitantes.

## Convencoes

- Use cases sao classes com metodo `execute()`
- Interfaces de repositorio no Domain definem o contrato; implementacoes no Infrastructure
- Schemas Zod definem input/output na borda (Presentation layer apenas)
- Erros estendem AppError com statusCode
- Enums TypeORM usam string values
- IDs sao UUID v4
- ESM modules (import/export)
- Constantes em UPPER_SNAKE_CASE
- **Interfaces SEMPRE com prefixo `I`**: `ICharacterRepository`, `ICharacterLookupProvider`, `IPaymentGateway`. Arquivo segue o mesmo padrao com prefixo `i-`: `i-character-repository.ts`, `i-character-lookup-provider.ts`.
- Nenhum `any` - usar tipos especificos ou generics
- Testes unitarios para Domain e Application layers (sem banco, sem framework)
- Testes de integracao para Infrastructure e Presentation layers
