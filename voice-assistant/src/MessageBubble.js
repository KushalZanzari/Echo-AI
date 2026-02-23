import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MessageBubble.css';

const CodeBlock = ({ language, children }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <span className="code-lang">{language}</span>
                <button className="copy-btn" onClick={handleCopy}>
                    {copied ? (
                        <>
                            <span>✓</span> Copied
                        </>
                    ) : (
                        <>
                            <span>📋</span> Copy Code
                        </>
                    )}
                </button>
            </div>
            <pre>
                <code className={`language-${language}`}>
                    {children}
                </code>
            </pre>
        </div>
    );
};

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`message-bubble-container ${isUser ? 'user-bubble-container' : 'ai-bubble-container'}`}>
            {!isUser && (
                <div className="ai-avatar">
                    <img src="/logo.png" alt="AI Avatar" className="ai-avatar-image" />
                </div>
            )}
            <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
                {isUser ? (
                    <p>{message.content}</p>
                ) : (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <CodeBlock language={match[1]} children={String(children).replace(/\n$/, '')} />
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
