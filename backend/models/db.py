from mongomock import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/fairshare")
client = MongoClient() # mongomock doesn't need the URI
db = client.fairshare

# Collections
groups_collection = db.groups
expenses_collection = db.expenses
users_collection = db.users
