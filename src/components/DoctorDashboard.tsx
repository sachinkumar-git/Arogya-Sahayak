import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Video,
  Users,
  Clock,
  FileText,
  Stethoscope,
  Activity,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mic,
  Camera,
  Monitor,
  Pill,
  X
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@supabase/supabase-js";

interface DoctorDashboardProps {
  onBack: () => void;
  user: User | null;
}

const DoctorDashboard = ({ onBack, user }: DoctorDashboardProps) => {
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [activeCall, setActiveCall] = useState<boolean>(false);
  const [showPdf, setShowPdf] = useState<boolean>(false);
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const waitingPatients = [
    {
      id: "1",
      name: "Ram Singh",
      age: 45,
      village: "Nabha",
      sahayak: "Priya Sharma",
      complaint: "Fever, headache, body ache for 3 days",
      vitals: { bp: "140/90", temp: "102°F", pulse: "85", spo2: "96%" },
      priority: "normal",
      waitTime: "5 mins",
      pdf: "/sample-reports/ram-singh.pdf"
    },
    {
      id: "2",
      name: "Sita Devi",
      age: 38,
      village: "Ghanaur",
      sahayak: "Raj Kumar",
      complaint: "Chest pain, shortness of breath",
      vitals: { bp: "160/100", temp: "98.6°F", pulse: "110", spo2: "94%" },
      priority: "high",
      waitTime: "2 mins",
      pdf: "/sample-reports/sita-devi.pdf"
    },
    {
      id: "3",
      name: "Rajesh Kumar",
      age: 52,
      village: "Nabha",
      sahayak: "Priya Sharma",
      complaint: "Diabetes follow-up, medication review",
      vitals: { bp: "130/85", temp: "98.4°F", pulse: "78", spo2: "98%" },
      priority: "normal",
      waitTime: "12 mins",
      pdf: "/sample-reports/rajesh-kumar.pdf"
    }
  ];

  const todayStats = {
    consultations: 15,
    avgTime: 8,
    pending: 3,
    completed: 12
  };

  const handleStartConsultation = async (patientId: string) => {
    setActiveCall(true);
    setSelectedPatient(patientId);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Could not access your camera/microphone.");
    }
  };

  const handleEndCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setActiveCall(false);
    setSelectedPatient("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">
              {t("dashboard.doctor_title")}
            </h1>
          </div>

          <div>
            <p className="text-sm opacity-90 mb-1">Telemedicine Doctor</p>
            <p className="text-lg font-semibold">{user?.email || "Dr. Doctor"}</p>
            <p className="text-sm opacity-80">
              MBBS, MD • General Medicine • 15+ years experience
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm">Online</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-sm">Available till 10 PM</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Stats Overview */}
        <section className="mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="health-card text-center">
              <div className="icon-large bg-primary-light text-primary mx-auto mb-2">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Today's Consultations</h3>
              <p className="text-2xl font-bold text-primary">
                {todayStats.consultations}
              </p>
              <p className="text-sm text-muted-foreground">
                {todayStats.pending} pending
              </p>
            </Card>

            <Card className="health-card text-center">
              <div className="icon-large bg-success-light text-success mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Completed</h3>
              <p className="text-2xl font-bold text-success">
                {todayStats.completed}
              </p>
              <p className="text-sm text-muted-foreground">consultations</p>
            </Card>

            <Card className="health-card text-center">
              <div className="icon-large bg-wellness-light text-wellness mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Avg. Time</h3>
              <p className="text-2xl font-bold text-wellness">
                {todayStats.avgTime}
              </p>
              <p className="text-sm text-muted-foreground">minutes</p>
            </Card>

            <Card className="health-card text-center">
              <div className="icon-large bg-warning-light text-warning mx-auto mb-2">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">High Priority</h3>
              <p className="text-2xl font-bold text-warning">1</p>
              <p className="text-sm text-muted-foreground">urgent case</p>
            </Card>
          </div>
        </section>

        {/* Active Call */}
        {activeCall && (
          <section className="mb-6">
            <Card className="health-card bg-primary-light">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-primary">Live Consultation</h2>
                <p className="text-muted-foreground">
                  Connected with Sahayak & Patient
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-background rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Video Feed</h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    {activeCall ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <Camera className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Real-time Vitals</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Heart Rate:</span>
                      <span className="font-semibold text-emergency">85 bpm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blood Pressure:</span>
                      <span className="font-semibold">140/90 mmHg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SpO2:</span>
                      <span className="font-semibold text-success">96%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span className="font-semibold text-warning">102°F</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  <Mic className="w-4 h-4 mr-2" />
                  Mute
                </Button>
                <Button variant="outline" size="sm">
                  <Monitor className="w-4 h-4 mr-2" />
                  Screen Share
                </Button>
                <Button variant="outline" size="sm">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Listen to Heart
                </Button>
                <Button className="emergency-btn" onClick={handleEndCall}>
                  End Call
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* Waiting Patients */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Patient Queue</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success">Accepting Patients</span>
            </div>
          </div>

          <div className="space-y-4">
            {waitingPatients.map((patient) => (
              <Card
                key={patient.id}
                className={`health-card cursor-pointer hover:shadow-[var(--shadow-card)] transition-all ${
                  selectedPatient === patient.id
                    ? "ring-2 ring-primary bg-primary-light"
                    : ""
                } ${
                  patient.priority === "high"
                    ? "border-l-4 border-l-emergency"
                    : ""
                }`}
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Patient Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          ({patient.age}y)
                        </span>
                        {patient.priority === "high" && (
                          <AlertTriangle className="w-4 h-4 text-emergency" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {patient.village} • via {patient.sahayak}
                      </p>
                      <p className="text-sm mt-1">{patient.complaint}</p>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="bg-secondary rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Current Vitals</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        BP: <span className="font-semibold">{patient.vitals.bp}</span>
                      </div>
                      <div>
                        Temp:{" "}
                        <span className="font-semibold">{patient.vitals.temp}</span>
                      </div>
                      <div>
                        Pulse:{" "}
                        <span className="font-semibold">{patient.vitals.pulse}</span>
                      </div>
                      <div>
                        SpO2:{" "}
                        <span className="font-semibold">{patient.vitals.spo2}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-between">
                    <div className="text-right mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          patient.priority === "high"
                            ? "bg-emergency-light text-emergency"
                            : "bg-warning-light text-warning"
                        }`}
                      >
                        Waiting {patient.waitTime}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConsultation(patient.id);
                        }}
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient.id);
                          setShowPdf(true);
                        }}
                      >
                        <FileText className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* PDF Modal */}
        {showPdf && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] relative">
              <button
                className="absolute top-3 right-3 text-gray-600 hover:text-black"
                onClick={() => setShowPdf(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                src={
                  waitingPatients.find((p) => p.id === selectedPatient)?.pdf ||
                  "/sample-reports/dummy.pdf"
                }
                className="w-full h-full rounded-b-lg"
                title="Patient Report"
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="health-card cursor-pointer hover:scale-105 transition-all">
              <div className="text-center">
                <div className="icon-large bg-emergency-light text-emergency mx-auto mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Emergency</h3>
                <p className="text-sm text-muted-foreground">Urgent consultation</p>
              </div>
            </Card>

            <Card className="health-card cursor-pointer hover:scale-105 transition-all">
              <div className="text-center">
                <div className="icon-large bg-wellness-light text-wellness mx-auto mb-3">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Prescriptions</h3>
                <p className="text-sm text-muted-foreground">Digital prescriptions</p>
              </div>
            </Card>

            <Card className="health-card cursor-pointer hover:scale-105 transition-all">
              <div className="text-center">
                <div className="icon-large bg-accent-light text-accent mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Records</h3>
                <p className="text-sm text-muted-foreground">Patient history</p>
              </div>
            </Card>

            <Card className="health-card cursor-pointer hover:scale-105 transition-all">
              <div className="text-center">
                <div className="icon-large bg-primary-light text-primary mx-auto mb-3">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">Daily reports</p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorDashboard;
