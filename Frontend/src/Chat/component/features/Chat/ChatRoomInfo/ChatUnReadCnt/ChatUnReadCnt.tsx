import ChatUnReadCntWrapper from "./ChatUnReadCnt.styles";

interface ChatUnReadCntProps {
  /** 채팅 안 읽은 숫자 */
  num: number;
}
const ChatUnReadCnt = ({ num }: ChatUnReadCntProps) => {
  return <ChatUnReadCntWrapper>{num}</ChatUnReadCntWrapper>;
};

export default ChatUnReadCnt;
