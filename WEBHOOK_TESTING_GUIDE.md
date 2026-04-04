# Messenger Webhook AI Response - Testing Guide

## Overview

The Messenger webhook automation pipeline is now complete and fully tested. This guide walks you through testing it end-to-end with a real Facebook Messenger page.

## What's Implemented ✅

The system now:
1. **Receives** Messenger messages via webhook
2. **Validates** user subscription and message limits
3. **Extracts** message content and detects language (Arabic/French/English)
4. **Generates** personalized AI responses using OpenAI GPT-4o
5. **Sends** responses back via Messenger Send API
6. **Stores** full conversation history in the database
7. **Handles** errors gracefully with user notifications

## Prerequisites

Before testing, you need:

### 1. A Facebook Page (with Messenger enabled)
- Create or use an existing Facebook page
- Enable Messenger on the page
- Get the **Page ID** (visible in page settings)

### 2. A Facebook App (Meta App)
- Create app at https://developers.facebook.com
- Get the **App ID** and **App Secret**
- Configure Messenger product
- Set webhook URL to: `https://yourdomain.com/api/webhook`
- Set webhook verify token (any string, e.g., "test123")

### 3. Page Access Token
- Go to your Meta App Dashboard
- Navigate to Messenger > Settings
- Generate a **Page Access Token** for your page
- This token is used to send messages and authenticate requests

## Step 1: Connect Your Page

### Via Manual Token (Recommended for Testing)

1. Log in to your Aiteam dashboard
2. Go to **Pages** section
3. Click **"Connect Page Manually"**
4. Paste your **Page Access Token**
5. The system will:
   - Validate the token
   - Fetch page information
   - Store the connection securely
   - Create an agent configuration

### Via OAuth (Production)

1. Click **"Connect with Facebook"**
2. Authorize the app
3. Select your page
4. Confirm connection

## Step 2: Configure Your AI Agent

1. Go to **Agent Configuration** page
2. Set up your agent:
   - **Personality/Instructions**: Define how the AI should behave
     - Example: "You are a friendly customer support agent. Be helpful and concise."
   - **Response Language**: Choose default response language (Arabic/French/English)
   - **System Prompt**: Optional custom system instructions
   - **Max Tokens**: Maximum response length (default: 500)

3. Click **"Save Configuration"**

## Step 3: Test the Webhook

### Local Testing (via localhost)

```bash
# 1. Start the dev server
npm run dev

# 2. In another terminal, send a test webhook
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [
      {
        "id": "YOUR_PAGE_ID",
        "time": '$(date +%s)',
        "messaging": [
          {
            "sender": { "id": "USER_PSID" },
            "recipient": { "id": "YOUR_PAGE_ID" },
            "timestamp": '$(date +%s)',
            "message": {
              "mid": "test-msg-'$(date +%s)'",
              "text": "Hello, can you help me?"
            }
          }
        ]
      }
    ]
  }'
```

### Real Messenger Testing

1. **Send a message** to your Facebook page via Messenger
2. **Check the logs** in your dashboard:
   - Go to **Conversations** page
   - You should see your message
   - The AI response should appear below it

3. **Verify in Messenger**:
   - The response should appear in the Messenger chat
   - Check that it's in the correct language
   - Verify it matches your agent's personality

## Step 4: Monitor and Debug

### Check Conversation History

1. Go to **Conversations** page
2. View all messages and responses
3. See response time and language detection

### View Analytics

1. Go to **Analytics** page
2. Monitor:
   - Total messages processed
   - Average response time
   - Languages used
   - Error rates

### Check Server Logs

```bash
# View real-time logs
tail -f .manus-logs/devserver.log | grep -E "Webhook|webhook"

# Search for specific errors
grep "Error processing message" .manus-logs/devserver.log
```

## Troubleshooting

### Issue: "Page not found"
- **Cause**: Page ID doesn't exist in database
- **Solution**: Connect the page via "Connect Page Manually" or "Connect with Facebook"

