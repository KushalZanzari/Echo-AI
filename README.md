# Echo AI - Voice & Chat Assistant

A powerful, full-stack AI Assistant application integrating text, voice, and file-based interactions. Built with React for a dynamic frontend and Node.js/Express for a robust backend, powered by the **Google Gemini API**.

## 🌟 Features

*   **🎙️ Voice Interaction (Voice Sphere):** Engage with the AI using your voice through the animated Voice Sphere interface. Features automatic transcription and auto-submission algorithms.
*   **💬 Intelligent Chat Interface:** A sleek, ChatGPT-like interface supporting Markdown formatting, real-time responses, code block syntax highlighting, and copy-to-clipboard functionality.
*   **🧠 Multiple AI Modes:**
    *   **Chat:** General open-ended conversation.
    *   **Coding:** Specialized instructions for code generation and debugging.
    *   **Summarization/Writing:** Tailored for proofreading, grammar checking, and content re-writing.
    *   **Files / Vision:** Analyze uploaded documents and images. Automatically switches modes based on your keywords.
*   **📂 File Upload & OCR Support:** Upload PDFs, TXT files, and images. The backend extracts text using powerful parsing tools and Tesseract OCR to feed context to the AI.
*   **🔐 User Authentication:** Secure sign-up and sign-in functionality utilizing PostgreSQL to store users and securely isolate user chat histories.
*   **🌓 Dark/Light Theme:** Fully responsive UI with an integrated toggle for light and dark modes.

## 🛠️ Technology Stack

**Frontend:**
*   React.js 
*   React Router DOM (Routing)
*   Lucide React (Icons)
*   React Speech Recognition (Voice to Text)
*   React Markdown & Remark GFM (Message Formatting)
*   Vanilla CSS (Custom Styling & Animations)

**Backend:**
*   Node.js & Express.js (Server & API Routing)
*   PostgreSQL & `pg` library (Database)
*   `@google/generative-ai` (Gemini AI Integration)
*   Multer (File Upload Handling)
*   `pdf-parse` & Tesseract (Document & Image OCR Parsing)
*   CORS & Dotenv (Security & Environment Variables)

---

## � Project Structure

```text
voice-assistant/
├── backend/                  # Node.js + Express Backend
│   ├── .env                  # Environment variables
│   ├── db.js                 # PostgreSQL connection setup
│   ├── server.js             # API Routes, OCR, and AI Integration
│   └── package.json          # Backend dependencies
└── voice-assistant/          # React Frontend
    ├── public/
    │   ├── index.html
    │   └── logo.png          # App custom logo
    ├── src/
    │   ├── App.js            # Main React component & routing
    │   ├── ChatInterface.js  # Main chat screen and message handling
    │   ├── MessageBubble.js  # Formatting for user and AI messages
    │   ├── VoiceSphere.js    # Voice interaction and animation
    │   ├── SignIn.js         # User authentication
    │   ├── SignUp.js         # New user registration
    │   ├── Settings.js       # App settings and themes
    │   └── ...               # Various CSS and Context files
    └── package.json          # Frontend dependencies
```

---

## �🚀 Getting Started

Follow these instructions to set up, run, and modify the project on your local machine.

### Prerequisites
Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16.x or higher)
*   [PostgreSQL](https://www.postgresql.org/) (Running locally or via a cloud provider like Neon/Supabase)
*   A [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### 1. Fork and Clone the Repository

To use this project or contribute, you can fork it to your own GitHub account and clone it locally:

```bash
# Clone the repository
gh repo clone KushalZanzari/Echo-AI

# Navigate into the project folder
cd voice-assistant
```

### 2. Backend Setup

Open a terminal and navigate to the backend folder:
```bash
cd backend
```

Install backend dependencies:
```bash
npm install
```

**Environment Variables:**
Create a `.env` file inside the `backend` directory and add the following keys:
```env
# Your Google Gemini API Key
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Your PostgreSQL connection string
POSTGRES_URL="postgresql://username:password@host:port/database"
```

Start the backend server:
```bash
# The server runs on http://localhost:5000 by default
node server.js
```

### 3. Frontend Setup

Open a **new** terminal window and navigate to the frontend folder:
```bash
cd voice-assistant
```

Install frontend dependencies:
```bash
npm install
```

Start the React development server:
```bash
# The application runs on http://localhost:3000 by default
npm start
```

### 4. Database Schema Setup
Ensure your PostgreSQL database has the required `users` table configured. Connect to your database and run:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📧 Contact

For questions, feedback, or suggestions, please reach out at kushalzanzari@gmail.com.

---

## 🙌 Credits

Developed by **Kushal Zanzari**
