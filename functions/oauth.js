export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    // Redirect to GitHub OAuth authorization page
    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${env.GH_CLIENT_ID}&scope=user`;
    return Response.redirect(authorizeUrl, 302);
  }

  // Exchange code for access token
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: env.GH_CLIENT_ID,
      client_secret: env.GH_CLIENT_SECRET,
      code: code
    })
  });

  const data = await response.json();

  if (data.error) {
    return new Response(JSON.stringify(data), { status: 400 });
  }

  // Use the access token to get user information
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${data.access_token}`
    }
  });

  const userData = await userResponse.json();

  return new Response(JSON.stringify(userData), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}