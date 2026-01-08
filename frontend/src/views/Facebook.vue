<template>
  <div class="facebook-page">
    <header class="page-header">
      <div>
        <h2>Facebook Integration</h2>
        <p>Manage pages, conversations, messages, contacts, and syncs.</p>
      </div>
      <div class="actions">
        <button class="btn" @click="loadPages" :disabled="fb.loading">
          {{ fb.loading ? 'Loading...' : 'Refresh Pages' }}
        </button>
        <button class="btn secondary" @click="runFullSync" :disabled="!selectedPageId || fb.loading">
          Full Sync
        </button>
      </div>
    </header>

    <div class="grid">
      <!-- Pages -->
      <section class="card">
        <div class="card-header">
          <h3>Pages</h3>
          <div class="card-actions">
            <button class="btn link" @click="loadPages" :disabled="fb.loading">Reload</button>
          </div>
        </div>
        <div v-if="pages.length === 0" class="empty">No pages found. Click reload.</div>
        <ul v-else class="list">
          <li v-for="page in pages" :key="page.id" :class="['list-item', { active: page.id === selectedPageId }]">
            <div>
              <div class="title">{{ page.name }}</div>
              <div class="subtitle">{{ page.category || 'No category' }}</div>
              <div class="meta">Followers: {{ page.fan_count || 0 }}</div>
            </div>
            <div class="item-actions">
              <button class="btn link" @click="selectPage(page.id)">Select</button>
              <button class="btn link" @click="syncPage(page.id)" :disabled="fb.loading">Sync</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Conversations -->
      <section class="card">
        <div class="card-header">
          <h3>Conversations</h3>
          <div class="card-actions">
            <button class="btn link" @click="loadConversations" :disabled="!selectedPageId || fb.loading">Load</button>
            <div class="btn-group">
              <input class="hours-input" type="number" min="1" v-model.number="unansweredHours" title="Hours threshold" />
              <button class="btn link" @click="loadUnanswered" :disabled="!selectedPageId || fb.loading">Unanswered</button>
              <button class="btn link" @click="refreshUnanswered(unansweredHours)" :disabled="!selectedPageId || fbAuto.loading">Check</button>
            </div>
            <button class="btn link" @click="syncConversations" :disabled="!selectedPageId || fb.loading">Sync</button>
          </div>
        </div>
        <div v-if="!selectedPageId" class="empty">Select a page to view conversations.</div>
        <div v-else-if="conversations.length === 0" class="empty">No conversations.</div>
        <ul v-else class="list">
          <li
            v-for="conv in conversations"
            :key="conv.id"
            :class="['list-item', { active: conv.id === selectedConversationId }]"
          >
            <div>
              <div class="title">{{ conv.participant_name || 'Unknown participant' }}</div>
              <div class="subtitle">{{ conv.last_message_text || 'No messages yet' }}</div>
              <div class="meta">
                <span>Unread: {{ conv.unread_count || 0 }}</span>
                <span>Answered: {{ conv.is_answered ? 'Yes' : 'No' }}</span>
              </div>
            </div>
            <div class="item-actions">
              <button class="btn link" @click="selectConversation(conv.id)">Open</button>
              <button class="btn link" @click="syncMessages(conv.id)" :disabled="fb.loading">Sync msgs</button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Messages -->
      <section class="card">
        <div class="card-header">
          <h3>Messages</h3>
          <div class="card-actions">
            <button class="btn link" @click="syncMessages(selectedConversationId)" :disabled="!selectedConversationId || fb.loading">
              Sync messages
            </button>
          </div>
        </div>
        <div v-if="!selectedConversationId" class="empty">Select a conversation to view messages.</div>
        <div v-else class="messages">
          <div v-if="messages.length === 0" class="empty">No messages yet.</div>
          <ul v-else class="message-list">
            <li v-for="msg in messages" :key="msg.id" :class="['message', { fromPage: msg.is_from_page }]">
              <div class="message-meta">
                <span class="author">{{ msg.from_name || msg.from_id }}</span>
                <span class="time">{{ formatDate(msg.created_time) }}</span>
              </div>
              <div class="message-body">{{ msg.message }}</div>
            </li>
          </ul>
          <form class="send-box" @submit.prevent="sendNewMessage">
            <input v-model="newMessage" type="text" placeholder="Type a message" :disabled="fb.loading" />
            <button class="btn" type="submit" :disabled="!newMessage || fb.loading">Send</button>
          </form>
        </div>
      </section>

      <!-- Contacts -->
      <section class="card">
        <div class="card-header">
          <h3>Contacts</h3>
          <div class="card-actions">
            <button class="btn link" @click="loadContacts" :disabled="!selectedPageId || fb.loading">Load</button>
          </div>
        </div>
        <div v-if="!selectedPageId" class="empty">Select a page to view contacts.</div>
        <div v-else-if="contacts.length === 0" class="empty">No contacts yet.</div>
        <ul v-else class="list">
          <li v-for="contact in contacts" :key="contact.id" class="list-item">
            <div>
              <div class="title">{{ contact.name || contact.facebook_user_id }}</div>
              <div class="subtitle">{{ contact.email || 'No email' }}</div>
              <div class="meta">Last interaction: {{ formatDate(contact.last_interaction) || 'N/A' }}</div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Connect Account -->
      <section class="card">
        <div class="card-header">
          <h3>Connect Facebook Account</h3>
          <div class="card-actions">
            <button class="btn link" @click="loadAccounts" :disabled="fb.loading">Refresh</button>
          </div>
        </div>
        <div class="card-body form-row">
          <input v-model="accessTokenInput" type="text" placeholder="Enter Facebook access token" />
          <button class="btn" @click="connectAccount" :disabled="fb.loading">Connect</button>
        </div>
        <div v-if="accounts.length" class="list accounts">
          <div class="list-item" v-for="acc in accounts" :key="acc.id">
            <div>
              <div class="title">{{ acc.name || 'Account' }}</div>
              <div class="subtitle">{{ acc.email || acc.facebook_user_id }}</div>
              <div class="meta">Status: {{ acc.status || 'unknown' }}</div>
            </div>
            <div class="item-actions">
              <button class="btn link" @click="syncPages(acc.id)" :disabled="fb.loading">Sync pages</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Automations -->
      <section class="card automations">
        <div class="card-header">
          <h3>Automations</h3>
          <div class="card-actions">
            <button class="btn link" @click="loadAutomations" :disabled="!selectedPageId || fbAuto.loading">Refresh</button>
          </div>
        </div>
        <div v-if="!selectedPageId" class="empty">Select a page to manage automations.</div>
        <div v-else class="auto-grid">
          <div class="auto-form">
            <h4>Create Automation</h4>
            <div class="form-row">
              <input v-model="newAutomation.name" placeholder="Name" />
              <select v-model="newAutomation.type">
                <option value="comment_to_message">Comment to message</option>
                <option value="away_message">Away message</option>
                <option value="unanswered_alert">Identify unanswered</option>
                <option value="custom_keyword">Custom keywords</option>
                <option value="contact_info">Contact info</option>
              </select>
              <label class="checkbox">
                <input type="checkbox" v-model="newAutomation.is_active" /> Active
              </label>
            </div>
            <div class="form-row">
              <textarea v-model="newAutomation.config.message" rows="2" placeholder="Message (for reply/away/contact info/keywords)"></textarea>
            </div>
            <div class="form-row" v-if="newAutomation.type === 'unanswered_alert'">
              <label>Hours threshold</label>
              <input type="number" v-model.number="newAutomation.config.hours_threshold" min="1" />
            </div>
            <button class="btn" @click="createAutomation" :disabled="fbAuto.loading">Create</button>
          </div>

          <div class="auto-list">
            <div v-if="automations.length === 0" class="empty">No automations yet.</div>
            <div v-for="auto in automations" :key="auto.id" class="auto-item">
              <div class="auto-head">
                <div>
                  <div class="title">{{ auto.name }}</div>
                  <div class="subtitle">Type: {{ auto.type }}</div>
                </div>
                <div class="item-actions">
                  <label class="checkbox">
                    <input type="checkbox" :checked="auto.is_active" @change="toggleAutomation(auto)" /> Active
                  </label>
                  <button class="btn link danger" @click="removeAutomation(auto.id)">Delete</button>
                </div>
              </div>
              <!-- Keywords for custom_keyword -->
              <div v-if="auto.type === 'custom_keyword'" class="keyword-block">
                <div class="form-row">
                  <input v-model="newKeyword.keyword" placeholder="Keyword" />
                  <select v-model="newKeyword.match_type">
                    <option value="exact">exact</option>
                    <option value="contains">contains</option>
                    <option value="starts_with">starts_with</option>
                    <option value="ends_with">ends_with</option>
                    <option value="regex">regex</option>
                  </select>
                  <input v-model="newKeyword.response_message" placeholder="Response message" />
                  <button class="btn link" @click="addKeyword(auto.id)" :disabled="fbAuto.loading">Add keyword</button>
                </div>
                <ul class="keyword-list" v-if="auto.keywords?.length">
                  <li v-for="kw in auto.keywords" :key="kw.id">
                    <strong>{{ kw.keyword }}</strong> ({{ kw.match_type }}) - {{ kw.response_message }}
                  </li>
                </ul>
              </div>
              <div class="config-block" v-else>
                <div>Message: {{ auto.config?.message || 'N/A' }}</div>
                <div v-if="auto.type === 'unanswered_alert'">Hours threshold: {{ auto.config?.hours_threshold || 24 }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFacebook } from '@/composables/useFacebook';
