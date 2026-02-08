import React, { useEffect, useState } from "react";

const ChatSpace = ({ activeChat, userId, setChats }) => {
  const [message, setMessage] = useState("");
  const [listOfMessages, setListOfMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/messages/${activeChat._id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (!res.ok) {
          throw new Error(res.status);
        }
        const data = await res.json();
        setListOfMessages(data.messages);
      } catch (err) {
        alert(err.message);
      }
    };
    if (activeChat) fetchData();
  }, [activeChat]);

  const sendMessage = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          receiverId: activeChat._id,
          content: message,
        }),
      });

      if (!res.ok) {
        throw new Error(res.status);
      }
      const data = await res.json();
      setListOfMessages([...listOfMessages, data.message]);
      setMessage("");
      setChats((prev) => [data.message, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };
  return activeChat ? (
    <div className="w-9/12 p-2">
      <div>
        <div>{activeChat.username}</div>
        <div>{activeChat.email}</div>
      </div>
      <div>
        {listOfMessages.map((mess) => {
          return (
            <div
              className={`${mess?.sender?._id === userId ? "text-right" : ""} ${mess?.sender === userId ? "text-right" : ""}`}
              key={mess._id}
            >
              {mess.content}
            </div>
          );
        })}
      </div>
      <div>
        <input
          type="text"
          placeholder="send message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></input>
        <button onClick={sendMessage}>send</button>
      </div>
    </div>
  ) : (
    <h1>please select a chat to start chatting</h1>
  );
};

export default ChatSpace;
