import express, { Request, Response, Router } from "express";

import WebSocket, { WebSocketServer } from "ws";

interface Client {
  socket: WebSocket;
  userId: string;
}

// 현재 연결된 사용자들을 저장 (userId 기반)
const clients = new Map<string, Client>();

// WebSocket 서버 생성
const wss = new WebSocketServer({ port: 5172 });

wss.on("connection", (socket) => {
  console.log("새로운 클라이언트가 연결되었습니다.");

  // 초기 연결 시 사용자 ID 등록
  socket.on("message", (data) => {
    const { type, userId, targetId, message } = JSON.parse(data.toString());

    switch (type) {
      case "register":
        clients.set(userId, { socket, userId });
        console.log(`사용자 ${userId} 등록 완료.`);
        break;

      case "message":
        sendMessage(userId, targetId, message);
        break;

      default:
        console.log("알 수 없는 메시지 타입:", type);
    }
  });

  // 클라이언트가 연결 종료 시 처리
  socket.on("close", () => {
    const disconnectedUser = [...clients.entries()].find(
      ([, client]) => client.socket === socket
    );

    if (disconnectedUser) {
      const [userId] = disconnectedUser;
      clients.delete(userId);
      console.log(`사용자 ${userId} 연결 종료.`);
    }
  });
});

// 1:1 메시지 전송 함수
function sendMessage(senderId: string, targetId: string, message: string) {
  const targetClient = clients.get(targetId);

  if (targetClient) {
    targetClient.socket.send(JSON.stringify({ senderId, message }));
    console.log(`사용자 ${senderId}가 ${targetId}에게 메시지 전송: ${message}`);
  } else {
    console.log(`대상 사용자 ${targetId}를 찾을 수 없습니다.`);
  }
}

console.log("WebSocket 서버가 포트 8080에서 실행 중입니다.");

/*
const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(express.json());

const router = Router();

// 기본 라우트
app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running?");
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

*/
