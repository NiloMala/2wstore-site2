import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Eye, Loader2 } from "lucide-react";
import { ordersService } from "@/services";
import type { OrderStatus } from "@/services";
import { useToast } from "@/hooks/use-toast";

interface OrderWithDetails {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  tracking_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: {
    id: string;
    product_name: string;
    product_image: string | null;
    price: number;
    quantity: number;
    size: string | null;
    color: string | null;
  }[];
  shipping_address: {
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  } | null;
  user: {
    name: string;
    email: string;
  } | null;
}

const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
};

const getOrderStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersService.getAllAdmin();
      setOrders(data as OrderWithDetails[] || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openOrderDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setTrackingCode(order.tracking_code || "");
    setIsDialogOpen(true);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await ordersService.updateStatus(orderId, newStatus, trackingCode || undefined);

      // Update local state
      setOrders(orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, tracking_code: trackingCode || order.tracking_code, updated_at: new Date().toISOString() }
          : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
          tracking_code: trackingCode || selectedOrder.tracking_code,
          updated_at: new Date().toISOString()
        });
      }

      toast({
        title: "Status atualizado",
        description: `Pedido atualizado para "${getOrderStatusLabel(newStatus)}".`,
      });
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o pedido.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pedidos</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID do pedido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery || statusFilter !== "all"
                ? "Nenhum pedido encontrado com os filtros aplicados."
                : "Nenhum pedido encontrado."}
            </p>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">#{order.id.slice(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">
                          {order.user?.name || 'Cliente não identificado'}
                        </p>
                      </div>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{formatDate(order.created_at)}</span>
                      <span className="font-semibold">R$ {Number(order.total).toFixed(2)}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => openOrderDetails(order)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalhes
                    </Button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {order.user?.name || 'Cliente não identificado'}
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{order.items?.length || 0} item(s)</TableCell>
                        <TableCell>R$ {Number(order.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openOrderDetails(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pedido #{selectedOrder?.id.slice(0, 8)}...</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Data do Pedido</Label>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Última Atualização</Label>
                  <p className="font-medium">{formatDate(selectedOrder.updated_at)}</p>
                </div>
              </div>

              {selectedOrder.user && (
                <div>
                  <Label className="text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{selectedOrder.user.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user.email}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-muted-foreground">Alterar Status</Label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => updateOrderStatus(selectedOrder.id, value as OrderStatus)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Código de Rastreio</Label>
                <div className="flex gap-2">
                  <Input
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Digite o código de rastreio"
                  />
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status)}
                    disabled={isUpdating}
                    variant="outline"
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                  </Button>
                </div>
              </div>

              {/* Melhor Envio protocol (if present) */}
              {(selectedOrder.melhor_envio_protocol || (selectedOrder as any).melhorEnvioProtocol) && (
                <div className="mt-4">
                  <Label className="text-muted-foreground">Protocolo Melhor Envio</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-mono font-bold text-primary break-all">
                      {selectedOrder.melhor_envio_protocol || (selectedOrder as any).melhorEnvioProtocol}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(selectedOrder.melhor_envio_protocol || (selectedOrder as any).melhorEnvioProtocol);
                          toast({ title: 'Protocolo copiado' });
                        } catch (err) {
                          console.error('Erro ao copiar protocolo', err);
                          toast({ title: 'Erro', description: 'Não foi possível copiar o protocolo.', variant: 'destructive' });
                        }
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              )}

              {selectedOrder.shipping_address && (
                <div>
                  <Label className="text-muted-foreground">Endereço de Entrega</Label>
                  <p className="font-medium mt-1">
                    {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}
                    {selectedOrder.shipping_address.complement &&
                      ` - ${selectedOrder.shipping_address.complement}`}
                    <br />
                    {selectedOrder.shipping_address.neighborhood} - {selectedOrder.shipping_address.city},{" "}
                    {selectedOrder.shipping_address.state}
                    <br />
                    CEP: {selectedOrder.shipping_address.zip_code}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground mb-2 block">Itens do Pedido</Label>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-muted rounded-lg"
                    >
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.size && `Tamanho: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Cor: ${item.color}`}
                        </p>
                        <p className="text-sm">
                          {item.quantity}x R$ {Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        R$ {(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>- R$ {Number(selectedOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span>R$ {Number(selectedOrder.shipping).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    R$ {Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="text-sm mt-1">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
