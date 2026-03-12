import Navbar from "./Navbar";

export default function Profile() {
  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "inherit", color: "#002A5C", marginBottom: "0.5rem" }}>Profile</h1>
        <p style={{ color: "#6B7A90" }}>Manage your profile and account settings.</p>
      </div>
    </>
  );
}
