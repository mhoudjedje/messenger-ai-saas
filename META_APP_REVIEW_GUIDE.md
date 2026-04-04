# Meta App Review Guide - Going Live with Messenger Automation

This guide walks you through the complete process of submitting your AITeam Messenger app for review and switching to Live mode.

**Timeline:** 24-48 hours for review (sometimes faster)

---

## Step 1: Verify Prerequisites ✅

Before submitting for review, ensure you have:

- ✅ App created in Meta App Dashboard
- ✅ Messenger product added to app
- ✅ Webhook configured and verified
- ✅ App secret and verify token configured
- ✅ Privacy policy URL (required)
- ✅ Terms of service URL (required)
- ✅ App icon/logo
- ✅ App category selected
- ✅ Business account verified

---

## Step 2: Add Privacy Policy & Terms of Service

Meta requires you to have public privacy policy and terms of service URLs.

### If you don't have these yet:

**Option A: Create simple pages (5 minutes)**
1. Go to your website or create a simple page on a service like Notion
2. Add a Privacy Policy page (you can use a template)
3. Add a Terms of Service page (you can use a template)
4. Get the public URLs

**Option B: Use template services**
- https://www.termsfeed.com/ (free tier available)
- https://www.privacypolicies.com/ (free tier available)

**For now, you can use placeholder URLs** - Meta will review them, and you can update them later if needed.

---

## Step 3: Complete App Settings

### In Meta App Dashboard:

1. Go to **Settings** → **Basic**
2. Fill in the following fields:

| Field | Value | Example |
|-------|-------|---------|
| App Name | Your app name | AITeam Messenger Bot |
| App Description | What your app does | AI-powered Messenger automation for businesses |
| App Category | Select category | Business |
| App Subcategory | Select subcategory | Messaging |
| Privacy Policy URL | Your privacy policy | https://example.com/privacy |
| Terms of Service URL | Your terms | https://example.com/terms |
| Data Deletion Instructions | How to delete user data | Users can request deletion via email |
| User Data Deletion | Select "Yes" | - |

3. Upload an **App Icon** (at least 200x200 pixels)

4. Click **Save Changes**

---

## Step 4: Request pages_messaging Permission

This is the critical permission that allows your app to send and receive messages.

### Steps:

1. In Meta App Dashboard, go to **App Review** (left sidebar)
2. Look for the section: **Permissions and Features**
3. Find **pages_messaging** in the list
4. Click the **Request** button next to it

You should see a dialog asking for:
- **Use Case Description:** Describe what your app does
- **Feature Implementation:** Explain how you use the permission
- **Demo Video:** Optional (but helpful)

### What to write in the Use Case Description:

```
Our app provides AI-powered automation for Facebook Messenger. 
It allows businesses to:
1. Automatically respond to customer messages using AI
2. Support multiple languages (Arabic, French, English)
3. Maintain conversation history
4. Track customer interactions

The app uses OpenAI's GPT-4 to generate contextual, helpful responses
to customer inquiries. All responses are customizable by the business owner.
```

### What to write in Feature Implementation:

```
When a customer sends a message to a business's Facebook page:
1. Our webhook receives the message event
2. We validate the webhook signature for security
3. We retrieve the business's configured AI settings
4. We call OpenAI's API to generate a response
5. We send the response back via Messenger Send API
6. We store the conversation for history and analytics

The app respects all rate limits and message quotas configured by the business.
```

---

## Step 5: Add Demo Video (Optional but Recommended)

A demo video significantly increases approval chances.

### What to show in the video (2-3 minutes):

1. **Setup:** Show connecting a Facebook page in your app
2. **Configuration:** Show configuring the AI agent
3. **Demo:** Show sending a message to the page and receiving an AI response
4. **Dashboard:** Show viewing conversation history

### How to record:
- Use OBS Studio (free), ScreenFlow (Mac), or Camtasia
- Show your AITeam dashboard
- Send a test message to your page
- Show the response arriving
- Keep it under 3 minutes

### Upload:
- Go to **App Review** → **pages_messaging** → **Demo Video**
- Upload your video (MP4 format)

---

## Step 6: Fill Out the Review Submission Form

### In Meta App Dashboard:

1. Go to **App Review** (left sidebar)
2. Find **pages_messaging** permission
3. Click **Submit for Review**
4. Fill out the submission form with:

| Field | What to Enter |
|-------|---------------|
| **App Purpose** | "AI-powered Messenger automation for customer support" |
| **App Functionality** | Describe the key features |
| **Data Usage** | "We store conversation history for customer reference" |
| **User Privacy** | "We follow all Meta policies and user privacy guidelines" |
| **Testing Instructions** | "Send a message to the test page and receive an AI response" |
| **Test Page URL** | Your Facebook page URL |
| **Test Account** | Your Facebook account email |

---

## Step 7: Submit for Review

1. Review all the information you've entered
2. Agree to Meta's terms and policies
3. Click **Submit for Review**
4. You should see a confirmation message

**Important:** After submission, you'll see a status of "**Pending Review**"

