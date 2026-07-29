import requests
import json

base_url = "http://localhost:8000/api"
headers = {"Content-Type": "application/json"}

print("Testing Registration...")
try:
    reg_response = requests.post(f"{base_url}/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User"
    })
    print("Registration Status:", reg_response.status_code)
    print("Registration Body:", reg_response.text)
except Exception as e:
    print("Registration Exception:", e)

print("\nTesting Login...")
try:
    login_response = requests.post(f"{base_url}/auth/login", data={
        "username": "test@example.com",
        "password": "password123"
    })
    print("Login Status:", login_response.status_code)
    print("Login Body:", login_response.text)
    
    if login_response.status_code == 200:
        token = login_response.json().get("access_token")
        
        print("\nTesting /auth/me...")
        me_response = requests.get(f"{base_url}/auth/me", headers={"Authorization": f"Bearer {token}"})
        print("Me Status:", me_response.status_code)
        print("Me Body:", me_response.text)
except Exception as e:
    print("Login Exception:", e)
