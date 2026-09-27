import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { LiveCounters } from "@/components/landing/LiveCounters";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Simulator } from "@/components/landing/Simulator";
import { ForParentsForSchools } from "@/components/landing/ForParentsForSchools";
import { SecurityAndPayments } from "@/components/landing/SecurityAndPayments";
import { Testimonials } from "@/components/landing/Testimonials";
import { SchoolsPreview } from "@/components/landing/SchoolsPreview";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LiveCounters />
        <ProblemSection />
        <HowItWorks />
        <Simulator />
        <ForParentsForSchools />
        <SecurityAndPayments />
        <Testimonials />
        <SchoolsPreview />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
