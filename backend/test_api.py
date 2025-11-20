import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1"

# Test user registration
def test_register():
    url = f"{BASE_URL}/auth/register"
    data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "password123"
    }
    response = requests.post(url, json=data)
    print(f"Register Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.json().get("access_token")

# Test login
def test_login(email="test@example.com", password="password123"):
    url = f"{BASE_URL}/auth/login"
    data = {
        "username": email,  # OAuth2 uses 'username' field
        "password": password
    }
    response = requests.post(url, data=data)  # Note: form data, not JSON
    print(f"Login Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    return response.json().get("access_token")

# Test get user info
def test_get_user(token):
    url = f"{BASE_URL}/users/me"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    print(f"Get User Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

# Test get stock history
def test_get_stock_history(ticker="AAPL", range="1m"):
    url = f"{BASE_URL}/stocks/history?ticker={ticker}&range={range}"
    response = requests.get(url)
    print(f"Get Stock History Response: {response.status_code}")
    # Only print first and last data points to avoid too much output
    data = response.json()
    if data and len(data) > 2:
        print("First data point:")
        print(json.dumps(data[0], indent=2))
        print("Last data point:")
        print(json.dumps(data[-1], indent=2))
        print(f"Total data points: {len(data)}")
    else:
        print(json.dumps(data, indent=2))

# Test get stock prediction
def test_get_prediction(ticker="AAPL", horizon="1d"):
    url = f"{BASE_URL}/stocks/predict?ticker={ticker}&horizon={horizon}"
    response = requests.get(url)
    print(f"Get Prediction Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

# Test add to watchlist
def test_add_to_watchlist(token, ticker="AAPL"):
    url = f"{BASE_URL}/watchlist/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {"ticker": ticker}
    response = requests.post(url, json=data, headers=headers)
    print(f"Add to Watchlist Response: {response.status_code}")
    if response.status_code == 201:
        print(json.dumps(response.json(), indent=2))
    else:
        print(response.text)

# Test get watchlist
def test_get_watchlist(token):
    url = f"{BASE_URL}/watchlist/"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    print(f"Get Watchlist Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

# Run tests
if __name__ == "__main__":
    # Try to register a new user
    token = test_register()
    
    # If registration fails (e.g., user already exists), try login
    if not token:
        token = test_login()
    
    if token:
        # Test authenticated endpoints
        test_get_user(token)
        test_add_to_watchlist(token, "MSFT")
        test_get_watchlist(token)
    
    # Test public endpoints
    test_get_stock_history()
    test_get_prediction()