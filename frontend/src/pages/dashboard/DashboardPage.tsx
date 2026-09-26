import { useCurrentUser } from "@/context/SessionContext";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import SahayakDashboard from "./SahayakDashboard";

export default function DashboardPage() {
  const user = useCurrentUser();
  if (user.role === "doctor") return <DoctorDashboard />;
  if (user.role === "sahayak") return <SahayakDashboard />;
  return <PatientDashboard />;
}
