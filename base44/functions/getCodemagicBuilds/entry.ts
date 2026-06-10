import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { appId } = await req.json();
    if (!appId) {
      return Response.json({ error: 'appId is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('CODEMAGIC_API_KEY');
    const res = await fetch(`https://api.codemagic.io/builds?appId=${appId}&limit=10`, {
      headers: { 'x-auth-token': apiKey }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Codemagic builds error:', res.status, text);
      return Response.json({ error: `Codemagic API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return Response.json({ builds: data.builds || [] });
  } catch (error) {
    console.error('getCodemagicBuilds error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});