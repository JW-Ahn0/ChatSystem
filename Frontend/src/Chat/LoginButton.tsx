import React from "react";
import { useNavigate } from "react-router-dom";

interface LoginButtonProps {
  userId: string; // userId를 props로 받음
}

const LoginButton: React.FC<LoginButtonProps> = ({ userId }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // 로그인 버튼 클릭 시 로그인 페이지로 이동
    navigate(`/chat?userId=${encodeURIComponent(userId)}`); // userId를 쿼리로 전달
  };

  return <button onClick={handleLoginClick}>로그인</button>;
};

export default LoginButton;
