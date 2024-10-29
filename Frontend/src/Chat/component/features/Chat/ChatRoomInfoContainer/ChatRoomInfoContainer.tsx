import { ChatRoomInfo } from "../../../../../types/Chat";
import ChatRoomItem from "../ChatRoomInfo/ChatRoomInfo";
import ChatRoomInfoContainerWrapper from "./ChatRoomInfoContainer.styles";

interface ChatRoomContainerProps {
  /** 채팅 정보 리스트 */
  chatRoomList: ChatRoomInfo[];
}
const ChatRoomContainer = ({ chatRoomList }: ChatRoomContainerProps) => {
  return (
    <ChatRoomInfoContainerWrapper>
      {chatRoomList.map((chatRoom, index) => (
        <ChatRoomItem
          key={index}
          imgUrl={chatRoom.imgUrl}
          name={chatRoom.name}
          unReadMsgCnt={chatRoom.unReadMsgCnt}
          lastMsg={chatRoom.lastMsg}
          creadtedAt={chatRoom.creadtedAt}
        />
      ))}
    </ChatRoomInfoContainerWrapper>
  );
};

export default ChatRoomContainer;
