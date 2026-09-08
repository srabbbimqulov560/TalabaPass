import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import { LanguageProvider } from '@/lib/i18n';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { supabase } from '@/lib/supabase'; // Supabase ulandi
import ServicesPage from '@/pages/services';

// Sahifalar
import HomePage from '@/pages/home';
import DiscountDetailPage from '@/pages/discount-detail';
import ProfilePage from '@/pages/profile';
import NotFound from '@/pages/not-found';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import CashierPage from '@/pages/cashier';
import SavedPage from '@/pages/saved';
import QrPage from '@/pages/qr';

const queryClient = new QueryClient();

function Router() {
  const [location, setLocation] = useLocation();
  const [session, setSession] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const publicPaths = ['/login', '/signup', '/cashier'];

  useEffect(() => {
    // Supabase orqali joriy xavfsiz sessiyani olish
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    // Foydalanuvchi kirganida/chiqqanida avtomatik kuzatish
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    if (!session && !publicPaths.includes(location)) {
      setLocation('/signup');
    }
    
    if (session && publicPaths.includes(location)) {
      setLocation('/');
    }
  }, [location, setLocation, session, isInitializing]);

  if (isInitializing) return null; // Yuklanayotganda oq ekran miltillashidan himoya

  if (!session && !publicPaths.includes(location)) return null;
  if (session && publicPaths.includes(location)) return null;

  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/cashier" component={CashierPage} />

        <Route>
          <AppShell>
            <Switch>
              <Route path="/services" component={ServicesPage} />
              <Route path="/saved" component={SavedPage} />
              <Route path="/" component={HomePage} />
              <Route path="/discount/:id" component={DiscountDetailPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/qr" component={QrPage} />
              <Route component={NotFound} />
            </Switch>
          </AppShell>
        </Route>
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