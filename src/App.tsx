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
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import MyAccount from "./pages/customer/MyAccount";
import MyOrders from "./pages/customer/MyOrders";
import OrderDetail from "./pages/customer/OrderDetail";
import MyAddresses from "./pages/customer/MyAddresses";
import Wishlist from "./pages/customer/Wishlist";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentPending from "./pages/PaymentPending";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import Trocas from "./pages/Trocas";
import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDelivery from "./pages/admin/AdminDelivery";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminBanners from "./pages/admin/AdminBanners";

const queryClient = new QueryClient();

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
            <Routes>
              {/* Admin Routes - No Header/Footer */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="entregas" element={<AdminDelivery />} />
                <Route path="cupons" element={<AdminCoupons />} />
                <Route path="banners" element={<AdminBanners />} />
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
          </BrowserRouter>
            </BannerProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
