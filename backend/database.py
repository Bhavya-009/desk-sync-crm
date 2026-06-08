import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()  # reads variables from your .env file into the environment

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Create a single client instance (reused across the app)
client = AsyncIOMotorClient(MONGO_URI)

# Pick the database
db = client["support_crm"]

# Two collections:  tickets  and  notes
tickets_collection = db["tickets"]
notes_collection   = db["notes"]
