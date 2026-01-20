import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { createLazyRoute, useNavigate } from "@tanstack/react-router";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { LoadingPage } from '@/components/loading-page';
import { useEffect, useRef } from 'react';
import { USER_ROLES } from '@/types/user';

function LandingPage() {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only redirect once when auth loading completes
    if (!isLoading && !hasRedirectedRef.current && user) {
      hasRedirectedRef.current = true;

      // Redirect to role-specific home page
      switch (user.role) {
        case USER_ROLES.ADMIN:
          navigate({ to: '/admin/user-management' });
          break;
        case USER_ROLES.MENTOR:
          navigate({ to: '/mentor/schedules' });
          break;
        case USER_ROLES.USER:
          navigate({ to: '/user/schedules' });
          break;
        default:
          // Stay on landing page
          break;
      }
    }
  }, [isLoading, user, navigate]);

  // Show loading page while auth is initializing
  if (isLoading) {
    return <LoadingPage />;
  }

  // Only render landing page for unauthenticated users
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  );
}

export default LandingPage;
export const Route = createLazyRoute('/public/')({
  component: LandingPage,
})