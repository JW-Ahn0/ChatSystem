import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * userList 통해 채팅방이 존재하는 지 확인
 * @param userList 유저 아이디 리스트,
 * @returns 저장한 userNickName 객체
 */

export async function getRoomByUserList(userList: string[]) {
  if (!userList || userList.length === 0) {
    throw new Error("userList는 빈 배열일 수 없습니다.");
  }
  try {
    const chatRoom = await prisma.chatRoom.findFirst({
      where: {
        user_list: {
          hasEvery: userList, // user_list가 userList의 모든 값을 포함해야 함
        },
      },
    });
    return chatRoom ? true : false; // 채팅방이 존재하면 true, 아니면 false
  } catch (error) {
    console.log(error);
    throw new Error("채팅방 조회 에러");
  }
}

/**
 * user_id, user_nickname 통해 유저 아이디별 대응 되는 유저 닉네임을 저장합니다.
 * @param user_id 유저 아이디,
 * @param user_nickname 유저 닉네임,
 * @returns 저장한 userNickName 객체
 */

export async function createUserIdNickName(
  user_id: string,
  user_nickname: string,
  profile_image_index: number
) {
  try {
    const newUser = await prisma.userNickName.create({
      data: {
        user_id,
        user_nickname,
        profile_image_index,
      },
    });
    return newUser; // 채팅 내역 반환
  } catch (error) {
    console.error("닉네임 등록 에러:", error);
    throw new Error("닉네임 등록 에러.");
  }
}

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
    //console.log("새로운 채팅이 생성되었습니다:", newChat);
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
      return;
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

    //console.log("ChatUnread 정보가 업데이트되었습니다:", updatedUnread);
    return updatedUnread;
  } catch (error) {
    console.error("ChatUnread 업데이트 오류:", error);
    throw error;
  }
}
/**
 * user_id로 해당 유저가 안 읽은 메시지의 총 합을 가져옵니다.
 * @param user_id 유저 id,
 * @returns 해당 유저가 안 읽은 메시지의 총 합
 */
export async function getUnreadMessagesCountByUser(
  user_id: string
): Promise<number> {
  try {
    const result = await prisma.chatUnread.aggregate({
      _sum: {
        unread_msg_cnt: true, // unread_msg_cnt의 합계를 구함
      },
      where: {
        user_id: user_id, // 해당 user_id에 해당하는 데이터만 선택
      },
    });

    // 합계가 없을 경우 0으로 처리
    return result._sum.unread_msg_cnt || 0;
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    throw error;
  }
}

/**
 * chat_id, 당 채팅을 보낸 유저의 id를 가져옵니다.
 * @param chat_id 채팅 메시지 id,
 * @returns 해당 채팅을 보낸 유저의 id
 */
