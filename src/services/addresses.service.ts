import { supabase } from '@/integrations/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase';

export type Address = Tables<'addresses'>;
export type AddressInsert = TablesInsert<'addresses'>;
export type AddressUpdate = TablesUpdate<'addresses'>;

export const addressesService = {
  /**
   * Get addresses for current user
   */
  async getMyAddresses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get default address
   */
  async getDefaultAddress() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get address by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create address
   */
  async create(address: Omit<AddressInsert, 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // If this is the first address or marked as default, reset other defaults
    if (address.is_default) {
      await this.resetDefault();
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        ...address,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update address
   */
  async update(id: string, address: AddressUpdate) {
    // If marking as default, reset other defaults
    if (address.is_default) {
      await this.resetDefault();
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete address
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Set as default address
   */
  async setDefault(id: string) {
    await this.resetDefault();

    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Reset all addresses to non-default
   */
  async resetDefault() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }
};
