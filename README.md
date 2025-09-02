# 📧 Lucid Growth Email Analyzer

A full-stack application that analyzes incoming emails using **IMAP**, extracts the **receiving chain** and detects the **ESP (Email Service Provider)**.  
This project was built as part of the **Lucid Growth Software Development Assignment**.

---

## 🚀 Tech Stack
- **Frontend:** React (Vite, TailwindCSS)
- **Backend:** Node.js (NestJS)
- **Database:** MongoDB
- **Email Handling:** IMAP

---

## 📌 Features
- Automatically fetches incoming emails via IMAP.  
- Identifies correct test email using a configurable **subject token**.  
- Extracts:
  - **Receiving Chain** → servers the email passed through.
  - **ESP Type** → Gmail, Outlook, SES, Zoho, etc.  
- Stores raw + processed logs in **MongoDB**.  
- Responsive UI showing results (receiving chain visualization + ESP detection).  

---

## ⚙️ Project Structure
LUCID-GROWTH-EMAIL-ANALYZER/
│
├── backend/ # NestJS backend
│ ├── src/
│ │ ├── common/ # Config
│ │ ├── email/ # Email module, services, parsers
│ │ ├── health/ # Health check
│ │ ├── app.module.ts
│ │ └── main.ts
│ ├── .env # Environment variables (not committed)
│ └── package.json
│
├── frontend/ # React (Vite + Tailwind)
│ ├── src/
│ │ ├── assets/
│ │ ├── App.tsx
│ │ ├── api.ts # API calls to backend
│ │ └── main.tsx
│ ├── index.html
│ └── package.json
│
└── README.md # Project documentation


---

## 🔑 Environment Variables
Create a `.env` file inside the `backend/` directory:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/lucidgrowth

IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password
MAILBOX=INBOX

SUBJECT_TOKEN=NIK TEST
TEST_ADDRESS=your-test-address@gmail.com


⚠️ Important: Never commit .env files to GitHub.

🛠️ Setup & Installation
1. Clone Repository
git clone https://github.com/YOUR_USERNAME/lucid-growth-email-analyzer.git
cd lucid-growth-email-analyzer

2. Backend Setup
cd backend
npm install


Run backend:

npm run start:dev


Backend available at: http://localhost:4000

3. Frontend Setup
cd ../frontend
npm install
npm run dev


Frontend available at: http://localhost:5173

📦 Deployment

Frontend: Deploy on Vercel
 or Netlify
.

Backend: Deploy on Render
, Railway
, or Heroku
.

Database: Use MongoDB Atlas
.

Update your .env values with hosted MongoDB + IMAP credentials when deploying.

🎥 Demo

Screen Recording: Add Loom/Video link here.

Live Frontend: Add deployed URL here.

Live Backend API: Add deployed API URL here.

📖 References

Google Message Header Analyzer

InboxDoctor

📝 License

This project is licensed under the MIT License.
Feel free to use and modify for learning or production.


---
