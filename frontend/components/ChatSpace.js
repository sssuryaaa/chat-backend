import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const ChatSpace = ({ activeChat, userId, setChats }) => {
  const [message, setMessage] = useState("");
  const [listOfMessages, setListOfMessages] = useState([]);
  const [isShort, setIsShort] = useState(false);
  const listRef = useRef(null);

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

  useLayoutEffect(() => {
    if (listRef.current) {
      setIsShort(listRef.current.scrollHeight <= listRef.current.clientHeight);
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [listOfMessages, activeChat?.id]);

  const sendMessage = async () => {
    if (message.trim() === "") return;
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
    <div className="w-9/12">
      <div className="">
        <div className="pb-2 border-b border-gray-800 p-2 fixed w-full bg-white z-20">
          <div>{activeChat.username}</div>
          <div className="text-gray-600">{activeChat.email}</div>
        </div>
        <div
          ref={listRef}
          className={`overflow-y-auto h-[90dvh] p-4 pt-25 flex flex-col`}
        >
          {listOfMessages.map((mess) => {
            return (
              <div
                className={`${mess?.sender?._id === userId ? " ml-auto bg-orange-400" : "bg-gray-200"} ${mess?.sender === userId ? " ml-auto bg-orange-400" : "bg-gray-200"} p-3 rounded-sm w-max text-black my-1 max-w-7/12 wrap-break-word`}
                key={mess._id}
              >
                {mess.content}
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-0 w-9/12 p-3 bg-white border-t border-gray-200 my-4">
        <div className="flex items-center gap-2 ">
          <input
            type="text"
            placeholder="Send a message..."
            className="flex-1 rounded-full border border-gray-600 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-orange-600 active:scale-95"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  ) : (
    <h1>please select a chat to start chatting</h1>
  );
};

export default ChatSpace;
