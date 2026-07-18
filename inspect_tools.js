const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emgazoulumtcwzbnzzyy.supabase.co';
const supabaseAnonKey = 'sb_publishable_TNzSRWsjaoqOv0cW8gMF6g_BtI0Fhku';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Fetching all tools and their statuses...');
  const { data, error } = await supabase
    .from('tools')
    .select('status, count()', { count: 'exact', head: false });
    
  if (error) {
    // If count grouping fails, let's fetch raw statuses
    const { data: rawTools, error: rawError } = await supabase
      .from('tools')
      .select('status, name');
      
    if (rawError) {
      console.error('Error:', rawError);
      return;
    }
    
    const counts = {};
    rawTools.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    console.log('Tool counts by status:', counts);
    console.log('Sample tools:', rawTools.slice(0, 5));
  } else {
    console.log('Grouped counts:', data);
  }
}

test().catch(console.error);
