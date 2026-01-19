import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Edit, Trash2, Home, Building } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MyAddresses = () => {
  const { isAuthenticated, user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo endereço
        </Button>
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
                <Button variant="outline" size="sm">
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
