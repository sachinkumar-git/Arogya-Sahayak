import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle, 
  XCircle,
  Pill,
  Navigation,
  Star,
  Mic
} from "lucide-react";

interface MedicineFinderProps {
  onBack: () => void;
}

const MedicineFinder = ({ onBack }: MedicineFinderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<string>("");

  const commonMedicines = [
    { name: "Paracetamol", hindi: "पैरासिटामोल", usage: "Fever, Pain" },
    { name: "Crocin", hindi: "क्रोसिन", usage: "Fever" },
    { name: "Disprin", hindi: "डिस्प्रिन", usage: "Headache" },
    { name: "ORS", hindi: "ओआरएस", usage: "Dehydration" },
    { name: "Cetirizine", hindi: "सेटिरिज़ीन", usage: "Allergy" },
    { name: "Combiflam", hindi: "कॉम्बिफ्लाम", usage: "Pain, Fever" }
  ];

  const pharmacies = [
    {
      id: '1',
      name: 'Sharma Medical Store',
      distance: '0.5 km',
      timing: 'Open till 10 PM',
      phone: '+91 98765 43210',
      rating: 4.5,
      medicines: {
        'Paracetamol': { available: true, price: '₹15' },
        'Crocin': { available: true, price: '₹25' },
        'Disprin': { available: false, price: '₹18' },
        'ORS': { available: true, price: '₹12' }
      }
    },
    {
      id: '2',
      name: 'Punjab Pharmacy',
      distance: '1.2 km',
      timing: 'Open 24/7',
      phone: '+91 98765 43211',
      rating: 4.2,
      medicines: {
        'Paracetamol': { available: true, price: '₹16' },
        'Crocin': { available: false, price: '₹25' },
        'Disprin': { available: true, price: '₹18' },
        'ORS': { available: true, price: '₹10' }
      }
    },
    {
      id: '3',
      name: 'Village Health Center',
      distance: '2.0 km',
      timing: 'Open till 8 PM',
      phone: '+91 98765 43212',
      rating: 4.8,
      medicines: {
        'Paracetamol': { available: true, price: '₹12' },
        'Crocin': { available: true, price: '₹22' },
        'Disprin': { available: true, price: '₹16' },
        'ORS': { available: true, price: '₹8' }
      }
    }
  ];

  const handleVoiceSearch = () => {
    alert('Backend connection required');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-wellness text-wellness-foreground p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Find Medicines</h1>
          </div>
          <p className="opacity-90">Check availability at nearby pharmacies</p>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Search Section */}
        <section className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search medicine name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 h-12 text-lg"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleVoiceSearch}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>

          {/* Common Medicines */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Common Medicines</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {commonMedicines.map((medicine) => (
                <Card
                  key={medicine.name}
                  className={`health-card cursor-pointer hover:scale-105 transition-all text-center ${
                    selectedMedicine === medicine.name ? 'ring-2 ring-wellness bg-wellness-light' : ''
                  }`}
                  onClick={() => setSelectedMedicine(medicine.name)}
                >
                  <div className="icon-large bg-wellness-light text-wellness mx-auto mb-2">
                    <Pill className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-sm">{medicine.name}</h4>
                  <p className="text-xs text-muted-foreground">{medicine.hindi}</p>
                  <p className="text-xs text-wellness mt-1">{medicine.usage}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Results Section */}
        {selectedMedicine && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Availability for "{selectedMedicine}"</h2>
              <div className="icon-large bg-wellness-light text-wellness">
                <Pill className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4">
              {pharmacies.map((pharmacy) => {
                const medicine = pharmacy.medicines[selectedMedicine as keyof typeof pharmacy.medicines];
                if (!medicine) return null;

                return (
                  <Card key={pharmacy.id} className="health-card">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-wellness-light rounded-full flex items-center justify-center">
                        {medicine.available ? (
                          <CheckCircle className="w-6 h-6 text-success" />
                        ) : (
                          <XCircle className="w-6 h-6 text-emergency" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{pharmacy.distance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{pharmacy.timing}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-warning fill-current" />
                            <span>{pharmacy.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {medicine.available ? (
                          <>
                            <p className="font-semibold text-lg text-success">{medicine.price}</p>
                            <p className="text-sm text-success">Available</p>
                          </>
                        ) : (
                          <p className="text-sm text-emergency">Out of Stock</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                      {medicine.available && (
                        <Button size="sm" className="flex-1 bg-wellness hover:bg-wellness/90">
                          Reserve
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Upload Prescription */}
        <section className="mb-6">
          <Card className="health-card bg-accent-light">
            <div className="text-center">
              <div className="icon-large bg-accent text-accent-foreground mx-auto mb-4">
                <Pill className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">Have a Prescription?</h3>
              <p className="text-muted-foreground mb-4">
                Upload your prescription to check medicine availability
              </p>
              <Button variant="outline" className="border-accent text-accent">
                Upload Prescription
              </Button>
            </div>
          </Card>
        </section>

        {/* Emergency Medicine Request */}
        <section>
          <Button 
            className="w-full emergency-btn btn-large"
            onClick={() => alert('Backend connection required')}
          >
            <Phone className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="text-lg font-bold">Emergency Medicine Request</div>
              <div className="text-sm opacity-90">Call nearest pharmacy for urgent needs</div>
            </div>
          </Button>
        </section>
      </div>
    </div>
  );
};

export default MedicineFinder;