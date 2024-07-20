// functions/register.js

export async function onRequestGet(context) {
    const clientID = context.env.GH_CLIENT_ID
    const redirectURI = encodeURIComponent('https://your-project-name.pages.dev/callback')
  
    if (!clientID) {
      return new Response('GitHub client ID not configured', { status: 500 })
    }
  
    const authURL = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=user`
  
    return Response.redirect(authURL, 302)
  }