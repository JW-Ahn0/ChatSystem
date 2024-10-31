import { useSearchParams } from "react-router-dom";
import ChatRoom from "../../Chat/component/features/Chat/ChatRoom/ChatRoom";
import ChatRoomInfoContainer from "../../Chat/component/features/Chat/ChatRoomInfoContainer/ChatRoomInfoContainer";
import ChatsPageWrapper from "./ChatsPage.style";
import { fetchData } from "../../utils/dataUtil";
import { useEffect, useState } from "react";
import { ChatRoomInfo, ServerChat } from "../../types/Chat";
const SERVER_URL = "http://59.8.137.118:5172"; // 서버 주소

const ChatsPage = () => {
  /* userId 가져오는 부분 */
  const [query] = useSearchParams();
  const userId = query.get("userId")!;
  // 상태를 ChatRoomInfo 배열 또는 null로 초기화합니다.
  const [data, setData] = useState<ChatRoomInfo[] | null>(null);

  const [chatList, setChatList] = useState<ServerChat[] | null>(null);
  const handleClick = (roomId: string) => {
    const fetchChatList = async () => {
      try {
        const chatListData: ServerChat[] = (await fetchData(
          SERVER_URL + `/chat/${roomId}`
        )) as ServerChat[];
        setChatList(chatListData); // 가져온 데이터를 상태에 저장
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };
    fetchChatList();
  };

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const chatData: ChatRoomInfo[] = (await fetchData(
          SERVER_URL + `/chat/rooms/${userId}`
        )) as ChatRoomInfo[];
        setData(chatData); // 가져온 데이터를 상태에 저장
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };

    fetchChatRooms();
  }, [userId]);
  return (
    <ChatsPageWrapper>
      <ChatRoomInfoContainer
        chatRoomList={data}
        onChatRoomClick={handleClick}
      ></ChatRoomInfoContainer>
      <ChatRoom chatList={chatList}></ChatRoom>
    </ChatsPageWrapper>
  );
};

export default ChatsPage;
