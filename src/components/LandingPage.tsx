import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Users, Stethoscope, Pill, Phone, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import heroImage from "@/assets/hero-telemedicine.jpg";

interface LandingPageProps {
  onUserTypeSelect: (userType: "patient" | "sahayak" | "doctor") => void;
  onShowAuth: () => void;
}

const LandingPage = ({ onUserTypeSelect, onShowAuth }: LandingPageProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/30 via-background to-primary-light/20 overflow-hidden">
{/* Header */}
<header className="p-4 sm:p-6 sticky top-0 bg-white/70 backdrop-blur-md z-50 shadow transition-transform duration-700 transform hover:-translate-y-1">
  <div className="container mx-auto flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="icon-large bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:rotate-12 hover:scale-110 transition-transform duration-500">
        <Heart className="w-6 h-6" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-primary">
        {t("landing.title")}
      </h1>
    </div>
    <div className="flex gap-2 items-center">
      
      {/* 🔹 Live Video Call Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.open(
            "https://c6674dc3-8ff5-4e0f-8fae-6231b0adab1b-00-19c6s5hms1l0f.sisko.replit.dev/",
            "_blank"
          )
        }
      >
        <Users className="w-4 h-4 mr-1" />
        Live Video Call
      </Button>

       {/* 🔹 Live Video Call Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.open(
            "https://nha.gov.in/img/resources/PMJAY-Hospital-List.pdf",
            "_blank"
          )
        }
      >
        
        Ayushmaan
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          window.open(
            "https://sih2-three.vercel.app/",
            "_blank"
          )
        }
      >
        
        Chatbot
      </Button>

      <LanguageSelector />

      {/* 🔹 Open Clinical Data Compressor */}
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Clinical Data Compressor
      </Button>

      <Button variant="outline" size="sm" onClick={onShowAuth}>
        Login
      </Button>
    </div>
  </div>
</header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text */}
          <div className="text-center lg:text-left space-y-6 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {t("landing.subtitle")}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              {t("landing.tagline")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="btn-large bg-gradient-to-r from-primary to-wellness hover:shadow-lg hover:scale-105 transition-transform duration-500"
                onClick={() => onUserTypeSelect("patient")}
              >
                <Phone className="w-5 h-5 mr-2" />
                {t("landing.patient_button")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="btn-large border-primary text-primary hover:bg-primary-light hover:scale-105 transition-transform duration-500"
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                {t("landing.emergency_button")}
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative transform transition-transform duration-500 hover:scale-105">
            <img
              src={heroImage}
              alt="Telemedicine Hero"
              className="rounded-3xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-success text-success-foreground p-5 rounded-xl shadow-xl animate-bounce">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-foreground rounded-full animate-pulse"></div>
                <span className="font-semibold">24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 py-16">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12 animate-fade-in">
          {t("landing.features_title")}
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Stethoscope className="w-6 h-6" />,
              title: t("landing.doctor_consultation"),
              desc: t("landing.doctor_consultation_desc"),
              color: "primary",
            },
            {
              icon: <Pill className="w-6 h-6" />,
              title: t("landing.medicine_delivery"),
              desc: t("landing.medicine_delivery_desc"),
              color: "wellness",
            },
            {
              icon: <FileText className="w-6 h-6" />,
              title: t("landing.health_records"),
              desc: t("landing.health_records_desc"),
              color: "accent",
            },
          ].map((item, i) => (
            <Card
              key={i}
              className={`health-card text-center hover:shadow-xl hover:scale-105 transition-transform duration-500 p-6`}
            >
              <div className={`icon-large bg-${item.color}-light text-${item.color} mx-auto mb-4 p-3 rounded-full`}>
                {item.icon}
              </div>
              <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
              <p className="text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* User Type Selection */}
      <section className="container mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-primary-light via-white to-primary-light rounded-3xl p-10 text-center shadow-xl transition-transform duration-500 hover:scale-105">
          <h3 className="text-3xl sm:text-4xl font-bold mb-10">
            {t("landing.choose_role")}
          </h3>
          <div className="grid sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Button
              size="lg"
              className="btn-large h-40 flex-col bg-primary hover:shadow-lg transition-all duration-500"
              onClick={() => onUserTypeSelect("patient")}
            >
              <Users className="w-10 h-10 mb-2" />
              <span className="text-lg font-semibold">{t("landing.patient")}</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-large h-40 flex-col border-wellness text-wellness hover:bg-wellness-light hover:shadow-lg transition-all duration-500"
              onClick={() => onUserTypeSelect("sahayak")}
            >
              <Heart className="w-10 h-10 mb-2" />
              <span className="text-lg font-semibold">{t("landing.sahayak")}</span>
              <span className="text-sm opacity-70">{t("landing.sahayak_subtitle")}</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-large h-40 flex-col border-accent text-accent hover:bg-accent-light hover:shadow-lg transition-all duration-500"
              onClick={() => onUserTypeSelect("doctor")}
            >
              <Stethoscope className="w-10 h-10 mb-2" />
              <span className="text-lg font-semibold">{t("landing.doctor")}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground p-6 mt-12 text-center">
        <p className="text-sm opacity-90">{t("landing.footer_text")}</p>
      </footer>

      {/* 🔹 Popup Modal with iframe */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl h-[85vh] p-0">
          <iframe
            src="/test/index.html"
            title="Clinical Data Compressor"
            className="w-full h-full border-0 rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
