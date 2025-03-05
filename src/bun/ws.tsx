// https://hono.dev/docs/helpers/websocket#bun-with-jsx

import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono()
  .get("/ping", (c) => c.text("Hello bun websocket!"))
  .get("/", (c) => {
    return c.html(
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <div>Bun Websocket Demo</div>
          {/* 添加一个用于展示 wsUrl 的元素 */}
          <div id="ws-url"></div>
          <div id="now-time"></div>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              // 根据 location 协议设置 ws:// 或 wss://
              const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
              // 使用当前 host 并拼接 WebSocket 路径
              const wsUrl = protocol + location.host + '/ws';
              // 将 wsUrl 显示在页面上
              const $wsUrl = document.getElementById('ws-url');
              if ($wsUrl) {
                $wsUrl.textContent = 'WebSocket URL: ' + wsUrl + ' ... ';
              }
              // 建立 WebSocket 连接
              const ws = new WebSocket(wsUrl);
              const $nowTime = document.getElementById('now-time');
              // ws.onmessage = (event) => {
              //   $nowTime.textContent = event.data;
              // };

              ws.onmessage = (event) => {
                try {
                  const data = JSON.parse(event.data);
                  if (data.type === "connected") {
                    console.log("Received connectionId:", data.connectionId);
                    // 你可以在页面上展示这个 connectionId
                    $wsUrl.textContent += " Connection ID: " + data.connectionId;
                  } else {
                    // 处理其他类型的消息
                    $nowTime.textContent = event.data;
                  }
                } catch (err) {
                  // 非 JSON 消息，直接处理
                  $nowTime.textContent = event.data;
                };
            };
            `,
            }}
          ></script>
        </body>
      </html>
    );
  })
  .get("/ws", upgradeWebSocket((c) => {
      let intervalId: number | Timer | undefined;
      return {
        onOpen(_event, ws) {
          // 为当前连接生成一个唯一ID（使用内置 crypto API 或其他方法）
          const connectionId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
          // 这里使用类型断言给 ws 添加一个自定义属性
          (ws as any).connectionId = connectionId;
          console.log("Server ws connection opened! ID:", connectionId);
          // 发送 connectionId 给客户端
          ws.send(JSON.stringify({ type: "connected", connectionId }));
          intervalId = setInterval(() => {
            ws.send(new Date().toString());
          }, 1000);
        },
        onMessage(event, ws) {
          const connectionId = (ws as any).connectionId || "unknown";
          console.log(`Message from client [ID: ${connectionId}]: ${event.data}`);
          ws.send(`Replied for client message: ${event.data} !`);
        },
        onClose(event, ws) {
          const connectionId = (ws as any).connectionId || "unknown";
          console.log("Connection closing ID:", connectionId);
          
          clearInterval(intervalId);
          console.log("Connection closed!");
        },
      };
    })
  );

export type WebSocketApp = typeof app;

export default {
  fetch: app.fetch,
  websocket,
};
