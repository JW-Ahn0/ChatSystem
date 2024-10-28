import type { Meta, StoryObj } from "@storybook/react";

import ChatMsg from "./ChatMsg";

const meta = {
  title: "ChatMsg",
  component: ChatMsg,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatMsg>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultOther: Story = {
  args: {
    msg: "안녕하세요 반갑습니다.",
    isMe: false,
    creadtedAt: new Date(),
    isRead: false,
    isLastMsg: true,
  },
};

export const DefaultMe: Story = {
  args: {
    msg: "네 안녕하세요 무슨 일이시죠?",
    isMe: true,
    creadtedAt: new Date(),
    isRead: false,
    isLastMsg: true,
  },
};
