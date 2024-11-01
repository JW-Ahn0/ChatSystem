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
export async function updateChatUnreadByCnt(
  userId: string,
  roomId: string,
  cnt: number
) {
  try {
    // 현재 unread_msg_cnt 조회
    const currentUnread = await prisma.chatUnread.findUnique({
      where: {
        unique_user_room: {
          user_id: userId,
          room_id: roomId,
        },
      },
    });

    if (!currentUnread) {
      throw new Error("ChatUnread record not found");
    }

    // 감소 계산 및 0으로 제한
    const newUnreadCount = Math.max(
      (currentUnread.unread_msg_cnt || 0) - cnt,
      0
    );

    // 업데이트
    const updatedUnread = await prisma.chatUnread.update({
      where: {
        unique_user_room: {
          user_id: userId,
          room_id: roomId,
        },
      },
      data: {
        unread_msg_cnt: newUnreadCount,
      },
    });

    console.log("ChatUnread 정보가 업데이트되었습니다:", updatedUnread);
    return updatedUnread;
  } catch (error) {
    console.error("ChatUnread 업데이트 오류:", error);
    throw error;
  }
}

export async function markChatsAsRead(
  unreadChatIds: string[]
): Promise<number> {
  try {
    const result = await prisma.chat.updateMany({
      where: {
        chat_id: { in: unreadChatIds },
      },
      data: {
        is_read: true,
      },
    });
    console.log(`Marked ${result.count} chats as read.`);
    return result.count; // 업데이트된 레코드 수 반환
  } catch (error) {
    console.error("Error updating chats as read:", error);
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

export async function updateChatUnread(userId: string, roomId: string) {
  try {
    const unreadData = await prisma.chatUnread.upsert({
      where: {
        unique_user_room: {
          user_id: userId,
          room_id: roomId,
        },
      },
      update: {
        unread_msg_cnt: { increment: 1 },
      },
      create: {
        user_id: userId,
        room_id: roomId,
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

/**
 * roomid 로 채팅 내역을 가져옵니다.
 * @param roomId 방 번호,
 * @returns chat테이블의 채팅 내역(최대 300개)
 */
export async function getChatHistoryByRoomId(roomId: string) {
  try {
    const chatHistory = await prisma.chat.findMany({
      where: {
        room_id: roomId, // 주어진 roomId에 해당하는 채팅 조회
      },
      orderBy: {
        created_at: "asc", // 시간 순서로 정렬
      },
      take: 300, // 최대 300개까지 가져옴
    });

    console.log(`Room ID ${roomId}의 채팅 내역 조회 완료.`);
    return chatHistory; // 채팅 내역 반환
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw new Error("Failed to get chat history.");
  }
}

/**
 * userId로 채팅룸 정보 리스트를 가져옵니다.
 * @param roomId 유저 ID,
 * @returns 채팅 룸 정보 리스트
 */
export async function getChatRoomInfoByUserId(userId: string) {
  try {
    const rooms = await fetchUserChatRooms(userId);
    const lastMessages = await getLatestMessagesByRoom(rooms);
    const chatRoomList = await buildChatRoomList(rooms, lastMessages, userId);

    console.log(`${userId} 채팅 룸 정보 리턴 완료`);
    return chatRoomList; // 채팅 정보 리스트
  } catch (error) {
    console.error("Error fetching room chat info:", error);
    throw new Error("Failed to get room chat info.");
  }
}

// 1. 사용자의 채팅방 목록 조회
async function fetchUserChatRooms(userId: string) {
  const rooms = await prisma.chatRoom.findMany({
    where: {
      user_list: {
        has: userId, // 배열에 userId가 포함된 경우
      },
    },
    select: {
      room_id: true, // room_id만 필요하므로 선택
      user_list: true, // user_list도 선택하여 다른 사용자 ID를 가져옴
    },
  });

  // 2. room_id와 user_list 객체 배열 생성
  return rooms.map((room) => ({
    room_id: room.room_id,
    user_list: room.user_list,
  }));
}

// 3. 각 room_id 별로 마지막 메시지 가져오기
async function getLatestMessagesByRoom(roomIds: RoomInfo[]) {
  const latestMessages = await Promise.all(
    roomIds.map(async (roomId) => {
      const messages = await prisma.chat.findMany({
        where: { room_id: roomId.room_id },
        orderBy: { created_at: "desc" },
        take: 1, // 최신 메시지 하나만 가져오기
      });
      return messages[0] || null; // 최신 메시지가 없으면 null 반환
    })
  );

  return latestMessages;
}

// 4. 각 room_id 별로 마지막 메시지와 읽지 않은 메시지 개수 가져오기
async function buildChatRoomList(
  rooms: { room_id: string; user_list: string[] }[],
  lastMessages: any[],
  userId: string
) {
  return Promise.all(
    rooms.map(async (room) => {
      const lastMessage = lastMessages.find(
        (msg) => msg.room_id === room.room_id
      );

      // 5. ChatUnread 데이터 조회 (사용자 ID가 일치하는 경우에만)
      const unreadData = await prisma.chatUnread.findUnique({
        where: {
          unique_user_room: {
            user_id: userId,
            room_id: room.room_id,
          },
        },
      });

      // 6. 다른 사용자 ID를 선택하여 이름을 가져오기
      const otherUserId =
        room.user_list.find((id) => id !== userId) || "Unknown"; // 다른 사용자 ID가 없으면 "Unknown"

      return {
        name: otherUserId, // 사용자 이름
        lastMsg: lastMessage ? lastMessage.msg : undefined, // 마지막 메시지
        unReadMsgCnt: unreadData ? unreadData.unread_msg_cnt : 0, // 읽지 않은 메시지 개수
        creadtedAt: lastMessage ? lastMessage.created_at : null, // 마지막 메시지의 시간
        roomId: room.room_id,
      };
    })
  );
}

interface RoomInfo {
  room_id: string;
  user_list: string[];
}
