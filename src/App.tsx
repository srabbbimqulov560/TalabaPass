import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import { LanguageProvider } from '@/lib/i18n';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

// Sahifalar
import HomePage from '@/pages/home';
import DiscountDetailPage from '@/pages/discount-detail';
import ProfilePage from '@/pages/profile';
import NotFound from '@/pages/not-found';
import LoginPage from '@/pages/login';    // Yangi qo'shildi
import SignupPage from '@/pages/signup';  // Yangi qo'shildi
import CashierPage from '@/pages/cashier';// Yangi qo'shildi

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        {/* Avtorizatsiya sahifalari menyusiz (to'liq ekran) ko'rinadi */}
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/cashier" component={CashierPage} />

        {/* Qolgan barcha sahifalar Header va Footer (AppShell) bilan ko'rinadi */}
        <Route>
          <AppShell>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/discount/:id" component={DiscountDetailPage} />
              <Route path="/profile" component={ProfilePage} />
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