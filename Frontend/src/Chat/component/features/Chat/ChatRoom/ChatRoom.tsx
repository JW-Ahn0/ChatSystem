import { useEffect, useRef, useState } from "react";
import { ServerChat } from "../../../../../types/Chat";
import ChatInput from "../ChatInput/ChatInput";
import ChatRoomWrapper from "./ChatRoom.styles";
import { useChatGroups } from "../../../../../hooks/Chat/useChatGroups";
import ChatMsgContainer from "../ChatMsgContainer/ChatMsgContainer";
import { convertDate2Str } from "../../../../../utils/dateUtil";
import ChatDay from "../ChatDay/ChatDay";

interface ChatRoomProps {
  chatList?: ServerChat[] | null;
  myUsername: string;
  roomId?: string;
  sendMessage: (msg: string, targetId: string) => void;
  sendUnReadMessage: (
    unreadChatIds: string[],
    userId: string,
    roomId?: string
  ) => void;
  otherUserId: string;
}

const ChatRoom = ({
  chatList,
  myUsername,
  roomId,
  sendMessage,
  sendUnReadMessage,
  otherUserId,
}: ChatRoomProps) => {
  const [newChats, setNewChats] = useState<ServerChat[]>([]);
  const chatGroups = useChatGroups(newChats, myUsername); // 커스텀 훅
  const chatEndRef = useRef<HTMLDivElement>(null); // 스크롤을 내릴 참조
  const [isInputEvent, setIsInputEvent] = useState<boolean>(true);

  const [unreadChatIds, setUnreadChatIds] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false); // 포커스 상태를 추적할 상태
  const chatRoomRef = useRef<HTMLDivElement>(null);
  // 포커스 상태 변경 핸들러
  const handleFocusChange = (focused: boolean) => {
    setIsFocused(focused);
  };
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const chatRoomElement = chatRoomRef.current;
    if (chatRoomElement) {
      chatRoomElement.addEventListener("focus", handleFocus);
      chatRoomElement.addEventListener("blur", handleBlur);
    }

    return () => {
      if (chatRoomElement) {
        chatRoomElement.removeEventListener("focus", handleFocus);
        chatRoomElement.removeEventListener("blur", handleBlur);
      }
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      // 여기서 unreadChatIds를 가져오는 로직 호출
      fetchUnreadChatIds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, chatList]);

  const fetchUnreadChatIds = () => {
    const unreadIds =
      chatList
        ?.filter((chat) => !chat.is_read && chat.sender !== myUsername)
        .map((chat) => chat.chat_id) ?? [];
    setUnreadChatIds(unreadIds);
  };

  useEffect(() => {
    sendUnReadMessage(unreadChatIds, myUsername, roomId);
  }, [unreadChatIds]);

  useEffect(() => {
    if (chatList) {
      setNewChats(chatList);
      setIsInputEvent(true);
    }
  }, [chatList]);

  useEffect(() => {
    // 새 메시지가 추가될 때마다 스크롤을 아래로 이동
    if (isInputEvent) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
      if (chatGroups.length > 0) {
        setIsInputEvent(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatGroups]);

  const handleMsg = (msg: string) => {
    const newChat: ServerChat = {
      chat_id: "",
      room_id: roomId ? roomId : "",
      sender: myUsername,
      is_read: false,
      msg,
      created_at: new Date().toString(),
    };

    // 새로운 메시지를 추가하고 상태 업데이트
    setNewChats((prevChats) => {
      const updatedChats = [...prevChats, newChat];
      setIsInputEvent(true);
      sendMessage(msg, otherUserId);
      return updatedChats;
    });
  };

  return (
    <ChatRoomWrapper ref={chatRoomRef} tabIndex={0}>
      <div className="chat-item">
        {chatGroups.map((group, index) => {
          const msgDay = convertDate2Str(group.chatList[0].creadtedAt);

          return (
            <div key={index} className="chat-date-item">
              {/* 첫 번째 메시지이거나 2개의 메시지 날짜가 다를 때만 출력 */}
              {index === 0 ||
              msgDay !==
                convertDate2Str(
                  chatGroups[index - 1].chatList[0].creadtedAt
                ) ? (
                <ChatDay date={msgDay} />
              ) : null}
              <ChatMsgContainer
                key={index}
                chatList={group.chatList}
                isMe={group.isMe}
                userNickName={group.userNickName}
              />
            </div>
          );
        })}
        <div ref={chatEndRef} /> {/* 스크롤 이동을 위한 빈 div */}
      </div>
      <ChatInput onClick={handleMsg} onFocusChange={handleFocusChange} />
    </ChatRoomWrapper>
  );
};

export default ChatRoom;
