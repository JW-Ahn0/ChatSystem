import "./App.css";
import Chat from "./Chat/Chat";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Chat/LoginPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default App;
