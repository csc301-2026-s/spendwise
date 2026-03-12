import Navbar from "./Navbar";

export default function MyScholarships() {
  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "inherit", color: "#002A5C", marginBottom: "0.5rem" }}>My Scholarships</h1>
        <p style={{ color: "#6B7A90" }}>View and manage your saved scholarships.</p>
      </div>
    </>
  );
}
