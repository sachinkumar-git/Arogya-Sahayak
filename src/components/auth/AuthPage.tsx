import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "@/components/LanguageSelector";

interface AuthPageProps {
  onAuthSuccess: (userType: 'patient' | 'sahayak' | 'doctor') => void;
  onBack: () => void;
}

const AuthPage = ({ onAuthSuccess, onBack }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    village: '',
    userType: 'patient' as 'patient' | 'sahayak' | 'doctor'
  });

  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          onAuthSuccess(profile.user_type);
        }
      }
    };

    checkUser();
  }, [onAuthSuccess]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: t('common.error'),
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          toast({
            title: t('common.success'),
            description: t('auth.login_success')
          });
          onAuthSuccess(profile.user_type);
        }
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      toast({
        title: t('common.error'),
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
            phone_number: formData.phoneNumber,
            village: formData.village
          }
        }
      });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('auth.signup_success')
      });

      onAuthSuccess(formData.userType);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-background">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              ← {t('common.back')}
            </Button>
            <div className="flex items-center gap-2">
              <div className="icon-large bg-primary text-primary-foreground">
                <Heart className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                {t('landing.title')}
              </h1>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Auth Form */}
      <section className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-md mx-auto">
          <Card className="health-card">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? t('auth.login') : t('auth.signup')}
              </h2>
              <p className="text-muted-foreground">
                {isLogin 
                  ? 'Welcome back to Arogya Sahayak' 
                  : 'Join the Arogya Sahayak community'
                }
              </p>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="fullName">{t('auth.full_name')} *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="userType">{t('auth.user_type')} *</Label>
                    <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">{t('landing.patient')}</SelectItem>
                        <SelectItem value="sahayak">{t('landing.sahayak')}</SelectItem>
                        <SelectItem value="doctor">{t('landing.doctor')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">{t('auth.phone_number')}</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="village">{t('auth.village')}</Label>
                    <Input
                      id="village"
                      type="text"
                      value={formData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email">{t('auth.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">{t('auth.password')} *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="mt-1 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword">{t('auth.confirm_password')} *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <Button
                className="w-full btn-large"
                onClick={isLogin ? handleLogin : handleSignup}
                disabled={loading}
              >
                {loading ? t('common.loading') : (isLogin ? t('auth.login') : t('auth.signup'))}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary"
                >
                  {isLogin 
                    ? `Don't have an account? ${t('auth.signup')}`
                    : `Already have an account? ${t('auth.login')}`
                  }
                </Button>
              </div>

              {isLogin && (
                <div className="text-center">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    {t('auth.forgot_password')}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;