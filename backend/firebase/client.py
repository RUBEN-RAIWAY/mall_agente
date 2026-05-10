import json
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import AsyncClient
from config import get_settings

_app = None
_async_db = None


def _build_credentials():
    settings = get_settings()
    if settings.firebase_service_account_json:
        return credentials.Certificate(json.loads(settings.firebase_service_account_json))
    return credentials.Certificate(settings.google_application_credentials)


def get_firebase_app():
    global _app
    if _app is None:
        settings = get_settings()
        cred = _build_credentials()
        _app = firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id})
    return _app


def get_sync_db():
    get_firebase_app()
    return firestore.client()


def get_async_db() -> AsyncClient:
    global _async_db
    if _async_db is None:
        settings = get_settings()
        cred = _build_credentials()
        _async_db = AsyncClient(project=settings.firebase_project_id, credentials=cred.get_credential())
    return _async_db
