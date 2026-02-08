import React, { useEffect, useState } from "react";

const Newchat = ({ setNewChatToFalse, setActiveChat }) => {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
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
  }, []);

  return people.length === 0 ? (
    <h1 className="w-3/12 p-2">Loading...</h1>
  ) : (
    <div className="w-3/12 p-2">
      <div onClick={setNewChatToFalse}>Go Back</div>
      {people.map((person) => (
        <h1
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
        </h1>
      ))}
    </div>
  );
};

export default Newchat;
