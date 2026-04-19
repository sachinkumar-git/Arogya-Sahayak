import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  Upload, 
  QrCode, 
  Heart, 
  Thermometer,
  Activity,
  Calendar,
  User,
  Phone,
  Share2
} from "lucide-react";

interface HealthRecordsProps {
  onBack: () => void;
}

const HealthRecords = ({ onBack }: HealthRecordsProps) => {
  const [selectedRecord, setSelectedRecord] = useState<string>("");

  const vitalSigns = {
    bloodPressure: "120/80 mmHg",
    heartRate: "72 bpm",
    temperature: "98.6°F",
    weight: "65 kg",
    height: "5'6\"",
    lastUpdated: "2 hours ago"
  };

  const medicalHistory = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'Consultation',
      doctor: 'Dr. Priya Sharma',
      condition: 'Common Cold',
      prescription: 'Paracetamol, Rest',
      status: 'Completed'
    },
    {
      id: '2',
      date: '2024-01-10',
      type: 'Lab Test',
      doctor: 'Dr. Rajesh Kumar',
      condition: 'Blood Test',
      prescription: 'CBC, Blood Sugar',
      status: 'Normal'
    },
    {
      id: '3',
      date: '2024-01-05',
      type: 'Vaccination',
      doctor: 'Village Health Center',
      condition: 'COVID-19 Booster',
      prescription: 'Covaxin',
      status: 'Completed'
    }
  ];

  const handleGenerateQR = () => {
    alert('Backend connection required');
  };

  const handleShareRecord = () => {
    alert('Backend connection required');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-accent text-accent-foreground p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Health Records</h1>
          </div>
          <p className="opacity-90">Your complete health information</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Patient Info Card */}
        <section className="mb-6">
          <Card className="health-card bg-accent-light">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">राम सिंह - Ram Singh</h2>
                <p className="text-muted-foreground">Age: 45 | Male</p>
                <p className="text-muted-foreground">Village: Nabha, Punjab</p>
                <p className="text-muted-foreground">Phone: +91 98765 43210</p>
              </div>
              <div className="text-right">
                <Button variant="outline" size="sm" onClick={handleGenerateQR}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Card
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Vital Signs */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Vital Signs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="health-card text-center">
              <div className="icon-large bg-emergency-light text-emergency mx-auto mb-2">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Blood Pressure</h3>
              <p className="text-lg font-bold text-emergency">{vitalSigns.bloodPressure}</p>
              <p className="text-xs text-muted-foreground">Normal</p>
            </Card>
            
            <Card className="health-card text-center">
              <div className="icon-large bg-success-light text-success mx-auto mb-2">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Heart Rate</h3>
              <p className="text-lg font-bold text-success">{vitalSigns.heartRate}</p>
              <p className="text-xs text-muted-foreground">Normal</p>
            </Card>
            
            <Card className="health-card text-center">
              <div className="icon-large bg-warning-light text-warning mx-auto mb-2">
                <Thermometer className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Temperature</h3>
              <p className="text-lg font-bold text-warning">{vitalSigns.temperature}</p>
              <p className="text-xs text-muted-foreground">Normal</p>
            </Card>
            
            <Card className="health-card text-center">
              <div className="icon-large bg-primary-light text-primary mx-auto mb-2">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Weight</h3>
              <p className="text-lg font-bold text-primary">{vitalSigns.weight}</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Last updated: {vitalSigns.lastUpdated}
          </p>
        </section>

        {/* Medical History */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Medical History</h2>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
          
          <div className="space-y-4">
            {medicalHistory.map((record) => (
              <Card
                key={record.id}
                className={`health-card cursor-pointer hover:shadow-[var(--shadow-card)] transition-all ${
                  selectedRecord === record.id ? 'ring-2 ring-accent bg-accent-light' : ''
                }`}
                onClick={() => setSelectedRecord(record.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="icon-large bg-secondary text-secondary-foreground">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{record.condition}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'Completed' ? 'bg-success-light text-success' :
                        record.status === 'Normal' ? 'bg-wellness-light text-wellness' :
                        'bg-warning-light text-warning'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {record.type} • {record.doctor}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {record.prescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{record.date}</span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="health-card cursor-pointer hover:scale-105 transition-all" onClick={handleShareRecord}>
              <div className="flex items-center gap-4">
                <div className="icon-large bg-primary-light text-primary">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Share with Doctor</h3>
                  <p className="text-sm text-muted-foreground">
                    Share selected records for consultation
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="health-card cursor-pointer hover:scale-105 transition-all">
              <div className="flex items-center gap-4">
                <div className="icon-large bg-wellness-light text-wellness">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Download Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Get PDF copy of all records
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Emergency Contact Info */}
        <section>
          <Card className="health-card bg-emergency-light">
            <div className="text-center">
              <div className="icon-large bg-emergency text-emergency-foreground mx-auto mb-4">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-emergency mb-2">Emergency Contact</h3>
              <p className="text-emergency mb-4">
                In case of emergency, these records will be shared automatically
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Emergency Contact:</strong> Sita Singh (Wife)</p>
                <p><strong>Phone:</strong> +91 98765 43211</p>
                <p><strong>Blood Group:</strong> B+</p>
                <p><strong>Allergies:</strong> None known</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default HealthRecords;