import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Initialize state from cookies if available
const getUserFromCookies = () => {
  try {
    const userCookie = Cookies.get("user");
    return userCookie ? JSON.parse(userCookie) : null;
  } catch {
    return null;
  }
};

const getTokenFromCookies = () => {
  const token = Cookies.get("token");
  if (token) {
    try {
      // Validate token before returning
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        // Token is expired, remove it
        Cookies.remove("token");
        Cookies.remove("user");
        return null;
      }
      return token;
    } catch (error) {
      // Invalid token, remove it
      Cookies.remove("token");
      Cookies.remove("user");
      return null;
    }
  }
  return null;
};

const initialState = {
  user: getUserFromCookies(),
  isLoading: false,
  token: getTokenFromCookies(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      if (action.payload) {
        Cookies.set("user", JSON.stringify(action.payload), { expires: 7 }); // 7 days
      } else {
        Cookies.remove("user");
      }
    },
    logout(state) {
      state.user = null;
      state.isLoading = false;
      state.token = null;
      Cookies.remove("user");
      Cookies.remove("token");
      // Clear localStorage as well (for redux-persist)
      try {
        localStorage.removeItem("persist:auth");
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    },
    setLogoutLoading(state) {
      state.isLoading = true;
    },
    setToken(state, action) {
      state.token = action.payload;
      if (action.payload) {
        // Validate token before setting
        try {
          const decodedToken = jwtDecode(action.payload);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            // Token is expired, don't set it
            state.token = null;
            return;
          }
          Cookies.set("token", action.payload, { expires: 7 }); // 7 days
        } catch (error) {
          // Invalid token, don't set it
          state.token = null;
        }
      } else {
        Cookies.remove("token");
      }
    },
    setState(state, action) {
      return action.payload;
    },
    // New action to sync state with cookies
    syncWithCookies(state) {
      const cookieToken = Cookies.get("token");
      const cookieUser = Cookies.get("user");

      if (!cookieToken) {
        state.user = null;
        state.token = null;
      } else {
        try {
          const decodedToken = jwtDecode(cookieToken);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            // Token expired
            state.user = null;
            state.token = null;
            Cookies.remove("user");
            Cookies.remove("token");
          } else {
            state.token = cookieToken;
            if (cookieUser) {
              try {
                state.user = JSON.parse(cookieUser);
              } catch (error) {
                state.user = null;
                Cookies.remove("user");
              }
            }
          }
        } catch (error) {
          // Invalid token
          state.user = null;
          state.token = null;
          Cookies.remove("user");
          Cookies.remove("token");
        }
      }
    },
  },
});

export const {
  setUser,
  logout,
  setToken,
  setState,
  syncWithCookies,
  setLogoutLoading,
} = authSlice.actions;
export default authSlice.reducer;
