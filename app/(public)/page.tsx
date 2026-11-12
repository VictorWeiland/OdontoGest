import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import { Hero } from './_components/hero'
import { HowItWorks } from "./_components/how-it-works";
import { Features } from "./_components/features";
import { Professionals } from "./_components/professionals";
import { SocialProof } from "./_components/social-proof";
import { Faq } from "./_components/faq";
import { FinalCta } from "./_components/final-cta";
import { getProfessionals } from "./_data-access/get-professionals";

export const revalidate = 120;

export default async function Home() {

  const { clinics, demoOnly } = await getProfessionals();

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-700">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Professionals clinics={clinics} demoOnly={demoOnly} />
        <SocialProof />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
