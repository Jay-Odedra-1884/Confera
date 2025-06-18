import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/landing'
import Authentication from './pages/authentication'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Videomeet from './pages/Videomeet'

function App() {
 
  return (
    <div className='app'>
      <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path='/auth' element={<Authentication />}/>
          <Route path='/' element={<LandingPage />} />
          <Route path='/:url' element={<Videomeet />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
