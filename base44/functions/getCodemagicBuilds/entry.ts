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

    // Try to get the app's last build ID first, then get build details
    // First get the app to find lastBuildId
    const appRes = await fetch(`https://api.codemagic.io/apps/${appId}`, {
      headers: { 'x-auth-token': apiKey }
    });

    console.log('App fetch status:', appRes.status);
    
    if (!appRes.ok) {
      const text = await appRes.text();
      console.error('App fetch error:', text);
      return Response.json({ builds: [], note: 'Could not fetch app details' });
    }

    const appData = await appRes.json();
    const app = appData.application || appData;
    console.log('App data keys:', Object.keys(app).join(', '));
    console.log('lastBuildId:', app.lastBuildId);

    // Get builds list - try the build directly if we have lastBuildId
    if (!app.lastBuildId) {
      return Response.json({ builds: [], note: 'No builds found for this app yet' });
    }

    // Fetch recent builds by getting build details directly
    const buildRes = await fetch(`https://api.codemagic.io/builds/${app.lastBuildId}`, {
      headers: { 'x-auth-token': apiKey }
    });

    console.log('Build fetch status:', buildRes.status);

    if (!buildRes.ok) {
      return Response.json({ builds: [], note: `Build fetch status: ${buildRes.status}` });
    }

    const buildData = await buildRes.json();
    const b = buildData.build || buildData;

    const build = {
      _id: b._id,
      index: b.index,
      status: b.status,
      branch: b.branch || b.commit?.branch,
      workflowId: b.workflowId,
      fileWorkflowId: b.fileWorkflowId,
      workflowName: b.config?.name || b.fileWorkflowId || b.workflowId || 'Build',
      createdAt: b.createdAt,
      finishedAt: b.finishedAt,
      message: b.message,
      commit: b.commit ? { message: b.commit.commitMessage, hash: b.commit.hash?.slice(0, 7) } : null,
      artefacts: (b.artefacts || []).map(a => ({ name: a.name, url: a.url }))
    };

    return Response.json({ builds: [build] });
  } catch (error) {
    console.error('getCodemagicBuilds error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});