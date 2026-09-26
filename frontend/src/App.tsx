import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/LanguageContext";
import { SessionProvider } from "@/context/SessionContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { GuestOnly, RequireAuth } from "@/components/layout/RouteGuards";
import { RouteFocus } from "@/components/layout/RouteFocus";
import { FullPageLoader } from "@/components/common/PageStates";
import { ApiError } from "@/lib/api";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const ConsultationsPage = lazy(() => import("@/pages/ConsultationsPage"));
const NewConsultationPage = lazy(() => import("@/pages/NewConsultationPage"));
const ConsultationDetailPage = lazy(() => import("@/pages/ConsultationDetailPage"));
const RecordsPage = lazy(() => import("@/pages/RecordsPage"));
const PatientHistoryPage = lazy(() => import("@/pages/PatientHistoryPage"));
const MedicinesPage = lazy(() => import("@/pages/MedicinesPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SessionProvider>
            <RouteFocus />
            <Suspense fallback={<FullPageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route element={<GuestOnly />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Route>

                <Route element={<AppLayout />}>
                  <Route path="/medicines" element={<MedicinesPage />} />
                  <Route element={<RequireAuth />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/consultations" element={<ConsultationsPage />} />
                    <Route path="/consultations/:id" element={<ConsultationDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                  <Route element={<RequireAuth roles={["patient", "sahayak"]} />}>
                    <Route path="/consultations/new" element={<NewConsultationPage />} />
                  </Route>
                  <Route element={<RequireAuth roles={["patient"]} />}>
                    <Route path="/records" element={<RecordsPage />} />
                  </Route>
                  <Route element={<RequireAuth roles={["doctor", "sahayak"]} />}>
                    <Route path="/patients/:id/records" element={<PatientHistoryPage />} />
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
            <Toaster />
          </SessionProvider>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
