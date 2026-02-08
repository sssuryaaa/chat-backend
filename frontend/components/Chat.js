import React, { useEffect, useState } from "react";
import Newchat from "./Newchat";
import ChatSpace from "./ChatSpace";

const Chat = () => {
  const [chats, setChats] = useState(null); // List of chats
  const [activeChat, setActiveChat] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [userId, setUserId] = useState(null);
  const alreadyEncounteredIds = [];
  const friends = !chats
    ? []
    : chats.map((chat) => {
        if (chat.receiver._id === userId) {
          if (alreadyEncounteredIds.includes(chat.sender._id)) {
            return undefined;
          }
          alreadyEncounteredIds.push(chat.sender._id);
          return chat.sender;
        } else {
          if (alreadyEncounteredIds.includes(chat.receiver._id)) {
            return undefined;
          }
          alreadyEncounteredIds.push(chat.receiver._id);
          return chat.receiver;
        }
      });
  const actualFriends = friends.filter((friend) => friend !== undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/chats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          throw new Error(res.status);
        }
        const data = await res.json();
        setChats(data.messages.reverse());
      } catch (err) {
        alert(err.message);
      }
    };

    const fetchId = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/userId", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          throw new Error(res.status);
        }
        const data = await res.json();
        setUserId(data.userId);
      } catch (err) {
        alert(err.message);
      }
    };
    fetchData();
    fetchId();
  }, []);

  return (
    <div className="flex">
      <div className="w-3/12 p-2">
        <div className="flex justify-between">
          <div>LOGO</div>
          <div onClick={() => setIsNewChat((prev) => !prev)}>New Chat</div>
        </div>
        {!isNewChat ? (
          <div>
            {!chats ? (
              "Loading"
            ) : chats.length === 0 ? (
              "No Chats"
            ) : (
              <div>
                {actualFriends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() =>
                      setActiveChat({
                        _id: friend._id,
                        username: friend.username,
                        email: friend.email,
                      })
                    }
                  >
                    <h1>{friend.username}</h1>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Newchat
            setNewChatToFalse={() => setIsNewChat(false)}
            setActiveChat={setActiveChat}
          />
        )}
      </div>
      <ChatSpace activeChat={activeChat} userId={userId} setChats={setChats} />
    </div>
  );
};

export default Chat;
