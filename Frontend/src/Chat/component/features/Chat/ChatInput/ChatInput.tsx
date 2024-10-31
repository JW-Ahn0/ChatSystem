import { useState } from "react";
import SendIcon from "../../../common/icon/SendIcon/SendIcon";
import ChatInputWrapper from "./ChatInput.styles";

interface ChatInputProps {
  onClick?: (message: string) => void; // 메시지를 전달받는 함수
}

const ChatInput = ({ onClick }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  // 메시지 전송 로직
  const sendMessage = () => {
    if (inputValue.trim() !== "") {
      console.log("Sent message:", inputValue); // 콘솔에 출력
      onClick?.(inputValue); // 부모로 메시지 전달
      setInputValue(""); // 입력 필드 초기화
    }
  };

  // 엔터 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <ChatInputWrapper>
      <input
        type="text"
        placeholder="Type a message"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button onClick={sendMessage}>
        <SendIcon />
      </button>
    </ChatInputWrapper>
  );
};

export default ChatInput;
