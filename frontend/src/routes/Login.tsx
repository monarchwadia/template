import React from "react";

export default function Login() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <h2>Login</h2>
      <form style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
