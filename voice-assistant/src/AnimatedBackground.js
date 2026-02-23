import React, { useEffect, useRef } from 'react';

const AnimatedBackground = ({ activeMode }) => {
    const canvasRef = useRef(null);

    // Theme Logic
    const getTheme = () => {
        switch (activeMode) {
            case 'coding':
                return {
                    background: 'linear-gradient(to bottom, #000000, #0a0a0a)', // Pure Black/Dark Gray
                    particleColor: '#00ff41', // Matrix Green
                    lineColorBase: 'rgba(0, 255, 65, '
                };
            case 'summarization':
                return {
                    background: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)', // Deep Creative Purple
                    particleColor: 'rgba(255, 255, 255, 0.3)',
                    lineColorBase: null // No lines
                };
            case 'files':
                return {
                    background: 'linear-gradient(to bottom right, #004d4d, #001a1a)', // Deep Teal/Cyan
                    particleColor: 'rgba(0, 255, 204, 0.5)',
                    lineColorBase: 'rgba(0, 255, 204, '
                };
            case 'chat':
            default:
                return {
                    background: 'linear-gradient(to bottom, #1a2980, #26d0ce)', // Original Blue/Teal
                    particleColor: 'rgba(255, 255, 255, 0.6)',
                    lineColorBase: 'rgba(255, 255, 255, '
                };
        }
    };

    const theme = getTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let width = window.innerWidth;
        let height = window.innerHeight;

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            particles = [];
            initParticles();
        };

        window.addEventListener('resize', handleResize);

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; // Velocity
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;

                // Mode specific props
                if (activeMode === 'coding') {
                    const chars = "01{}[]<>;/|\\+=";
                    this.char = chars.charAt(Math.floor(Math.random() * chars.length));
                    this.fontSize = Math.floor(Math.random() * 10) + 10;
                } else if (activeMode === 'summarization') {
                    const chars = "AaBbCcDdEe¶§📝abcABS";
                    this.char = chars.charAt(Math.floor(Math.random() * chars.length));
                    this.fontSize = Math.floor(Math.random() * 14) + 8;
                } else if (activeMode === 'files') {
                    const chars = "📄📁🗂️📎📂📑";
                    this.char = chars.charAt(Math.floor(Math.random() * chars.length));
                    this.fontSize = Math.floor(Math.random() * 20) + 12;
                }
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                if (activeMode === 'coding') {
                    ctx.font = `${this.fontSize}px monospace`;
                    ctx.fillStyle = theme.particleColor;
                    ctx.fillText(this.char, this.x, this.y);
                } else if (activeMode === 'summarization') {
                    ctx.font = `${this.fontSize}px Georgia, serif`;
                    ctx.fillStyle = theme.particleColor;
                    ctx.fillText(this.char, this.x, this.y);
                } else if (activeMode === 'files') {
                    ctx.font = `${this.fontSize}px Arial`;
                    // Emojis don't always use fillStyle, but it's safe to set
                    ctx.fillStyle = theme.particleColor;
                    // Lower opacity for file emojis so they don't distract too much
                    ctx.globalAlpha = 0.4;
                    ctx.fillText(this.char, this.x, this.y);
                    ctx.globalAlpha = 1.0; // reset
                } else {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = theme.particleColor;
                    ctx.fill();
                }
            }
        }

        const initParticles = () => {
            const numberOfParticles = Math.floor((width * height) / 15000); // Density
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw particles
            particles.forEach((p, index) => {
                p.update();
                p.draw();

                // Connect particles (ONLY if NOT summarization)
                if (activeMode !== 'summarization' && theme.lineColorBase) {
                    for (let j = index; j < particles.length; j++) {
                        const p2 = particles[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 150) {
                            ctx.beginPath();
                            ctx.strokeStyle = `${theme.lineColorBase}${0.2 - distance / 1000})`;
                            ctx.lineWidth = 1;
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Initial setup
        canvas.width = width;
        canvas.height = height;
        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [activeMode]); // Re-run effect when activeMode changes

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0, // Behind refined z-indexes
                background: theme.background,
                transition: 'background 1s ease-in-out', // Smooth transition
                pointerEvents: 'none'
            }}
        />
    );
};

export default AnimatedBackground;
