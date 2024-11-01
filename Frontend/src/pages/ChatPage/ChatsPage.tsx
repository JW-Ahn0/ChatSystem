import { useSearchParams } from "react-router-dom";
import ChatRoom from "../../Chat/component/features/Chat/ChatRoom/ChatRoom";
import ChatRoomInfoContainer from "../../Chat/component/features/Chat/ChatRoomInfoContainer/ChatRoomInfoContainer";
import ChatsPageWrapper from "./ChatsPage.style";
import { fetchData } from "../../utils/dataUtil";
import { useEffect, useState } from "react";
import { ChatRoomInfo, ServerChat } from "../../types/Chat";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://59.8.137.118:5172"; // 서버 주소

const ChatsPage = () => {
  /* userId 가져오는 부분 */
  const [query] = useSearchParams();
  const userId = query.get("userId")!;
  const [otherUserId, setOtherUserId] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  // 소켓 초기화 및 연결 설정

  // 상태를 ChatRoomInfo 배열 또는 null로 초기화합니다.
  const [data, setData] = useState<ChatRoomInfo[] | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string>("");
  const [chatList, setChatList] = useState<ServerChat[]>([]);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on("message", (response) => {
      if (chatList && chatList[0].room_id === response.chat.room_id) {
        setChatList((prevChatList) => {
          if (prevChatList) {
            return [...prevChatList, response.chat];
          } else {
            return [response.chat];
          }
        });
      }
      if (response.unreadData) {
        setData(response.unreadData);
      }
    });

    newSocket.on("message-read", (response) => {
      if (response.unreadChatIds) {
        setChatList(
          (prevChatList) =>
            prevChatList
              ? prevChatList.map((chat) =>
                  response.unreadChatIds.includes(chat.chat_id)
                    ? { ...chat, is_read: true }
                    : chat
                )
              : [] // prevChatList가 null인 경우 빈 배열을 반환
        );
      }

      if (response.rooms) {
        setData(response.rooms);
      }
    });

    // 사용자 등록
    if (userId) {
      newSocket.emit("register", userId);
    }

    return () => {
      newSocket.close();
    };
  }, [userId, chatList, data]);

  // 메시지 전송
  const sendMessage = (msg: string, targetId: string) => {
    if (socket && msg.trim() && targetId) {
      socket.emit("message", {
        senderId: userId,
        targetId,
        message: msg,
      });
    }
  };

  // 메시지 전송
  const sendUnReadMessage = (
    unreadChatIds: string[],
    userId: string,
    roomId?: string
  ) => {
    if (roomId) {
      if (socket && userId && unreadChatIds.length !== 0) {
        socket.emit("message-read", {
          unreadChatIds: unreadChatIds,
          roomId: roomId,
          userId: userId,
        });
      }
    }
  };
  const handleClick = (roomId: string, otherUserId: string) => {
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
    setCurrentRoomId(roomId);
    setOtherUserId(otherUserId);
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
        selectedRoomId={currentRoomId}
      ></ChatRoomInfoContainer>
      <ChatRoom
        chatList={chatList}
        roomId={currentRoomId}
        myUsername={userId}
        sendMessage={sendMessage}
        sendUnReadMessage={sendUnReadMessage}
        otherUserId={otherUserId}
      ></ChatRoom>
    </ChatsPageWrapper>
  );
};

export default ChatsPage;
