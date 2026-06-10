import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = Deno.env.get('CODEMAGIC_API_KEY');
    const res = await fetch('https://api.codemagic.io/apps', {
      headers: { 'x-auth-token': apiKey }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Codemagic error:', res.status, text);
      return Response.json({ error: `Codemagic API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return Response.json({ apps: data.applications || [] });
  } catch (error) {
    console.error('listCodemagicApps error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});