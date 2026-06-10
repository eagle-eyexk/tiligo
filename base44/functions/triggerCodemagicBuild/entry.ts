import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { appId, workflowId, branch } = await req.json();
    if (!appId || !workflowId) {
      return Response.json({ error: 'appId and workflowId are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('CODEMAGIC_API_KEY');
    const res = await fetch('https://api.codemagic.io/builds', {
      method: 'POST',
      headers: {
        'x-auth-token': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appId,
        workflowId,
        branch: branch || 'main'
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Codemagic trigger error:', res.status, text);
      return Response.json({ error: `Codemagic API error: ${res.status} - ${text}` }, { status: res.status });
    }

    const data = await res.json();
    console.log('Build triggered:', data);
    return Response.json({ success: true, build: data });
  } catch (error) {
    console.error('triggerCodemagicBuild error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});