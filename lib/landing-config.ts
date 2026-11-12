/**
 * Flags e contatos da landing page.
 * Ajuste via variáveis de ambiente (sem mexer no código).
 */

/** Mostra as clínicas marcadas com is_demo = true quando NÃO houver clínicas reais. */
export const SHOW_DEMO_CLINICS = process.env.NEXT_PUBLIC_SHOW_DEMO_CLINICS !== "false";

/** Métricas e depoimentos. Só ligue com dados verdadeiros. */
export const SHOW_SOCIAL_PROOF = process.env.NEXT_PUBLIC_SHOW_SOCIAL_PROOF === "true";

export const SITE_URL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, // ex.: 5511999999999
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
};

export const SOCIALS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
};

export function whatsappLink(message = "Olá! Quero conhecer o OdontoGEST para a minha clínica.") {
  if (!CONTACT.whatsapp) return undefined;
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * Dados reais para a faixa de métricas e depoimentos.
 * Preencha SOMENTE com informações verdadeiras e ligue SHOW_SOCIAL_PROOF.
 */
export const REAL_METRICS: { label: string; value: string }[] = [];
export const REAL_TESTIMONIALS: { name: string; clinic: string; text: string }[] = [];
