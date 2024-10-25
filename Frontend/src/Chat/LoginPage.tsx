import { useState } from "react";
import LoginButton from "./LoginButton";

const LoginPage = () => {
  const [userId, setUserId] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState<boolean>(false); // 입력 필드를 비활성화할 플래그

  const handleRegister = () => {
    console.log("등록된 사용자 ID:", userId);
    setIsDisabled(true); // 입력 필드 비활성화
  };

  return (
    <>
      <div>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="사용자 ID 입력"
          disabled={isDisabled} // 플래그에 따라 disabled 상태 결정
        />
        <button onClick={handleRegister} disabled={isDisabled}>
          등록
        </button>
      </div>
      {isDisabled && <LoginButton userId={userId} />}
    </>
  );
};

export default LoginPage;
