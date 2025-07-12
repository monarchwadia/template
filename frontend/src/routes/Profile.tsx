import { GuardMustBeLoggedIn } from "../guards/GuardMustBeLoggedIn";

export default function Profile() {
  // Placeholder user data
  const user = {
    username: "johndoe",
    email: "johndoe@example.com",
  };

  return (
    <GuardMustBeLoggedIn>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <h2>Profile</h2>
        <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 24, minWidth: 300 }}>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
    </GuardMustBeLoggedIn>
  );
}
