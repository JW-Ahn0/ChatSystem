import type { Meta, StoryObj } from "@storybook/react";
import ChatDay from "./ChatDay";

const meta = {
  title: "Features/Chat/ChatDay",
  component: ChatDay,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatDay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { date: new Date() },
};
