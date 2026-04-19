import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Stethoscope, 
  Pill, 
  FileText, 
  Phone, 
  MapPin, 
  Clock,
  Mic,
  Video
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@supabase/supabase-js";

interface PatientDashboardProps {
  onNavigate: (section: string) => void;
  user: User | null;
}

const PatientDashboard = ({ onNavigate, user }: PatientDashboardProps) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold">{t('dashboard.patient_title')}</h1>
            <Button variant="secondary" size="sm">
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </Button>
          </div>
          {/* user info card */}
          <div className="rounded-xl bg-white text-gray-800 p-4 shadow-md">
            <p className="text-sm opacity-90 mb-1">{t('dashboard.welcome_back')},</p>
            <p className="text-lg font-semibold">{user?.email || 'User'}</p>
            <p className="text-sm opacity-80">Village: Nabha, Punjab</p>
          </div>
        </div>
      </header>

      {/* Emergency Button */}
      <section className="container mx-auto px-4 sm:px-6 pt-6">
        <Button 
          className="w-full emergency-btn btn-large mb-6 hover:scale-105 transition-all"
          onClick={() => onNavigate('emergency')}
        >
          <Phone className="w-6 h-6 mr-3" />
          <div className="text-left">
            <div className="text-lg font-bold">आपातकाल - Emergency</div>
            <div className="text-sm opacity-90">Instant doctor connection</div>
          </div>
        </Button>
      </section>

      {/* Main Actions */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {/* Doctor Consultation */}
          <Card 
            className="health-card cursor-pointer hover:shadow-[var(--shadow-primary)] hover:scale-105 transition-all group"
            onClick={() => onNavigate('consultation')}
          >
            <div className="text-center">
              <div className="icon-large bg-primary-light text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Doctor Consultation</h3>
              <p className="text-muted-foreground mb-4">डॉक्टर से बात करें</p>
              <div className="flex justify-center gap-2">
                <div className="flex items-center gap-1 text-sm text-success">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  12 Doctors Online
                </div>
              </div>
            </div>
          </Card>

          {/* Find Medicines */}
          <Card 
            className="health-card cursor-pointer hover:shadow-[var(--shadow-wellness)] hover:scale-105 transition-all group"
            onClick={() => onNavigate('medicines')}
          >
            <div className="text-center">
              <div className="icon-large bg-wellness-light text-wellness mx-auto mb-4 group-hover:bg-wellness group-hover:text-wellness-foreground transition-all">
                <Pill className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Medicines</h3>
              <p className="text-muted-foreground mb-4">दवा खोजें</p>
              <div className="flex justify-center gap-2">
                <div className="flex items-center gap-1 text-sm text-wellness">
                  <MapPin className="w-3 h-3" />
                  5 Pharmacies Nearby
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Health Records */}
          <Card 
            className="health-card cursor-pointer hover:shadow-[var(--shadow-card)] hover:scale-105 transition-all group"
            onClick={() => onNavigate('records')}
          >
            <div className="text-center">
              <div className="icon-large bg-accent-light text-accent mx-auto mb-3 group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-1">Health Records</h4>
              <p className="text-sm text-muted-foreground">स्वास्थ्य रिकॉर्ड</p>
            </div>
          </Card>

          {/* Voice Assistant */}
          <Card 
            className="health-card cursor-pointer hover:shadow-[var(--shadow-card)] hover:scale-105 transition-all group"
            onClick={() => onNavigate('voice')}
          >
            <div className="text-center">
              <div className="icon-large bg-secondary text-secondary-foreground mx-auto mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-1">Voice Assistant</h4>
              <p className="text-sm text-muted-foreground">आवाज़ सहायक</p>
            </div>
          </Card>

          {/* Appointments */}
          <Card 
            className="health-card cursor-pointer hover:shadow-[var(--shadow-card)] hover:scale-105 transition-all group"
            onClick={() => onNavigate('appointments')}
          >
            <div className="text-center">
              <div className="icon-large bg-warning-light text-warning mx-auto mb-3 group-hover:bg-warning group-hover:text-warning-foreground transition-all">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-1">Appointments</h4>
              <p className="text-sm text-muted-foreground">अपॉइंटमेंट</p>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="health-card flex items-center gap-4">
              <div className="icon-large bg-success-light text-success">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Video consultation completed</p>
                <p className="text-sm text-muted-foreground">Dr. Priya Sharma - 2 hours ago</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
            
            <div className="health-card flex items-center gap-4">
              <div className="icon-large bg-wellness-light text-wellness">
                <Pill className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Medicine delivered</p>
                <p className="text-sm text-muted-foreground">Order #12345 - Yesterday</p>
              </div>
              <Button variant="outline" size="sm">Receipt</Button>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default PatientDashboard;
