import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { createLazyRoute } from "@tanstack/react-router";

function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </>
  );
}

export default LandingPage;
export const Route = createLazyRoute('/public/')({
  component: LandingPage,
})