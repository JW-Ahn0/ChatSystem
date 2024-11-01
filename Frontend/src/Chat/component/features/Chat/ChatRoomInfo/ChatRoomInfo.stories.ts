import type { Meta, StoryObj } from "@storybook/react";
import ChatRoomInfo from "./ChatRoomInfo";

const meta = {
  title: "Features/Chat/ChatRoomInfo",
  component: ChatRoomInfo,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatRoomInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    roomId: "1",
    selectedRoomId: "0",
    name: "엄마손파이",
    unReadMsgCnt: 1,
    creadtedAt: new Date().toString(),
    lastMsg: "안녕하세요.",
  },
};

export const NoUnreadMsg: Story = {
  args: {
    roomId: "1",
    selectedRoomId: "0",
    name: "엄마손파이",
  },
};

export const MsgOverflow: Story = {
  args: {
    roomId: "1",
    selectedRoomId: "0",
    name: "엄마손파이",
    unReadMsgCnt: 1,
    creadtedAt: new Date().toString(),
    lastMsg: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
};

export const SelectedMsgOverflow: Story = {
  args: {
    roomId: "1",
    selectedRoomId: "1",
    name: "엄마손파이",
    unReadMsgCnt: 1,
    creadtedAt: new Date().toString(),
    lastMsg: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
};