---

## Step 8: Monitor Review Status

### Check Status:

1. Go to **App Review** in Meta App Dashboard
2. Look for **pages_messaging** permission
3. Status will show one of:
   - 🟡 **Pending Review** - Waiting for Meta team
   - 🟢 **Approved** - Ready to go live!
   - 🔴 **Rejected** - Need to address feedback

### Timeline:
- **Typical:** 24-48 hours
- **Fast track:** Sometimes 4-8 hours
- **Slow:** Up to 1 week (rare)

### Check your email:
Meta will send you an email when the review is complete with either:
- ✅ Approval notification
- ❌ Rejection with specific feedback

---

## Step 9: Handle Rejection (If It Happens)

If your app is rejected, Meta will provide specific feedback like:

### Common Rejection Reasons & Solutions:

| Reason | Solution |
|--------|----------|
| "Unclear use case" | Provide more detailed description of what your app does |
| "Privacy concerns" | Add/update privacy policy, explain data handling |
| "Insufficient testing" | Provide demo video showing the feature working |
| "Misleading description" | Make sure description matches actual functionality |
| "Security concerns" | Explain how you validate webhooks and secure data |

**If rejected:**
1. Read the feedback carefully
2. Make the requested changes
3. Go back to **App Review**
4. Click **Resubmit**
5. Wait for review again

---

## Step 10: Switch to Live Mode

Once your app is **Approved** ✅:

### In Meta App Dashboard:

1. Go to **Settings** → **Basic**
2. Look for **App Mode** at the top
3. Click the toggle to switch from **Development** to **Live**
4. Confirm the switch

### What changes:
- 🟢 App is now **Live**
- ✅ Any Facebook user can message your page
- ✅ Webhook will receive all messages
- ✅ Your automation is now active!

---

## Step 11: Verify Everything Works

After going live:

1. **Test with a different account:**
   - Use a friend's Facebook account
   - Send a message to your page
   - Verify you receive an AI response

2. **Check server logs:**
   ```bash
   tail -f /home/ubuntu/messenger-ai-saas/.manus-logs/devserver.log | grep "\[Webhook\]"
   ```

3. **Monitor for errors:**
   - Check for any webhook failures
   - Monitor response times
   - Verify messages are being stored

---

## Troubleshooting

### Issue: "Submit for Review" button is grayed out

**Solution:**
- Ensure all required fields in App Settings are filled
- Ensure Privacy Policy and Terms of Service URLs are valid
- Ensure app icon is uploaded
- Try refreshing the page

### Issue: Review keeps getting rejected

**Solution:**
- Make sure your description matches what your app actually does
- Provide a demo video showing the feature working
- Be specific about how you use the permission
- Ensure your privacy policy is clear about data handling

### Issue: "App Mode" toggle won't switch to Live

**Solution:**
- Wait for app review to complete (status must be "Approved")
- Refresh the page
- Try again in a few minutes
- Check if there are any "Required Actions" in the dashboard

### Issue: Messages still not being received after going live

**Solution:**
- Verify webhook is still configured correctly
- Check server logs for errors
- Verify page access token is valid
- Ensure agent is configured for the page
- Check subscription status

---

## Timeline Summary

| Step | Time | Status |
|------|------|--------|
| 1. Complete app settings | 10 min | ⏳ Now |
| 2. Request permission | 5 min | ⏳ Now |
| 3. Submit for review | 5 min | ⏳ Now |
| 4. Wait for approval | 24-48 hours | ⏳ Pending |
| 5. Switch to Live mode | 2 min | ⏳ After approval |
| 6. Test with real users | 5 min | ⏳ After going live |

**Total time to go live:** ~24-48 hours

---

## Important Notes

### Before Submitting:

- ✅ Make sure your webhook is working (we tested this)
- ✅ Make sure your AI responses are appropriate
- ✅ Make sure you have proper privacy policy
- ✅ Make sure you're not violating any Meta policies

### After Going Live:

- ✅ Monitor your webhook logs regularly
- ✅ Keep your privacy policy updated
- ✅ Respond to any user complaints quickly
- ✅ Keep your app and dependencies updated
- ✅ Monitor API costs (OpenAI)

### Meta Policies to Follow:

- ❌ Don't use AI to spam or harass users
- ❌ Don't collect user data without consent
- ❌ Don't impersonate businesses or people
- ❌ Don't violate user privacy
- ✅ Do provide clear opt-out options
- ✅ Do handle user data responsibly
- ✅ Do respond to Meta inquiries promptly

---

## Support

If you encounter issues during the review process:

1. **Check Meta Developer Docs:** https://developers.facebook.com/docs/messenger-platform
2. **Check App Review Status:** Meta App Dashboard → App Review
3. **Contact Meta Support:** https://developers.facebook.com/support

---

**Ready to submit?** Let's do it! Follow the steps above and let me know when you've submitted for review. I'll help you monitor the status and troubleshoot any issues.

**Last Updated:** 2026-03-25
**Status:** Ready for submission
