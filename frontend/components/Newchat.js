import React, { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";

const Newchat = ({ setNewChatToFalse, setActiveChat, people }) => {
  people.sort((a, b) => a.username.localeCompare(b.username));
  return people.length === 0 ? (
    <h1 className="w-3/12 p-2 fixed top-25">Loading...</h1>
  ) : (
    <div className="p-2 overflow-y-auto h-[75dvh] bg-gray-200 rounded-lg m-2 pt-3">
      <div onClick={setNewChatToFalse} className="">
        <IoMdArrowRoundBack
          size={23}
          className="font-normal  hover:bg-gray-200 rounded-full "
        />
      </div>
      {people.map((person) => (
        <div key={person._id}>
          <div
            onClick={() =>
              setActiveChat({
                _id: person._id,
                username: person.username,
                email: person.email,
              })
            }
            className="p-4 hover:bg-gray-200 rounded-sm w-full cursor-pointer transition-colors"
          >
            <div>{person.username}</div>
            <div>Hey there! I'm using ChatSpace</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Newchat;
