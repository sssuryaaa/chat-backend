import React, { useEffect, useState } from "react";

const Newchat = ({ setNewChatToFalse, setActiveChat, people }) => {
  return people.length === 0 ? (
    <h1 className="w-3/12 p-2 fixed top-25">Loading...</h1>
  ) : (
    <div className="w-3/12 fixed top-25 p-2 overflow-y-auto h-screen">
      <div onClick={setNewChatToFalse}>Go Back</div>
      {people.map((person) => (
        <div
          className="p-4 hover:bg-gray-200 rounded-sm w-full cursor-pointer transition-colors"
          key={person._id}
          onClick={() =>
            setActiveChat({
              _id: person._id,
              username: person.username,
              email: person.email,
            })
          }
        >
          {person.username}
        </div>
      ))}
    </div>
  );
};

export default Newchat;
