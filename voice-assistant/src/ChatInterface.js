import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';
import MessageBubble from './MessageBubble';
import Sidebar from './Sidebar';
import AnimatedBackground from './AnimatedBackground';
import { Mic, Send, Paperclip, Menu, X, FileText, Type, ListTree, Sun, Moon, LogOut, Share, MoreHorizontal, Pin, Archive, Flag, Trash2, Download, AudioLines } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranscript } from './TranscriptContext';

const ChatInterface = () => {
    const userName = localStorage.getItem('userName') || 'User';

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [history, setHistory] = useState(() => {
        return JSON.parse(localStorage.getItem(`chatHistory_${userName}`) || '[]');
    });
    const [activeMode, setActiveMode] = useState('chat');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [viewingFile, setViewingFile] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

    const { transcript, setTranscript } = useTranscript();

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Theme initialization
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setIsDarkMode(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('isAuthenticated');
        // Redirect to sign in page
        navigate('/signin');
    };

    const handleShareChat = () => {
        if (!currentChatId || messages.length === 0) {
            alert('Start a chat before sharing.');
            return;
        }
        const url = window.location.origin + '/share/' + currentChatId;
        navigator.clipboard.writeText(url);
        alert('Chat link copied to clipboard!');
    };

    const togglePinChat = () => {
        setIsOptionsMenuOpen(false);
        if (!currentChatId || messages.length === 0) return;
        setHistory(prev => prev.map(chat =>
            chat.id === currentChatId ? { ...chat, isPinned: !chat.isPinned } : chat
        ));
    };

    const toggleArchiveChat = () => {
        setIsOptionsMenuOpen(false);
        if (!currentChatId || messages.length === 0) return;
        setHistory(prev => prev.map(chat =>
            chat.id === currentChatId ? { ...chat, isArchived: true } : chat
        ));
        handleNewChat();
    };

    const handleDownloadChat = () => {
        setIsOptionsMenuOpen(false);
        if (messages.length === 0) {
            alert("No messages to download.");
            return;
        }

        // Format the chat into a readable text document
        const chatTitle = history.find(c => c.id === currentChatId)?.title || "Echo AI Chat";
        const dateStr = new Date().toLocaleString();

        let fileContent = `--- ${chatTitle} ---\n`;
        fileContent += `Date: ${dateStr}\n\n`;

        messages.forEach(msg => {
            const roleName = msg.role === 'user' ? userName : 'Echo AI';
            fileContent += `[${roleName}]:\n${msg.content}\n\n`;
        });

        // Create a Blob from the content
        const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        // Create an invisible anchor to trigger the download
        const link = document.createElement("a");
        link.href = url;
        const sanitizedTitle = chatTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `chat_${sanitizedTitle}.txt`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    const handleDeleteCurrentChat = () => {
        setIsOptionsMenuOpen(false);
        if (!currentChatId || messages.length === 0) return;
        if (window.confirm('Are you sure you want to delete this chat?')) {
            handleDeleteChat(currentChatId);
        }
    };

    // Ensure we start with a new chat on mount
    useEffect(() => {
        handleNewChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save history whenever it changes
    useEffect(() => {
        localStorage.setItem(`chatHistory_${userName}`, JSON.stringify(history));
    }, [history, userName]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleNewChat = () => {
        const newId = Date.now().toString();
        setCurrentChatId(newId);
        setMessages([]);
        setUploadedFiles([]);
        setViewingFile(null);
        // Do NOT reset mode here, keep current mode!
    };

    const handleSelectChat = (chatId) => {
        const chat = history.find(c => c.id === chatId);
        if (chat) {
            setCurrentChatId(chatId);
            setMessages(chat.messages);
            setUploadedFiles(chat.files || []); // Restore files from history
            setViewingFile(null);
            if (chat.mode) {
                setActiveMode(chat.mode);
            } else {
                setActiveMode('chat'); // Legacy chats default to chat
            }
        }
    };

    const handleDeleteChat = (chatId) => {
        const newHistory = history.filter(c => c.id !== chatId);
        setHistory(newHistory);
        if (currentChatId === chatId) {
            handleNewChat();
        }
    };

    const updateHistory = (newMessages = messages, mode = activeMode, currentFiles = uploadedFiles) => {
        setHistory(prevHistory => {
            const existingChatIndex = prevHistory.findIndex(c => c.id === currentChatId);

            // Determine title based on first user message
            let title = "New Chat";
            const firstUserMsg = newMessages.find(m => m.role === 'user');
            if (firstUserMsg) {
                title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
            } else if (currentFiles.length > 0) {
                title = currentFiles[0].name.slice(0, 30) + (currentFiles[0].name.length > 30 ? '...' : '');
            }

            const updatedChat = {
                id: currentChatId,
                title: title,
                timestamp: Date.now(),
                messages: newMessages,
                mode: mode || activeMode, // Use passed mode or fallback to state
                files: currentFiles // Save files to history
            };

            if (existingChatIndex >= 0) {
                const newHistory = [...prevHistory];
                newHistory[existingChatIndex] = updatedChat;
                return newHistory;
            } else {
                return [updatedChat, ...prevHistory];
            }
        });
    };

    // Auto-send voice transcript
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
            handleSend(transcript);
            setTranscript(''); // Clear so it doesn't repeatedly send
        }
    }, [transcript]);

    const handleSend = async (overrideInput = null) => {
        const textToSend = overrideInput !== null && typeof overrideInput === 'string' ? overrideInput : input;

        if (!textToSend.trim()) return;

        // Auto-switch to coding mode if keywords are detected
        // Removed 'fix' and 'error' to avoid conflict with grammar checking
        const codingKeywords = ['code', 'function', 'debug', 'java', 'js', 'python', 'script', 'algorithm', 'api', 'react', 'node', 'css', 'html', 'program', 'variable', 'class', 'import', 'export', 'const', 'let', 'var', 'sql', 'database'];
        const writingKeywords = ['summarize', 'paraphrase', 'rewrite', 'grammar', 'check', 'humanizer', 'translate', 'cover letter', 'post', 'plagiarism', 'citation', 'write', 'compose', 'proofread', 'essay', 'blog', 'email'];

        const shouldSwitchToCoding = codingKeywords.some(keyword => textToSend.toLowerCase().includes(keyword));
        const shouldSwitchToWriting = writingKeywords.some(keyword => textToSend.toLowerCase().includes(keyword));

        let modeToSend = activeMode;

        // Auto-switch mode logic, EXCEPT if currently in files mode
        if (activeMode !== 'files') {
            // Priority Logic: 
            // 1. If explicitly coding keywords (python, java, code) -> Coding (prioritized as they are very specific)
            // 2. If writing keywords (summarize, grammar) but NO coding keywords -> Summarization
            // 3. Otherwise, stick to the current mode

            if (shouldSwitchToCoding && activeMode !== 'coding') {
                setActiveMode('coding');
                modeToSend = 'coding';
            } else if (shouldSwitchToWriting && activeMode !== 'summarization' && !shouldSwitchToCoding) {
                setActiveMode('summarization');
                modeToSend = 'summarization';
            }
        }

        const userMessage = { role: 'user', content: textToSend };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        updateHistory(updatedMessages, modeToSend); // Pass the CORRECT mode immediately

        setInput('');
        setIsLoading(true);

        // Standard Text Chat Logic
        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: updatedMessages,
                    mode: modeToSend,
                    files: modeToSend === 'files' ? uploadedFiles.map(f => ({ name: f.name, content: f.content })) : []
                }),
            });

            const data = await response.json();

            let aiMessage;
            if (response.ok) {
                aiMessage = { role: 'ai', content: data.response };
            } else {
                aiMessage = { role: 'ai', content: `**Error:** ${data.details || data.error}` };
            }

            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);
            updateHistory(finalMessages, modeToSend); // Pass the CORRECT mode

        } catch (error) {
            console.error("Error:", error);
            const errorMessage = { role: 'ai', content: "**Connection Error:** Could not reach the server." };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files && files.length > 0) {
            handleBatchUpload(files);
        }
    };

    const handleBatchUpload = async (files) => {
        for (const file of files) {
            await handleFileUpload(file);
        }
    };

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.text) {
                const newFile = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Ensure unique IDs in tight loop
                    name: file.name,
                    content: data.text
                };

                setUploadedFiles(prev => {
                    const newFiles = [...prev, newFile]; // Append as each finishes
                    updateHistory(messages, 'files', newFiles); // Save to history immediately
                    return newFiles;
                });

                // Auto-switch to files mode so they can see the uploaded image/document
                if (activeMode !== 'files') {
                    setActiveMode('files');
                }
            } else {
                alert(`Upload failed: ${data.error}${data.details ? `\nDetails: ${data.details}` : ''}`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert(`Error uploading file: ${error.message}`);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSummarizeFile = (file) => {
        // Auto-switch to summarization and pre-fill input
        setActiveMode('summarization');
        const prompt = `Please summarize the following file (${file.name}):\n\n${file.content}`;
        setInput(prompt);
        // We could autotrigger send here, but letting them see it first is safer
    };

    const countWords = (text) => {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    };

    return (
        <div className={`app-container ${activeMode === 'coding' ? 'coding-mode' : ''} ${activeMode === 'files' ? 'files-mode' : ''} ${isSidebarOpen ? 'sidebar-is-open' : ''}`}>
            <AnimatedBackground activeMode={activeMode} />
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNewChat={handleNewChat}
                history={history}
                onSelectChat={handleSelectChat}
                currentChatId={currentChatId}
                onDeleteChat={handleDeleteChat}
                activeMode={activeMode}
                onSelectMode={(mode) => {
                    setActiveMode(mode);
                    if (mode !== 'files') {
                        handleNewChat(); // Clear chat when switching modes, but avoid for files since files mode is generic
                    }
                }}
            />

            <div className="chat-interface">
                <header className="chat-header">
                    <div className="header-left">
                        <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu size={24} />
                        </button>
                        <div className="logo-section">
                            <img src="/logo.png" alt="Echo AI Logo" style={{ height: '40px', width: 'auto' }} />
                            {activeMode !== 'chat' && (
                                <span className="mode-badge">{activeMode} Mode</span>
                            )}
                        </div>
                    </div>

                    <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>

                        {/* Share Button */}
                        <button
                            className="header-action-btn"
                            onClick={handleShareChat}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}
                            title="Share Chat"
                        >
                            <Share size={18} />
                            Share
                        </button>

                        {/* More Options Menu */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="header-action-btn"
                                onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isOptionsMenuOpen ? 'var(--glass-border)' : 'transparent',
                                    border: 'none',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px'
                                }}
                                title="More Options"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {isOptionsMenuOpen && (
                                <div className="options-dropdown" style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    marginTop: '8px',
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '8px 0',
                                    width: '200px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    zIndex: 1000,
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <button onClick={togglePinChat} className="options-dropdown-item">
                                        <Pin size={16} /> Pin chat
                                    </button>
                                    <button onClick={toggleArchiveChat} className="options-dropdown-item">
                                        <Archive size={16} /> Archive
                                    </button>
                                    <button onClick={handleDownloadChat} className="options-dropdown-item">
                                        <Download size={16} /> Download chat
                                    </button>
                                    <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                                    <button
                                        onClick={handleDeleteCurrentChat}
                                        className="options-dropdown-item"
                                        style={{ color: '#ff6b6b' }}
                                    >
                                        <Trash2 size={16} color="#ff6b6b" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            className="theme-toggle-header-btn"
                            onClick={toggleTheme}
                            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>

                <div className="chat-messages">
                    {activeMode === 'files' && (
                        <div className="files-dashboard" style={{ flex: 'none', padding: '20px', minHeight: 'auto' }}>
                            <div className="files-dashboard-header" style={{ marginBottom: '15px' }}>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Current File</h2>
                                <p style={{ fontSize: '0.9rem' }}>Chat with your most recently uploaded document below.</p>
                            </div>

                            {uploadedFiles.length === 0 ? (
                                <div className="empty-files-state" style={{ padding: '20px', marginTop: 0 }}>
                                    <FileText size={32} className="empty-file-icon" style={{ marginBottom: '10px' }} />
                                    <p style={{ fontSize: '1rem', margin: 0 }}>No files uploaded yet.</p>
                                </div>
                            ) : (
                                <div className="files-grid" style={{ paddingBottom: '10px' }}>
                                    {uploadedFiles.map(file => (
                                        <div key={file.id} className="file-card" onClick={() => setViewingFile(file)} style={{ cursor: 'pointer', padding: '15px' }}>
                                            <div className="file-card-header" style={{ marginBottom: 0 }}>
                                                <FileText className="file-card-icon" />
                                                <h3 className="file-card-title" title={file.name}>{file.name}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <img src="/logo.png" alt="Echo AI Logo" style={{ height: '100px', width: 'auto', marginBottom: '24px' }} />
                            <h1>{activeMode === 'files' ? 'What should I do with your files?' : `How can I help you ${userName}?`}</h1>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <MessageBubble key={index} message={msg} />
                        ))
                    )}
                    {isLoading && (
                        <div className="loading-indicator">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    <div className="input-wrapper">
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                            accept=".txt,.js,.py,.java,.cpp,.html,.css,.json,.md,.pdf,.docx"
                        />
                        <button className="attach-btn" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip size={20} />
                        </button>
                        <button className="attach-btn" onClick={() => navigate('/voicesphere')}>
                            <Mic size={20} />
                        </button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Echo AI..."
                            rows={1}
                        />
                        <button
                            className={`send-btn ${input.trim() ? 'active' : ''}`}
                            onClick={handleSend}
                            disabled={!input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {viewingFile && (
                <div className="file-viewer-modal" onClick={() => setViewingFile(null)}>
                    <div className="file-viewer-content" onClick={e => e.stopPropagation()}>
                        <div className="file-viewer-header">
                            <h3>{viewingFile.name}</h3>
                            <button className="close-viewer-btn" onClick={() => setViewingFile(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="file-viewer-body">
                            <pre>{viewingFile.content}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