import { useNotifications } from '@/composables/useNotifications';
import { useFacebookAutomations } from '@/composables/useFacebookAutomations';

const fb = useFacebook();
const fbAuto = useFacebookAutomations();
const { handleApiError, addInfo } = useNotifications();

const pages = ref([]);
const selectedPageId = ref(null);
const conversations = ref([]);
const selectedConversationId = ref(null);
const messages = ref([]);
const contacts = ref([]);
const newMessage = ref('');
const accessTokenInput = ref('');
const automations = ref([]);
const newAutomation = ref({
  name: '',
  type: 'comment_to_message',
  is_active: true,
  config: {
    message: '',
    hours_threshold: 24,
    keywords: []
  }
});
const newKeyword = ref({ keyword: '', match_type: 'contains', response_message: '', is_active: true });
const unansweredHours = ref(24);
const accounts = ref([]);

async function loadPages() {
  try {
    const res = await fb.getPages();
    pages.value = res?.pages || res?.data?.pages || res?.data || [];
    if (pages.value.length) {
      if (!selectedPageId.value) selectedPageId.value = pages.value[0].id;
      await loadConversations();
      await loadContacts();
      await loadAutomations();
    }
  } catch (err) {
    handleApiError(err, 'Load Pages');
  }
}

async function syncPage(pageId) {
  if (!pageId) return;
  try {
    // full sync for the page
    await fb.fullSync(pageId);
    addInfo('Page synced');
    await loadConversations();
    await loadContacts();
  } catch (err) {
    handleApiError(err, 'Sync Page');
  }
}

