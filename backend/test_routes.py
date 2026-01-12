#!/usr/bin/env python
"""Quick test of material routes"""

import sys
sys.path.insert(0, '.')

try:
    from main import app
    from fastapi.testclient import TestClient
    
    client = TestClient(app)
    print("Testing /api/materials endpoint...")
    response = client.get("/api/materials")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
