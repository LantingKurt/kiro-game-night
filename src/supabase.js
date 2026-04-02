import { createClient } from '@supabase/supabase-js';

// Public fallback values keep GitHub Pages leaderboard working even if CI env vars are missing.
const FALLBACK_SUPABASE_URL = 'https://bavplagsmahjeofiqjay.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_61crTTCFOWdssiJvdmu98w_RW_Ar1sh';

const envSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const supabaseUrl = envSupabaseUrl || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = envSupabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY;

let supabase = null;

// Only create client if credentials are provided
if (supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' && 
    supabaseAnonKey !== 'your_supabase_anon_key_here') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export async function submitScore(name, score, wave) {
  if (!supabase) {
    console.warn('Supabase not configured');
    return { error: 'Supabase not configured' };
  }
  
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        {
          player_name: name,
          score: score,
          wave_reached: wave
        }
      ]);
    
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error submitting score:', error);
    return { error };
  }
}

export async function getLeaderboard() {
  if (!supabase) {
    console.warn('Supabase not configured');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
