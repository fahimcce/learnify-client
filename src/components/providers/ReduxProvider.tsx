"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import { store, persistor } from "@/redux/store";
import { rehydrateAuth } from "@/redux/features/auth/authSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync auth state with cookies after rehydration
    // This ensures that if cookies exist but redux-persist hasn't rehydrated yet,
    // we still have the auth state available
    const timer = setTimeout(() => {
      store.dispatch(rehydrateAuth());
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
