import type { Meta, StoryObj } from "@storybook/react";
import ChatsPage from "./ChatsPage";
const meta = {
  title: "Features/Chat/ChatsPage",
  component: ChatsPage,
  tags: ["autodocs"],
} satisfies Meta<typeof ChatsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
