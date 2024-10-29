import styled from "styled-components";

const ChatUnReadCntWrapper = styled.div`
  width: 4px;
  height: 4px;
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;

  background-color: var(--color-chat-orange);

  color: var(--color-white);
  padding: 8px;
  border-radius: 50%;
`;

export default ChatUnReadCntWrapper;
