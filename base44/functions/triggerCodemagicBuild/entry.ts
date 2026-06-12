import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { appId, workflowId, fileWorkflowId, branch } = await req.json();
    if (!appId || (!workflowId && !fileWorkflowId)) {
      return Response.json({ error: 'appId and workflowId or fileWorkflowId are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('CODEMAGIC_API_KEY');

    const body = {
      appId,
      branch: branch || 'main'
    };

    // For codemagic.yaml workflows, use workflowId (the yaml workflow ID string)
    // fileWorkflowId is stored internally but the API accepts workflowId for both
    if (fileWorkflowId) {
      body.workflowId = fileWorkflowId;  // codemagic.yaml uses workflowId in the API
    } else {
      body.workflowId = workflowId;
    }

    const res = await fetch('https://api.codemagic.io/builds', {
      method: 'POST',
      headers: {
        'x-auth-token': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      console.error('Codemagic trigger error:', res.status, text);
      return Response.json({ error: `Codemagic API error: ${res.status} - ${text}` }, { status: res.status });
    }

    console.log('Build triggered:', JSON.stringify(data));
    return Response.json({ success: true, build: data });
  } catch (error) {
    console.error('triggerCodemagicBuild error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});