export async function fetchData(url: string): Promise<unknown> {
  try {
    const response = await fetch(url, {
      method: "GET", // 요청 메서드
      headers: {
        "Content-Type": "application/json", // 응답이 JSON일 때
      },
    });

    // 응답이 정상적인지 확인
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json(); // JSON으로 파싱
    return data; // 데이터 반환
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error; // 오류 발생 시 호출한 곳에 전달
  }
}