### Issue: "Subscription not active"
- **Cause**: User doesn't have an active subscription
- **Solution**: Go to Premium page and select a plan

### Issue: "Message limit exceeded"
- **Cause**: User has exceeded their monthly message limit
- **Solution**: Upgrade to a higher plan

### Issue: AI response is not being sent
- **Cause**: OpenAI API error or invalid configuration
- **Solution**:
  1. Check OpenAI API key is configured
  2. Verify agent configuration is saved
  3. Check server logs for errors
  4. Verify page access token is valid

### Issue: Webhook not receiving messages
- **Cause**: Webhook URL not configured in Meta App Console
- **Solution**:
  1. Go to Meta App Dashboard
  2. Messenger > Settings > Webhooks
  3. Set Callback URL: `https://yourdomain.com/api/webhook`
  4. Set Verify Token: (use the same token you set in Meta App)
  5. Subscribe to `messages` webhook field

## Testing Checklist

- [ ] Page connected successfully
- [ ] Agent configuration saved
- [ ] Test message received via webhook
- [ ] AI response generated
- [ ] Response sent back to Messenger
- [ ] Conversation stored in database
- [ ] Response appears in Messenger chat
- [ ] Correct language detected
- [ ] Analytics updated
- [ ] Error handling works (test with invalid input)

## Performance Metrics

Expected performance:
- **Message processing**: 1-3 seconds
- **AI response generation**: 2-5 seconds
- **Total response time**: 3-8 seconds
- **Success rate**: 99%+ (with proper configuration)

## Next Steps

After successful testing:

1. **Deploy to Production**
   - Create checkpoint
   - Publish via Manus UI
   - Update webhook URL in Meta App Console

2. **Monitor in Production**
   - Set up error alerts
   - Monitor OpenAI costs
   - Track response times

3. **Optimize**
   - Adjust agent personality based on feedback
   - Fine-tune response language
   - Implement custom rules if needed

4. **Scale**
   - Add more pages
   - Implement rate limiting
   - Set up analytics dashboard

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs
3. Verify all configuration steps
4. Test with simple messages first
5. Check Meta App Console webhook delivery logs

## API Reference

### Webhook Event Structure

```json
{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "time": 1234567890,
      "messaging": [
        {
          "sender": { "id": "USER_PSID" },
          "recipient": { "id": "PAGE_ID" },
          "timestamp": 1234567890,
          "message": {
            "mid": "MESSAGE_ID",
            "text": "User message text",
            "attachments": []
          }
        }
      ]
    }
  ]
}
```

### Database Schema

Messages are stored with:
- `conversationId`: Links to conversation
- `userId`: User who owns the page
- `pageId`: Facebook page ID
- `psid`: Messenger user ID
- `senderType`: "user" or "agent"
- `content`: Message text
- `language`: Detected language
- `responseTime`: Time to generate response
- `createdAt`: Timestamp

## Code Examples

### Manual Webhook Test (Node.js)

```javascript
const axios = require('axios');

const webhookEvent = {
  object: 'page',
  entry: [
    {
      id: 'YOUR_PAGE_ID',
      time: Math.floor(Date.now() / 1000),
      messaging: [
        {
          sender: { id: 'USER_PSID' },
          recipient: { id: 'YOUR_PAGE_ID' },
          timestamp: Math.floor(Date.now() / 1000),
          message: {
            mid: `msg-${Date.now()}`,
            text: 'Hello, how can you help me?'
          }
        }
      ]
    }
  ]
};

axios.post('http://localhost:3000/api/webhook', webhookEvent)
  .then(res => console.log('Success:', res.data))
  .catch(err => console.error('Error:', err.response?.data || err.message));
```

## Monitoring Dashboard

The system provides real-time monitoring:

1. **Conversations Page**: View all messages and responses
2. **Analytics Page**: Track metrics and trends
3. **Agent Configuration**: Manage AI personality
4. **Settings Page**: Configure preferences

---

**Last Updated**: April 2026  
**Status**: ✅ Production Ready
