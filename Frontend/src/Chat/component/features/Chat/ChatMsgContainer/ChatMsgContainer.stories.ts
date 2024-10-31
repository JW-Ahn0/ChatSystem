import type { Meta, StoryObj } from "@storybook/react";
import ChatMsgContainer from "./ChatMsgContainer";
const meta = {
  title: "Features/Chat/ChatMsgContainer",
  component: ChatMsgContainer,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatMsgContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const testArgus = {
  /** 채팅 메시지 내용 */
  msg: "안녕하세요",
  /** 해당 채팅이 그룹에서 마지막 메시지인지 구분,(시간 표시 유무 구분)*/
  isLastMsg: false,
  /** 해당 채팅을 읽었는지 구분 */
  isRead: false,
  /** 해당 메시지 보낸 시간 */
  creadtedAt: new Date().toString(),
};

const otehrChatList = Array.from({ length: 6 }, () => ({ ...testArgus }));

const myMessage = { ...testArgus, isMe: true };
const myChatList = Array.from({ length: 6 }, () => ({ ...myMessage }));
export const Me: Story = {
  args: { chatList: otehrChatList, isMe: true, userNickName: "엄마손파이" },
};

export const Other: Story = {
  args: { chatList: myChatList, isMe: false, userNickName: "엄마손파이" },
};
