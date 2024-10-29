import styled from "styled-components";

const ChatInputWrapper = styled.div`
  position: relative;
  display: inline-block;

  input {
    position: relative;
    border: 2px solid var(--bg-gray-light);
    border-radius: 10px;
    padding: 12px 50px 12px 20px;
  }
  button {
    position: absolute;
    font-size: 24px;
    color: var(--primary-color-org);
    background-color: transparent;
    right: 8px;
    top: 8px;
    border: none;
    cursor: pointer;
  }
`;

export default ChatInputWrapper;
