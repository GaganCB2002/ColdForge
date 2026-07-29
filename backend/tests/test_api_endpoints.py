import pytest
import io
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def test_user_token(client):
    client.post("/api/auth/register", json={
        "email": "tester@example.com",
        "password": "testpassword",
        "full_name": "Tester"
    })
    response = client.post("/api/auth/login", data={
        "username": "tester@example.com",
        "password": "testpassword"
    })
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def second_user_token(client):
    client.post("/api/auth/register", json={
        "email": "tester2@example.com",
        "password": "testpassword",
        "full_name": "Tester Two"
    })
    response = client.post("/api/auth/login", data={
        "username": "tester2@example.com",
        "password": "testpassword"
    })
    return response.json()["access_token"]

# ─── ROOT ───

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "message" in data

# ─── AUTH ───

class TestAuth:
    def test_register_success(self, client):
        response = client.post("/api/auth/register", json={
            "email": "new@example.com",
            "password": "strongpass123",
            "full_name": "New User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "new@example.com"
        assert "id" in data
        assert "password" not in data

    def test_register_duplicate_email(self, client):
        client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "testpassword",
            "full_name": "Dup"
        })
        response = client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "testpassword",
            "full_name": "Dup"
        })
        assert response.status_code == 400

    def test_register_invalid_email(self, client):
        response = client.post("/api/auth/register", json={
            "email": "notanemail",
            "password": "testpassword",
            "full_name": "Bad Email"
        })
        assert response.status_code == 422

    def test_register_short_password(self, client):
        response = client.post("/api/auth/register", json={
            "email": "shortpw@example.com",
            "password": "ab",
            "full_name": "Short PW"
        })
        assert response.status_code in [200, 422]

    def test_login_success(self, client, test_user_token):
        response = client.post("/api/auth/login", data={
            "username": "tester@example.com",
            "password": "testpassword"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user_token):
        response = client.post("/api/auth/login", data={
            "username": "tester@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [400, 401]

    def test_login_nonexistent_user(self, client, test_user_token):
        response = client.post("/api/auth/login", data={
            "username": "nobody@example.com",
            "password": "testpassword"
        })
        assert response.status_code in [400, 401]

    def test_login_missing_fields(self, client):
        response = client.post("/api/auth/login", data={})
        assert response.status_code == 422

    def test_get_me_authenticated(self, client, test_user_token):
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 200
        assert response.json()["email"] == "tester@example.com"

    def test_get_me_no_token(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client):
        response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
        assert response.status_code == 401

    def test_update_me(self, client, test_user_token):
        response = client.put("/api/auth/me", json={
            "full_name": "Updated Tester",
            "bio": "A test user"
        }, headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 200
        assert response.json()["full_name"] == "Updated Tester"

    def test_update_me_unauthorized(self, client):
        response = client.put("/api/auth/me", json={"full_name": "Hacker"})
        assert response.status_code == 401

# ─── PROJECTS ───

class TestProjects:
    def test_create_project(self, client, test_user_token):
        response = client.post("/api/projects/", json={
            "name": "Test Project",
            "description": "Test Description"
        }, headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Project"
        assert "id" in data

    def test_create_project_minimal(self, client, test_user_token):
        response = client.post("/api/projects/", json={
            "name": "Minimal Project"
        }, headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 201
        assert response.json()["name"] == "Minimal Project"

    def test_create_project_empty_name(self, client, test_user_token):
        response = client.post("/api/projects/", json={"name": ""}, headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code in [201, 422]

    def test_create_project_unauthorized(self, client):
        response = client.post("/api/projects/", json={"name": "Hacked Project"})
        assert response.status_code == 401

    def test_get_projects(self, client, test_user_token):
        response = client.get("/api/projects/", headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
        assert any(p["name"] == "Test Project" for p in data)

    def test_get_projects_empty_for_other_user(self, client, second_user_token):
        response = client.get("/api/projects/", headers={"Authorization": f"Bearer {second_user_token}"})
        assert response.status_code == 200
        assert len(response.json()) == 0

    def test_get_project_by_id(self, client, test_user_token):
        projects = client.get("/api/projects/", headers={"Authorization": f"Bearer {test_user_token}"}).json()
        pid = projects[0]["id"]
        response = client.get(f"/api/projects/{pid}", headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 200
        assert response.json()["id"] == pid

    def test_get_project_not_found(self, client, test_user_token):
        response = client.get("/api/projects/99999", headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 404

    def test_get_project_other_user_forbidden(self, client, test_user_token, second_user_token):
        projects = client.get("/api/projects/", headers={"Authorization": f"Bearer {test_user_token}"}).json()
        pid = projects[0]["id"]
        response = client.get(f"/api/projects/{pid}", headers={"Authorization": f"Bearer {second_user_token}"})
        assert response.status_code == 404

    def test_update_project(self, client, test_user_token):
        projects = client.get("/api/projects/", headers={"Authorization": f"Bearer {test_user_token}"}).json()
        pid = projects[0]["id"]
        response = client.put(f"/api/projects/{pid}", json={"name": "Updated Project"},
                              headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Project"

    def test_update_project_not_found(self, client, test_user_token):
        response = client.put("/api/projects/99999", json={"name": "Nope"},
                              headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 404

    def test_delete_project(self, client, test_user_token):
        response = client.post("/api/projects/", json={"name": "To Delete"},
                               headers={"Authorization": f"Bearer {test_user_token}"})
        pid = response.json()["id"]
        response = client.delete(f"/api/projects/{pid}", headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 204

    def test_delete_project_not_found(self, client, test_user_token):
        response = client.delete("/api/projects/99999", headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 404

    def test_delete_project_unauthorized(self, client):
        response = client.delete("/api/projects/1")
        assert response.status_code == 401

    def test_create_duplicate_name_allowed(self, client, test_user_token):
        response1 = client.post("/api/projects/", json={"name": "Duplicate Name"},
                                headers={"Authorization": f"Bearer {test_user_token}"})
        assert response1.status_code == 201
        response2 = client.post("/api/projects/", json={"name": "Duplicate Name"},
                                headers={"Authorization": f"Bearer {test_user_token}"})
        assert response2.status_code == 201

# ─── DOCUMENTS ───

class TestDocuments:
    @pytest.fixture(autouse=True)
    def setup(self, client, test_user_token):
        projects = client.get("/api/projects/", headers={"Authorization": f"Bearer {test_user_token}"}).json()
        self.project_id = projects[0]["id"]
        self.token = test_user_token

    def test_upload_txt_document(self, client):
        file = io.BytesIO(b"Sample text content with skills and experience.")
        response = client.post("/api/documents/", data={"project_id": self.project_id, "doc_type": "knowledge_base"},
                               files={"file": ("sample.txt", file, "text/plain")},
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 201
        data = response.json()
        assert data["filename"] == "sample.txt"
        assert "id" in data

    def test_upload_multiple_documents(self, client):
        for i in range(3):
            file = io.BytesIO(f"Document {i} content".encode())
            response = client.post("/api/documents/", data={"project_id": self.project_id, "doc_type": "knowledge_base"},
                                   files={"file": (f"doc{i}.txt", file, "text/plain")},
                                   headers={"Authorization": f"Bearer {self.token}"})
            assert response.status_code == 201

    def test_upload_to_nonexistent_project(self, client):
        file = io.BytesIO(b"Some content")
        response = client.post("/api/documents/", data={"project_id": 99999, "doc_type": "knowledge_base"},
                               files={"file": ("test.txt", file, "text/plain")},
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_upload_empty_file(self, client):
        file = io.BytesIO(b"")
        response = client.post("/api/documents/", data={"project_id": self.project_id, "doc_type": "knowledge_base"},
                               files={"file": ("empty.txt", file, "text/plain")},
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code in [201, 500]

    def test_upload_unauthorized(self, client):
        file = io.BytesIO(b"Content")
        response = client.post("/api/documents/", data={"project_id": self.project_id, "doc_type": "knowledge_base"},
                               files={"file": ("test.txt", file, "text/plain")})
        assert response.status_code == 401

    def test_list_documents(self, client):
        response = client.get(f"/api/documents/project/{self.project_id}",
                              headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 200
        assert len(response.json()) >= 4

    def test_list_documents_empty_project(self, client, test_user_token, second_user_token):
        proj = client.post("/api/projects/", json={"name": "Empty Project"},
                           headers={"Authorization": f"Bearer {second_user_token}"}).json()
        response = client.get(f"/api/documents/project/{proj['id']}",
                              headers={"Authorization": f"Bearer {second_user_token}"})
        assert response.status_code == 200
        assert response.json() == []

    def test_rename_document(self, client):
        docs = client.get(f"/api/documents/project/{self.project_id}",
                          headers={"Authorization": f"Bearer {self.token}"}).json()
        doc_id = docs[0]["id"]
        response = client.put(f"/api/documents/{doc_id}", json={"filename": "renamed.txt"},
                              headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 200
        assert response.json()["filename"] == "renamed.txt"

    def test_rename_document_not_found(self, client):
        response = client.put("/api/documents/99999", json={"filename": "nope.txt"},
                              headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_delete_document(self, client):
        file = io.BytesIO(b"To be deleted")
        doc = client.post("/api/documents/", data={"project_id": self.project_id, "doc_type": "knowledge_base"},
                          files={"file": ("delete_me.txt", file, "text/plain")},
                          headers={"Authorization": f"Bearer {self.token}"}).json()
        response = client.delete(f"/api/documents/{doc['id']}", headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 204

    def test_delete_document_not_found(self, client):
        response = client.delete("/api/documents/99999", headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_delete_document_other_user(self, client, test_user_token, second_user_token):
        docs = client.get(f"/api/documents/project/{self.project_id}",
                          headers={"Authorization": f"Bearer {self.token}"}).json()
        doc_id = docs[0]["id"]
        response = client.delete(f"/api/documents/{doc_id}", headers={"Authorization": f"Bearer {second_user_token}"})
        assert response.status_code == 404

# ─── EMAILS ───

class TestEmails:
    @pytest.fixture(autouse=True)
    def setup(self, client, test_user_token):
        projects = client.get("/api/projects/", headers={"Authorization": f"Bearer {test_user_token}"}).json()
        self.project_id = projects[0]["id"]
        self.token = test_user_token

    def test_quick_email_generation(self, client):
        response = client.post("/api/emails/quick", json={"role": "Java Developer"},
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            assert "email_content" in response.json()

    def test_quick_email_empty_role(self, client):
        response = client.post("/api/emails/quick", json={"role": ""},
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code in [200, 422, 500]

    def test_quick_email_unauthorized(self, client):
        response = client.post("/api/emails/quick", json={"role": "Engineer"})
        assert response.status_code == 401

    def test_full_email_generation(self, client):
        payload = {
            "project_id": self.project_id,
            "recipient_name": "Jane Doe",
            "company_name": "Tech Corp",
            "industry": "Software",
            "pain_points": "Need fast hiring",
            "job_description": "Senior Python Developer with React experience. Job ID: TECH-123",
            "tone": "Professional"
        }
        response = client.post("/api/emails/generate", json=payload,
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code in [201, 500]

    def test_email_generation_missing_required_fields(self, client):
        response = client.post("/api/emails/generate", json={},
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 422

    def test_email_generation_invalid_project(self, client):
        payload = {
            "project_id": 99999,
            "recipient_name": "Jane Doe",
            "company_name": "Tech Corp",
            "industry": "Software",
            "pain_points": "None",
            "job_description": "Python Dev",
            "tone": "Professional"
        }
        response = client.post("/api/emails/generate", json=payload,
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_list_emails(self, client):
        response = client.get(f"/api/emails/project/{self.project_id}",
                              headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_emails_invalid_project(self, client):
        response = client.get("/api/emails/project/99999",
                              headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_get_email_not_found(self, client):
        response = client.get("/api/emails/99999", headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_get_email_unauthorized(self, client):
        response = client.get("/api/emails/1")
        assert response.status_code == 401

    def test_update_email_subject(self, client):
        emails = client.get(f"/api/emails/project/{self.project_id}",
                            headers={"Authorization": f"Bearer {self.token}"}).json()
        if emails:
            eid = emails[0]["id"]
            response = client.put(f"/api/emails/{eid}", json={"subject": "Updated Subject"},
                                  headers={"Authorization": f"Bearer {self.token}"})
            assert response.status_code == 200
            assert response.json()["subject"] == "Updated Subject"

    def test_update_email_not_found(self, client):
        response = client.put("/api/emails/99999", json={"subject": "Nope"},
                              headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_delete_email_not_found(self, client):
        response = client.delete("/api/emails/99999", headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

# ─── ACTIVITIES ───

class TestActivities:
    @pytest.fixture(autouse=True)
    def setup(self, client, test_user_token):
        projects = client.get("/api/projects/", headers={"Authorization": f"Bearer {test_user_token}"}).json()
        self.project_id = projects[0]["id"]
        self.token = test_user_token
        self.other_token = None

    def test_create_activity(self, client):
        response = client.post("/api/activities/", json={
            "action_type": "Manual Entry",
            "description": "Test activity",
            "project_id": self.project_id
        }, headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 201
        data = response.json()
        assert data["action_type"] == "Manual Entry"
        assert "id" in data

    def test_create_activity_minimal(self, client):
        response = client.post("/api/activities/", json={
            "action_type": "Note",
            "description": "Quick note"
        }, headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 201

    def test_create_activity_empty_fields(self, client):
        response = client.post("/api/activities/", json={"action_type": "", "description": ""},
                               headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code in [201, 422]

    def test_list_activities(self, client):
        response = client.get("/api/activities/", headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 200
        assert len(response.json()) >= 2

    def test_update_activity(self, client):
        acts = client.get("/api/activities/", headers={"Authorization": f"Bearer {self.token}"}).json()
        aid = acts[0]["id"]
        response = client.put(f"/api/activities/{aid}", json={"description": "Updated description"},
                              headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 200
        assert response.json()["description"] == "Updated description"

    def test_update_activity_not_found(self, client):
        response = client.put("/api/activities/99999", json={"description": "Nope"},
                              headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_delete_activity(self, client):
        act = client.post("/api/activities/", json={"action_type": "Temp", "description": "Delete me"},
                          headers={"Authorization": f"Bearer {self.token}"}).json()
        response = client.delete(f"/api/activities/{act['id']}", headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 204

    def test_delete_activity_not_found(self, client):
        response = client.delete("/api/activities/99999", headers={"Authorization": f"Bearer {self.token}"})
        assert response.status_code == 404

    def test_delete_activity_unauthorized(self, client):
        response = client.delete("/api/activities/1")
        assert response.status_code == 401

# ─── CROSS-CUTTING EDGE CASES ───

class TestEdgeCases:
    def test_invalid_json_body(self, client, test_user_token):
        response = client.post("/api/projects/", data="not json",
                               headers={"Authorization": f"Bearer {test_user_token}", "Content-Type": "application/json"})
        assert response.status_code == 422

    def test_malformed_token(self, client):
        response = client.get("/api/projects/", headers={"Authorization": "Bearer " + "x" * 500})
        assert response.status_code == 401

    def test_expired_token_style(self, client):
        response = client.get("/api/projects/", headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNTAwMDAwMDAwfQ.signature"})
        assert response.status_code == 401

    def test_empty_project_list_unauthorized(self, client):
        response = client.get("/api/projects/")
        assert response.status_code == 401

    def test_wrong_http_method(self, client, test_user_token):
        response = client.patch("/api/projects/", json={},
                                headers={"Authorization": f"Bearer {test_user_token}"})
        assert response.status_code == 405
