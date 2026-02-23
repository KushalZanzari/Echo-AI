require('dotenv').config();

process.on('uncaughtException', (err) => {
    console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
    require('fs').appendFileSync('server_error.log', `[${new Date().toISOString()}] Uncaught Exception: ${err.message}\n${err.stack}\n\n`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL UNHANDLED REJECTION:', reason);
    require('fs').appendFileSync('server_error.log', `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n\n`);
});

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const OpenAI = require("openai");
const multer = require('multer');
const mult = require('multer');
// Handle pdf-parse export variability (v1 vs v2)
let pdf;
try {
    const pdfImport = require('pdf-parse');
    if (typeof pdfImport === 'function') {
        pdf = pdfImport;
    } else if (pdfImport.default && typeof pdfImport.default === 'function') {
        pdf = pdfImport.default;
    } else {
        console.warn('pdf-parse import is unexpected:', typeof pdfImport);
        pdf = pdfImport;
    }
} catch (e) {
    console.error('Failed to import pdf-parse:', e);
}
const mammoth = require('mammoth');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI client for Groq
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

app.use(cors());
app.use(express.json());

// Debug middleware for upload
app.use('/api/upload', (req, res, next) => {
    console.log(`Incoming request to /api/upload. Headers:`, req.headers['content-type']);
    next();
});

// File Upload Endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log("Received upload request");
    if (!req.file) {
        console.log("No file part found in request");
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Processing file: ${req.file.originalname}, Type: ${req.file.mimetype}, Size: ${req.file.size} bytes`);

    try {
        let extractedText = '';
        const buffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Extract Text or base64 based on file type
        if (mimeType === 'application/pdf') {
            console.log("Parsing PDF...");
            const data = await pdf(buffer);
            extractedText = data.text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // DOCX
            console.log("Parsing DOCX...");
            const result = await mammoth.extractRawText({ buffer: buffer });
            extractedText = result.value;
        } else if (mimeType.startsWith('text/') || mimeType === 'application/javascript' || mimeType === 'application/json') {
            console.log("Reading text file...");
            extractedText = buffer.toString('utf8');
        } else {
            console.log(`Unsupported file type: ${mimeType}`);
            return res.status(400).json({ error: 'Unsupported file type: ' + mimeType });
        }

        console.log(`Extraction successful. Text length: ${extractedText.length}`);
        res.json({ text: extractedText, filename: req.file.originalname });

    } catch (error) {
        console.error('CRITICAL Error processing file:', error);

        // Write to log file
        try {
            const fs = require('fs');
            const logMessage = `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\nFull: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}\n\n`;
            fs.appendFileSync('server_error.log', logMessage);
        } catch (logErr) {
            console.error("Failed to write log:", logErr);
        }

        res.status(500).json({ error: 'Failed to process file', details: error.message || 'Unknown Error' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, mode, files } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        let formattedMessages = messages.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : msg.role,
            content: msg.content
        }));

        // Modes System Prompts for Coding Mode
        if (mode === 'coding') {
            const systemPrompt = {
                role: "system",
                content: `You are an elite competitive programmer and senior software engineer. 
When the user asks a coding question, you MUST explicitly follow this strict format:

1. **Analysis & Approaches**: 
   - Briefly discuss the **Common/Naive Approach** (time/space complexity).
   - Discuss a **Better Approach**.
   - Conclude with the **Optimal Approach**.

2. **Optimal Solution**: 
   - Provide the code for the optimal approach.
   - **CRITICAL:** THE CODE MUST BE ABSOLUTELY COMMENT-FREE.
     - NO inline comments (e.g., '# ...', '// ...').
                - NO docstrings(e.g., ''' ... ''', '/** ... */').
     - NO explanations inside the code block.
   - The code MUST pass all edge cases(empty inputs, large inputs, negative numbers, etc.).
   - JUST THE RAW CODE.

3. ** Detailed Explanation **:
- Explain the logic of the optimal solution step - by - step.

4. ** Test Cases & Edge Cases **:
- List specific Test Cases(Normal, Edge, Invalid).
   - Trace the execution of the code with one Edge Case to prove it works.

Your goal is to provide a complete, robust, and educational answer.`
            };
            formattedMessages.unshift(systemPrompt);
        } else if (mode === 'summarization') {
            const systemPrompt = {
                role: "system",
                content: `You are an expert professional writer and editor.
Your goal is to provide high-quality, polished, and human-sounding text.
- If asked to **Summarize**: Provide a concise, bulleted summary capturing key points.
- If asked to **Fix Grammar**: vivid, correct, and professional. Show changes if possible.
- If asked to **Rewrite/Humanize**: Make it sound natural, engaging, and flow well.
- If asked for a **Cover Letter/Post**: Use a professional yet engaging tone.

Format your response with clear headings and bullet points where appropriate.`
            };
            formattedMessages.unshift(systemPrompt);
        } else if (mode === 'files') {
            let filesText = "No files uploaded.";
            if (req.body.files && req.body.files.length > 0) {
                filesText = req.body.files.map(f => `--- File: ${f.name} ---\n${f.content}\n-------------------`).join('\n\n');
            }
            const systemPrompt = {
                role: "system",
                content: `You are an expert document assistant. You have access to the following user files:\n\n${filesText}\n\nAnswer the user's questions or perform tasks (like summarizing, counting words, finding information) based ONLY on these files. If the user asks about a file but no files are provided, ask them to upload one.`
            };
            formattedMessages.unshift(systemPrompt);
        }

        const chatCompletion = await client.chat.completions.create({
            messages: formattedMessages,
            model: "llama-3.3-70b-versatile",
        });

        const text = chatCompletion.choices[0].message.content;

        res.json({ response: text });

    } catch (error) {
        console.error('Error connecting to Grok:', error);
        res.status(500).json({
            error: 'Failed to fetch response from AI',
            details: error.message
        });
    }
});

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ error: 'Internal server error during signup' });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Signed in successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Error in signin:', error);
        res.status(500).json({ error: 'Internal server error during signin' });
    }
});

app.get('/api/auth/init-db', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        res.json({ message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ error: 'Failed to initialize database' });
    }
});

// Global Error Handler (Must be last)
app.use((err, req, res, next) => {
    console.error('Unhandled Middleware Error:', err);

    // Write to log file
    try {
        const fs = require('fs');
        const logMessage = `[${new Date().toISOString()}] Middleware Error: ${err.message}\nStack: ${err.stack}\n\n`;
        fs.appendFileSync('server_error.log', logMessage);
    } catch (logErr) {
        console.error("Failed to write log:", logErr);
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'Upload Error', details: err.message });
    }

    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
