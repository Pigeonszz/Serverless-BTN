import { initDatabase, insertOAuthHash } from '../../d1.js';

export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    // Redirect to GitHub OAuth authorization page with the 'user:email' scope
    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${env.GH_CLIENT_ID}&scope=user:email`;
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

  // Use the access token to get user email information
  const emailResponse = await fetch('https://api.github.com/user/emails', {
    headers: {
      'Authorization': `token ${data.access_token}`
    }
  });

  const emailData = await emailResponse.json();

  // Generate SHA1 hash as salt
  const sha1Salt = Array.from(new TextEncoder().encode(code)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Combine code and SHA1 salt
  const combinedString = code + sha1Salt;

  // Generate SHA256 hash of the combined string
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(combinedString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Initialize the database and insert the hash
  await initDatabase(env);
  await insertOAuthHash(env, sha256Hash);

  return new Response(JSON.stringify(emailData), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}