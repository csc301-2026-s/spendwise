import { useState } from "react"

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    padding: "2rem",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#111",
    border: "1px solid #222",
    padding: "3rem",
  },
  accent: {
    width: "40px",
    height: "3px",
    background: "#e8c97e",
    marginBottom: "2rem",
  },
  heading: {
    fontSize: "1.8rem",
    fontWeight: "400",
    color: "#f0ece4",
    letterSpacing: "0.02em",
    margin: "0 0 0.4rem 0",
  },
  subheading: {
    fontSize: "0.8rem",
    color: "#555",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: "0 0 2.5rem 0",
  },
  fieldGroup: {
    display: "flex",
    gap: "1rem",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    marginBottom: "1.2rem",
  },
  label: {
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#666",
    marginBottom: "0.5rem",
  },
  input: {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #2a2a2a",
    padding: "0.6rem 0",
    color: "#f0ece4",
    fontSize: "0.95rem",
    fontFamily: "Georgia, serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  inputFocused: {
    borderBottom: "1px solid #e8c97e",
  },
  errorText: {
    fontSize: "0.72rem",
    color: "#e05c5c",
    marginTop: "0.3rem",
  },
  button: {
    width: "100%",
    marginTop: "2rem",
    padding: "1rem",
    background: "#e8c97e",
    border: "none",
    color: "#0a0a0a",
    fontSize: "0.75rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontFamily: "Georgia, serif",
    cursor: "pointer",
    fontWeight: "700",
  },
  successOverlay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "3rem 0",
  },
  successCircle: {
    width: "52px",
    height: "52px",
    border: "2px solid #e8c97e",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e8c97e",
    fontSize: "1.4rem",
  },
  successLabel: {
    color: "#f0ece4",
    fontSize: "0.78rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    margin: 0,
  },
}

function InputField({ label, name, type = "text", value, onChange, error }) {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <div style={styles.fieldWrapper}>
      <label style={styles.label}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ ...styles.input, ...(isFocused ? styles.inputFocused : {}) }}
      />
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  )
}

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const validate = () => {
    const e = {}
    if (!formData.first_name.trim()) e.first_name = "Required"
    if (!formData.last_name.trim()) e.last_name = "Required"
    if (!formData.email.includes("@")) e.email = "Enter a valid email"
    if (formData.password.length < 6) e.password = "Min 6 characters"
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSuccess(true)
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {success ? (
          <div style={styles.successOverlay}>
            <div style={styles.successCircle}>✓</div>
            <p style={styles.successLabel}>Account Created</p>
          </div>
        ) : (
          <>
            <div style={styles.accent} />
            <h2 style={styles.heading}>Create Account</h2>
            <p style={styles.subheading}>Join us today</p>
            <form onSubmit={handleSubmit} noValidate>
              <div style={styles.fieldGroup}>
                <InputField
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                />
                <InputField
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                />
              </div>
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <button type="submit" style={styles.button}>
                Create Account
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}