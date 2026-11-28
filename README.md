# OdontoGEST

Plataforma SaaS de **agendamento online e gestão para clínicas odontológicas**, construída com **Next.js 16 (App Router)**, **Prisma ORM 7 + PostgreSQL**, **Auth.js (NextAuth v5)** e **Stripe**.

O sistema conecta pacientes a clínicas por meio de uma página pública exclusiva de agendamento (`/clinica/[id]`) e oferece à clínica um painel completo (`/dashboard`) para gerenciar agenda do dia, agendamentos rápidos internos, serviços, horários de atendimento, lembretes, relatórios financeiros/operacionais e assinaturas.

---

## Sumário

- [Como funciona](#como-funciona)
- [Funcionalidades principais](#funcionalidades-principais)
- [Planos e período de teste](#planos-e-período-de-teste)
- [Arquitetura e tecnologias](#arquitetura-e-tecnologias)
- [Rotas da aplicação e APIs](#rotas-da-aplicação-e-apis)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Estrutura de pastas](#estrutura-de-pastas)

---

## Como funciona

```mermaid
flowchart LR
    A["Landing Page (/)"] -->|"Paciente escolhe clínica"| B["Página Pública (/clinica/[id])"]
    A -->|"Portal da Clínica"| C["Login / Cadastro (/login, /cadastro)"]
    C -->|"proxy.ts protege /dashboard/*"| D["Painel da Clínica (/dashboard)"]
    B -->|"bookAppointmentInTransaction\n(pg_advisory_xact_lock)"| E[("PostgreSQL (Prisma)")]
    D -->|"Agendamento Rápido\n(mesma trava transacional)"| E
    D -->|"Assinaturas e Checkout"| F["Stripe + Webhook (/api/webhook)"]
    F -->|"Atualiza Subscription"| E
    D -->|"Upload de foto/logo"| G["Cloudinary (/api/image/upload)"]
```

### Fluxo do Paciente (Página Pública)
1. O paciente acessa `/` (ou diretamente o link compartilhável `/clinica/[id]`).
2. Escolhe um **procedimento ativo** cadastrado pela clínica (cada serviço possui valor em centavos e duração em minutos).
3. Seleciona uma **data** (respeitando o fuso `America/Sao_Paulo`) e visualiza os **horários livres** calculados em blocos de 30 minutos pelo endpoint `GET /api/schedule/get-appointments`, considerando:
   - Os horários de expediente configurados pela clínica (`User.times`);
   - A duração do serviço escolhido (ex.: um serviço de 60 min exige 2 slots consecutivos livres);
   - Horários já passados no dia atual.
4. Preenche nome, telefone (com máscara) e e-mail e confirma o agendamento.
5. Ao final, vê a tela de confirmação com resumo e botão para falar com a clínica via **WhatsApp** (`wa.me`).

### Fluxo da Clínica (Painel Administrativo)
1. A clínica cria conta em `/cadastro` (e-mail + senha) ou entra em `/login` com **e-mail/senha** ou **Google/GitHub**.
2. Todas as rotas de `/dashboard/*` são protegidas pelo [`proxy.ts`](proxy.ts) (convenção do Next.js 16) e validadas no servidor com `auth()` / `getSession()`.
3. Na **Agenda do Dia (`/dashboard`)**, a clínica acompanha os agendamentos e métricas da data selecionada, gerencia **lembretes rápidos**, abre detalhes do paciente com **confirmação em 1 clique no WhatsApp** ou cancela consultas.
4. Pelo **Agendamento rápido** (botão na topbar, botão `+` flutuante no mobile ou clique direto em um horário livre da agenda), a clínica registra uma consulta sem sair do painel, com busca de pacientes anteriores, validação de conflito e atualização instantânea da agenda.

### Proteção contra duplo agendamento
Tanto a página pública ([`create-appointment.ts`](app/(public)/clinica/%5Bid%5D/_actions/create-appointment.ts)) quanto o Agendamento rápido do painel ([`quick-appointment.ts`](app/(panel)/dashboard/_actions/quick-appointment.ts)) utilizam a função compartilhada [`bookAppointmentInTransaction`](lib/appointments/book-appointment.ts), que executa dentro de `prisma.$transaction`:
- Um lock transacional no PostgreSQL por clínica + data (`pg_advisory_xact_lock(hashtext("${clinicId}:${dateIso}"))`);
- Revalidação do serviço ativo e dos slots ocupados imediatamente antes de gravar, evitando colisões em cliques simultâneos de paciente e clínica.

---

## Funcionalidades principais

- **Autenticação híbrida (Auth.js v5 / NextAuth):**
  - Login e cadastro com e-mail e senha (`bcryptjs` custo 12) + login social com Google e GitHub;
  - Proteção contra força bruta por e-mail e IP ([`lib/rate-limit.ts`](lib/rate-limit.ts));
  - Sanitização de `callbackUrl` para evitar *open redirect* ([`lib/auth-schemas.ts`](lib/auth-schemas.ts)).
- **Agenda e Agendamento Rápido:**
  - Grade de horários em blocos de 30 minutos com suporte a procedimentos de qualquer duração múltipla;
  - Sugestão automática de pacientes anteriores da própria clínica no Agendamento rápido;
  - Link `wa.me` pré-preenchido com paciente, serviço, data, horário e nome da clínica ([`utils/whatsapp.ts`](utils/whatsapp.ts)).
- **Gestão de Serviços (`/dashboard/services`):**
  - Criação, edição, ativação/inativação e exclusão de procedimentos com controle de limite por plano.
- **Relatórios (`/dashboard/reports`):**
  - Disponível para assinantes do plano **Profissional** (`active` ou `trialing`);
  - Métricas do período, filtro por intervalo de datas e gráficos (atendimentos por dia, ticket médio diário e serviços mais agendados) com Recharts.
- **Perfil da Clínica (`/dashboard/profile`):**
  - Edição de nome, endereço, telefone, status de atendimento, fuso horário, horários disponíveis e upload de avatar/logo via Cloudinary.
- **Assinaturas (`/dashboard/plans`):**
  - Integração com Stripe Checkout, Customer Portal e Webhook para sincronização automática de status.

---

## Planos e período de teste

A fonte única de verdade dos planos e recursos fica em [`utils/plans/index.ts`](utils/plans/index.ts) e [`utils/permissions/trial-limits.ts`](utils/permissions/trial-limits.ts):

| Plano | Valor | Limite de serviços ativos | Recursos principais |
| :--- | :--- | :--- | :--- |
| **Período de teste (Trial)** | Gratuito (`3 dias`) | Até `3 serviços` | Acesso ao painel, agenda online e confirmação no WhatsApp durante 3 dias após o cadastro |
| **Básico** | `R$ 27,90/mês` | Até `15 serviços` | Agendamentos online 24h, página pública, lembretes no painel, suporte por e-mail |
| **Profissional** | `R$ 97,90/mês` | Ilimitado | Tudo do Básico + Relatórios de desempenho, gráficos de faturamento e suporte prioritário no WhatsApp |
| **Rede de clínicas** | Sob consulta | Ilimitado | Estrutura corporativa multiunidades (recursos marcados como *Em breve*) |

---

## Arquitetura e tecnologias

- **Framework:** Next.js `16.3.4` (App Router, Turbopack, `proxy.ts`), React `19.2.8`, TypeScript `5`
- **Estilização e UI:** Tailwind CSS v4, Base UI / shadcn UI, Lucide Icons, fonte `Plus Jakarta Sans`, Sonner (toasts)
- **Formulários e Estado:** React Hook Form, Zod, TanStack React Query
- **Gráficos e Datas:** Recharts, `date-fns`, `react-datepicker` (com utilitários estritos para `America/Sao_Paulo`)
- **Banco de Dados:** PostgreSQL com Prisma ORM `7.10.0` (`@prisma/adapter-pg` + `pg`)
- **Autenticação:** `next-auth` (`5.0.0-beta.32`) + `@auth/prisma-adapter` + `bcryptjs`
- **Pagamentos e Mídia:** Stripe (`stripe`, `@stripe/stripe-js`) e Cloudinary

---

## Rotas da aplicação e APIs

### Páginas (`app/`)
- `/` — Landing page pública e listagem de clínicas
- `/clinica/[id]` — Página pública de agendamento da clínica
- `/login` — Login da clínica (e-mail/senha e Google)
- `/cadastro` — Cadastro de nova clínica
- `/termos` e `/privacidade` — Termos de Uso e Política de Privacidade (LGPD)
- `/dashboard` — Agenda do dia, resumo de métricas e lembretes
- `/dashboard/services` — Cadastro e gerenciamento de serviços
- `/dashboard/reports` — Relatórios e gráficos (Plano Profissional)
- `/dashboard/profile` — Configurações da clínica, foto e horários
- `/dashboard/plans` — Contratação e gerenciamento da assinatura Stripe

### Endpoints (`app/api/`)
- `GET / POST /api/auth/[...nextauth]` — Rotas de autenticação do Auth.js
- `GET /api/clinic/appointments?date=YYYY-MM-DD` — Lista os agendamentos do dia da clínica autenticada
- `GET /api/schedule/get-appointments?userId=<id>&date=YYYY-MM-DD` — Calcula e retorna os horários ocupados do dia
- `POST /api/image/upload` — Upload de imagem (`PNG`/`JPEG`) para o Cloudinary
- `POST /api/webhook` — Recebe eventos do Stripe (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
# Banco de dados (PostgreSQL)
DATABASE_URL="postgresql://usuario:senha@host:5432/odontogest?sslmode=require"

# Auth.js / NextAuth
AUTH_SECRET="sua-chave-secreta-aleatoria"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# URL pública da aplicação
NEXT_PUBLIC_URL="http://localhost:3000"

# Stripe (Planos e Assinaturas)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_SECRET_WEBHOOK_KEY=""
STRIPE_PLAN_BASIC=""
STRIPE_PLAN_PROFISSIONAL=""
STRIPE_SUCCESS_URL="http://localhost:3000/dashboard/plans"
STRIPE_CANCEL_URL="http://localhost:3000/dashboard/plans"

# Opcionais: planos anuais no Stripe
# STRIPE_PLAN_BASIC_YEARLY=""
# STRIPE_PLAN_PROFISSIONAL_YEARLY=""

# Cloudinary (Avatar/logo da clínica)
CLOUDINARY_NAME=""
CLOUDINARY_KEY=""
CLOUDINARY_SECRET=""

# Contato e configurações opcionais da Landing Page / Login
NEXT_PUBLIC_WHATSAPP_NUMBER="5511999999999"
NEXT_PUBLIC_CONTACT_EMAIL="contato@odontogest.com.br"
# NEXT_PUBLIC_SHOW_DEMO_CLINICS="true"
# NEXT_PUBLIC_SHOW_SOCIAL_PROOF="false"
# NEXT_PUBLIC_SHOW_PRIORITY_TRIAGE="false"
# NEXT_PUBLIC_INSTAGRAM_URL=""
# NEXT_PUBLIC_LINKEDIN_URL=""
# NEXT_PUBLIC_FACEBOOK_URL=""
```

---

## Como rodar localmente

### 1. Instalar dependências
```bash
npm install
```
*(O script `postinstall` executa `prisma generate` automaticamente.)*

### 2. Configurar banco e migrations
O projeto utiliza a configuração do Prisma 7 em [`prisma7.config.ts`](prisma7.config.ts):

```bash
npx prisma generate --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000).

### 4. Testar webhooks do Stripe localmente (opcional)
Com a Stripe CLI instalada:
```bash
npm run stripe:listen
```

### 5. Scripts de verificação e build
```bash
npx tsc --noEmit   # Verificação de tipos TypeScript
npm run lint       # ESLint
npx next build     # Build de produção sem rodar migrations
npm run build      # prisma generate && prisma migrate deploy && next build
```

---

## Estrutura de pastas

```text
├── app/
│   ├── (auth)/                  # Telas e actions de /login e /cadastro
│   ├── (panel)/dashboard/       # Painel autenticado da clínica
│   │   ├── _actions/            # Agendamento rápido, lembretes, cancelamento
│   │   ├── _components/         # Sidebar, Topbar, Agenda, Quick Appointment
│   │   ├── plans/               # Assinaturas Stripe
│   │   ├── profile/             # Dados da clínica, horários e avatar
│   │   ├── reports/             # Métricas e gráficos Recharts
│   │   └── services/            # CRUD de procedimentos
│   ├── (public)/                # Landing page, /clinica/[id], /termos, /privacidade
│   └── api/                     # Route Handlers (auth, agenda, upload, webhook)
├── components/ui/               # Componentes base de interface
├── lib/
│   ├── appointments/            # Transação compartilhada com advisory lock
│   ├── auth.ts                  # Configuração NextAuth v5 (OAuth + Credentials)
│   ├── auth-schemas.ts          # Schemas Zod de auth e sanitização de callbackUrl
│   ├── landing-config.ts        # Flags e contatos públicos
│   ├── prisma.ts                # Instância Prisma Client (@prisma/adapter-pg)
│   ├── rate-limit.ts            # Rate limit em memória (login/cadastro)
│   └── schedule-utils.ts        # Regras compartilhadas de fuso e disponibilidade
├── prisma/
│   ├── schema.prisma            # Modelos User, Service, Appointment, Reminder, Subscription
│   └── migrations/              # Histórico de migrations SQL
├── utils/
│   ├── permissions/             # Verificação de trial, planos e permissões
│   ├── plans/                   # Definição centralizada dos planos e recursos
│   └── whatsapp.ts              # Formatação de data e montagem de link wa.me
├── prisma7.config.ts            # Configuração de datasource/migrations do Prisma 7
└── proxy.ts                     # Proteção de rotas (/dashboard/*, /login, /cadastro)
```
