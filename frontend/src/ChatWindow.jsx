import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

// ✅ Helper: har API call mein token automatically laga do
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getReply = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setNewChat(false);

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: authHeaders(), // ✅ FIX: token bheja ab
        body: JSON.stringify({ message: prompt, threadId: currThreadId }),
      });

      // ✅ Token expire ho gaya toh logout karo
      if (response.status === 401) {
        handleLogout();
        return;
      }

      const res = await response.json();
      setReply(res.reply);
      setPrevChats((prev) => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: res.reply },
      ]);
      setPrompt("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <span>
          Teach AI <i className="fa-solid fa-angle-down"></i>
        </span>
        <div className="userIconDiv" onClick={() => setIsOpen(!isOpen)}>
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
          </div>
          <div className="dropDownItem" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i> Log out
          </div>
        </div>
      )}

      <Chat />
      {loading && <ScaleLoader color="#10a37f" />}

      <div className="chatInput">
        <div className="userInput">
          <input
            type="text"
            placeholder="Ask anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getReply()}
          />
          <div id="submit">
            <i className="fa-solid fa-paper-plane" onClick={getReply}></i>
          </div>
        </div>
      </div>
    </div>
  );
}
