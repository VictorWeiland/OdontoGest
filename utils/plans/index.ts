export type FeatureStatus = "available" | "soon"
export type PlanId = "BASIC" | "PROFESSIONAL" | "ENTERPRISE"

export interface PlanFeature {
  id: string
  label: string
  category: "agendamento" | "gestao" | "relatorios" | "suporte" | "avancado"
  status: FeatureStatus
  plans: PlanId[]
  note?: Partial<Record<PlanId, string>>
}

export interface PlansDetailsProps {
  maxServices: number | null
  maxProfessionals?: number | null
}

export type PlansProps = {
  BASIC: PlansDetailsProps
  PROFESSIONAL: PlansDetailsProps
  ENTERPRISE: PlansDetailsProps
}

export const PLANS: PlansProps = {
  BASIC: {
    maxServices: 15,
    maxProfessionals: 1,
  },
  PROFESSIONAL: {
    maxServices: null, // Ilimitado
    maxProfessionals: 1,
  },
  ENTERPRISE: {
    maxServices: null, // Ilimitado
    maxProfessionals: null,
  },
}

export const PLAN_FEATURES: PlanFeature[] = [
  // Agendamento e Atendimento
  {
    id: "online_scheduling",
    label: "Agendamentos online ilimitados 24h",
    category: "agendamento",
    status: "available",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "public_page",
    label: "Página pública da clínica",
    category: "agendamento",
    status: "available",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
    note: {
      BASIC: "Via ID exclusivo",
      PROFESSIONAL: "Via ID exclusivo",
      ENTERPRISE: "Personalizada / Domínio próprio",
    },
  },
  {
    id: "custom_link",
    label: "Link personalizado da clínica (slug exclusivo)",
    category: "agendamento",
    status: "soon",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "operating_hours",
    label: "Definição de horários de funcionamento e intervalos",
    category: "agendamento",
    status: "available",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "block_dates",
    label: "Bloqueio de folgas e feriados específicos",
    category: "agendamento",
    status: "soon",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "whatsapp_confirmation_click",
    label: "Confirmação por WhatsApp com 1 clique (mensagem pronta)",
    category: "agendamento",
    status: "available",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "whatsapp_auto_reminders",
    label: "Lembretes e confirmações automáticas por WhatsApp",
    category: "agendamento",
    status: "soon",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
    note: {
      PROFESSIONAL: "Com cota mensal",
      ENTERPRISE: "Cota ampliada",
    },
  },
  {
    id: "return_reminders",
    label: "Lembrete automático de retorno semestral",
    category: "agendamento",
    status: "soon",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "waiting_list",
    label: "Lista de espera inteligente para encaixes",
    category: "agendamento",
    status: "soon",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },

  // Gestão e Clínica
  {
    id: "services_limit",
    label: "Serviços odontológicos cadastrados",
    category: "gestao",
    status: "available",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
    note: {
      BASIC: "Até 15 procedimentos",
      PROFESSIONAL: "Ilimitados",
      ENTERPRISE: "Ilimitados",
    },
  },
  {
    id: "professionals_limit",
    label: "Profissionais / Cadeiras de atendimento",
    category: "gestao",
    status: "available",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
    note: {
      BASIC: "1 profissional",
      PROFESSIONAL: "1 profissional (até 3 em breve)",
      ENTERPRISE: "Múltiplos profissionais",
    },
  },
  {
    id: "panel_reminders",
    label: "Painel de controle com lembretes diários",
    category: "gestao",
    status: "available",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "patients_history",
    label: "Cadastro e histórico detalhado de pacientes",
    category: "gestao",
    status: "soon",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "email_alerts",
    label: "Aviso imediato por e-mail a cada novo agendamento",
    category: "gestao",
    status: "soon",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "digital_anamnesis",
    label: "Anamnese digital e prontuário odontológico",
    category: "gestao",
    status: "soon",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "basic_finance",
    label: "Controle financeiro básico de entradas e saídas",
    category: "gestao",
    status: "soon",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "satisfaction_survey",
    label: "Pesquisa de satisfação pós-consulta (NPS)",
    category: "gestao",
    status: "soon",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },

  // Relatórios e Indicadores
  {
    id: "complete_reports",
    label: "Relatórios de desempenho e métricas operacionais",
    category: "relatorios",
    status: "available",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "charts_revenue",
    label: "Gráficos diários e estimativa de faturamento",
    category: "relatorios",
    status: "available",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "export_reports",
    label: "Exportação de relatórios em CSV e PDF",
    category: "relatorios",
    status: "soon",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "multi_unit_reports",
    label: "Relatórios comparativos e consolidados por unidade",
    category: "relatorios",
    status: "soon",
    plans: ["ENTERPRISE"],
  },

  // Suporte e Avançado
  {
    id: "support_email",
    label: "Suporte por e-mail",
    category: "suporte",
    status: "available",
    plans: ["BASIC", "PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "support_whatsapp",
    label: "Suporte prioritário via WhatsApp",
    category: "suporte",
    status: "available",
    plans: ["PROFESSIONAL", "ENTERPRISE"],
  },
  {
    id: "dedicated_manager",
    label: "Gerente de contas dedicado e implantação assistida",
    category: "suporte",
    status: "soon",
    plans: ["ENTERPRISE"],
  },
  {
    id: "data_migration",
    label: "Ajuda na migração de dados de outro sistema",
    category: "avancado",
    status: "soon",
    plans: ["ENTERPRISE"],
  },
  {
    id: "multi_units",
    label: "Painel consolidado para várias unidades",
    category: "avancado",
    status: "soon",
    plans: ["ENTERPRISE"],
  },
  {
    id: "roles_permissions",
    label: "Permissões por perfil (administrador, recepção, dentista)",
    category: "avancado",
    status: "soon",
    plans: ["ENTERPRISE"],
  },
  {
    id: "custom_branding",
    label: "Marca e domínio próprio da rede",
    category: "avancado",
    status: "soon",
    plans: ["ENTERPRISE"],
  },
]

export interface SubscriptionPlanItem {
  id: PlanId
  name: string
  headline: string
  description: string
  price: string
  period?: string
  popular?: boolean
  promoBadge?: string
  actionLabel?: string
  limits: {
    servicesLabel: string
    professionalsLabel: string
  }
  features: {
    text: string
    status: FeatureStatus
  }[]
}

export const subscriptionPlans: SubscriptionPlanItem[] = [
  {
    id: "BASIC",
    name: "Básico",
    headline: "Para dentista autônomo ou consultório com 1 profissional",
    description: "Tudo o que você precisa para organizar sua agenda online e acabar com os horários vagos.",
    price: "R$ 27,90",
    period: "/mês",
    popular: false,
    actionLabel: "Começar no Básico",
    limits: {
      servicesLabel: "Até 15 procedimentos",
      professionalsLabel: "1 profissional",
    },
    features: [
      { text: "Até 15 serviços ativos cadastrados", status: "available" },
      { text: "1 profissional de atendimento", status: "available" },
      { text: "Agendamentos online ilimitados 24h", status: "available" },
      { text: "Página pública exclusiva da sua clínica", status: "available" },
      { text: "Horários de funcionamento e intervalos ativos", status: "available" },
      { text: "Confirmação por WhatsApp com 1 clique", status: "available" },
      { text: "Painel de controle com lembretes diários", status: "available" },
      { text: "Suporte por e-mail", status: "available" },
      { text: "Link personalizado da clínica", status: "soon" },
      { text: "Cadastro e histórico detalhado de pacientes", status: "soon" },
      { text: "Aviso por e-mail a cada novo agendamento", status: "soon" },
    ],
  },
  {
    id: "PROFESSIONAL",
    name: "Profissional",
    headline: "Para clínicas com mais movimento",
    description: "Mais recursos de gestão, relatórios analíticos de faturamento e suporte prioritário.",
    price: "R$ 97,90",
    period: "/mês",
    popular: true,
    promoBadge: "Mais popular",
    actionLabel: "Ativar Plano Profissional",
    limits: {
      servicesLabel: "Serviços ilimitados",
      professionalsLabel: "1 profissional (até 3 em breve)",
    },
    features: [
      { text: "Tudo do Básico com serviços ilimitados", status: "available" },
      { text: "Relatórios operacionais e métricas de desempenho", status: "available" },
      { text: "Gráficos diários e estimativa de faturamento", status: "available" },
      { text: "Suporte prioritário via WhatsApp", status: "available" },
      { text: "Até 3 profissionais / cadeiras", status: "soon" },
      { text: "Lembretes e confirmações automáticas por WhatsApp", status: "soon" },
      { text: "Lembrete de retorno para pacientes", status: "soon" },
      { text: "Lista de espera inteligente", status: "soon" },
      { text: "Anamnese digital e prontuário", status: "soon" },
      { text: "Controle financeiro básico", status: "soon" },
      { text: "Exportação em CSV e PDF", status: "soon" },
      { text: "Página pública com cores e logo personalizadas", status: "soon" },
      { text: "Pesquisa de satisfação pós-consulta", status: "soon" },
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Rede de clínicas",
    headline: "Para redes e clínicas com várias unidades",
    description: "Estrutura corporativa com gestão centralizada de unidades, permissões e suporte dedicado.",
    price: "Sob consulta",
    period: "",
    popular: false,
    actionLabel: "Falar com a equipe",
    limits: {
      servicesLabel: "Serviços ilimitados",
      professionalsLabel: "Múltiplos profissionais",
    },
    features: [
      { text: "Tudo do Profissional para todas as unidades", status: "soon" },
      { text: "Painel consolidado com várias unidades", status: "soon" },
      { text: "Relatórios comparativos por filial", status: "soon" },
      { text: "Permissões por perfil (admin, recepção, dentista)", status: "soon" },
      { text: "Ajuda na migração de dados e implantação assistida", status: "soon" },
      { text: "Gerente de contas e suporte dedicado", status: "soon" },
      { text: "Marca e domínio próprio", status: "soon" },
    ],
  },
]
