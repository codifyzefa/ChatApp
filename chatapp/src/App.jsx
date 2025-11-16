import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './Pages/Blog/Login.jsx'
import SignupPage from './Pages/Blog/signup'
import Profile from './Pages/Blog/Profile'
import Create from './Pages/Blog/Create'
import Explore from './Pages/Blog/Explore'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/:username/dashboard" element={<Profile />} />
        <Route path="/dashboard" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </div>
  )
}

export default App