import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // UUID 생성 함수

const SERVER_URL = "ws://59.8.137.118:5172"; // WebSocket 서버 주소

interface Message {
  senderId: string;
  message: string;
}

const Chat2: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const socket = useRef<WebSocket | null>(null);
  const userId = useRef<string>(uuidv4()); // 고유 사용자 ID 생성
  const [targetId, setTargetId] = useState<string>(""); // 타겟 ID 관리

  const [checkMsg, setCheckMsg] = useState<string>("");
  // WebSocket 연결 설정
  useEffect(() => {
    socket.current = new WebSocket(SERVER_URL);

    socket.current.onopen = () => {
      setCheckMsg("WebSocket 연결 성공!");
      console.log("WebSocket 연결 성공!");
      console.log("유저ID : " + userId.current);
      socket.current?.send(
        JSON.stringify({ type: "register", userId: userId.current })
      );
    };

    socket.current.onmessage = (event) => {
      const { senderId, message } = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, { senderId, message }]);
    };

    socket.current.onclose = () => {
      console.log("WebSocket 연결 종료.");
    };

    socket.current.onerror = (error) => {
      setCheckMsg("WebSocket 오류:" + error);
    };

    return () => {
      socket.current?.close();
    };
  }, []);

  // 메시지 전송 함수
  const sendMessage = () => {
    if (socket.current && inputMessage.trim() !== "" && targetId) {
      socket.current.send(
        JSON.stringify({
          type: "message",
          senderId: userId.current,
          targetId, // 타겟 ID 동적으로 사용
          message: inputMessage,
        })
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        { senderId: userId.current, message: inputMessage },
      ]);
      setInputMessage("");
    }
  };

  return (
    <div>
      <h1>1:1 실시간 채팅</h1>
      <h2>{checkMsg}</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.senderId}:</strong> {msg.message}
          </p>
        ))}
      </div>
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
    </div>
  );
};

export default Chat2;
