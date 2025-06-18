import React from "react";
import { useContext } from "react";
import httpstatus from "http-status";
import toast from "react-hot-toast";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);

  const router = useNavigate();

  const { handleLogin, handleRegister } = useContext(AuthContext
  );

  const handleAuth = async () => {
    try {
        if(formState === 0) {
        let result = await handleLogin(username, password);
        if(result.status === httpstatus.OK) {
            toast.success("Login Successful");
            setUsername("");
            setPassword("");
        } else {
            toast.error("Login Failed");
        }
        
    }

    if(formState === 1) {
        let result = await handleRegister(name, username, password);
            toast.success(result);
            setFormState(0); // Switch to Sign In after successful registration
            setUsername("");
            setPassword("");
    }
    } catch (error) {
        console.log("ERROR FROM AUTHENTICATION.JSX PAGE(HANDLEAUTH FUNCTION) : ",error);
        toast.error(error.response.data.message);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="absolute w-9/10 md:w-1/3 md:h-2/3 flex flex-col text-center items-center gap-6 shadow-[0_0_1000px_0px_#BF1CBA] py-4 px-8 rounded-xl">
        <div onClick={() => {router('/')}} className="absolute left-5 border cursor-pointer px-2 py-0.5 rounded-lg hover:scale-110 transition-all duration-200"><i class="fa-solid fa-less-than"></i></div>
        <h1 className="font-bold text-3xl">Authentication</h1>
        <div className="flex mb-5">
          <button
            onClick={() => {
              setFormState(0);
            }}
            className={
              formState === 0
                ? "bg-[#BF1CBA] rounded-lg px-6 py-2 cursor-pointer"
                : "px-6 py-3 cursor-pointer"
            }
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setFormState(1);
            }}
            className={
              formState === 1
                ? "bg-[#BF1CBA] rounded-lg px-6 py-2 cursor-pointer"
                : "px-6 py-3 cursor-pointer"
            }
          >
            Sign Up
          </button>
        </div>
        {formState === 1 && (
          <input
            className="border border-white w-full h-10 rounded-lg px-2"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
          />
        )}
        <input
          className="border border-white w-full h-10 rounded-lg px-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="username"
        />
        <input
          className="border border-white w-full h-10 rounded-lg px-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <button className="bg-gray-500 px-6 py-2 rounded-lg" onClick={handleAuth}>{formState === 0 ? "Sign In" : "Sign Up"}</button>
      </div>
    </div>
  );
}

export default Authentication;
