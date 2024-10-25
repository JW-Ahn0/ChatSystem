import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";

const SERVER_URL = "http://59.8.137.118:5172"; // 서버 주소

const Chat: React.FC = () => {
  /* userId 가져오는 부분 */
  const [query] = useSearchParams();
  const userId = query.get("userId")!;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [targetId, setTargetId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    { senderId: string; message: string }[]
  >([]);

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
        { senderId: userId, message: inputMessage },
      ]);
      setInputMessage("");
    }
  };

  return (
    <div>
      <h1>1:1 실시간 채팅</h1>
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
      />
      <button onClick={sendMessage}>전송</button>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.senderId}:</strong> {msg.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Chat;
