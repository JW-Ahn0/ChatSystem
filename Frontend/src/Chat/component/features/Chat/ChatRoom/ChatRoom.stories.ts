import type { Meta, StoryObj } from "@storybook/react";
import ChatRoom from "./ChatRoom";
import { ServerChat } from "../../../../../types/Chat";

const meta = {
  title: "Features/Chat/ChatRoom",
  component: ChatRoom,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatRoom>;

export default meta;
type Story = StoryObj<typeof meta>;

const serverChatList: ServerChat[] = [
  {
    chat_id: "1",
    room_id: "1",
    sender: "user1",
    is_read: true,
    msg: "Hi",
    created_at: "2024-10-28T10:15:00Z",
  },
  {
    chat_id: "2",
    room_id: "1",
    sender: "user1",
    is_read: true,
    msg: "How are you?",
    created_at: "2024-10-28T10:15:30Z",
  },
  {
    chat_id: "3",
    room_id: "1",
    sender: "user2",
    is_read: true,
    msg: "Hello!",
    created_at: "2024-10-28T10:16:00Z",
  },
  {
    chat_id: "4",
    room_id: "1",
    sender: "user1",
    is_read: true,
    msg: "Goodbye",
    created_at: "2024-10-28T10:17:00Z",
  },
];
export const Default: Story = {
  args: {
    chatList: serverChatList,
    myUsername: "user1",
    otherUserId: "user2",
    roomId: "1",
    sendMessage: (msg, targetId) => {
      console.log(msg, targetId);
    },
    sendUnReadMessage: (unreadChatIds, userId) => {
      console.log(unreadChatIds, userId);
    },
  },
};
