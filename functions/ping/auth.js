// functions/auth.js

import { getAuthCredentials, createAuthTableIfNotExists } from '/functions/db.js'

export async function authenticate(request, db) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { status: 401, message: 'Unauthorized' }
  }

  const [appID, appSecret] = authHeader.split(' ')[1].split('@')
  if (!appID || !appSecret) {
    return { status: 401, message: 'Unauthorized' }
  }

  // 确保 Authentication 表存在
  await createAuthTableIfNotExists(db)

  // 从数据库中获取 appSecret
  const storedAppSecret = await getAuthCredentials(db, appID)
  if (!storedAppSecret || storedAppSecret !== appSecret) {
    return { status: 401, message: 'Unauthorized' }
  }

  return { status: 200, message: 'Authorized' }
}