import type { Meta, StoryObj } from "@storybook/react";
import ChatInput from "./ChatInput";

const meta = {
  title: "Features/Chat/ChatInput",
  component: ChatInput,
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
