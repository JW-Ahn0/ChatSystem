import { useEffect, useState } from "react";
import { ChatMsgContainerProps } from "../../Chat/component/features/Chat/ChatMsgContainer/ChatMsgContainer";
import { ServerChat } from "../../types/Chat";

// 커스텀 훅: chatList 변경에 따라 그룹화된 chatGroups를 반환
export function useChatGroups(
  chatList: ServerChat[] | null | undefined,
  myUsername: string
) {
  const [chatGroups, setChatGroups] = useState<ChatMsgContainerProps[]>([]);
  useEffect(() => {
    if (chatList && chatList.length !== 0) {
      const groups = groupChats(chatList, myUsername);
      setChatGroups(groups);
    }
  }, [chatList, myUsername]);
  return chatGroups;
}

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

    if (
      !currentGroup ||
      currentGroup.isMe !== isMe ||
      formatTime(currentGroup.chatList[0].creadtedAt) !== chatTime
    ) {
      currentGroup = {
        isMe,
        userNickName: chat.sender,
        chatList: [],
      };
      groups.push(currentGroup);
    }

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
  const date = new Date(datestr);
  return date.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
}
