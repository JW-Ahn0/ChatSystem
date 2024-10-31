import {
  DEFAULT_LAST_MSG,
  DEFAULT_PROFILE_IMG,
} from "../../../../../constants/Chat";
import { convertDate2ClentTime } from "../../../../../utils/dateUtil";
import ChatRoomInfoWrapper from "./ChatRoomInfo.styles";
import ChatUnReadCnt from "./ChatUnReadCnt/ChatUnReadCnt";

interface ChatRoomItemProps {
  /** 프로필 이미지 경로 */
  imgUrl?: string;
  /** 닉네임 */
  name: string;
  /** 마지막에 온 메시지 */
  lastMsg?: string;
  /** 안 읽은 메시지 개수 */
  unReadMsgCnt?: number;
  /** 마지막 메시지 온 시간 */
  creadtedAt?: string;
  /** 온 클릭 함수 */
  onClick?: () => void;
}
const ChatRoomItem = ({
  imgUrl = DEFAULT_PROFILE_IMG,
  name,
  unReadMsgCnt = 0,
  lastMsg = DEFAULT_LAST_MSG,
  creadtedAt,
  onClick,
}: ChatRoomItemProps) => {
  const lastMsgTime = creadtedAt ? convertDate2ClentTime(creadtedAt) : "";
  return (
    <ChatRoomInfoWrapper onClick={onClick}>
      <img src={imgUrl}></img>
      <div className="name--and--msg">
        <strong>{name}</strong>
        <span>{lastMsg}</span>
      </div>
      <div className="time--and--cnt">
        <div>{lastMsgTime}</div>
        {unReadMsgCnt !== 0 && <ChatUnReadCnt num={unReadMsgCnt} />}
      </div>
    </ChatRoomInfoWrapper>
  );
};

export default ChatRoomItem;
