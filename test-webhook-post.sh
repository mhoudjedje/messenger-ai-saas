#!/bin/bash

# Test webhook endpoint with a sample Messenger event
curl -X POST https://messengerai-crj7dbqp.manus.space/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [
      {
        "id": "104788746174280",
        "time": 1234567890,
        "messaging": [
          {
            "sender": {
              "id": "test-user-123"
            },
            "recipient": {
              "id": "104788746174280"
            },
            "timestamp": 1234567890,
            "message": {
              "mid": "mid.123456",
              "text": "Hello, this is a test message"
            }
          }
        ]
      }
    ]
  }' -v
