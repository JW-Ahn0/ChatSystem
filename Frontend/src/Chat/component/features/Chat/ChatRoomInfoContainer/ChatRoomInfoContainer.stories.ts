import type { Meta, StoryObj } from "@storybook/react";
import ChatRoomContainer from "./ChatRoomInfoContainer";

const meta = {
  title: "Features/Chat/ChatRoomContainer",
  component: ChatRoomContainer,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatRoomContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const chatRoomInfo = {
  /** 채팅방 ID */
  roomId: "1",
  /** 닉네임 */
  name: "테스트",
  /** 마지막에 온 메시지 */
  lastMsg: "안녕하세요 자리있나요?",
  /** 안 읽은 메시지 개수 */
  unReadMsgCnt: 1,
  /** 마지막 메시지 온 시간 */
  creadtedAt: new Date().toString(),
};

const chatRoomList = Array.from({ length: 6 }, () => ({ ...chatRoomInfo }));

export const Default: Story = {
  args: {
    chatRoomList: chatRoomList,
    selectedRoomId: "1",
  },
};

export const Empty: Story = {
  args: {
    selectedRoomId: "1",
  },
};
