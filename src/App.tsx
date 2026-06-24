import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { BannerProvider } from "@/context/BannerContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import ScrollToTop from "./components/ScrollToTop";

// Lazy load de todas as páginas para reduzir o bundle inicial
const Index = lazy(() => import("./pages/Index"));
const Catalog = lazy(() => import("./pages/Catalog"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const MyAccount = lazy(() => import("./pages/customer/MyAccount"));
const MyOrders = lazy(() => import("./pages/customer/MyOrders"));
const OrderDetail = lazy(() => import("./pages/customer/OrderDetail"));
const MyAddresses = lazy(() => import("./pages/customer/MyAddresses"));
const Wishlist = lazy(() => import("./pages/customer/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const PaymentPending = lazy(() => import("./pages/PaymentPending"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Trocas = lazy(() => import("./pages/Trocas"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminDelivery = lazy(() => import("./pages/admin/AdminDelivery"));
const AdminShipping = lazy(() => import("./pages/admin/AdminShipping"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BannerProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Admin Routes - No Header/Footer */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="entregas" element={<AdminDelivery />} />
                <Route path="melhor-envio" element={<AdminShipping />} />
                <Route path="cupons" element={<AdminCoupons />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="configuracoes" element={<AdminSettings />} />
              </Route>

              {/* Public Routes with Header/Footer */}
              <Route
                path="*"
                element={
                  <>
                    <Header />
                    <CartSidebar />
                    <WhatsAppButton />
                    <MobileBottomNav />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/catalogo" element={<Catalog />} />
                      <Route path="/produto/:id" element={<ProductDetail />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/pagamento/sucesso" element={<PaymentSuccess />} />
                      <Route path="/pagamento/falha" element={<PaymentFailure />} />
                      <Route path="/pagamento/pendente" element={<PaymentPending />} />
                      <Route path="/termos" element={<Termos />} />
                      <Route path="/privacidade" element={<Privacidade />} />
                      <Route path="/trocas" element={<Trocas />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/cadastro" element={<Register />} />
                      <Route path="/recuperar-senha" element={<ForgotPassword />} />
                      <Route path="/redefinir-senha" element={<ResetPassword />} />
                      <Route path="/minha-conta" element={<MyAccount />}>
                        <Route path="pedidos" element={<MyOrders />} />
                        <Route path="pedidos/:orderId" element={<OrderDetail />} />
                        <Route path="enderecos" element={<MyAddresses />} />
                        <Route path="favoritos" element={<Wishlist />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />
                  </>
                }
              />
            </Routes>
            </Suspense>
          </BrowserRouter>
            </BannerProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
