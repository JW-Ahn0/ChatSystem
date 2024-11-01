//Date - > 'XXXX년XX월XX일(X) 형식으로 변환
export function convertDate2Str(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
  const day = String(localDate.getDate()).padStart(2, "0");
  const dayOfWeek = days[localDate.getDay()]; // 요일 가져오기

  const formattedDate = `${year}.${month}.${day}(${dayOfWeek})`;

  return formattedDate;
}

//Date - > XX시XX분 형식으로 변환
export function convertDate2Time(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
// Date -> 오늘: "HH시 MM분", 올해: "MM월 DD일", 그 외: "YYYY.MM.DD"
export function convertDate2ClentTime(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();

  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const isThisYear = date.getFullYear() === today.getFullYear();

  if (isToday) {
    // 오늘이면 시간 (HH시 MM분)
    return convertDate2Time(dateStr);
  } else if (isThisYear) {
    // 올해면 "MM월 DD일"
    const month = date
      .toLocaleString("ko-KR", { month: "2-digit" })
      .replace(/^0/, ""); // 0 제거
    const day = date
      .toLocaleString("ko-KR", { day: "2-digit" })
      .replace(/^0/, ""); // 0 제거
    return `${month} ${day}`;
  } else {
    // 올해가 아니면 "YYYY.MM.DD"
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
}
