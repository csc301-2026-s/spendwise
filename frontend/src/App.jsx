import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Registration from "./components/Registration"
import Login from "./components/Login"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}