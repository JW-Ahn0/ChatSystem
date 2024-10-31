import styled from "styled-components";

const ChatRoomWrapper = styled.div`
  min-width: 500px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 24px;

  .chat-item {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
`;

export default ChatRoomWrapper;