function selectPage(id) {
  selectedPageId.value = id;
  conversations.value = [];
  messages.value = [];
  contacts.value = [];
  automations.value = [];
  selectedConversationId.value = null;
  loadConversations();
  loadContacts();
  loadAutomations();
}

async function loadConversations() {
  if (!selectedPageId.value) return;
  try {
    const res = await fb.getConversations(selectedPageId.value);
    conversations.value = res?.conversations || res?.data?.conversations || res?.data || [];
  } catch (err) {
    handleApiError(err, 'Load Conversations');
  }
}

async function loadUnanswered() {
  if (!selectedPageId.value) return;
  try {
    const res = await fb.getUnanswered(selectedPageId.value);
    conversations.value = res?.conversations || res?.data?.conversations || res?.data || [];
  } catch (err) {
    handleApiError(err, 'Load Unanswered');
  }
}

async function syncConversations() {
  if (!selectedPageId.value) return;
  try {
    await fb.syncConversations(selectedPageId.value);
    await loadConversations();
    addInfo('Conversations synced');
  } catch (err) {
    handleApiError(err, 'Sync Conversations');
  }
}

function selectConversation(id) {
  selectedConversationId.value = id;
  messages.value = [];
  loadMessages();
}

async function loadMessages() {
  if (!selectedConversationId.value) return;
  try {
    const res = await fb.getMessages(selectedConversationId.value);
    messages.value = res?.messages || res?.data?.messages || res?.data || [];
  } catch (err) {
    handleApiError(err, 'Load Messages');
  }
}

async function syncMessages(convId) {
  if (!convId) return;
  try {
    await fb.syncMessages(convId);
    await loadMessages();
    addInfo('Messages synced');
  } catch (err) {
    handleApiError(err, 'Sync Messages');
  }
}

async function loadContacts() {
  if (!selectedPageId.value) return;
  try {
    const res = await fb.getContacts(selectedPageId.value);
    contacts.value = res?.contacts || res?.data?.contacts || res?.data || [];
  } catch (err) {
    handleApiError(err, 'Load Contacts');
  }
}

async function runFullSync() {
  if (!selectedPageId.value) return;
  try {
    await fb.fullSync(selectedPageId.value);
    addInfo('Full sync completed');
    await loadConversations();
    await loadContacts();
  } catch (err) {
    handleApiError(err, 'Full Sync');
  }
}

async function sendNewMessage() {
  if (!newMessage.value || !selectedPageId.value || !selectedConversationId.value) return;
  try {
    const conv = conversations.value.find((c) => c.id === selectedConversationId.value);
    const recipientId = conv?.participant_id;
    if (!recipientId) {
      addInfo('Recipient not available for this conversation');
      return;
    }
    await fb.sendMessage(selectedPageId.value, {
      recipient_id: recipientId,
      message: newMessage.value,
    });
    newMessage.value = '';
    await loadMessages();
    addInfo('Message sent');
  } catch (err) {
    handleApiError(err, 'Send Message');
  }
}

