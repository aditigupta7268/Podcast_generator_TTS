## 🎙️ Podcast Generator using Text-to-Speech (TTS)

A full-stack Podcast Generator Web Application that converts user-provided text into high-quality speech using Text-to-Speech (TTS) technology.
The application includes a backend API for audio generation and a frontend interface for seamless user interaction.

## 🚀 Project Overview

This project allows users to:

✍️ Enter custom text content

🌍 Select language (if supported)

🔊 Convert text into speech

🎧 Listen to generated podcast audio

⬇️ Download the audio file

It is designed as a lightweight, scalable, and user-friendly podcast generation tool.

## 🏗️ Tech Stack
🔹 Backend

🔹Python

🔹Flask (REST API) 

🔹FastAPI

🔹gTTS (Google Text-to-Speech)

🔹UUID (for unique file naming)

🔹 Frontend

🔹HTML5

🔹CSS3

🔹JavaScript (Fetch API for backend communication)

🔹 Other Tools

🔹REST APIs

🔹Audio processing

🔹JSON handling

## 📂 Project Structure

```
Podcast_generator_TTS/
│
├── app.py                # Flask backend server
├── requirements.txt      # Project dependencies
├── audio/                # Generated audio files
├── static/               # CSS / JS files
├── templates/            # HTML files
└── README.md             # Project documentation
```

## ⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/aditigupta7268/Podcast_generator_TTS.git
cd Podcast_generator_TTS

2️⃣ Create Virtual Environment (Recommended)
python -m venv venv
source venv/bin/activate     # Mac/Linux
venv\Scripts\activate        # Windows

3️⃣ Install Dependencies
pip install -r requirements.txt

4️⃣ Run the Application
python app.py


Server will start at:

http://127.0.0.1:5000/

## 🎯 How It Works

User enters podcast script text in the frontend.

Frontend sends POST request to Flask backend.

Backend processes text using gTTS.

Audio file is generated and stored in /audio.

Response is sent back with audio URL.

User can play or download the generated podcast.

## 📌 API Endpoint
🔹 Generate Podcast

🔹POST /generate

🔹Request Body (JSON):
{
  "text": "Your podcast script here",
  "lang": "en"
}

🔹Response:
{
  "audio_url": "/audio/unique_file.mp3"
}

## 💡 Key Features

🎙️ Automatic Podcast Generation

🌐 Multi-language support (based on gTTS support)

🧩 Clean and responsive frontend UI

🔁 Unique audio file creation using UUID

📦 Lightweight and easy to deploy

📸 Future Enhancements

🎵 Background music integration

🎚️ Voice speed & pitch control

☁️ Cloud storage integration

🎧 Multiple voice options

📝 Script saving feature

## 🧠 Learning Outcomes

Built REST APIs using Flask and used FastAPI for backend 

Integrated frontend with backend

Implemented TTS functionality

Managed file storage dynamically

Created a full stack mini project

📎 GitHub Repository

🔗 https://github.com/aditigupta7268/Podcast_generator_TTS

👩‍💻 Author

Aditi Gupta
Generative AI Enthusiast | Full Stack Developer | Python Developer


