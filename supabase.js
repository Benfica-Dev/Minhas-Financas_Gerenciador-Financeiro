import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Cole aqui a URL (apenas o endereço base, sem /rest/v1/) e a chave anon que você pegou no Supabase
const SUPABASE_URL = 'https://mlvoqjuzzbtbqzszybqz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RL5mqEqej-typf5hIPb1Lg_zzYRGrff';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);