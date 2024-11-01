import styled from "styled-components";

const ChatRoomWrapper = styled.div`
  min-width: 500px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;

  .chat-item {
    max-height: 800px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .chat-date-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

export default ChatRoomWrapper;
