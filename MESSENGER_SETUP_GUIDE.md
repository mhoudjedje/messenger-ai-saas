# Messenger AI Automation - Setup & Testing Guide

This guide walks you through setting up the Messenger webhook and testing the AI automation with real messages.

---

## Prerequisites

Before you start, ensure you have:

1. **A Facebook Page** - The page where customers will message you
2. **A Facebook App** - For OAuth and webhook configuration
3. **Meta Cloud API Access Token** - For API authentication (already configured ✅)
4. **Your Webhook URL** - The public URL where Meta will send messages

---

## Step 1: Get Your Webhook URL

Your application is running at:
```
https://messengerai-crj7dbqp.manus.space
```

Your webhook endpoint is:
```
https://messengerai-crj7dbqp.manus.space/api/webhook
```

**Note:** The webhook must be publicly accessible. Make sure your domain is properly configured in the Manus dashboard.

---

## Step 2: Configure Meta App Webhook Settings

### In Meta App Dashboard:

1. Go to **Meta App Dashboard** → Your App → **Messenger** → **Settings**
2. Under **Webhooks**, click **Edit Subscription**
3. Fill in the webhook settings:
   - **Callback URL:** `https://messengerai-crj7dbqp.manus.space/api/webhook`
   - **Verify Token:** Use the value from `META_VERIFY_TOKEN` environment variable
   - **Webhook Fields:** Select the following fields:
     - `messages` (required for incoming messages)
     - `messaging_postbacks` (for button clicks)
     - `message_deliveries` (for delivery confirmation)
     - `message_reads` (for read receipts)

4. Click **Verify and Save**

Meta will send a GET request to your webhook URL with verification parameters. Your server will automatically respond with the challenge to complete verification.

---

## Step 3: Connect Your Facebook Page

### Option A: Manual Token Entry (Recommended for Testing)

1. Go to your AITeam dashboard
2. Navigate to **Pages** section
3. Click **Connect Page**
4. Choose **Manual Token Entry**
5. Enter your Facebook Page Access Token
6. Click **Connect**

### Option B: OAuth Flow

1. Go to your AITeam dashboard
2. Navigate to **Pages** section
3. Click **Connect Page**
4. Choose **OAuth**
5. Follow the Facebook login flow
6. Select your page
7. Grant permissions

---

## Step 4: Get Your Facebook Page Access Token

If you don't have your page access token, here's how to get it:

### Using Facebook Graph API Explorer:

1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. Select your app from the dropdown
3. In the left panel, search for **"Get Page Access Token"**
4. Select your page
5. Click **Get Token**
6. Copy the long token that appears

### Using Meta Business Suite:

1. Go to [Meta Business Suite](https://business.facebook.com)
2. Select your business account
3. Go to **Settings** → **Access Tokens**
4. Find your page's access token
5. Click **Generate New Token** if needed

---

## Step 5: Configure Agent Settings

1. Go to your AITeam dashboard
2. Select your connected page
3. Click **Configure Agent**
4. Set up:
   - **Agent Name:** e.g., "Sales Assistant"
   - **Personality & Behavior:** Describe how the agent should act
   - **System Instructions:** Detailed rules for the agent
   - **Response Language:** Choose Arabic, French, or English
   - **Max Tokens:** 100-200 for concise responses
   - **Creativity:** 0.7 for balanced responses

5. Click **Save Configuration**

---

## Step 6: Test the Webhook (Optional)

You can test the webhook without sending a real message:

### Using curl:

```bash
# Test webhook verification
curl "https://messengerai-crj7dbqp.manus.space/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test_challenge_string"

# Expected response: test_challenge_string
```

### Using Postman:

1. Create a new GET request
2. URL: `https://messengerai-crj7dbqp.manus.space/api/webhook`
3. Query Parameters:
   - `hub.mode` = `subscribe`
   - `hub.verify_token` = Your verify token
   - `hub.challenge` = `test_challenge`
4. Send the request
5. You should get the challenge string back

---

## Step 7: Send a Real Test Message

Now it's time to test with a real message!

### From Facebook Messenger:

1. Go to your Facebook Page
2. Open the Messenger inbox
3. Send a message to your page from a test account
4. **Wait 3-5 seconds** for the AI to process
5. You should receive an automated response

### What happens behind the scenes:

1. Meta sends webhook event to your server
2. Server validates the webhook signature
3. Server extracts the message content
4. Server detects the language (Arabic/French/English)
5. Server generates AI response using OpenAI
6. Server sends response back to Messenger
7. Message is saved to database for history

---

## Step 8: Monitor the Webhook

### Check Server Logs:

```bash
# View real-time logs
tail -f /home/ubuntu/messenger-ai-saas/.manus-logs/devserver.log

# Filter for webhook events
tail -f /home/ubuntu/messenger-ai-saas/.manus-logs/devserver.log | grep "\[Webhook\]\|\[Agent\]"
```

### Expected Log Output:

```
[2026-03-25T10:30:45.123Z] [Webhook] Verified webhook
[2026-03-25T10:30:46.456Z] [Webhook] Processing event from page: 123456789
[2026-03-25T10:30:47.789Z] [Agent] Generating personalized response for language: ar
[2026-03-25T10:30:50.234Z] [Agent] Response generated successfully
[2026-03-25T10:30:51.567Z] [Webhook] Message sent successfully
```

### View Message History:

1. Go to your AITeam dashboard
2. Navigate to **Conversations**
3. You should see the conversation with the test message
4. Click to view the full conversation history

---

## Troubleshooting

### Issue: Webhook verification fails

**Symptoms:** Meta shows "Webhook verification failed" in App Dashboard

**Solutions:**
1. Check that `META_VERIFY_TOKEN` environment variable is set correctly
2. Verify the webhook URL is publicly accessible
3. Check server logs for errors
4. Try webhook verification again after 5 minutes

### Issue: Messages not received

**Symptoms:** You send a message but don't get a response

**Solutions:**
1. Check that your page is connected in AITeam dashboard
2. Verify the page access token is valid (not expired)
3. Check that the agent is configured
4. Check server logs for errors
5. Verify your subscription is active
6. Check message limit hasn't been exceeded

### Issue: AI response is slow

**Symptoms:** Takes > 10 seconds to get a response

**Solutions:**
1. Check OpenAI API status
2. Reduce `maxTokens` in agent configuration
3. Check server CPU/memory usage
4. Check network latency

### Issue: AI response is not in the right language

**Symptoms:** Response is in English but should be in Arabic

**Solutions:**
1. Check agent configuration - set "Response Language" correctly
2. Check language detection in logs
3. Try sending a message with more text in the target language

### Issue: Webhook signature validation fails

**Symptoms:** Logs show "Invalid signature"

**Solutions:**
1. Verify `META_APP_SECRET` is correct
2. Check that webhook URL matches exactly in Meta App Dashboard
3. Ensure no proxy or middleware is modifying the request body

---

## Advanced Configuration

### Rate Limiting

The webhook is currently rate-limited to:
- 10 requests per minute per user
- 100 requests per hour per user

If you exceed these limits, you'll get a 429 (Too Many Requests) response.

### Message Limits

Users on different subscription tiers have different monthly message limits:
- **Free:** 100 messages/month
- **Pro:** 1,000 messages/month
- **Enterprise:** Unlimited

Once the limit is exceeded, the agent will send a message asking the user to upgrade.

### Conversation History

All conversations are stored in the database with:
- User messages
- AI responses
- Response time
- Language used
- Timestamps

You can view and export conversation history from the dashboard.

---

## Production Checklist

Before going live with real customers:

- [ ] Webhook URL is publicly accessible
- [ ] Meta App Dashboard webhook is configured correctly
- [ ] Page access token is valid and has proper permissions
- [ ] Agent is configured with appropriate personality and rules
- [ ] Subscription is active
- [ ] Message limit is sufficient
- [ ] Error handling is in place
- [ ] Logging is enabled for monitoring
- [ ] Backup and recovery procedures are documented
- [ ] Rate limiting is appropriate for your use case
- [ ] Response quality is acceptable (test with multiple messages)
- [ ] Language detection is working correctly
- [ ] Typing indicator is showing (optional but improves UX)

---

## Testing Scenarios

### Test 1: Basic Message

**Send:** "Hello"
**Expected:** AI responds with a greeting

### Test 2: Arabic Message

**Send:** "السلام عليكم"
**Expected:** AI responds in Arabic

### Test 3: French Message

**Send:** "Bonjour"
**Expected:** AI responds in French

### Test 4: Complex Question

**Send:** "What are your business hours?"
**Expected:** AI responds based on configured personality

### Test 5: Attachment

**Send:** An image
**Expected:** AI acknowledges the attachment

---

## Performance Monitoring

### Key Metrics to Monitor:

1. **Response Time:** How long does it take to respond?
   - Target: < 3 seconds
   - Acceptable: < 5 seconds
   - Poor: > 10 seconds

2. **Success Rate:** What percentage of messages are processed successfully?
   - Target: > 99%
   - Acceptable: > 95%
   - Poor: < 90%

3. **Error Rate:** What percentage of messages fail?
   - Target: < 1%
   - Acceptable: < 5%
   - Poor: > 10%

4. **API Cost:** How much are you spending on OpenAI?
   - Monitor daily/monthly spend
   - Optimize prompts to reduce token usage
   - Consider caching for repeated messages

---

## Support & Documentation

For more information:
- [Meta Messenger Platform Docs](https://developers.facebook.com/docs/messenger-platform)
- [Webhook Reference](https://developers.facebook.com/docs/messenger-platform/webhooks)
- [Send API Reference](https://developers.facebook.com/docs/messenger-platform/reference/send-api)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

**Last Updated:** 2026-03-25
**Status:** Ready for testing
