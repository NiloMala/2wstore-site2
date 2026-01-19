import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Bike, MapPin, Clock, DollarSign, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { deliveryService } from "@/services";
import type { DeliveryZone, DeliverySettings } from "@/services";

const AdminDelivery = () => {
  const { toast } = useToast();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<DeliveryZone | null>(null);

  // Form state for zone
  const [zoneName, setZoneName] = useState("");
  const [zoneNeighborhoods, setZoneNeighborhoods] = useState("");
  const [zonePrice, setZonePrice] = useState("");
  const [zoneEstimatedTime, setZoneEstimatedTime] = useState("");
  const [zoneIsActive, setZoneIsActive] = useState(true);

  // Form state for settings
  const [settingsMinOrder, setSettingsMinOrder] = useState("");
  const [settingsFreeThreshold, setSettingsFreeThreshold] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [zonesData, settingsData] = await Promise.all([
        deliveryService.getAllZonesAdmin(),
        deliveryService.getSettings(),
      ]);
      setZones(zonesData || []);
      setSettings(settingsData as DeliverySettings);
    } catch (error) {
      console.error("Error loading delivery data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as configurações de entrega.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetZoneForm = () => {
    setZoneName("");
    setZoneNeighborhoods("");
    setZonePrice("");
    setZoneEstimatedTime("");
    setZoneIsActive(true);
    setSelectedZone(null);
  };

  const openNewZoneDialog = () => {
    resetZoneForm();
    setIsZoneDialogOpen(true);
  };

  const openEditZoneDialog = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    setZoneName(zone.name);
    setZoneNeighborhoods((zone.neighborhoods || []).join(", "));
    setZonePrice(zone.price?.toString() || "");
    setZoneEstimatedTime(zone.estimated_time || "");
    setZoneIsActive(zone.is_active ?? true);
    setIsZoneDialogOpen(true);
  };

  const openDeleteDialog = (zone: DeliveryZone) => {
    setZoneToDelete(zone);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveZone = async () => {
    if (!zoneName || !zoneNeighborhoods || !zonePrice || !zoneEstimatedTime) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const neighborhoodsArray = zoneNeighborhoods
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (neighborhoodsArray.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um bairro.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const zoneData = {
        name: zoneName,
        neighborhoods: neighborhoodsArray,
        price: parseFloat(zonePrice),
        estimated_time: zoneEstimatedTime,
        is_active: zoneIsActive,
      };

      if (selectedZone) {
        await deliveryService.updateZone(selectedZone.id, zoneData);
        toast({
          title: "Zona atualizada",
          description: `A zona "${zoneName}" foi atualizada com sucesso.`,
        });
      } else {
        await deliveryService.createZone(zoneData);
        toast({
          title: "Zona criada",
          description: `A zona "${zoneName}" foi criada com sucesso.`,
        });
      }

      setIsZoneDialogOpen(false);
      resetZoneForm();
      loadData();
    } catch (error) {
      console.error("Error saving zone:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a zona de entrega.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteZone = async () => {
    if (!zoneToDelete) return;

    try {
      await deliveryService.deleteZone(zoneToDelete.id);
      toast({
        title: "Zona removida",
        description: `A zona "${zoneToDelete.name}" foi removida com sucesso.`,
      });
      setIsDeleteDialogOpen(false);
      setZoneToDelete(null);
      loadData();
    } catch (error) {
      console.error("Error deleting zone:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a zona de entrega.",
        variant: "destructive",
      });
    }
  };

  const handleToggleZoneStatus = async (zone: DeliveryZone) => {
    try {
      await deliveryService.toggleZoneActive(zone.id);
      setZones((prev) =>
        prev.map((z) =>
          z.id === zone.id ? { ...z, is_active: !z.is_active } : z
        )
      );
      toast({
        title: zone.is_active ? "Zona desativada" : "Zona ativada",
        description: `A zona "${zone.name}" foi ${zone.is_active ? "desativada" : "ativada"}.`,
      });
    } catch (error) {
      console.error("Error toggling zone:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da zona.",
        variant: "destructive",
      });
    }
  };

  const handleToggleMotoboyEnabled = async () => {
    if (!settings) return;

    try {
      const newValue = !settings.is_motoboy_enabled;
      await deliveryService.updateSettings({ is_motoboy_enabled: newValue });
      setSettings({ ...settings, is_motoboy_enabled: newValue });
      toast({
        title: newValue ? "Motoboy ativado" : "Motoboy desativado",
        description: `A entrega via motoboy foi ${newValue ? "ativada" : "desativada"}.`,
      });
    } catch (error) {
      console.error("Error toggling motoboy:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    const minOrder = parseFloat(settingsMinOrder);
    const freeThreshold = settingsFreeThreshold ? parseFloat(settingsFreeThreshold) : null;

    if (isNaN(minOrder) || minOrder < 0) {
      toast({
        title: "Erro",
        description: "Valor mínimo do pedido inválido.",
        variant: "destructive",
      });
      return;
    }

    if (freeThreshold !== null && (isNaN(freeThreshold) || freeThreshold < 0)) {
      toast({
        title: "Erro",
        description: "Valor para frete grátis inválido.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await deliveryService.updateSettings({
        minimum_order: minOrder,
        free_delivery_threshold: freeThreshold,
      });

      setSettings((prev) =>
        prev
          ? { ...prev, minimum_order: minOrder, free_delivery_threshold: freeThreshold }
          : prev
      );

      toast({
        title: "Configurações salvas",
        description: "As configurações de entrega foram atualizadas.",
      });

      setIsSettingsDialogOpen(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openSettingsDialog = () => {
    if (settings) {
      setSettingsMinOrder(settings.minimum_order?.toString() || "0");
      setSettingsFreeThreshold(settings.free_delivery_threshold?.toString() || "");
    }
    setIsSettingsDialogOpen(true);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entrega via Motoboy</h1>
          <p className="text-muted-foreground">
            Configure as zonas de entrega e valores por região
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openSettingsDialog}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button onClick={openNewZoneDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Zona
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bike className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Entrega via Motoboy</CardTitle>
                <CardDescription>
                  {settings?.is_motoboy_enabled
                    ? "Serviço de entrega ativo"
                    : "Serviço de entrega desativado"}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={settings?.is_motoboy_enabled ?? false}
              onCheckedChange={handleToggleMotoboyEnabled}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Pedido mínimo:</span>
              <span className="font-medium">{formatCurrency(settings?.minimum_order)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Zonas ativas:</span>
              <span className="font-medium">{zones.filter((z) => z.is_active).length}</span>
            </div>
            {settings?.free_delivery_threshold && (
              <div className="flex items-center gap-2 text-sm">
                <Bike className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Frete grátis acima de:</span>
                <span className="font-medium">{formatCurrency(settings.free_delivery_threshold)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Zones Table */}
      <Card>
        <CardHeader>
          <CardTitle>Zonas de Entrega</CardTitle>
          <CardDescription>
            Gerencie as áreas de entrega, bairros e valores de frete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zona/Região</TableHead>
                <TableHead>Bairros</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tempo Est.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma zona de entrega cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(zone.neighborhoods || []).slice(0, 3).map((n, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {n}
                          </Badge>
                        ))}
                        {(zone.neighborhoods || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(zone.neighborhoods || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(zone.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {zone.estimated_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={zone.is_active ?? false}
                        onCheckedChange={() => handleToggleZoneStatus(zone)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditZoneDialog(zone)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(zone)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zone Dialog */}
      <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedZone ? "Editar Zona de Entrega" : "Nova Zona de Entrega"}
            </DialogTitle>
            <DialogDescription>
              {selectedZone
                ? "Atualize as informações da zona de entrega"
                : "Cadastre uma nova área de entrega com seus bairros e valores"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="zoneName">Nome da Zona/Região *</Label>
              <Input
                id="zoneName"
                placeholder="Ex: Centro, Zona Sul, Região Norte"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="zoneNeighborhoods">Bairros *</Label>
              <Textarea
                id="zoneNeighborhoods"
                placeholder="Digite os bairros separados por vírgula. Ex: Centro, Consolação, República"
                value={zoneNeighborhoods}
                onChange={(e) => setZoneNeighborhoods(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Separe os bairros por vírgula
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="zonePrice">Valor do Frete (R$) *</Label>
                <Input
                  id="zonePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={zonePrice}
                  onChange={(e) => setZonePrice(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="zoneEstimatedTime">Tempo Estimado *</Label>
                <Input
                  id="zoneEstimatedTime"
                  placeholder="Ex: 30-45 min"
                  value={zoneEstimatedTime}
                  onChange={(e) => setZoneEstimatedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Zona Ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Zonas inativas não aparecem para os clientes
                </p>
              </div>
              <Switch
                checked={zoneIsActive}
                onCheckedChange={setZoneIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsZoneDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveZone} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedZone ? "Salvar Alterações" : "Criar Zona"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações de Entrega</DialogTitle>
            <DialogDescription>
              Configure os parâmetros gerais da entrega via motoboy
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="settingsMinOrder">Pedido Mínimo (R$)</Label>
              <Input
                id="settingsMinOrder"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={settingsMinOrder}
                onChange={(e) => setSettingsMinOrder(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Valor mínimo do pedido para entrega via motoboy
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settingsFreeThreshold">Frete Grátis Acima de (R$)</Label>
              <Input
                id="settingsFreeThreshold"
                type="number"
                min="0"
                step="0.01"
                placeholder="Deixe vazio para desativar"
                value={settingsFreeThreshold}
                onChange={(e) => setSettingsFreeThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pedidos acima deste valor terão frete grátis. Deixe vazio para desativar.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Zona de Entrega</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a zona "{zoneToDelete?.name}"? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteZone}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDelivery;
