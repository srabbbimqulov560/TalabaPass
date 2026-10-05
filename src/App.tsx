import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from '@/lib/i18n';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { supabase } from '@/lib/supabase'; 
import { TalabaLoader } from '@/components/TalabaLoader';

// --- ASOSIY SAHIFALAR ---
import ForgotPassword from '@/pages/forgot-password';
import NotificationsPage from '@/pages/notifications';
import NotFound from '@/pages/not-found';

// --- ADMIN UCHUN SAHIFALAR ---
import AdminDashboard from '@/admin/AdminDashboard';
import MerchantsManager from '@/admin/MerchantsManager';
import StudentsManager from '@/admin/StudentsManager';
import DiscountsManager from '@/admin/DiscountsManager';
import StudentsReport from '@/admin/StudentsReport';
import MerchantsReport from '@/admin/MerchantsReport';
import ScansReport from '@/admin/ScansReport';
import SystemLogs from '@/admin/SystemLogs';
import Announcements from '@/admin/Announcements';
import AdminCarousel from '@/admin/carousel';

// --- TALABALAR UCHUN SAHIFALAR ---
import { AppShell } from '@/components/app-shell';
import HomePage from '@/pages/home';
import ServicesPage from '@/pages/Services';
import StoreDetailPage from '@/pages/store-detail';
import SavedPage from '@/pages/saved';
import ProfilePage from '@/pages/profile';
import QrPage from '@/pages/qr';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import CashierPage from '@/pages/cashier';
import DiscountDetailPage from '@/pages/discount-detail';
import DiscountListPage from '@/pages/discount-list';

// --- BIZNES (DO'KONLAR) UCHUN SAHIFALAR ---
import { MerchantAppShell } from '@/components/app-shell';
import MerchantSignup from '@/merchantpass/signup';
import MerchantLogin from '@/merchantpass/login';
import MerchantHome from '@/merchantpass/home';
import MerchantDiscounts from '@/merchantpass/discounts';
import MerchantScanner from '@/merchantpass/scanner';
import MerchantHistory from '@/merchantpass/history';
import MerchantProfile from '@/merchantpass/profile';
import MerchantPurchases from '@/merchantpass/purchases';

const queryClient = new QueryClient();

function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation(to); }, [to, setLocation]);
  return null;
}

function ForceLogoutRedirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    supabase.auth.signOut().then(() => setLocation(to));
  }, [to, setLocation]);
  return null;
}

