import { ChatRoomInfo } from "../../../../../types/Chat";
import ChatRoomItem from "../ChatRoomInfo/ChatRoomInfo";
import ChatRoomInfoContainerWrapper from "./ChatRoomInfoContainer.styles";

interface ChatRoomContainerProps {
  /** 채팅 정보 리스트 */
  chatRoomList?: ChatRoomInfo[] | null;
  onChatRoomClick?: (chatRoom: string) => void; // 클릭 이벤트 처리 함수
}
const ChatRoomContainer = ({
  chatRoomList,
  onChatRoomClick = () => {},
}: ChatRoomContainerProps) => {
  // chatRoomList가 null일 경우 빈 배열로 초기화
  const rooms = chatRoomList || [];

  return (
    <ChatRoomInfoContainerWrapper>
      {rooms.length === 0 && <div>없습니다.</div>}
      {rooms.map((chatRoom) => (
        <ChatRoomItem
          key={chatRoom.roomId}
          imgUrl={chatRoom.imgUrl}
          name={chatRoom.name}
          unReadMsgCnt={chatRoom.unReadMsgCnt}
          lastMsg={chatRoom.lastMsg}
          creadtedAt={chatRoom.creadtedAt}
          onClick={() => onChatRoomClick(chatRoom.roomId)} // 클릭 시 roomId 전달
        />
      ))}
    </ChatRoomInfoContainerWrapper>
  );
};

export default ChatRoomContainer;
