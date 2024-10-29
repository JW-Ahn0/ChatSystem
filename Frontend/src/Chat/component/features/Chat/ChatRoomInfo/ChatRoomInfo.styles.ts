import styled from "styled-components";

const ChatRoomInfoWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 16px;

  padding: 10px;

  &:hover {
    background-color: var(--color-white);
  }
  cursor: pointer;

  .name--and--msg {
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
    }
  }
  .time--and--cnt {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 12px;
    gap: 8px;
  }
`;

export default ChatRoomInfoWrapper;
