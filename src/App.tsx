import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/lib/i18n';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { supabase } from '@/lib/supabase'; 
import { Loader2 } from 'lucide-react'; // Yuklanish belgisi

// --- TALABALAR UCHUN SAHIFALAR ---
import { AppShell } from '@/components/app-shell';
import HomePage from '@/pages/home';
import ServicesPage from '@/pages/services';
import SavedPage from '@/pages/saved';
import ProfilePage from '@/pages/profile';
import QrPage from '@/pages/qr';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import CashierPage from '@/pages/cashier';
import DiscountDetailPage from '@/pages/discount-detail';
import NotFound from '@/pages/not-found';

// --- BIZNES (DO'KONLAR) UCHUN SAHIFALAR ---
import { MerchantAppShell } from '@/merchantpass/app-shell';
import MerchantSignup from '@/merchantpass/signup';
import MerchantLogin from '@/merchantpass/login';
import MerchantHome from '@/merchantpass/home';
import MerchantDiscounts from '@/merchantpass/discounts';
import MerchantScanner from '@/merchantpass/scanner';
import MerchantHistory from '@/merchantpass/history';
import MerchantProfile from '@/merchantpass/profile';

const queryClient = new QueryClient();

// 1. Yangi: Maxsus xavfsiz yo'naltiruvchi komponent
function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

function Router() {
  const [location] = useLocation();
  const [session, setSession] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Supabase sessiyasini kuzatish
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ilova yuklanayotganda miltillash bo'lmasligi uchun
  if (isInitializing) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[hsl(var(--background))]">
        <Loader2 className="animate-spin text-[hsl(var(--accent))]" size={40} />
      </div>
    );
  }

  // Hozirgi manzil biznes paneliga tegishli ekanligini aniqlash
  const isMerchantRoute = location.startsWith('/merchant');

  // ==========================================
  // 1-HOLAT: FOYDALANUVCHI TIZIMGA KIRMAGAN (SESSIYA YO'Q)
  // ==========================================
  if (!session) {
    return (
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/merchant/login" component={MerchantLogin} />
          <Route path="/merchant/signup" component={MerchantSignup} />
          <Route path="/cashier" component={CashierPage} />
          
          {/* Ruxsatsiz yopiq sahifaga o'tishga urinsa loginga otib yuboradi */}
          <Route>
            <Redirect to={isMerchantRoute ? '/merchant/login' : '/login'} />
          </Route>
        </Switch>
      </RoutedErrorBoundary>
    );
  }

  // ==========================================
  // 2-HOLAT: FOYDALANUVCHI TIZIMDA BOR (SESSIYA MAVJUD)
  // ==========================================
  return (
    <RoutedErrorBoundary>
      <Switch>
        {/* Ro'yxatdan o'tishni to'liq tugatmagan (rasm yuklash bosqichidagi) odamlar ishlata olishi uchun */}
        <Route path="/signup" component={SignupPage} />
        <Route path="/merchant/signup" component={MerchantSignup} />

        {/* Tizimga kirib bo'lgan odam adashib loginga bossa, ichkariga qaytarib otamiz */}
        <Route path="/login"><Redirect to="/" /></Route>
        <Route path="/merchant/login"><Redirect to="/merchant" /></Route>

        {/* BARCHA ASOSIY VA YOPIQ SAHIFALAR QOBIQ (SHELL) ICHIDA */}
        <Route>
          {isMerchantRoute ? (
            // BIZNES (DO'KON) PANELIGA TEGISHLI SAHIFALAR
            <MerchantAppShell>
              <Switch>
                <Route path="/merchant" component={MerchantHome} />
                <Route path="/merchant/discounts" component={MerchantDiscounts} />
                <Route path="/merchant/scanner" component={MerchantScanner} />
                <Route path="/merchant/history" component={MerchantHistory} />
                <Route path="/merchant/profile" component={MerchantProfile} />
                <Route component={NotFound} />
              </Switch>
            </MerchantAppShell>
          ) : (
            // TALABALAR UCHUN TEGISHLI SAHIFALAR
            <AppShell>
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/services" component={ServicesPage} />
                <Route path="/saved" component={SavedPage} />
                <Route path="/discount/:id" component={DiscountDetailPage} />
                <Route path="/profile" component={ProfilePage} />
                <Route path="/qr" component={QrPage} />
                <Route component={NotFound} />
              </Switch>
            </AppShell>
          )}
        </Route>
      </Switch>
    </RoutedErrorBoundary>
  );
}

// Xatoliklarni chiroyli ushlash uchun maxsus himoya komponenti
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;