import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="text-center p-6">
        <div className="icon-large bg-emergency-light text-emergency mx-auto mb-6">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-xl text-muted-foreground">Page Not Found</h2>
        <p className="mb-6 text-muted-foreground max-w-md">
          The page you're looking for doesn't exist. Please check the URL or return to the homepage.
        </p>
        <Button asChild className="btn-large bg-primary hover:bg-primary/90">
          <a href="/">
            <Home className="w-5 h-5 mr-2" />
            Return to Arogya Sahayak
          </a>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;
