/* eslint-disable @typescript-eslint/no-explicit-any */
// Google Analytics gtag type definitions
interface Window {
  gtag?: (
    command: "config" | "event" | "js" | "set",
    targetId: string,
    config?: Record<string, any>,
  ) => void;
  dataLayer?: any[];
}
