import { supabase } from '../lib/supabase'

export type User = {
  id: number
  username: string
}

export async function findByCredentials(username: string, password: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, password')
    .eq('username', username.trim())
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  if (data.password !== password) return null
  return { id: data.id, username: data.username }
}
