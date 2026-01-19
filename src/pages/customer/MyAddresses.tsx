import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Edit, Trash2, Home, Building } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MyAddresses = () => {
  const { isAuthenticated, user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [form, setForm] = useState({ label: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip_code: '', is_default: false });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isAuthenticated || !user) {
        setAddresses([]);
        return;
      }
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) {
        console.error('Error loading addresses:', error);
        setAddresses([]);
      } else {
        setAddresses(data || []);
      }
    };
    load();
    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Meus Endereços
        </CardTitle>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingAddress(null); setForm({ label: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip_code: '', is_default: false }); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo endereço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAddress ? 'Editar Endereço' : 'Novo Endereço'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <Label>Rótulo</Label>
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                <Label>Rua</Label>
                <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                <Label>Número</Label>
                <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
                <Label>Complemento</Label>
                <Input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} />
                <Label>Bairro</Label>
                <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
                <Label>Cidade</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Label>Estado</Label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <Label>CEP</Label>
                <Input value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={async () => {
                  try {
                    if (editingAddress) {
                      await supabase.from('addresses').update(form).eq('id', editingAddress.id);
                    } else {
                      await supabase.from('addresses').insert({ ...form, user_id: user?.id });
                    }
                    setIsDialogOpen(false);
                    setEditingAddress(null);
                    // reload
                    const { data } = await supabase.from('addresses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
                    setAddresses(data || []);
                  } catch (err) {
                    console.error(err);
                    alert('Erro ao salvar endereço');
                  }
                }}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 border rounded-lg relative ${
                address.is_default ? 'border-primary bg-accent/50' : 'border-border'
              }`}
            >
              {address.is_default && (
                <span className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Padrão
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  address.label?.toLowerCase?.() === 'casa' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {address.label?.toLowerCase?.() === 'casa' ? (
                    <Home className="h-5 w-5" />
                  ) : (
                    <Building className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{address.label || 'Endereço'}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.neighborhood}, {address.city} - {address.state}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CEP: {address.zip_code || address.zipCode}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => {
                  setEditingAddress(address);
                  setForm({
                    label: address.label || '',
                    street: address.street || '',
                    number: address.number || '',
                    complement: address.complement || '',
                    neighborhood: address.neighborhood || '',
                    city: address.city || '',
                    state: address.state || '',
                    zip_code: address.zip_code || address.zipCode || '',
                    is_default: !!address.is_default,
                  });
                  setIsDialogOpen(true);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {!address.is_default && (
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyAddresses;
