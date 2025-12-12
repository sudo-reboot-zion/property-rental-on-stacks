import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";

import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import LearnMore from "./pages/LearnMore";
import HostLayout from "./layouts/HostLayout";
import Dashboard from "./pages/host/Dashboard";
import CreateListing from "./pages/host/CreateListing";
import MyListings from "./pages/host/MyListings";
import AdminDisputes from "./pages/admin/AdminDisputes";
import { Navigate } from "react-router-dom";
import AIChatButton from "./components/AIChatButton";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />

          {/* Host Routes */}
          <Route path="/host" element={<HostLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-listing" element={<CreateListing />} />
            <Route path="listings" element={<MyListings />} />
            <Route index element={<Navigate to="/host/dashboard" replace />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/disputes" element={<AdminDisputes />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatButton />
        <ScrollToTop />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
