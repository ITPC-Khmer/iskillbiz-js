const express = require('express');
const router = express.Router();
const axios = require('axios');
const { requireAuth } = require('../middleware/auth');
const { FacebookAccount } = require('../models');

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FACEBOOK_REDIRECT_URL = process.env.FACEBOOK_REDIRECT_URL || 'http://localhost:5173/facebook/callback';

/**
 * Generate Facebook OAuth URL
 */
router.get('/oauth/url', requireAuth, (req, res, next) => {
  try {
    const scopes = [
      'pages_show_list',
      'pages_messaging',
      'pages_manage_metadata',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_engagement'
    ].join(',');

    // Store user ID in state for callback verification
    const state = Buffer.from(JSON.stringify({
      userId: req.user.id,
      timestamp: Date.now()
    })).toString('base64');

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URL)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${state}` +
      `&response_type=code`;

    res.success({ url: authUrl }, 'Facebook OAuth URL generated');
  } catch (err) {
    next(err);
  }
});

/**
 * Handle Facebook OAuth callback (POST - from frontend)
 */
router.post('/oauth/callback', requireAuth, async (req, res, next) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.error('Authorization code is required', 400);
    }

    // Verify state (optional but recommended)
    // In this flow, state validation might be less critical if we trust the user is authenticated via requireAuth
    // But ideally we should decode state and check userId matches req.user.id
    if (state) {
        try {
            const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
            if (stateData.userId !== req.user.id) {
                return res.error('Invalid state parameter: User mismatch', 400);
            }
        } catch (e) {
            console.warn('State validation failed:', e.message);
        }
    }

    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: FACEBOOK_REDIRECT_URL,
        code
      }
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        fields: 'id,name,email',
        access_token
      }
    });

    const fbUser = userResponse.data;

    // Create or update Facebook account
    const [account, created] = await FacebookAccount.findOrCreate({
      where: {
        user_id: req.user.id,
        facebook_user_id: fbUser.id
      },
      defaults: {
        user_id: req.user.id,
        facebook_user_id: fbUser.id,
        access_token,
        name: fbUser.name,
        email: fbUser.email,
        status: 'active'
      }
    });

    if (!created) {
      await account.update({
        access_token,
        name: fbUser.name,
        email: fbUser.email,
        status: 'active'
      });
    }

    res.success({ account }, 'Facebook account connected successfully');
  } catch (err) {
     if (err.response?.data?.error) {
         return res.error(err.response.data.error.message, 400);
     }
    next(err);
  }
});

/**
 * Handle Facebook OAuth callback (GET - direct redirect from Facebook)
 */
router.get('/oauth/callback', async (req, res, next) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth error
    if (error) {
      const errorMsg = error_description || error;
      return res.redirect(`${process.env.CLIENT_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/facebook?error=${encodeURIComponent(errorMsg)}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.CLIENT_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/facebook?error=Missing+code+or+state`);
    }

    // Decode and verify state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return res.redirect(`${process.env.CLIENT_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/facebook?error=Invalid+state+parameter`);
    }

    const userId = stateData.userId;
    if (!userId) {
      return res.redirect(`${process.env.CLIENT_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/facebook?error=Invalid+state+parameter`);
    }

    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: FACEBOOK_REDIRECT_URL,
        code
      }
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.redirect(`${process.env.CLIENT_ORIGINS?.split(',')[0] || 'http://localhost:5173'}/facebook?error=Failed+to+obtain+access+token`);
    }

    // Get user info from Facebook
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        fields: 'id,name,email',
        access_token
      }
    });

    const fbUser = userResponse.data;

    // Create or update Facebook account
    const [account, created] = await FacebookAccount.findOrCreate({
      where: {
        user_id: userId,
        facebook_user_id: fbUser.id
      },
      defaults: {
        user_id: userId,
        facebook_user_id: fbUser.id,
        access_token,
        name: fbUser.name,
        email: fbUser.email,
        status: 'active'
      }
    });

    if (!created) {
      await account.update({
        access_token,
        name: fbUser.name,
        email: fbUser.email,
        status: 'active'
      });
    }

    // Redirect back to frontend with success
    const clientUrl = process.env.CLIENT_ORIGINS?.split(',')[0] || 'http://localhost:5173';
    res.redirect(`${clientUrl}/facebook?success=true&account_id=${account.id}`);

  } catch (err) {
    console.error('Facebook OAuth callback error:', err.response?.data || err.message);
    const clientUrl = process.env.CLIENT_ORIGINS?.split(',')[0] || 'http://localhost:5173';
    res.redirect(`${clientUrl}/facebook?error=${encodeURIComponent(err.message || 'OAuth failed')}`);
  }
});

/**
 * Exchange short-lived token for long-lived token
 */
router.post('/oauth/extend-token', requireAuth, async (req, res, next) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.error('Access token is required', 400);
    }

    // Exchange for long-lived token
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: access_token
      }
    });

    const { access_token: longLivedToken, expires_in } = response.data;

    res.success({
      access_token: longLivedToken,
      expires_in
    }, 'Token extended successfully');

  } catch (err) {
    console.error('Token extension error:', err.response?.data || err.message);
    next(err);
  }
});

module.exports = router;
