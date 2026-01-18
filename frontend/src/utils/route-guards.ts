import { redirect } from "@tanstack/react-router";
import { store } from "@/store/store";
import type { UserRole } from "@/types/user";
import type { UserResponseDTO } from "@/types/user";

interface AuthState {
  user: UserResponseDTO | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Wait for the auth state to finish loading
 * Returns a promise that resolves when isLoading becomes false
 */
const waitForAuthInit = (): Promise<AuthState> => {
  return new Promise((resolve) => {
    const state = store.getState().auth;

    // If already loaded, resolve immediately
    if (!state.isLoading) {
      resolve(state);
      return;
    }

    // Otherwise, subscribe and wait for loading to finish
    const unsubscribe = store.subscribe(() => {
      const currentState = store.getState().auth;
      if (!currentState.isLoading) {
        unsubscribe();
        resolve(currentState);
      }
    });
  });
};

/**
 * Get the current auth state from Redux store
 */
export const getAuthState = () => {
  const state = store.getState();
  return {
    user: state.auth.user,
    isLoading: state.auth.isLoading,
  };
};

/**
 * Require user to be authenticated
 * Redirects to /login if not authenticated
 */
export const requireAuth = async () => {
  // Wait for auth to finish loading
  const { user } = await waitForAuthInit();

  console.log("requireAuth - user after waiting:", user);

  if (!user) {
    throw redirect({
      to: "/login",
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
      to: "/login",
    });
  }

  console.log("requireRole - user after waiting:", user);

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
  // Wait for auth to finish loading
  const { user } = await waitForAuthInit();

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
