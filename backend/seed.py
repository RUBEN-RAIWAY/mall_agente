"""Seed script: loads initial client data into Firestore.

Usage:
    python seed.py            # Load clients (skip existing)
    python seed.py --clean    # Delete all data first, then load
"""

import json
import sys
import os

# Ensure backend dir is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from firebase.client import get_sync_db


def load_seed_data() -> list[dict]:
    path = os.path.join(os.path.dirname(__file__), "data", "seed_clients.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def clean_collection(db, collection_name: str):
    docs = db.collection(collection_name).stream()
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    print(f"  Deleted {count} documents from '{collection_name}'")


def seed_clients(db, clients: list[dict]):
    for client in clients:
        client_id = client["client_id"]
        doc_ref = db.collection("clients").document(client_id)
        existing = doc_ref.get()
        if existing.exists:
            print(f"  Skipping {client_id} ({client['nombres']}) - already exists")
            continue
        doc_ref.set(client)
        print(f"  Created {client_id} ({client['nombres']})")


def main():
    clean_mode = "--clean" in sys.argv

    print("Connecting to Firestore...")
    db = get_sync_db()

    if clean_mode:
        print("\nCleaning existing data...")
        clean_collection(db, "clients")
        clean_collection(db, "conversations")

    print("\nLoading seed clients...")
    clients = load_seed_data()
    seed_clients(db, clients)

    print(f"\nDone! {len(clients)} clients processed.")


if __name__ == "__main__":
    main()
