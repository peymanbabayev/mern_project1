import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App.tsx";

// QueryClient yaradın
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 dəqiqə (data fresh sayılır)
      gcTime: 1000 * 60 * 10,         // 10 dəqiqə (cache-də saxlanma müddəti)
      retry: 1,                       // Error olduqda 1 dəfə retry
      refetchOnWindowFocus: false,    // Window focus olduqda refetch etməsin
    },
  },
});

import { AuthProvider } from "./context/AuthContext";

// ... existing imports

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      {/* DevTools - yalnız development-də görünür */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);