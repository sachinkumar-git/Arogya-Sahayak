import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Video, 
  MessageCircle, 
  Mic, 
  Star, 
  Clock, 
  Phone,
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  Stethoscope
} from "lucide-react";

interface ConsultationBookingProps {
  onBack: () => void;
}

const ConsultationBooking = ({ onBack }: ConsultationBookingProps) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [consultationType, setConsultationType] = useState<'video' | 'audio' | 'chat'>('video');

  const specialties = [
    { id: 'general', name: 'General Medicine', icon: Stethoscope, color: 'primary' },
    { id: 'pediatric', name: 'Child Care', icon: Baby, color: 'wellness' },
    { id: 'cardiology', name: 'Heart Problems', icon: Heart, color: 'emergency' },
    { id: 'orthopedic', name: 'Bone & Joint', icon: Bone, color: 'accent' },
    { id: 'mental', name: 'Mental Health', icon: Brain, color: 'success' },
    { id: 'eye', name: 'Eye Care', icon: Eye, color: 'warning' }
  ];

  const doctors = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      specialty: 'General Medicine',
      rating: 4.8,
      experience: '12 years',
      languages: 'Hindi, Punjabi, English',
      nextAvailable: '10 mins',
      fee: '₹150'
    },
    {
      id: '2', 
      name: 'Dr. Rajesh Kumar',
      specialty: 'General Medicine',
      rating: 4.7,
      experience: '8 years',
      languages: 'Hindi, English',
      nextAvailable: '25 mins',
      fee: '₹120'
    },
    {
      id: '3',
      name: 'Dr. Meera Singh',
      specialty: 'Child Care',
      rating: 4.9,
      experience: '15 years',
      languages: 'Hindi, Punjabi',
      nextAvailable: '5 mins',
      fee: '₹200'
    }
  ];

  const handleBooking = () => {
    // This will be connected to backend functionality
    alert('Backend connection required');
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
            <h1 className="text-xl sm:text-2xl font-bold">Book Consultation</h1>
          </div>
          <p className="opacity-90">Choose your doctor and consultation type</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Step 1: Choose Specialty */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">1. Choose Medical Specialty</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.map((specialty) => {
              const IconComponent = specialty.icon;
              return (
                <Card
                  key={specialty.id}
                  className={`health-card cursor-pointer hover:scale-105 transition-all ${
                    selectedSpecialty === specialty.id ? 'ring-2 ring-primary bg-primary-light' : ''
                  }`}
                  onClick={() => setSelectedSpecialty(specialty.id)}
                >
                  <div className="text-center">
                    <div className={`icon-large bg-${specialty.color}-light text-${specialty.color} mx-auto mb-2`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-sm">{specialty.name}</h3>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Step 2: Choose Consultation Type */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">2. Consultation Type</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card
              className={`health-card cursor-pointer hover:scale-105 transition-all ${
                consultationType === 'video' ? 'ring-2 ring-primary bg-primary-light' : ''
              }`}
              onClick={() => setConsultationType('video')}
            >
              <div className="text-center">
                <div className="icon-large bg-primary-light text-primary mx-auto mb-2">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-medium">Video Call</h3>
                <p className="text-sm text-muted-foreground">See & talk to doctor</p>
              </div>
            </Card>
            <Card
              className={`health-card cursor-pointer hover:scale-105 transition-all ${
                consultationType === 'audio' ? 'ring-2 ring-wellness bg-wellness-light' : ''
              }`}
              onClick={() => setConsultationType('audio')}
            >
              <div className="text-center">
                <div className="icon-large bg-wellness-light text-wellness mx-auto mb-2">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-medium">Voice Call</h3>
                <p className="text-sm text-muted-foreground">Talk to doctor</p>
              </div>
            </Card>
            <Card
              className={`health-card cursor-pointer hover:scale-105 transition-all ${
                consultationType === 'chat' ? 'ring-2 ring-accent bg-accent-light' : ''
              }`}
              onClick={() => setConsultationType('chat')}
            >
              <div className="text-center">
                <div className="icon-large bg-accent-light text-accent mx-auto mb-2">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-medium">Chat</h3>
                <p className="text-sm text-muted-foreground">Text messages</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Step 3: Choose Doctor */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">3. Available Doctors</h2>
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Card
                key={doctor.id}
                className={`health-card cursor-pointer hover:shadow-[var(--shadow-primary)] transition-all ${
                  selectedDoctor === doctor.id ? 'ring-2 ring-primary bg-primary-light' : ''
                }`}
                onClick={() => setSelectedDoctor(doctor.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span>{doctor.rating}</span>
                      </div>
                      <span>{doctor.experience}</span>
                      <span>{doctor.languages}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-primary">{doctor.fee}</p>
                    <div className="flex items-center gap-1 text-success text-sm">
                      <Clock className="w-3 h-3" />
                      <span>{doctor.nextAvailable}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Voice Input Option */}
        <section className="mb-8">
          <Card className="health-card bg-wellness-light">
            <div className="flex items-center gap-4">
              <div className="icon-large bg-wellness text-wellness-foreground">
                <Mic className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Voice Description</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your symptoms in Punjabi, Hindi, or English
                </p>
              </div>
              <Button variant="outline" className="border-wellness text-wellness">
                Start Recording
              </Button>
            </div>
          </Card>
        </section>

        {/* Book Button */}
        <div className="sticky bottom-4">
          <Button 
            className="w-full btn-large bg-gradient-to-r from-primary to-wellness hover:shadow-[var(--shadow-primary)]"
            disabled={!selectedSpecialty || !selectedDoctor}
            onClick={handleBooking}
          >
            Book Consultation - {selectedDoctor ? doctors.find(d => d.id === selectedDoctor)?.fee : '₹0'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationBooking;