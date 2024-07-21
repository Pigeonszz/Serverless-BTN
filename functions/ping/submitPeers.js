// functions/ping/submitPeers.js

import { onRequest } from './auth.js';
import { initDatabase, insertPeers } from "../d1.js";

export async function onRequestPost({ request, env }) {
  // 应用中间件
  return onRequest({ request, next: async () => {
    // 检查Content-Encoding头是否为gzip
    const contentEncoding = request.headers.get("Content-Encoding");
    if (contentEncoding !== "gzip") {
      return new Response(JSON.stringify({ error: "Unsupported Content-Encoding" }), {
        status: 415,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // 读取请求体并解压
    const compressedBody = await request.arrayBuffer();
    const decompressedBody = await gunzip(compressedBody);
    const body = JSON.parse(decompressedBody);

    // 验证请求体字段
    const requiredFields = [
      "populate_time", "ip_address", "peer_port", "peer_id", "client_name",
      "torrent_identifier", "torrent_size", "downloaded", "rt_download_speed",
      "uploaded", "rt_upload_speed", "peer_progress", "downloader_progress", "peer_flag"
    ];
    for (const field of requiredFields) {
      if (!(field in body)) {
        return new Response(JSON.stringify({ error: `Missing field: ${field}` }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }

    // 初始化数据库（检查并创建Peers表）
    await initDatabase(env);

    // 插入peers信息到D1数据库
    await insertPeers(env, body.peers);

    return new Response(JSON.stringify({ message: "Peers information received successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, env });
}

async function gunzip(buffer) {
  const stream = new Response(buffer).body.getReader();
  const decompressedStream = new DecompressionStream('gzip');
  const writer = decompressedStream.writable.getWriter();

  while (true) {
    const { done, value } = await stream.read();
    if (done) break;
    await writer.write(value);
  }

  writer.close();
  const decompressedBuffer = await new Response(decompressedStream.readable).arrayBuffer();
  return new TextDecoder().decode(decompressedBuffer);
}