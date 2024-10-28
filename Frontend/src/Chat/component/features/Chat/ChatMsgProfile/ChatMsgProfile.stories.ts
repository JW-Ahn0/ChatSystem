import type { Meta, StoryObj } from "@storybook/react";
import ChatMsgProfile from "./ChatMsgProfile";
const meta = {
  title: "Features/Chat/ChatMsgProfile",
  component: ChatMsgProfile,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatMsgProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "user",
  },
};
