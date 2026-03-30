import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
