import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export default function Dashboard() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState("");
  const [tempQuote, setTempQuote] = useState("");

  async function populateQuote() {
    const req = await fetch("http://localhost:8000/api/quote", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });

    const data = await req.json();
    console.log("data", data);

    if (data.status === "ok") {
      setTempQuote("");
      setQuote(data.quote);
      console.log("data.quote", data.quote);
    } else {
      console.log("error", data.error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("1", token);
    if (token) {
      const user = jwt_decode(token);
      console.log("user", user);
      if (!user) {
        localStorage.removeItem("token");
        navigate.replace("/login");
      } else {
        populateQuote();
      }
    }
  }, []);

  async function postQuote(e) {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/api/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        quote: tempQuote,
      }),
    });
    populateQuote();
  }

  return (
    <div>
      <h1>Your Quote : {quote || "No quote found"}</h1>
      <form onSubmit={postQuote}>
        <input
          type="test"
          value={tempQuote}
          onChange={(e) => setTempQuote(e.target.value)}
          placeholder="Insert your quote here"
        />
        <input type="submit" value="Post quote" />
      </form>
    </div>
  );
}
