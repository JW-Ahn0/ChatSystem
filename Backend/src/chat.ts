import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * roomid, sender를 통해 채팅내역을 저장합니다.
 * @param roomId 방 번호,
 * @param sender 보낸 사람 ID,
 * @param message 메시지 내용
 * @returns 저장한 chat 객체
 */

export async function createChat(
  roomId: string,
  sender: string,
  message: string
) {
  try {
    const newChat = await prisma.chat.create({
      data: {
        room_id: roomId,
        sender: sender,
        msg: message,
      },
    });
    console.log("새로운 채팅이 생성되었습니다:", newChat);
    return newChat;
  } catch (error) {
    console.error("채팅 생성 오류:", error);
    throw error;
  }
}

/**
 * userId가 포함된 ChatRoom을 찾거나, 없으면 새로운 ChatRoom을 생성하여 반환합니다.
 * @param userList 참여할 유저 ID 배열 (예: ["userA", "userB"])
 * @returns 생성되거나 찾은 ChatRoom의 room_id
 */
export async function getOrCreateChatRoom(userList: string[]): Promise<string> {
  try {
    // 1. 해당 userList와 일치하는 채팅방이 있는지 검색
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        user_list: {
          hasEvery: userList, // 모든 유저가 해당 방에 있는지 확인
        },
      },
    });

    // 2. 채팅방이 없으면 새로 생성
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          user_list: userList,
        },
      });
      console.log(`새로운 채팅방 생성: room_id=${chatRoom.room_id}`);
    } else {
      console.log(`기존 채팅방 찾음: room_id=${chatRoom.room_id}`);
    }

    return chatRoom.room_id;
  } catch (error) {
    console.error("채팅방 처리 중 오류 발생:", error);
    throw error;
  }
}

/**
 * roomid, sender를 통해 채팅내역을 저장합니다.
 * @param roomId 방 번호,
 * @param sender 보낸 사람 ID,
 * @param message 메시지 내용
 * @returns 저장한 chat 객체
 */

export async function updateChatUnread(
  userId: string,
  roomId: string,
  message: string
) {
  try {
    const unreadData = await prisma.chatUnread.upsert({
      where: {
        unique_user_room: {
          user_id: userId,
          room_id: roomId,
        },
      },
      update: {
        unread_last_msg: message,
        unread_msg_cnt: { increment: 1 },
      },
      create: {
        user_id: userId,
        room_id: roomId,
        unread_last_msg: message,
        unread_msg_cnt: 1,
      },
    });

    console.log("ChatUnread 정보가 업데이트되었습니다:", unreadData);
    return unreadData;
  } catch (error) {
    console.error("ChatUnread 업데이트 오류:", error);
    throw error;
  }
}
