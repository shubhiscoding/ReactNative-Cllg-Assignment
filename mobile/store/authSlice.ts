import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthState, LoginCredentials, RegisterCredentials, OTPVerification, User } from "@/types";
import { api } from "@/utils/api";

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

// Load user from storage on app start
export const loadUser = createAsyncThunk("auth/loadUser", async () => {
  const token = await AsyncStorage.getItem("token");
  const userStr = await AsyncStorage.getItem("user");
  
  if (token && userStr) {
    const user = JSON.parse(userStr) as User;
    api.setToken(token);
    return { token, user };
  }
  return null;
});

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.login(credentials);
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || "Login failed");
      }
      
      const { token, user } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      api.setToken(token);
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Register (sends OTP)
export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await api.register(credentials);
      if (!response.success) {
        return rejectWithValue(response.error || "Registration failed");
      }
      return { email: credentials.email };
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (data: OTPVerification, { rejectWithValue }) => {
    try {
      const response = await api.verifyOTP(data);
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || "Verification failed");
      }
      
      const { token, user } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      api.setToken(token);
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || "Verification failed");
    }
  }
);

// Resend OTP
export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.resendOTP(email);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to resend OTP");
      }
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to resend OTP");
    }
  }
);

// Request Login OTP (forgot password)
export const requestLoginOTP = createAsyncThunk(
  "auth/requestLoginOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.requestLoginOTP(email);
      if (!response.success) {
        return rejectWithValue(response.error || "Failed to send OTP");
      }
      return { email };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send OTP");
    }
  }
);

// Verify Login OTP (forgot password)
export const verifyLoginOTP = createAsyncThunk(
  "auth/verifyLoginOTP",
  async (data: OTPVerification, { rejectWithValue }) => {
    try {
      const response = await api.verifyLoginOTP(data);
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || "Verification failed");
      }
      
      const { token, user } = response.data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      api.setToken(token);
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || "Verification failed");
    }
  }
);

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
  api.setToken(null);
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Request Login OTP
      .addCase(requestLoginOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestLoginOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(requestLoginOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify Login OTP
      .addCase(verifyLoginOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyLoginOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(verifyLoginOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

