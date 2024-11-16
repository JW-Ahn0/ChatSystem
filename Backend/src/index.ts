import express from "express";
import { Request, Response } from "express";
import { Server, Socket } from "socket.io";
import https from "https";
import fs from "fs";
import {
  createChat,
  getOrCreateChatRoom,
  getChatRoomInfoByUserId,
  updateChatUnread,
  getChatHistoryByRoomId,
  markChatsAsRead,
  updateChatUnreadByCnt,
  createUserIdNickName,
  getUserNickNameById,
  getRoomByUserList,
  getUnreadMessagesCountByUser,
  upsertUserUnRaedTable,
  getUnreadDataById,
  updateUnRaedTable,
  getUserNickNameProfileImgById,
} from "./chat";
import cors from "cors"; // CORS 패키지 import
import { Chat, Room, UnreadData } from "./types/chat_type";
import { MongoClient } from "mongodb";
import path from "path";

// 인증서 파일 경로 설정
const privateKey = fs.readFileSync(
  path.resolve(__dirname, "../src/certificates/jwjwjw.store-key.pem"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.resolve(__dirname, "../src/certificates/jwjwjw.store-crt.pem"),
  "utf8"
);
const ca = fs.readFileSync(
  path.resolve(__dirname, "../src/certificates/jwjwjw.store-chain.pem"),
  "utf8"
);
const app = express(); // Express 인스턴스 생성
app.use(express.json());
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
const server = https.createServer(
  {
    key: privateKey,
    cert: certificate,
    ca: ca,
  },
  app
);
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
app.get("/chat/:roomId/:otherUserId", async (req, res) => {
  const { roomId, otherUserId } = req.params;

  try {
    const chatHistory = await getChatHistoryByRoomId(roomId);
    const nicknameProfile = await getUserNickNameProfileImgById(otherUserId);
    res.json({
      chatListData: chatHistory,
      profileIndex: nicknameProfile.profile_image_index,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
});

const mongoClient = new MongoClient(process.env.DATABASE_URL!); // MongoDB 연결 설정

// 특정 roomId의 채팅 내역 조회 API
app.get("/chat/unread/cnt/:userId", async (req, res) => {
  const { userId } = req.params;

  // SSE 헤더 설정
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // 헤더 전송

  // 사용자 정보가 있으면 최초 데이터를 클라이언트로 전송
  const cnt = await getUnreadMessagesCountByUser(userId);
  if (cnt) {
    res.write(`data: ${JSON.stringify({ cnt: cnt })}\n\n`);
  }

  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    const changeStream = db.collection("UserUnread").watch([
      {
        $match: {
          operationType: { $in: ["insert", "update"] }, // insert와 update를 모두 감지
        },
      },
    ]);

    changeStream.on("change", async (change) => {
      // updateDescription에서 변경된 필드 확인
      if (change.operationType === "insert") {
        const document = await getUnreadDataById(
          change.documentKey._id.toString()
        );
        if (document && document.user_id === userId) {
          const cnt = document.unread_msg_cnt;
          try {
            res.write(`data: ${JSON.stringify({ cnt })}\n\n`);
          } catch (error) {
            if (error instanceof Error) {
              res.write(
                `event: error\ndata: ${JSON.stringify({
                  error: error.message,
                })}\n\n`
              );
            } else {
              res.write(
                `event: error\ndata: ${JSON.stringify({
                  error: "An unknown error occurred",
                })}\n\n`
              );
            }
          }
        }
      }
      if (change.operationType === "update" && change.updateDescription) {
        const updatedFields = change.updateDescription.updatedFields;

        // unread_msg_cnt가 변경된 경우
        if (updatedFields && updatedFields.unread_msg_cnt !== undefined) {
          {
            const document = await getUnreadDataById(
              change.documentKey._id.toString()
            );
            // user_id가 특정 값과 일치하는지 확인
            if (document && document.user_id === userId) {
              const cnt = document.unread_msg_cnt;
              try {
                res.write(`data: ${JSON.stringify({ cnt })}\n\n`);
              } catch (error) {
                if (error instanceof Error) {
                  res.write(
                    `event: error\ndata: ${JSON.stringify({
                      error: error.message,
                    })}\n\n`
                  );
                } else {
                  res.write(
                    `event: error\ndata: ${JSON.stringify({
                      error: "An unknown error occurred",
                    })}\n\n`
                  );
                }
              }
            }
          }
        }
      }
    });

    // `watch` 메서드에서 오류 발생 시 처리
    changeStream.on("error", (err) => {
      console.error("Change Stream error:", err);
      res.write(
        `event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`
      );
    });

    // 클라이언트가 연결을 끊으면 Change Stream을 닫음
    req.on("close", () => {
      changeStream.close();
      res.end();
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to start SSE with MongoDB Change Stream" });
  }
});

// 특정 roomId의 채팅 내역 조회 API
app.get("/nickname/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userNickName = await getUserNickNameById(userId);
    res.json(userNickName);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Express POST 요청 처리
app.post(
  "/register/nickname",
  async (req: Request, res: Response): Promise<void> => {
    const { user_id, user_nickname, profile_image_index } = req.body;

    // 필수 필드 체크
    if (!user_id || !user_nickname || !profile_image_index) {
      res.status(400).json({
        error: "user_id와 user_nickname,profile_image_index이 필요합니다.",
      });
      return;
    }

    try {
      const newUser = await createUserIdNickName(
        user_id,
        user_nickname,
        profile_image_index
      );
      res
        .status(201)
        .json({ message: "닉네임이 성공적으로 등록되었습니다.", newUser });
    } catch (error) {
      console.error("닉네임 등록 에러:", error);
      res.status(500).json({ error: "닉네임 등록에 실패했습니다." });
    }
  }
);

// 특정 user_list로 참여 여부 확인 API
app.post("/room/exists", async (req: Request, res: Response): Promise<void> => {
  const { user_list } = req.body; // 요청 본문에서 userList 추출

  try {
    // user_list가 userList의 모든 요소를 포함하는 채팅방 조회
    const ChatRoom = await getRoomByUserList(user_list);
    res.json({ exists: ChatRoom }); // 유저가 참여 중인 채팅방이 존재함
    return;
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
    //printClients(clients);
  });

  socket.on("message", async ({ senderId, targetId, message }) => {
    const { roomId, isFirstMsg } = await getOrCreateChatRoom([
      senderId,
      targetId,
    ]);
    let chat = await createChat(roomId, senderId, message);
    const targetName = await getUserNickNameById(targetId);
    const senderName = await getUserNickNameById(senderId);
    chat.sender = senderName;

    await updateChatUnread(targetId, roomId);
    await upsertUserUnRaedTable(targetId);
    const senderUnread = await getChatRoomInfoByUserId(senderId);
    const targetUnread = await getChatRoomInfoByUserId(targetId);
    //우종, 혜수님한테 보냈는데, 채팅방이 사라졌고, 혜수님한테 온골로 왔는데 혜수님인데 테스트1로 안녕하세요.
    console.log(targetName + " 그리고 ", senderName);
    sendMessage(chat, targetId, targetUnread, targetName, false, roomId);

    sendMessage(chat, senderId, senderUnread, senderName, isFirstMsg, roomId);
  });

  socket.on("message-read", async ({ unreadChatIds, roomId, userId }) => {
    const { count, sender } = await markChatsAsRead(unreadChatIds);
    await updateChatUnreadByCnt(userId, roomId, count);
    const newCount = await getUnreadMessagesCountByUser(userId);
    await updateUnRaedTable(userId, newCount);
    const rooms = await getChatRoomInfoByUserId(userId);
    const senderRooms = await getChatRoomInfoByUserId(sender);
    sendChatRoomData(userId, rooms, unreadChatIds);
    sendChatRoomData(sender, senderRooms, unreadChatIds);
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

function sendChatRoomData(
  targetId: string,
  rooms: Room[],
  unreadChatIds: string[]
) {
  const targetClient = clients.get(targetId);

  if (targetClient) {
    targetClient.socket.emit("message-read", {
      targetId,
      rooms,
      unreadChatIds,
    });
    console.log(`사용자 ${targetId}에게 메시지 전송`);
  } else {
    console.log(`대상 사용자 ${targetId}를 찾을 수 없습니다.`);
  }
}

interface messageData {
  chat: Chat;
  targetName: string;
  unreadData: UnreadData[];
  roomId?: string;
}
// 1:1 메시지 전송 함수
function sendMessage(
  chat: Chat,
  targetId: string,
  unreadData: UnreadData[],
  targetName: string,
  isFirstMsg: boolean,
  roomId: string
) {
  const targetClient = clients.get(targetId);
  if (targetClient) {
    const messageData: messageData = { chat, targetName, unreadData };

    // roomId가 존재할 때만 messageData에 추가
    if (isFirstMsg) {
      messageData.roomId = roomId;
    }

    targetClient.socket.emit("message", messageData);
    console.log(`사용자 ${chat.sender}가 ${targetId}에게 메시지 전송`);
  } else {
    console.log(`대상 사용자 ${targetId}를 찾을 수 없습니다.`);
  }
}

// 서버 실행
const PORT = 5172;
server.listen(PORT, () => {
  console.log(`Socket.IO 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
