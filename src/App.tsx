import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LandingPage from "./components/LandingPage";
import PatientDashboard from "./components/PatientDashboard";
import ConsultationBooking from "./components/ConsultationBooking";
import MedicineFinder from "./components/MedicineFinder";
import HealthRecords from "./components/HealthRecords";
import SahayakDashboard from "./components/SahayakDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import AuthPage from "./components/auth/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type UserType = 'patient' | 'sahayak' | 'doctor' | null;
type PatientSection =
  | 'dashboard'
  | 'consultation'
  | 'medicines'
  | 'records'
  | 'voice'
  | 'appointments'
  | 'emergency';

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentUserType, setCurrentUserType] = useState<UserType>(null);
  const [currentSection, setCurrentSection] = useState<PatientSection>('dashboard');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("user_id", session.user.id)
            .single();

          if (profile) {
            setCurrentUserType(profile.user_type);
            setShowAuth(false);
          }
        } else {
          setCurrentUserType(null);
          setShowAuth(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserTypeSelect = (userType: UserType) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setCurrentUserType(userType);
    setCurrentSection("dashboard");
  };

  const handleAuthSuccess = (userType: UserType) => {
    setCurrentUserType(userType);
    setCurrentSection("dashboard");
    setShowAuth(false);
  };

  const handlePatientNavigation = (section: string) => {
    setCurrentSection(section as PatientSection);
  };

  const renderCurrentView = () => {
    if (showAuth) {
      return (
        <AuthPage
          onAuthSuccess={handleAuthSuccess}
          onBack={() => setShowAuth(false)}
        />
      );
    }

    if (!currentUserType) {
      return (
        <LandingPage
          onUserTypeSelect={handleUserTypeSelect}
          onShowAuth={() => setShowAuth(true)}
        />
      );
    }

    switch (currentUserType) {
      case "patient":
        switch (currentSection) {
          case "consultation":
            return (
              <ConsultationBooking
                onBack={() => setCurrentSection("dashboard")}
              />
            );
          case "medicines":
            return (
              <MedicineFinder
                onBack={() => setCurrentSection("dashboard")}
              />
            );
          case "records":
            return (
              <HealthRecords
                onBack={() => setCurrentSection("dashboard")}
              />
            );
          case "emergency":
            alert("Backend connection required");
            setCurrentSection("dashboard");
            return (
              <PatientDashboard
                onNavigate={handlePatientNavigation}
                user={user}
              />
            );
          default:
            return (
              <PatientDashboard
                onNavigate={handlePatientNavigation}
                user={user}
              />
            );
        }
      case "sahayak":
        // 👇 Back just resets to LandingPage (no logout)
        return <SahayakDashboard onBack={() => setCurrentUserType(null)} user={user} />;
      case "doctor":
        // 👇 Back just resets to LandingPage (no logout)
        return <DoctorDashboard onBack={() => setCurrentUserType(null)} user={user} />;
      default:
        return (
          <LandingPage
            onUserTypeSelect={handleUserTypeSelect}
            onShowAuth={() => setShowAuth(true)}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={renderCurrentView()} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
