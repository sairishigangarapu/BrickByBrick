import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  const { data: usersData, error: usersErr } = await supabase.from('users').select('*').limit(1);
  console.log('Users Table Cols:', usersData ? Object.keys(usersData[0] || {}) : usersErr);

  const { data: annData, error: annErr } = await supabase.from('announcements').select('*').limit(1);
  console.log('Announcements Table Cols:', annData ? Object.keys(annData[0] || {}) : annErr);
}
checkSchema();
