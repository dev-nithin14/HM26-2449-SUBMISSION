import { IUserRepository } from '../interfaces/index.js';
import { UserProfile } from '../../types/index.js';
import { supabase } from '../../lib/supabase.js';

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapProfile(data);
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapProfile(data);
  }

  async findAll(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((row) => this.mapProfile(row));
  }

  private mapProfile(row: any): UserProfile {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      phone: row.phone || undefined,
      organization: row.organization || undefined,
      avatar_url: row.avatar_url || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
