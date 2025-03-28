import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Barbers from "@/pages/barbers";
import Services from "@/pages/services";
import Clients from "@/pages/clients";
import Appointments from "@/pages/appointments";
import Products from "@/pages/products";
import Sales from "@/pages/sales";
import Reports from "@/pages/reports";
import Sidebar from "@/components/layout/Sidebar";
import MobileMenu from "@/components/layout/MobileMenu";
import Header from "@/components/layout/Header";
import { useState } from "react";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onMobileMenuToggle={toggleMobileMenu} />
          <main className="flex-1 overflow-y-auto md:pt-0 pt-16 pb-6 px-4 md:px-6 bg-gray-100">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/barbers" component={Barbers} />
              <Route path="/services" component={Services} />
              <Route path="/clients" component={Clients} />
              <Route path="/appointments" component={Appointments} />
              <Route path="/products" component={Products} />
              <Route path="/sales" component={Sales} />
              <Route path="/reports" component={Reports} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
