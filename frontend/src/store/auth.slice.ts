import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { UserResponseDTO } from "@/types/user";
import api from "@/api/api";
import type { AxiosError } from "axios";

interface AuthState {
  user: UserResponseDTO | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk<
  UserResponseDTO,
  void,
  { rejectValue: string }
>("auth/fetchUser", async (_, { rejectWithValue }) => {
  try {
    // Use the imported 'api' instance instead of browser fetch
    const response = await api.get<UserResponseDTO>("/Auth/self");

    // Axios automatically handles response.ok and throws an error on 4xx/5xx
    return response.data; // Axios response places the data in the 'data' property
  } catch (err) {
    const error = err as AxiosError;
    // Determine the error message to send as the rejection payload
    let errorMessage = "Failed to fetch user";
    if (error.response?.status === 401) {
      errorMessage = "Not authenticated or session expired";
    } else if (error.message) {
      errorMessage = `API Error: ${error.message}`;
    }

    return rejectWithValue(errorMessage);
  }
});

// --- Auth Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Utility reducer to manually set a user (e.g., after successful login)
    setUser: (state, action: PayloadAction<UserResponseDTO>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    // Logout reducer to clear user state
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // PENDING: Started fetching
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // FULFILLED: Successfully fetched user data
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      // REJECTED: Failed to fetch user data (e.g., 401, 500 error)
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null; // Clear user on failure
        state.isLoading = false;
        state.error = (action.payload as string) || "An unknown error occurred";
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
