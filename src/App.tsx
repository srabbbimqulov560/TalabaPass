import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import { LanguageProvider } from '@/lib/i18n';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

// Sahifalar
// import MerchantSignup from '../../merchant talabapass/merchant-talabapass/src/pages/MerchantSignup';

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
  const token = localStorage.getItem('token');
  
  // Ochiq sahifalar ro'yxati (bu sahifalarga tokensiz ham kirish mumkin)
  const publicPaths = ['/login', '/signup', '/merchant-signup'];

  useEffect(() => {
    // 1. Yangi foydalanuvchi (token yo'q) yopiq sahifaga kirmasa -> Avtomatik Signup'ga otish
    if (!token && !publicPaths.includes(location)) {
      setLocation('/signup');
    }
    
    // 2. Tizimdagi foydalanuvchi (token bor) signup/login'ga kirmasa -> Avtomatik Asosiy(Dashbord)ga otish
    if (token && publicPaths.includes(location)) {
      setLocation('/');
    }
  }, [location, setLocation, token]);

  // Yo'naltirish vaqtida sahifa miltillab (flash) ko'rinib qolmasligi uchun himoya
  if (!token && !publicPaths.includes(location)) return null;
  if (token && publicPaths.includes(location)) return null;

  return (
    <RoutedErrorBoundary>
      <Switch>
        {/* Avtorizatsiya sahifalari menyusiz (to'liq ekran) ko'rinadi */}
        {/* <Route path="/merchant-signup" component={MerchantSignup} /> */}
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/cashier" component={CashierPage} />

        {/* Qolgan barcha sahifalar Header va Footer (AppShell) bilan ko'rinadi */}
        <Route>
          <AppShell>
            <Switch>
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
  // Sahifa yangilanganda ham Dark Mode saqlanib qolishi uchun
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