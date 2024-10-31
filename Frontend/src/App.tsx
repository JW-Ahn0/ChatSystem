import "./App.css";
import Chat from "./Chat/Chat";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Chat/LoginPage";
import ChatsPage from "./pages/ChatPage/ChatsPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chats" element={<ChatsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
