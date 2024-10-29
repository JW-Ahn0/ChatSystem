import { DEFAULT_PROFILE_IMG } from "../../../../../constants/Chat";
import ChatMsgProfileWrapper from "./ChatMsgProfile.styles";

interface ChatMsgProfileProps {
  /** 프로필 이미지 경로 */
  imgUrl?: string;
  /** 닉네임 */
  name: string;
}

const ChatMsgProfile = ({
  imgUrl = DEFAULT_PROFILE_IMG,
  name,
}: ChatMsgProfileProps) => {
  return (
    <ChatMsgProfileWrapper>
      <img src={imgUrl} alt="프로필_이미지" />
      <span>{name}</span>
    </ChatMsgProfileWrapper>
  );
};

export default ChatMsgProfile;
