import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import modalReducer from "./modal.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modal: modalReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, ...}
export type AppDispatch = typeof store.dispatch;
