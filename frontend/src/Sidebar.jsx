import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v4 as uuidv4 } from "uuid";

// ✅ Helper: token header
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  // ✅ Dynamic name — localStorage se padho
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    setUserName(name);
  }, []);

  const getAllThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/thread", {
        headers: authHeaders(), // ✅ FIX: token bheja — warna sab ka data aata tha
      });
      if (response.status === 401) return;
      const res = await response.json();
      setAllThreads(res.map((t) => ({ threadId: t.threadId, title: t.title })));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv4());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${newThreadId}`,
        { headers: authHeaders() }, // ✅ token
      );
      const res = await response.json();
      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      await fetch(`http://localhost:8080/api/thread/${threadId}`, {
        method: "DELETE",
        headers: authHeaders(), // ✅ token
      });
      setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));
      if (threadId === currThreadId) createNewChat();
    } catch (error) {
      console.log(error);
    }
  };

  // "Ritik Tomar" → "RT"
  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <section className="sidebar">
      <button onClick={createNewChat}>
        <img src="/src/assets/chat_logo.avif" alt="Teach AI" className="logo" />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={thread.threadId === currThreadId ? "highlight" : ""}
          >
            {thread.title}
            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      {/* ✅ Dynamic user: avatar + name */}
      <div className="sign">
        <div className="userAvatar">{getInitials(userName)}</div>
        <p className="userName">{userName}</p>
      </div>
    </section>
  );
}
