import express from "express";
import { Server, Socket } from "socket.io";
import http from "http";
import {
  createChat,
  getOrCreateChatRoom,
  getChatRoomInfoByUserId,
  updateChatUnread,
  getChatHistoryByRoomId,
} from "./chat";
import cors from "cors"; // CORS 패키지 import

const app = express(); // Express 인스턴스 생성

// CORS 미들웨어 사용
app.use(
  cors({
    origin: "*", // 모든 출처 허용
    methods: ["GET", "POST"], // 허용할 HTTP 메서드
    allowedHeaders: ["Content-Type"], // 허용할 헤더
    credentials: true, // 인증 정보 포함 여부
  })
);

// HTTP 서버 생성
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 모든 출처 허용
    methods: ["GET", "POST"], // 허용할 HTTP 메서드
    allowedHeaders: ["Content-Type"], // 허용할 헤더
    credentials: true, // 인증 정보 포함 여부
  },
});

// 예시 라우트
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Express를 통한 HTTP API 라우트 정의
app.get("/chat/rooms/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const rooms = await getChatRoomInfoByUserId(userId); // DB에서 채팅방 정보 조회
    res.json(rooms); // JSON으로 반환
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
});
interface Client {
  socket: Socket;
  userId: string;
}

// 특정 roomId의 채팅 내역 조회 API
app.get("/chat/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const chatHistory = await getChatHistoryByRoomId(roomId);
    res.json(chatHistory);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
});

// 현재 연결된 사용자들을 저장 (userId 기반)
const clients = new Map<string, Client>();

// Socket.IO 서버 설정
io.on("connection", (socket) => {
  console.log("새로운 클라이언트가 연결되었습니다.");

  // 초기 연결 시 사용자 ID 등록
  socket.on("register", (userId: string) => {
    clients.set(userId, { socket, userId });
    //console.log(`사용자 ${userId} 등록 완료.`);
    printClients(clients);
  });

  // 메시지 수신
  socket.on("message", async ({ senderId, targetId, message }) => {
    const roomId = await getOrCreateChatRoom([senderId, targetId]);
    const chat = await createChat(roomId, senderId, message);
    //console.log(chat);
    await updateChatUnread(targetId, roomId);
    sendMessage(senderId, targetId, message, chat.is_read, chat.created_at);
  });

  // 클라이언트가 연결 종료 시 처리
  socket.on("disconnect", () => {
    const disconnectedUser = [...clients.entries()].find(
      ([, client]) => client.socket.id === socket.id
    );

    if (disconnectedUser) {
      const [userId] = disconnectedUser;
      clients.delete(userId);
      console.log(`사용자 ${userId} 연결 종료.`);
    }
  });
});

// 연결된 클라이언트 리스트 출력
function printClients(clients: Map<string, Client>) {
  console.log("클라이언트 리스트");
  clients.forEach((value, key) => {
    console.log(value);
  });
}

// 1:1 메시지 전송 함수
function sendMessage(
  senderId: string,
  targetId: string,
  message: string,
  isRead: boolean,
  createdAt: Date
) {
  const targetClient = clients.get(targetId);

  if (targetClient) {
    targetClient.socket.emit("message", {
      senderId,
      message,
      isRead,
      createdAt,
    });
    console.log(`사용자 ${senderId}가 ${targetId}에게 메시지 전송: ${message}`);
  } else {
    console.log(`대상 사용자 ${targetId}를 찾을 수 없습니다.`);
  }
}

// 서버 실행
const PORT = 5172;
server.listen(PORT, () => {
  console.log(`Socket.IO 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
