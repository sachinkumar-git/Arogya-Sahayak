-- Create enum for user types
CREATE TYPE user_type AS ENUM ('patient', 'sahayak', 'doctor');

-- Create enum for consultation status
CREATE TYPE consultation_status AS ENUM ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled');

-- Create enum for priority levels
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'emergency');

-- Create profiles table for all users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  village TEXT,
  preferred_language TEXT DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctors table for additional doctor info
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization TEXT,
  license_number TEXT,
  experience_years INTEGER,
  qualification TEXT,
  is_available BOOLEAN DEFAULT true,
  available_until TIMESTAMP WITH TIME ZONE,
  consultation_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sahayaks table for health assistants
CREATE TABLE public.sahayaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  health_center TEXT,
  certification TEXT,
  equipment_status JSONB DEFAULT '{}',
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id),
  doctor_id UUID REFERENCES public.profiles(id),
  sahayak_id UUID REFERENCES public.profiles(id),
  status consultation_status DEFAULT 'scheduled',
  priority priority_level DEFAULT 'normal',
  complaint TEXT,
  symptoms TEXT,
  vitals JSONB DEFAULT '{}',
  diagnosis TEXT,
  prescription TEXT,
  notes TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id),
  consultation_id UUID REFERENCES public.consultations(id),
  record_type TEXT NOT NULL, -- 'consultation', 'lab_result', 'prescription', etc.
  title TEXT NOT NULL,
  content JSONB,
  attachments TEXT[],
  recorded_by UUID REFERENCES public.profiles(id),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  dosage_form TEXT, -- 'tablet', 'syrup', 'injection', etc.
  strength TEXT,
  price DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacies table
CREATE TABLE public.pharmacies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT,
  phone_number TEXT,
  address TEXT,
  village TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacy inventory table
CREATE TABLE public.pharmacy_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id),
  medicine_id UUID NOT NULL REFERENCES public.medicines(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE,
  batch_number TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pharmacy_id, medicine_id, batch_number)
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id),
  doctor_id UUID REFERENCES public.profiles(id),
  sahayak_id UUID REFERENCES public.profiles(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  status consultation_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sahayaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for doctors (viewable by all for consultation purposes)
CREATE POLICY "Doctors are viewable by authenticated users" ON public.doctors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors can update their own info" ON public.doctors FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);
CREATE POLICY "Doctors can insert their own info" ON public.doctors FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);

-- RLS Policies for sahayaks (viewable by all for consultation purposes)
CREATE POLICY "Sahayaks are viewable by authenticated users" ON public.sahayaks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sahayaks can update their own info" ON public.sahayaks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);
CREATE POLICY "Sahayaks can insert their own info" ON public.sahayaks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);

-- RLS Policies for consultations
CREATE POLICY "Users can view consultations they're involved in" ON public.consultations FOR SELECT USING (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  sahayak_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can create consultations" ON public.consultations FOR INSERT WITH CHECK (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'patient')
);

CREATE POLICY "Doctors and sahayaks can update consultations" ON public.consultations FOR UPDATE USING (
  doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'doctor') OR
  sahayak_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'sahayak')
);

-- RLS Policies for health records
CREATE POLICY "Users can view health records they're involved in" ON public.health_records FOR SELECT USING (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  recorded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Healthcare providers can insert health records" ON public.health_records FOR INSERT WITH CHECK (
  recorded_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND user_type IN ('doctor', 'sahayak'))
);

-- RLS Policies for medicines (public read access)
CREATE POLICY "Medicines are viewable by authenticated users" ON public.medicines FOR SELECT TO authenticated USING (true);

-- RLS Policies for pharmacies (public read access)
CREATE POLICY "Pharmacies are viewable by authenticated users" ON public.pharmacies FOR SELECT TO authenticated USING (true);

-- RLS Policies for pharmacy inventory (public read access)
CREATE POLICY "Pharmacy inventory is viewable by authenticated users" ON public.pharmacy_inventory FOR SELECT TO authenticated USING (true);

-- RLS Policies for appointments
CREATE POLICY "Users can view appointments they're involved in" ON public.appointments FOR SELECT USING (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  sahayak_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'patient')
);

CREATE POLICY "All involved users can update appointments" ON public.appointments FOR UPDATE USING (
  patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  doctor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  sahayak_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, user_type, full_name, preferred_language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'user_type', 'patient')::user_type,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pharmacy_inventory_updated_at BEFORE UPDATE ON public.pharmacy_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.medicines (name, generic_name, manufacturer, dosage_form, strength, price, description) VALUES
('Paracetamol', 'Acetaminophen', 'Cipla', 'tablet', '500mg', 25.00, 'Pain reliever and fever reducer'),
('Amoxicillin', 'Amoxicillin', 'Sun Pharma', 'capsule', '250mg', 85.00, 'Antibiotic for bacterial infections'),
('Crocin', 'Paracetamol', 'GSK', 'tablet', '650mg', 30.00, 'Fever and pain relief'),
('Azithromycin', 'Azithromycin', 'Torrent', 'tablet', '500mg', 120.00, 'Antibiotic for respiratory infections'),
('ORS', 'Oral Rehydration Salt', 'Electral', 'powder', '21g', 15.00, 'Treatment for dehydration');

INSERT INTO public.pharmacies (name, owner_name, phone_number, address, village, is_active) VALUES
('Sharma Medical Store', 'Raj Kumar Sharma', '+91-9876543210', 'Main Market, Near Gurudwara', 'Nabha', true),
('City Pharmacy', 'Preet Singh', '+91-9876543211', 'Civil Hospital Road', 'Nabha', true),
('Wellness Pharmacy', 'Gurpreet Kaur', '+91-9876543212', 'Bus Stand Area', 'Ghanaur', true),
('Apollo Pharmacy', 'Mandeep Singh', '+91-9876543213', 'GT Road', 'Rajpura', true),
('Health Plus', 'Simran Kaur', '+91-9876543214', 'Village Center', 'Samana', true);

-- Insert sample inventory
INSERT INTO public.pharmacy_inventory (pharmacy_id, medicine_id, quantity, expiry_date, batch_number) VALUES
((SELECT id FROM public.pharmacies WHERE name = 'Sharma Medical Store'), (SELECT id FROM public.medicines WHERE name = 'Paracetamol'), 100, '2025-12-31', 'PC001'),
((SELECT id FROM public.pharmacies WHERE name = 'Sharma Medical Store'), (SELECT id FROM public.medicines WHERE name = 'Crocin'), 50, '2025-10-15', 'CR001'),
((SELECT id FROM public.pharmacies WHERE name = 'City Pharmacy'), (SELECT id FROM public.medicines WHERE name = 'Amoxicillin'), 25, '2025-11-30', 'AM001'),
((SELECT id FROM public.pharmacies WHERE name = 'Wellness Pharmacy'), (SELECT id FROM public.medicines WHERE name = 'ORS'), 200, '2026-06-15', 'OR001'),
((SELECT id FROM public.pharmacies WHERE name = 'Apollo Pharmacy'), (SELECT id FROM public.medicines WHERE name = 'Azithromycin'), 30, '2025-09-20', 'AZ001');