async function getSenderByChatId(chat_id: string): Promise<string> {
  try {
    const result = await prisma.chat.findUnique({
      where: {
        chat_id: chat_id,
      },
      select: {
        sender: true,
      },
    });
    if (!result) {
      console.log(`Chat with id ${chat_id} not found.`);
      return ""; // 해당 chat_id가 없을 경우 null 반환
    }
    return result.sender; // sender_id 반환
  } catch (error) {
    console.error("Error fetching sender by chat_id:", error);
    throw error; // 오류 발생 시 예외 던지기
  }
}
export async function markChatsAsRead(
  unreadChatIds: string[]
): Promise<{ count: number; sender: string }> {
  if (unreadChatIds.length === 0) {
    return { count: 0, sender: "" };
  }

  try {
    const sender = await getSenderByChatId(unreadChatIds[0]);
    const result = await prisma.chat.updateMany({
      where: {
        chat_id: { in: unreadChatIds },
      },
      data: {
        is_read: true,
      },
    });
    //console.log(`Marked ${result.count} chats as read.`);
    return { count: result.count, sender }; // 업데이트된 레코드 수 반환
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
export async function getOrCreateChatRoom(
  userList: string[]
): Promise<{ roomId: string; isFirstMsg: boolean }> {
  try {
    // 1. 해당 userList와 일치하는 채팅방이 있는지 검색
    let chatRoom = await prisma.chatRoom.findFirst({
      where: {
        user_list: {
          hasEvery: userList, // 모든 유저가 해당 방에 있는지 확인
        },
      },
    });
    let isFirstMsg = false;
    // 2. 채팅방이 없으면 새로 생성
    if (!chatRoom) {
      chatRoom = await prisma.chatRoom.create({
        data: {
          user_list: userList,
        },
      });
      isFirstMsg = true;
    }

    return { roomId: chatRoom.room_id, isFirstMsg };
  } catch (error) {
    console.error("채팅방 처리 중 오류 발생:", error);
    throw error;
  }
}
export async function getUnreadDataById(id: string) {
  try {
    const document = await prisma.userUnread.findUnique({
      where: {
        id: id, // ObjectId를 string으로 변환하여 검색
      },
    });

    //console.log("ChatUnread 정보가 업데이트되었습니다:", unreadData);
    return document;
  } catch (error) {
    console.error("ChatUnread 업데이트 오류:", error);
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

    //console.log("ChatUnread 정보가 업데이트되었습니다:", unreadData);
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
    // 유일한 sender ID에서 닉네임을 가져오기
    const uniqueSenderIds = Array.from(
      new Set(chatHistory.map((chat) => chat.sender))
    );
    const senderNicknames = await Promise.all(
      uniqueSenderIds.map((senderId) => getUserNickNameById(senderId))
    );

    // 닉네임을 매핑
    const nicknameMap = Object.fromEntries(
      uniqueSenderIds.map((id, index) => [id, senderNicknames[index]])
    );

    // 닉네임으로 변환한 채팅 내역
    const chatHistoryWithNicknames = chatHistory.map((chat) => ({
      ...chat, // 기존 채팅 데이터를 유지
      sender: nicknameMap[chat.sender], // sender를 닉네임으로 변경
    }));

    console.log(`Room ID ${roomId}의 채팅 내역 조회 완료.`);
    return chatHistoryWithNicknames; // 채팅 내역 반환
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

    //console.log(`${userId} 채팅 룸 정보 리턴 완료`);
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
  const chatRoomList = await Promise.all(
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

      // 닉네임 가져오기
      const { user_nickname, profile_image_index } =
        await getUserNickNameProfileImgById(otherUserId);
      return {
        otherUserId: otherUserId,
        name: user_nickname, // 사용자 이름
        lastMsg: lastMessage ? lastMessage.msg : undefined, // 마지막 메시지
        unReadMsgCnt: unreadData ? unreadData.unread_msg_cnt : 0, // 읽지 않은 메시지 개수
        creadtedAt: lastMessage ? lastMessage.created_at : null, // 마지막 메시지의 시간
        roomId: room.room_id,
        profileImageIndex: profile_image_index,
      };
    })
  );
  // createdAt 기준으로 정렬 (내림차순)
  return chatRoomList.sort((a, b) => {
    // a.createdAt과 b.createdAt이 null일 경우를 대비
    if (a.creadtedAt === null && b.creadtedAt === null) return 0;
    if (a.creadtedAt === null) return 1; // a가 null이면 b가 앞에 와야 함
    if (b.creadtedAt === null) return -1; // b가ㅊ null이면 a가 앞에 와야 함

    // 두 값이 있을 경우 내림차순 정렬
    return new Date(b.creadtedAt).getTime() - new Date(a.creadtedAt).getTime();
  });
}
/**
 * getUserNickNameById userId로 닉네임 가져오기
 */
export async function getUserNickNameById(userId: string) {
  try {
    const userNickName = await prisma.userNickName.findFirst({
      where: { user_id: userId }, // user_id로 검색
    });
    return userNickName ? userNickName.user_nickname : "Unknown"; // 닉네임이 없으면 "Unknown" 반환
  } catch (error) {
    console.error("닉네임 조회 에러:", error);
    return "Unknown"; // 에러 발생 시 "Unknown" 반환
  }
}
export async function getUserNickNameProfileImgById(userId: string) {
  try {
    const userNickName = await prisma.userNickName.findFirst({
      where: { user_id: userId }, // user_id로 검색
    });
    return userNickName
      ? {
          user_nickname: userNickName.user_nickname,
          profile_image_index: userNickName.profile_image_index,
        }
      : { user_nickname: "Unknown", profile_image_index: 1 }; // 닉네임이 없으면 "Unknown" 반환
  } catch (error) {
    console.error("닉네임 조회 에러:", error);
    return { user_nickname: "Unknown", profile_image_index: 1 }; // 닉네임이 없으면 "Unknown" 반환
  }
}

interface RoomInfo {
  room_id: string;
  user_list: string[];
}

/**
 * test
 */

export async function updateUnRaedTable(userId: string, cnt: number) {
  try {
    // 현재 unread_msg_cnt 조회
    const currentUnread = await prisma.userUnread.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!currentUnread) {
      return;
    }
    // 업데이트
    const updatedUnread = await prisma.userUnread.update({
      where: {
        user_id: userId,
      },
      data: {
        unread_msg_cnt: cnt,
      },
    });
    return updatedUnread;
  } catch (error) {
    console.error("ChatUnread 업데이트 오류:", error);
    throw error;
  }
}

export async function upsertUserUnRaedTable(userId: string) {
  try {
    // 먼저 user_id로 해당 데이터가 있는지 확인
    const existingData = await prisma.userUnread.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (existingData) {
      // 데이터가 있으면 update
      const unreadData = await prisma.userUnread.update({
        where: {
          id: existingData.id, // id를 기준으로 update
        },
        data: {
          unread_msg_cnt: { increment: 1 },
        },
      });
      //console.log("ChatUnread 정보가 업데이트되었습니다:", unreadData);
      return unreadData;
    } else {
      // 데이터가 없으면 create
      const unreadData = await prisma.userUnread.create({
        data: {
          user_id: userId,
          unread_msg_cnt: 1,
        },
      });
      //console.log("새로운 ChatUnread 정보가 생성되었습니다:", unreadData);
      return unreadData;
    }
  } catch (error) {
    console.error("ChatUnread 업데이트 오류:", error);
    throw error;
  }
}
