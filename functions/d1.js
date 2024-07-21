// functions/d1.js

export async function initDatabase(env) {
  // 检查并创建Authentication表
  await env.D1.exec(`
    CREATE TABLE IF NOT EXISTS Authentication (
      AppID TEXT PRIMARY KEY,
      AppSecret TEXT NOT NULL
    )
  `);

  // 检查并创建Peers表
  await env.D1.exec(`
    CREATE TABLE IF NOT EXISTS Peers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      populate_time INTEGER NOT NULL,
      ip_address TEXT NOT NULL,
      peer_port INTEGER NOT NULL,
      peer_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      torrent_identifier TEXT NOT NULL,
      torrent_size INTEGER NOT NULL,
      downloaded INTEGER NOT NULL,
      rt_download_speed INTEGER NOT NULL,
      uploaded INTEGER NOT NULL,
      rt_upload_speed INTEGER NOT NULL,
      peer_progress REAL NOT NULL,
      downloader_progress REAL NOT NULL,
      peer_flag TEXT NOT NULL
    )
  `);

  // 检查并创建Bans表
  await env.D1.exec(`
    CREATE TABLE IF NOT EXISTS Bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      populate_time INTEGER NOT NULL,
      btn_ban BOOLEAN NOT NULL,
      module TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      peer_port INTEGER NOT NULL,
      peer_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      torrent_identifier TEXT NOT NULL,
      torrent_size INTEGER NOT NULL,
      downloaded INTEGER NOT NULL,
      rt_download_speed INTEGER NOT NULL,
      uploaded INTEGER NOT NULL,
      rt_upload_speed INTEGER NOT NULL,
      peer_progress REAL NOT NULL,
      downloader_progress REAL NOT NULL,
      peer_flag TEXT NOT NULL,
      ban_unique_id TEXT NOT NULL
    )
  `);
}

export async function getAuthentication(env, appId, appSecret) {
  const { results } = await env.D1.prepare("SELECT * FROM Authentication WHERE AppID = ? AND AppSecret = ?")
    .bind(appId, appSecret)
    .all();
  return results;
}

export async function insertPeers(env, peers) {
  const stmt = env.D1.prepare(`
    INSERT INTO Peers (
      populate_time, ip_address, peer_port, peer_id, client_name,
      torrent_identifier, torrent_size, downloaded, rt_download_speed,
      uploaded, rt_upload_speed, peer_progress, downloader_progress, peer_flag
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const peer of peers) {
    await stmt.bind(
      peer.populate_time, peer.ip_address, peer.peer_port, peer.peer_id, peer.client_name,
      peer.torrent_identifier, peer.torrent_size, peer.downloaded, peer.rt_download_speed,
      peer.uploaded, peer.rt_upload_speed, peer.peer_progress, peer.downloader_progress, peer.peer_flag
    ).run();
  }
}

export async function insertBans(env, bans) {
  const stmt = env.D1.prepare(`
    INSERT INTO Bans (
      populate_time, btn_ban, module, ip_address, peer_port, peer_id, client_name,
      torrent_identifier, torrent_size, downloaded, rt_download_speed,
      uploaded, rt_upload_speed, peer_progress, downloader_progress, peer_flag, ban_unique_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ban of bans) {
    await stmt.bind(
      ban.populate_time, ban.btn_ban, ban.module, ban.ip_address, ban.peer_port, ban.peer_id, ban.client_name,
      ban.torrent_identifier, ban.torrent_size, ban.downloaded, ban.rt_download_speed,
      ban.uploaded, ban.rt_upload_speed, ban.peer_progress, ban.downloader_progress, ban.peer_flag, ban.ban_unique_id
    ).run();
  }
}