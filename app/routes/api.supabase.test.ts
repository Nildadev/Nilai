import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { createClient } from '@supabase/supabase-js';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { test } = body;

    // Get env vars from Cloudflare context
    const supabaseUrl = 
      (globalThis as any).VITE_SUPABASE_URL || 
      'https://swuowhorzbcjwlmxaybn.supabase.co';
    
    const supabaseAnonKey = 
      (globalThis as any).VITE_SUPABASE_ANON_KEY || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dW93aG9yemJjandsbXhheWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTk1MzMsImV4cCI6MjA4Njk5NTUzM30.jlXWYePjrzBMAqq8XE1vJL6-OcfVL052VjJbhxabp0E';

    console.log('Supabase test connection:', {
      url: supabaseUrl,
      keyPreview: supabaseAnonKey?.substring(0, 20) + '...',
      test,
    });

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (test === 'connection') {
      // Test connection
      const { data, error } = await supabase
        .from('conversations')
        .select('id')
        .limit(1);

      if (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
            details: error,
          }),
          { status: 400 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Connection successful',
          data,
        })
      );
    }

    if (test === 'insert') {
      // Test insert
      const testUserId = `test_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: testUserId,
          title: 'Test Conversation',
          metadata: { test: true },
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message,
            details: error,
          }),
          { status: 400 }
        );
      }

      // Clean up test data
      await supabase.from('conversations').delete().eq('id', data.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Insert test successful',
          data,
        })
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Supabase client created',
        url: supabaseUrl,
      })
    );
  } catch (error) {
    console.error('Supabase test error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500 }
    );
  }
}
