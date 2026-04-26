import { redirect } from "@tanstack/react-router";
import { store } from "@/store/store";
import type { UserRole } from "@/types/user";

/**
 * Get the current auth state from Redux store
 */
export const getAuthState = () => {
  const state = store.getState();
  return {
    user: state.auth.user,
    bootstrapped: state.auth.bootstrapped,
    isLoading: state.auth.isLoading,
  };
};

/**
 * Require user to be authenticated
 * Redirects to /login if not authenticated
 */
export const requireAuth = async () => {
  const { user } = getAuthState();

  if (!user) {
    throw redirect({
      to: "/",
    });
  }

  return user;
};

/**
 * Require user to have a specific role
 * Redirects to /login if not authenticated
 * Redirects to /unauthorized if wrong role
 */
export const requireRole = async (allowedRole: UserRole) => {
  const user = await requireAuth();

  if (!user) {
    throw redirect({
      to: "/",
    });
  }

  if (user.role !== allowedRole) {
    throw redirect({
      to: "/unauthorized",
    });
  }

  return user;
};

/**
 * Redirect authenticated users away from auth pages (login/register)
 * to their role-specific home page
 */
export const redirectIfAuthenticated = async () => {
  const { user } = getAuthState();

  if (user) {
    // Redirect to role-specific home page
    switch (user.role) {
      case "Admin":
        throw redirect({ to: "/admin/user-management" });
      case "Mentor":
        throw redirect({ to: "/mentor/schedules" });
      case "User":
        throw redirect({ to: "/user/schedules" });
      default:
        throw redirect({ to: "/" });
    }
  }
};
