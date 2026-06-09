# DeskSync CRM

DeskSync CRM is a full-stack customer relationship management and ticket management application built with React, JavaScript , FastAPI, and MongoDB.

## Features

* Create, update, and manage support tickets
* Add and track ticket notes
* RESTful API built with FastAPI
* MongoDB database integration
* Responsive React frontend
* Real-time frontend-backend communication

## Tech Stack

### Frontend

* React
* JavaScript
* Vite
* Tailwindcss

### Backend

* FastAPI
* Python
* Motor
* MongoDB

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file and configure:

```env
MONGO_URI=__
```

## License

This project is intended for learning and portfolio purposes.
