import SendIcon from "../../../common/icon/SendIcon/SendIcon";
import ChatInputWrapper from "./ChatInput.styles";
const ChatInput = () => {
  return (
    <ChatInputWrapper>
      <input type="text" placeholder="Type a message" />
      <button>
        <SendIcon />
      </button>
    </ChatInputWrapper>
  );
};

export default ChatInput;
