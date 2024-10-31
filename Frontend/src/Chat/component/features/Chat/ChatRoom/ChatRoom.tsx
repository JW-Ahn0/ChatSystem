import { useEffect, useState } from "react";
import { ServerChat } from "../../../../../types/Chat";
import ChatInput from "../ChatInput/ChatInput";
import ChatMsgContainer, {
  ChatMsgContainerProps,
} from "../ChatMsgContainer/ChatMsgContainer";
import ChatRoomWrapper from "./ChatRoom.styles";

interface ChatRoomProps {
  chatList?: ServerChat[] | null;
}

const ChatRoom = ({ chatList }: ChatRoomProps) => {
  // TODO: 전역 상태의 닉네임으로 변경
  const myUsername = "user1";
  const [chatGroups, setChatGroups] = useState<ChatMsgContainerProps[]>([]);

  // chatList가 변경될 때마다 chatGroups 업데이트
  useEffect(() => {
    if (chatList) {
      const groups = groupChats(chatList, myUsername);
      setChatGroups(groups);
    }
  }, [chatList, myUsername]);

  const handleMsg = (msg: string) => {
    const newChat: ServerChat = {
      chat_id: "",
      room_id: "room1", // 필요한 값들 임의로 설정
      sender: myUsername,
      is_read: false,
      msg,
      created_at: new Date().toString(),
    };

    // 새로운 메시지 추가와 함께 그룹 재생성
    const updatedChatList = chatList ? [...chatList, newChat] : [newChat];
    const updatedGroups = groupChats(updatedChatList, myUsername);
    setChatGroups(updatedGroups);
  };

  return (
    <ChatRoomWrapper>
      <div className="chat-item">
        {chatGroups.map((value, index) => (
          <ChatMsgContainer
            key={index}
            chatList={value.chatList}
            isMe={value.isMe}
            userNickName={value.userNickName}
          ></ChatMsgContainer>
        ))}
      </div>
      <ChatInput onClick={handleMsg}></ChatInput>
    </ChatRoomWrapper>
  );
};

// 시간과 발신자 기준으로 그룹화하는 함수
function groupChats(
  chatList: ServerChat[],
  myUsername: string
): ChatMsgContainerProps[] {
  const groups: ChatMsgContainerProps[] = [];

  let currentGroup: ChatMsgContainerProps | null = null;
  chatList.forEach((chat) => {
    const chatTime = formatTime(chat.created_at);
    const isMe = chat.sender === myUsername;

    // 새로운 그룹이 필요할 때: 발신자가 다르거나, 시간이 다르거나, 그룹이 없는 경우
    if (
      !currentGroup ||
      currentGroup.isMe !== isMe ||
      formatTime(currentGroup.chatList[0].creadtedAt) !== chatTime
    ) {
      // 새 그룹 생성 및 추가
      currentGroup = {
        isMe,
        userNickName: chat.sender,
        chatList: [],
      };
      groups.push(currentGroup);
    }

    // 기존 그룹에 채팅 추가
    currentGroup.chatList.push({
      msg: chat.msg,
      isLastMsg: false,
      isRead: chat.is_read,
      creadtedAt: chat.created_at,
    });
  });

  return groups;
}

// 시간(분 단위) 포맷팅 함수
function formatTime(datestr: string): string {
  const date = new Date(datestr); // 문자열을 Date 객체로 변환
  return date.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
}

export default ChatRoom;
