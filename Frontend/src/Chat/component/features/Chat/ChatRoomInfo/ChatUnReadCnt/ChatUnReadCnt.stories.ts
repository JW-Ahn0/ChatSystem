import type { Meta, StoryObj } from "@storybook/react";
import ChatUnReadCnt from "./ChatUnReadCnt";

const meta = {
  title: "Features/Chat/ChatUnReadCnt",
  component: ChatUnReadCnt,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatUnReadCnt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    num: 5,
  },
};
