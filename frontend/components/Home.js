import React from "react";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="flex">
      <div className="w-2/4 h-dvh flex items-center justify-center font-bold text-3xl">
        <span className="text-gray-600">Welcome to</span>{" "}
        <span className=" text-orange-500"> Chat Space </span>
      </div>
      <div className="w-2/4 h-dvh flex flex-col items-center justify-center gap-2">
        <div>
          <button
            className="font-bold bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors w-75"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
        <div>
          <button
            className="font-bold px-4 py-2 rounded-md hover:bg-gray-200 transition-colors w-75 border border-gray-400"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
