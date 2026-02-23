import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Moon, Sun } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const savedName = localStorage.getItem('userName') || '';
        setNickname(savedName);

        const savedTheme = localStorage.getItem('theme') || 'dark';
        setIsDarkMode(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const handleSaveNickname = (e) => {
        e.preventDefault();
        localStorage.setItem('userName', nickname);
        alert('Nickname saved successfully!');
    };

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                    <span>Back</span>
                </button>
                <h1>Settings</h1>
            </div>

            <div className="settings-content">
                <div className="settings-section">
                    <h2><User size={20} /> Profile Information</h2>
                    <form className="settings-form" onSubmit={handleSaveNickname}>
                        <div className="form-group">
                            <label htmlFor="nickname">Nickname / Go by Name</label>
                            <p className="helper-text">This is the name Echo AI will call you in the chat.</p>
                            <input
                                type="text"
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Enter your nickname"
                                required
                            />
                        </div>
                        <button type="submit" className="save-btn">Save Nickname</button>
                    </form>
                </div>

                <div className="settings-section">
                    <h2><Moon size={20} /> Appearance</h2>
                    <div className="theme-toggle-container">
                        <div className="theme-info">
                            <h3>Application Theme</h3>
                            <p className="helper-text">Switch between Dark and Light mode depending on your preference.</p>
                        </div>
                        <button className={`theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`} onClick={toggleTheme}>
                            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
