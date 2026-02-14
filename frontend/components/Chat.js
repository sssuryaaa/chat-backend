import React, { useEffect, useRef, useState } from "react";
import Newchat from "./Newchat";
import ChatSpace from "./ChatSpace";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";

const Chat = () => {
  const [chats, setChats] = useState(null); // List of chats
  const [activeChat, setActiveChat] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState([]);
  const [logoutToggle, setLogoutToggle] = useState(false);
  const [countOfUnreadMessages, setCountOfUnreadMessages] = useState({});
  const [listOfMessages, setListOfMessages] = useState([]);
  const activeChatRef = useRef(activeChat);
  const navigate = useNavigate();
  const lastMessages = {};
  const alreadyEncounteredIds = [];
  const friends = !chats
    ? []
    : chats
        .slice()
        .reverse()
        .map((chat) => {
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

  if (chats) {
    chats.forEach((chat) => {
      if (chat.receiver._id === userId) {
        if (!lastMessages[chat.sender._id]) lastMessages[chat.sender._id] = {};
        lastMessages[chat.sender._id] = chat.content;
      } else {
        if (!lastMessages[chat.receiver._id])
          lastMessages[chat.receiver._id] = {};
        lastMessages[chat.receiver._id] = chat.content;
      }
    });
  }
  const actualFriends = friends.filter((friend) => friend !== undefined);
  const filteredFriends = actualFriends.filter((friend) => {
    return friend.username
      .toLowerCase()
      .includes(search.toLocaleLowerCase().trim());
  });
  const dosts = people.filter(
    (person) =>
      person.username
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase().trim()) &&
      !actualFriends.map((fr) => fr.username).includes(person.username),
  );

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }
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
        setChats(data.messages);
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

    const fetchPeople = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        setPeople(data.users);
      } catch (error) {
        alert(error.message);
      }
    };

    fetchData();
    fetchId();
    fetchPeople();

    const socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });

    const onNew = async (msg) => {
      // update chat list/messages state
      setChats((prev) => [...prev, msg]);
      if (
        activeChatRef.current &&
        activeChatRef.current._id === msg.sender._id
      ) {
        setListOfMessages((prev) => [...prev, msg]);
        try {
          const res = await fetch(
            `http://localhost:5000/api/messages/${msg._id}/viewed`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          if (!res.ok) throw new Error(res.status);
        } catch (err) {
          alert(err.message);
        }
      }
      // console.log("message:new", msg);
    };

    const onViewed = ({ messageId, isViewed }) => {
      // mark message viewed in state
      setChats((prev) => {
        return prev.map((ele) => {
          if (ele._id === messageId) ele.isViewed = isViewed;
          return ele;
        });
      });
      // console.log("message:viewed", messageId, isViewed);
    };

    socket.on("message:new", onNew);
    socket.on("message:viewed", onViewed);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:viewed", onViewed);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!chats) return;
    const unReadMessages = chats.filter(
      (chat) =>
        chat.receiver._id === userId &&
        !chat.isViewed &&
        (activeChat ? activeChat._id !== chat.sender._id : true),
    );
    const unReadMessagesOfEachUser = {};
    unReadMessages.forEach((element) => {
      unReadMessagesOfEachUser[element.sender._id]
        ? unReadMessagesOfEachUser[element.sender._id]++
        : (unReadMessagesOfEachUser[element.sender._id] = 1);
    });
    setCountOfUnreadMessages(unReadMessagesOfEachUser);
  }, [chats]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  console.log(chats);

  return (
    <div className="flex" onClick={() => setLogoutToggle(false)}>
      <div className="w-3/12 border-r border-gray-800 h-dvh">
        <div className="sticky top-2 h-[20dvh] bg-gray-200 rounded-lg m-2 pb-2">
          <div className="flex justify-between p-4 items-center">
            <div className="font-bold text-orange-600 ">LOGO</div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div
                className={`bg-gray-200 border border-gray-100 text-sm rounded-full px-4 py-2 cursor-pointer  transition-colors ${isNewChat ? "bg-orange-300 hover:bg-amber-400" : ""}`}
                onClick={() => setIsNewChat((prev) => !prev)}
              >
                New Chat
              </div>
              <div
                onClick={(e) => {
                  setLogoutToggle((prev) => !prev);
                  e.stopPropagation();
                }}
                className="relative"
              >
                <BsThreeDotsVertical />
                {logoutToggle && (
                  <div
                    onClick={() => {
                      logout();
                    }}
                    className="absolute p-2 border border-gray-200 rounded-lg bg-white z-999 right-0 top-5"
                  >
                    Logout
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-2">
            <input
              className="w-full border border-gray-600 bg-gray-100 rounded-full p-2"
              placeholder="Search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!isNewChat ? (
          <div className="box-border overflow-y-auto h-[75dvh] bg-gray-200 m-2 rounded-lg">
            {!chats ? (
              "Loading"
            ) : chats.length === 0 ? (
              "No Chats"
            ) : (
              <>
                {search.trim().length > 0 && filteredFriends.length > 0 ? (
                  <div className="font-bold">Chats</div>
                ) : (
                  ""
                )}
                <div className="p-2 ">
                  {filteredFriends.map((friend) => (
                    <div
                      className={`p-4 hover:bg-gray-300 my-2 rounded-lg cursor-pointer transition-colors ${activeChat?._id === friend._id ? "bg-gray-300" : ""}`}
                      key={friend._id}
                      onClick={() => {
                        setActiveChat({
                          _id: friend._id,
                          username: friend.username,
                          email: friend.email,
                        });
                        setCountOfUnreadMessages((prev) => {
                          const next = { ...prev };
                          delete next[friend._id];
                          return next;
                        });
                      }}
                    >
                      <h1>{friend.username}</h1>
                      <div className={`flex justify-between items-center }`}>
                        <div
                          className={`${countOfUnreadMessages[friend._id] ? "text-black" : "text-gray-800"}`}
                        >
                          {lastMessages[friend._id].substring(0, 40) +
                            (lastMessages[friend._id].length > 40 ? "..." : "")}
                        </div>
                        {countOfUnreadMessages[friend._id] && (
                          <div className="w-5 h-5 rounded-full bg-orange-400 text-[12px] text-center">
                            {countOfUnreadMessages[friend._id]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {search.trim().length > 0 && dosts.length > 0 ? (
                  <>
                    <div className="font-bold">Friends</div>
                    <div>{dosts.map((dost) => dost.username)}</div>
                  </>
                ) : (
                  ""
                )}
                {search.trim().length > 0 &&
                dosts.length === 0 &&
                filteredFriends.length === 0 ? (
                  <div>No chats or friends found</div>
                ) : (
                  ""
                )}
              </>
            )}
          </div>
        ) : (
          <Newchat
            setNewChatToFalse={() => setIsNewChat(false)}
            setActiveChat={setActiveChat}
            people={people}
          />
        )}
      </div>
      <ChatSpace
        activeChat={activeChat}
        userId={userId}
        setChats={setChats}
        listOfMessages={listOfMessages}
        setListOfMessages={setListOfMessages}
      />
    </div>
  );
};

export default Chat;
