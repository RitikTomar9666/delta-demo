import "./Chat.css";
import { MyContext } from "./MyContext.jsx";
import React, { useContext, useState, useEffect } from "react";
import rehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/atom-one-dark.css";

export default function Chat() {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  useEffect(() => {
    if (reply === null) {
      setLatestReply(null);
      return;
    }

    if (!prevChats?.length) return;
    const content = reply.split(" ");

    let idx = 0;
    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(" "));

      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats, reply]);

  return (
    <>
      {newChat && <h1>Start a new Chat</h1>}
      <div className="chats">
        {prevChats?.slice(0, -1).map((chat, idx) => (
          <div className={chat.role === "user" ? "userDi" : "gptDiv"} key={idx}>
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}
        {prevChats.length > 0 && latestReply !== null && (
          <div className="gptDiv" key={"typing"}>
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {latestReply}
            </ReactMarkdown>
          </div>
        )}
        {prevChats.length > 0 && latestReply === null && (
          <div className="gptDiv" key={"non-typing"}>
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {prevChats[prevChats.length - 1].content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
}
