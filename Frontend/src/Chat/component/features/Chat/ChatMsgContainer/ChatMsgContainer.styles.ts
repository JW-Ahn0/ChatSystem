import styled from "styled-components";

const ChatMsgContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.my {
    align-items: flex-end;
  }

  &.other {
    align-items: flex-start;
  }
`;

export default ChatMsgContainerWrapper;