function Router() {
  const [location] = useLocation();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'merchant' | 'admin' | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkRoleAndStatus = async (userId: string) => {
      try {
        const [adminRes, merchantRes, studentRes] = await Promise.all([
          supabase.from('admins').select('id').eq('id', userId).maybeSingle(),
          supabase.from('merchants').select('id, is_active').eq('id', userId).maybeSingle(),
          supabase.from('students').select('id, is_active').eq('id', userId).maybeSingle()
        ]);
        if (adminRes.data) return { role: 'admin', active: true };
        if (merchantRes.data) return { role: 'merchant', active: !!merchantRes.data.is_active };
        if (studentRes.data) return { role: 'student', active: !!studentRes.data.is_active };
        
        if (window.location.pathname.includes('/merchant')) return { role: 'merchant', active: false };
        return { role: 'student', active: false };
      } catch (e) {
        return { role: 'student', active: false };
      }
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session) {
        const { role, active } = await checkRoleAndStatus(session.user.id);
        if (mounted) {
          setSession(session);
          setUserRole(role as any);
          setIsActive(active);
          setIsInitializing(false);
        }
      } else {
        if (mounted) setIsInitializing(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      if (newSession) {
        const { role, active } = await checkRoleAndStatus(newSession.user.id);
        if (mounted) {
          setSession(newSession);
          setUserRole(role as any);
          setIsActive(active);
          if (isInitializing) setIsInitializing(false); 
        }
      } else {
        setSession(null);
        setUserRole(null);
        setIsActive(false);
        setIsInitializing(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isInitializing) {
    return <TalabaLoader fullScreen={true} />;
  }

  const isMerchantRoute = location.startsWith('/merchant');

  if (!session) {
    return (
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/merchant/login" component={MerchantLogin} />
          <Route path="/merchant/signup" component={MerchantSignup} />
          <Route path="/cashier" component={CashierPage} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route><Redirect to={isMerchantRoute ? '/merchant/login' : '/login'} /></Route>
        </Switch>
      </RoutedErrorBoundary>
    );
  }

  if (!isActive && userRole !== 'admin') {
    if (userRole === 'merchant') {
      return (
        <Switch>
          <Route path="/merchant/signup" component={MerchantSignup} />
          <Route path="/merchant/login" component={MerchantLogin} />
          <Route><Redirect to="/merchant/signup" /></Route>
        </Switch>
      );
    }
    if (userRole === 'student') {
      return (
        <Switch>
          <Route path="/signup" component={SignupPage} />
          <Route><Redirect to="/signup" /></Route>
        </Switch>
      );
    }
  }

  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/login"><Redirect to="/" /></Route>
        <Route path="/signup"><Redirect to="/" /></Route>
        <Route path="/merchant/login"><Redirect to="/merchant" /></Route>
        <Route path="/merchant/signup"><Redirect to="/merchant" /></Route>

        {/* 🌟 YECHIM: REDIRECT OLIB TASHLANDI VA SAHIFA QO'YILDI */}
        {userRole === 'admin' && <Route path="/admin/carousel" component={AdminCarousel} />}
        {userRole === 'admin' && <Route path="/admin/announcements" component={Announcements} />}
        {userRole === 'admin' && <Route path="/admin" component={AdminDashboard} />}
        {userRole === 'admin' && <Route path="/admin/students-report" component={StudentsReport} />}
        {userRole === 'admin' && <Route path="/admin/merchants-report" component={MerchantsReport} />}
        {userRole === 'admin' && <Route path="/admin/scans-report" component={ScansReport} />}
        {userRole === 'admin' && <Route path="/admin/logs" component={SystemLogs} />}
        {userRole === 'admin' && <Route path="/admin/merchants" component={MerchantsManager} />}
        {userRole === 'admin' && <Route path="/admin/students" component={StudentsManager} />}
        {userRole === 'admin' && <Route path="/admin/discounts" component={DiscountsManager} />}

        {/* 🏪 BIZNES (DO'KON) HUDUDI */}
        {userRole === 'merchant' && (
          <MerchantAppShell>
            <Switch>
              <Route path="/merchant" component={MerchantHome} />
              <Route path="/merchant/purchases" component={MerchantPurchases} />
              <Route path="/merchant/discounts" component={MerchantDiscounts} />
              <Route path="/merchant/scanner" component={MerchantScanner} />
              <Route path="/merchant/history" component={MerchantHistory} />
              <Route path="/merchant/profile" component={MerchantProfile} />
              <Route><Redirect to="/merchant" /></Route>
            </Switch>
          </MerchantAppShell>
        )}

        {/* 🎓 TALABALAR VA ADMIN HUDUDI */}
        {(userRole === 'student' || userRole === 'admin') && (
          <AppShell>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/notifications" component={NotificationsPage} />
              <Route path="/services" component={ServicesPage} />
              <Route path="/store/:id" component={StoreDetailPage} />
              <Route path="/saved" component={SavedPage} />
              <Route path="/discount/:id" component={DiscountDetailPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/qr" component={QrPage} />
              <Route path="/list/:type" component={DiscountListPage} />
              
              {/* O'chirilgan URL'lar uchun 404 sahifa chiqadi */}
              <Route component={NotFound} />
            </Switch>
          </AppShell>
        )}
      </Switch>
    </RoutedErrorBoundary>
  );
}

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