/**
 * Facebook Module Initialization Script
 *
 * This script initializes the Facebook module by:
 * 1. Creating/syncing all Facebook tables
 * 2. Optionally seeding test data
 */

require('dotenv').config();
const { initDatabase } = require('../models');
const { User, FacebookAccount, FacebookPage, FacebookAutomation, FacebookKeyword } = require('../models');

async function initializeFacebookModule() {
  try {
    console.log('🚀 Initializing Facebook Module...\n');

    // Initialize database and create tables
    console.log('📊 Creating database tables...');
    await initDatabase();
    console.log('✅ Database tables created successfully\n');

    // Check if we should seed test data
    const shouldSeed = process.argv.includes('--seed');

    if (shouldSeed) {
      console.log('🌱 Seeding test data...\n');
      await seedTestData();
      console.log('✅ Test data seeded successfully\n');
    }

    console.log('✨ Facebook Module initialized successfully!');
    console.log('\n📖 Read FACEBOOK_MODULE_README.md for usage instructions');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Facebook module:', error);
    process.exit(1);
  }
}

async function seedTestData() {
  // Find or create a test user
  const [testUser] = await User.findOrCreate({
    where: { email: 'test@facebook-module.local' },
    defaults: {
      email: 'test@facebook-module.local',
      passwordHash: 'test_hash',
      name: 'Test User'
    }
  });
  console.log('  ✓ Test user created');

  // Create a sample Facebook account
  const [fbAccount] = await FacebookAccount.findOrCreate({
    where: { facebook_user_id: 'test_fb_user_123' },
    defaults: {
      user_id: testUser.id,
      facebook_user_id: 'test_fb_user_123',
      access_token: 'test_access_token',
      name: 'Test Facebook User',
      email: 'test@facebook.com',
      status: 'active'
    }
  });
  console.log('  ✓ Test Facebook account created');

  // Create a sample Facebook page
  const [fbPage] = await FacebookPage.findOrCreate({
    where: { page_id: 'test_page_123' },
    defaults: {
      facebook_account_id: fbAccount.id,
      page_id: 'test_page_123',
      page_access_token: 'test_page_token',
      name: 'Test Business Page',
      category: 'Local Business',
      status: 'active'
    }
  });
  console.log('  ✓ Test Facebook page created');

  // Create sample automations
  const automationTypes = [
    {
      name: 'Welcome Away Message',
      type: 'away_message',
      config: {
        message: 'Thank you for contacting us! We will respond within 24 hours.'
      }
    },
    {
      name: 'Pricing Keywords',
      type: 'custom_keyword',
      config: {}
    },
    {
      name: 'Comment Auto-Reply',
      type: 'comment_to_message',
      config: {
        message: 'Thank you for your comment! We have sent you a message.'
      }
    },
    {
      name: 'Unanswered Alert',
      type: 'unanswered_alert',
      config: {
        hours_threshold: 24
      }
    },
    {
      name: 'Contact Info Request',
      type: 'contact_info',
      config: {
        message: 'To better assist you, could you please provide your email and phone number?'
      }
    }
  ];

  for (const autoData of automationTypes) {
    const [automation] = await FacebookAutomation.findOrCreate({
      where: {
        facebook_page_id: fbPage.id,
        type: autoData.type
      },
      defaults: {
        facebook_page_id: fbPage.id,
        name: autoData.name,
        type: autoData.type,
        is_active: true,
        config: autoData.config
      }
    });

    // Add keywords for custom_keyword automation
    if (autoData.type === 'custom_keyword') {
      const keywords = [
        { keyword: 'price', match_type: 'contains', response_message: 'Our pricing starts at $99/month. Visit our website for details.' },
        { keyword: 'cost', match_type: 'contains', response_message: 'Our pricing starts at $99/month. Visit our website for details.' },
        { keyword: 'hours', match_type: 'contains', response_message: 'We are open Monday-Friday, 9AM-5PM EST.' },
        { keyword: 'location', match_type: 'contains', response_message: 'We are located at 123 Main St, City, State.' }
      ];

      for (const kwData of keywords) {
        await FacebookKeyword.findOrCreate({
          where: {
            facebook_automation_id: automation.id,
            keyword: kwData.keyword
          },
          defaults: {
            facebook_automation_id: automation.id,
            keyword: kwData.keyword,
            match_type: kwData.match_type,
            response_message: kwData.response_message,
            is_active: true
          }
        });
      }
      console.log(`  ✓ ${autoData.name} automation with keywords created`);
    } else {
      console.log(`  ✓ ${autoData.name} automation created`);
    }
  }
}

// Run initialization
initializeFacebookModule();