async function connectAccount() {
  if (!accessTokenInput.value) return;
  try {
    await fb.connectAccount(accessTokenInput.value);
    addInfo('Facebook account connected');
    accessTokenInput.value = '';
    await loadPages();
  } catch (err) {
    handleApiError(err, 'Connect Facebook');
  }
}

async function loadAutomations() {
  if (!selectedPageId.value) return;
  try {
    const res = await fbAuto.getAutomations(selectedPageId.value);
    automations.value = res?.automations || res?.data?.automations || res?.data || [];
  } catch (err) {
    handleApiError(err, 'Load Automations');
  }
}

async function createAutomation() {
  if (!selectedPageId.value || !newAutomation.value.name) return;
  try {
    const payload = { ...newAutomation.value };
    await fbAuto.createAutomation(selectedPageId.value, payload);
    addInfo('Automation created');
    newAutomation.value = { name: '', type: 'comment_to_message', is_active: true, config: { message: '', hours_threshold: 24, keywords: [] } };
    await loadAutomations();
  } catch (err) {
    handleApiError(err, 'Create Automation');
  }
}

async function toggleAutomation(automation) {
  try {
    await fbAuto.updateAutomation(automation.id, { is_active: !automation.is_active });
    automation.is_active = !automation.is_active;
    addInfo('Automation updated');
  } catch (err) {
    handleApiError(err, 'Update Automation');
  }
}

async function removeAutomation(id) {
  try {
    await fbAuto.deleteAutomation(id);
    automations.value = automations.value.filter(a => a.id !== id);
    addInfo('Automation deleted');
  } catch (err) {
    handleApiError(err, 'Delete Automation');
  }
}

async function addKeyword(automationId) {
  if (!newKeyword.value.keyword || !newKeyword.value.response_message) return;
  try {
    await fbAuto.createKeyword(automationId, { ...newKeyword.value });
    addInfo('Keyword added');
    newKeyword.value = { keyword: '', match_type: 'contains', response_message: '', is_active: true };
    await loadAutomations();
  } catch (err) {
    handleApiError(err, 'Add Keyword');
  }
}

async function refreshUnanswered(hours = 24) {
  if (!selectedPageId.value) return;
  try {
    const res = await fbAuto.checkUnanswered(selectedPageId.value, hours);
    conversations.value = res?.conversations || res?.data?.conversations || res?.data || [];
    addInfo('Unanswered check completed');
  } catch (err) {
    handleApiError(err, 'Check Unanswered');
  }
}

async function loadAccounts() {
  try {
    const res = await fb.getAccounts();
    accounts.value = res?.accounts || res?.data?.accounts || res?.data || [];
  } catch (err) {
    handleApiError(err, 'Load Accounts');
  }
}

onMounted(() => {
  loadAccounts();
  loadPages();
});
</script>

<style scoped>
.facebook-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.list {
  list-style: none;
  padding: 0.5rem 1rem 1rem 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.list-item.active {
  border-color: #6366f1;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.15);
}

.title {
  font-weight: 600;
}

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}

.meta {
  margin-top: 0.25rem;
  display: flex;
  gap: 1rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty {
  padding: 1rem;
  color: #6b7280;
  text-align: center;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  background: #4f46e5;
  color: white;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #4338ca;
}

.btn.secondary {
  background: #0ea5e9;
}

.btn.secondary:hover {
  background: #0284c7;
}

.btn.link {
  background: transparent;
  color: #4f46e5;
  padding: 0.25rem 0.5rem;
}

.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.messages {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.message-list {
  list-style: none;
  padding: 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 320px;
  overflow-y: auto;
}

.message {
  padding: 0.75rem;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.message.fromPage {
  background: #eef2ff;
  border-color: #c7d2fe;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
}

.message-body {
  color: #0f172a;
  white-space: pre-wrap;
}

.send-box {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
}

.send-box input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  outline: none;
}

.send-box input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.send-box button {
  min-width: 90px;
}

.card-body.form-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem 1rem;
}

.card-body.form-row input {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.automations {
  grid-column: 1 / -1;
}

.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.auto-form {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auto-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auto-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auto-head {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.keyword-block {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
}

.keyword-list {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.config-block {
  color: #6b7280;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.btn.danger {
  color: #ef4444;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.hours-input {
  width: 70px;
  padding: 0.35rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.accounts {
  padding: 0 1rem 1rem;
}

.accounts .list-item {
  align-items: center;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

