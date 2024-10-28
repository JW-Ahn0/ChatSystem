import type { Preview } from "@storybook/react";
import "../src/css/common.css";
import "../src/css/font.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
