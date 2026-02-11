import React, { useEffect, useState } from "react";
import Newchat from "./Newchat";
import ChatSpace from "./ChatSpace";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router";

const Chat = () => {
  const [chats, setChats] = useState(null); // List of chats
  const [activeChat, setActiveChat] = useState(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState([]);
  const [logoutToggle, setLogoutToggle] = useState(false);
  const navigate = useNavigate();
  const lastMessages = {};
  const alreadyEncounteredIds = [];
  const friends = !chats
    ? []
    : chats.map((chat) => {
        if (chat.receiver._id === userId) {
          if (alreadyEncounteredIds.includes(chat.sender._id)) {
            return undefined;
          }
          alreadyEncounteredIds.push(chat.sender._id);
          lastMessages[chat.sender.username] = chat.content;
          return chat.sender;
        } else {
          if (alreadyEncounteredIds.includes(chat.receiver._id)) {
            return undefined;
          }
          alreadyEncounteredIds.push(chat.receiver._id);
          lastMessages[chat.receiver.username] = chat.content;
          return chat.receiver;
        }
      });
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
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex">
      <div className="w-3/12 border-r border-gray-800 h-dvh">
        <div className="fixed top-0 w-3/12">
          <div className="flex justify-between p-4">
            <div className="font-bold text-orange-600 ">LOGO</div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div
                className={`bg-gray-200 border border-gray-100 text-sm rounded-full px-4 cursor-pointer  transition-colors ${isNewChat ? "bg-orange-300 hover:bg-amber-400" : ""}`}
                onClick={() => setIsNewChat((prev) => !prev)}
              >
                New Chat
              </div>
              <div
                onClick={() => setLogoutToggle((prev) => !prev)}
                className="relative"
              >
                <BsThreeDotsVertical />
                {logoutToggle && (
                  <div
                    onClick={logout}
                    className="absolute p-2 border border-gray-200 rounded-lg bg-white z-999"
                  >
                    Logout
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-2">
            <input
              className="w-full border border-gray-600 rounded-full p-2"
              placeholder="Search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!isNewChat ? (
          <div className="fixed top-25 w-3/12 overflow-y-auto h-dvh">
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
                      className={`p-4 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors ${activeChat?._id === friend._id ? "bg-gray-300" : ""}`}
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
                      <p className="text-gray-700">
                        {lastMessages[friend.username].substring(0, 40) +
                          (lastMessages[friend.username].length > 40
                            ? "..."
                            : "")}
                      </p>
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
      <ChatSpace activeChat={activeChat} userId={userId} setChats={setChats} />
    </div>
  );
};

export default Chat;
