// functions/callback.js

export async function onRequestGet(context) {
    const clientID = context.env.GH_CLIENT_ID
    const clientSecret = context.env.GH_CLIENT_SECRET
    const code = context.request.query.get('code')
  
    if (!clientID || !clientSecret) {
      return new Response('GitHub client credentials not configured', { status: 500 })
    }
  
    if (!code) {
      return new Response('Authorization code not provided', { status: 400 })
    }
  
    // 交换授权码获取访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientID,
        client_secret: clientSecret,
        code: code
      })
    })
  
    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      return new Response('Failed to obtain access token from GitHub', { status: 401 })
    }
  
    // 使用访问令牌获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`
      }
    })
  
    const userData = await userResponse.json()
    if (!userData.id) {
      return new Response('Failed to obtain user information from GitHub', { status: 401 })
    }
  
    // 这里可以处理用户信息，例如存储到数据库或生成会话
  
    return new Response(`Welcome, ${userData.name}!`, { status: 200 })
  }