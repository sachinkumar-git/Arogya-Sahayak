import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Stethoscope, 
  Activity, 
  Calendar, 
  Phone,
  Video,
  Battery,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Clock,
  Heart
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@supabase/supabase-js";

interface SahayakDashboardProps {
  onBack: () => void;
  user: User | null;
}

const SahayakDashboard = ({ onBack, user }: SahayakDashboardProps) => {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const { t } = useLanguage();

  const equipmentStatus = [
    { name: "Digital Stethoscope", status: "connected", battery: 85 },
    { name: "Blood Pressure Monitor", status: "connected", battery: 92 },
    { name: "Pulse Oximeter", status: "connected", battery: 78 },
    { name: "Glucometer", status: "disconnected", battery: 0 },
    { name: "Portable ECG", status: "connected", battery: 67 },
    { name: "Digital Thermometer", status: "connected", battery: 90 }
  ];

  const todayPatients = [
    { id: "1", name: "Ram Singh", age: 45, time: "2:30 PM", status: "waiting", complaint: "Fever, headache", priority: "normal" },
    { id: "2", name: "Sita Devi", age: 38, time: "3:00 PM", status: "in-progress", complaint: "Chest pain", priority: "high" },
    { id: "3", name: "Rajesh Kumar", age: 52, time: "3:30 PM", status: "scheduled", complaint: "Diabetes checkup", priority: "normal" }
  ];

  const handleStartConsultation = (patientId: string) => {
    alert("Backend connection required");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-light/40 via-background to-wellness-light/20">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-wellness">
              {t("dashboard.sahayak_title")}
            </h1>
          </div>
          <Card className="bg-white/80 border border-wellness/30 shadow-sm">
            <div className="p-4 text-center space-y-1">
              <p className="text-sm text-wellness">Health Assistant</p>
              <p className="text-lg font-semibold">{user?.email || "Health Assistant"}</p>
              <p className="text-sm text-muted-foreground">
                ASHA Worker • Nabha Health Center
              </p>
            </div>
          </Card>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Status Overview */}
        <section className="mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="health-card text-center">
              <div className="icon-large bg-primary-light text-primary mx-auto mb-2">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Today's Patients</h3>
              <p className="text-2xl font-bold text-primary">8</p>
              <p className="text-sm text-muted-foreground">3 pending</p>
            </Card>
            
            <Card className="health-card text-center">
              <div className="icon-large bg-success-light text-success mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Completed</h3>
              <p className="text-2xl font-bold text-success">5</p>
              <p className="text-sm text-muted-foreground">consultations</p>
            </Card>
            
            <Card className="health-card text-center">
              <div className="icon-large bg-warning-light text-warning mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Avg. Time</h3>
              <p className="text-2xl font-bold text-warning">12</p>
              <p className="text-sm text-muted-foreground">minutes</p>
            </Card>
            
            <Card className="health-card text-center">
              <div className="icon-large bg-accent-light text-accent mx-auto mb-2">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Equipment</h3>
              <p className="text-2xl font-bold text-accent">5/6</p>
              <p className="text-sm text-muted-foreground">connected</p>
            </Card>
          </div>
        </section>

        {/* Equipment Status */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Digital Health Kit Status</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentStatus.map((equipment, index) => (
              <Card key={index} className="health-card">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${equipment.status === "connected" ? "bg-success" : "bg-emergency"}`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{equipment.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Battery
                        className={`w-3 h-3 ${
                          equipment.battery > 50
                            ? "text-success"
                            : equipment.battery > 20
                            ? "text-warning"
                            : "text-emergency"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">{equipment.battery}%</span>
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      equipment.status === "connected"
                        ? "bg-success-light text-success"
                        : "bg-emergency-light text-emergency"
                    }`}
                  >
                    {equipment.status}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Today's Patients */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Patients</h2>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-success" />
              <span className="text-sm text-success">Online</span>
            </div>
          </div>

          <div className="space-y-4">
            {todayPatients.map((patient) => (
              <Card
                key={patient.id}
                className={`health-card cursor-pointer hover:shadow-[var(--shadow-card)] transition-all ${
                  selectedPatient === patient.id ? "ring-2 ring-wellness bg-wellness-light" : ""
                } ${patient.priority === "high" ? "border-l-4 border-l-emergency" : ""}`}
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{patient.name}</h3>
                      <span className="text-sm text-muted-foreground">({patient.age} years)</span>
                      {patient.priority === "high" && <AlertTriangle className="w-4 h-4 text-emergency" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{patient.complaint}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{patient.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        patient.status === "waiting"
                          ? "bg-warning-light text-warning"
                          : patient.status === "in-progress"
                          ? "bg-primary-light text-primary"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {patient.status.replace("-", " ")}
                    </span>
                    <div className="flex gap-2 mt-2">
                      {/* Start Consultation */}
                      <Button
                        size="sm"
                        className="bg-wellness hover:bg-wellness/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConsultation(patient.id);
                        }}
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Start
                      </Button>

                      {/* View Report */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open("/dummy.pdf", "_blank");
                        }}
                      >
                        View Report
                      </Button>

                      {/* Download Report */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = "/dummy.pdf";
                          link.download = "patient-report.pdf";
                          link.click();
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="health-card cursor-pointer hover:scale-105 transition-all">
              <div className="text-center">
                <div className="icon-large bg-primary-light text-primary mx-auto mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Emergency Call</h3>
                <p className="text-sm text-muted-foreground">Connect to emergency services</p>
              </div>
            </Card>
            
            <Card className="health-card cursor-pointer hover:scale-105 transition-all">
              <div className="text-center">
                <div className="icon-large bg-wellness-light text-wellness mx-auto mb-3">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Health Checkup</h3>
                <p className="text-sm text-muted-foreground">Start routine examination</p>
              </div>
            </Card>
            
            <Card className="health-card cursor-pointer hover:scale-105 transition-all">
              <div className="text-center">
                <div className="icon-large bg-accent-light text-accent mx-auto mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Schedule Visit</h3>
                <p className="text-sm text-muted-foreground">Book appointment for patient</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Training & Support */}
        <section>
          <Card className="health-card bg-success-light">
            <div className="flex items-center gap-4">
              <div className="icon-large bg-success text-success-foreground">
                <Heart className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-success">Need Help?</h3>
                <p className="text-success text-sm mb-3">
                  Get support with equipment or procedures
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-success text-success">
                    Training Videos
                  </Button>
                  <Button variant="outline" size="sm" className="border-success text-success">
                    Call Support
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default SahayakDashboard;
