#!/bin/bash

# AI Assistant Integration Test Script
# This script performs basic tests on the AI assistant endpoints

echo "======================================"
echo "AI Assistant Integration Test Script"
echo "======================================"
echo ""

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
JWT_TOKEN="${JWT_TOKEN:-}"

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ JWT_TOKEN environment variable is required"
  echo "Usage: JWT_TOKEN=your_token ./test-ai-endpoints.sh"
  exit 1
fi

echo "Testing AI Assistant endpoints..."
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Get Services
echo "Test 1: GET Services"
echo "Endpoint: POST $BASE_URL/api/ai/services"
curl -X POST "$BASE_URL/api/ai/services" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not installed for formatting)"
echo ""
echo "---"
echo ""

# Test 2: Check Availability (will fail without valid IDs, but tests endpoint)
echo "Test 2: Check Availability (with dummy data)"
echo "Endpoint: POST $BASE_URL/api/ai/availability"
curl -X POST "$BASE_URL/api/ai/availability" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "test-employee-id",
    "serviceId": "test-service-id",
    "date": "2024-01-15"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not installed for formatting)"
echo ""
echo "---"
echo ""

# Test 3: Process Natural Language (if OpenAI is configured)
echo "Test 3: Process Natural Language Input"
echo "Endpoint: POST $BASE_URL/api/ai/process"
curl -X POST "$BASE_URL/api/ai/process" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "What are your business hours?",
    "context": {
      "customerPhone": "+1234567890",
      "customerName": "Test User"
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not installed for formatting)"
echo ""
echo "---"
echo ""

# Test 4: Manage Appointments - Get
echo "Test 4: Get Appointments"
echo "Endpoint: POST $BASE_URL/api/ai/appointments"
curl -X POST "$BASE_URL/api/ai/appointments" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not installed for formatting)"
echo ""
echo "---"
echo ""

# Test 5: Validation Error Test
echo "Test 5: Validation Error Test (missing required fields)"
echo "Endpoint: POST $BASE_URL/api/ai/availability"
curl -X POST "$BASE_URL/api/ai/availability" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not installed for formatting)"
echo ""
echo "---"
echo ""

echo "======================================"
echo "Testing Complete"
echo "======================================"
echo ""
echo "Notes:"
echo "- Tests 1, 4, and 5 should work with any valid JWT token"
echo "- Tests 2 and 3 will show errors without valid employee/service IDs"
echo "- Test 3 requires OpenAI API key to be configured"
echo "- Check HTTP status codes: 200/201 = success, 400 = validation error, 401 = auth error, 404 = not found"
