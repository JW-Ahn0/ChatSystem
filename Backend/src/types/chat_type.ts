export interface Chat {
  chat_id: string;
  room_id: string;
  sender: string;
  is_read: boolean;
  msg: string;
  created_at: Date;
}

export interface UnreadData {
  name: string;
  lastMsg: any;
  unReadMsgCnt: number | null;
  creadtedAt: any;
  roomId: string;
}

export interface Room {
  name: string;
  lastMsg: any;
  unReadMsgCnt: number | null;
  creadtedAt: any;
  roomId: string;
}
