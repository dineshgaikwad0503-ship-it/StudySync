# Local Setup

1. Install Node.js 20+ and Python 3.12+.
2. Start MongoDB locally or use MongoDB Atlas.
3. Frontend:
   `cd frontend && npm install && npm run dev`
4. Socket:
   `cd socket && npm install && npm start`
5. Backend:
   `python -m venv .venv`
   `pip install -r requirements.txt`
   `python manage.py runserver`
6. Open the Vite URL and use two browser windows to test synchronized drawing/chat.

## Environment
VITE_SOCKET_URL, SECRET_KEY, MONGO_URI, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET.
