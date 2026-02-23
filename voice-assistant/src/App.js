import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from './SignIn';
import SignUp from './SignUp';
import VoiceSphere from './VoiceSphere';
import ChatInterface from './ChatInterface';
import Settings from './Settings';
import { TranscriptProvider } from './TranscriptContext';


function App() {
  return (
    <TranscriptProvider>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/voicesphere" element={<VoiceSphere />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </TranscriptProvider>
  );
}

export default App;
