import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import "./Chat.css";
const SERVER_URL = "http://59.8.137.118:5172"; // 서버 주소

const Chat: React.FC = () => {
  /* userId 가져오는 부분 */
  const [query] = useSearchParams();
  const userId = query.get("userId")!;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [targetId, setTargetId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    { senderId: string; message: string; isRead: boolean; createdAt: Date }[]
  >([]);

  // 스크롤을 마지막 메시지로 유지하기 위한 참조값
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // 소켓 초기화 및 연결 설정
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // 사용자 등록
    if (userId) {
      newSocket.emit("register", userId);
    }

    return () => {
      newSocket.close();
    };
  }, []);

  // 메시지를 보낸 후 스크롤을 마지막 메시지로 이동
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송
  const sendMessage = () => {
    if (socket && inputMessage.trim() && targetId) {
      socket.emit("message", {
        senderId: userId,
        targetId,
        message: inputMessage,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderId: userId,
          message: inputMessage,
          isRead: false,
          createdAt: new Date(),
        },
      ]);
      setInputMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h1>1:1 실시간 채팅</h1>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.senderId === userId ? "my-message" : "other-message"
            }`}
          >
            <p className="sender">{msg.senderId}</p>
            <p className="text">{msg.message}</p>
            <p className="timestamp">
              {msg.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="is-read">
              {msg.isRead ? "" : "1"} {/* 읽었는지 여부 표시 */}
            </p>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="타겟 ID 입력"
        />
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
};

export default Chat;
