const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Chat endpoint - proxies to Gemini and Groq
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model = 'gemini' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let reply;

    if (model === 'gemini') {
      reply = await callGemini(message);
    } else if (model === 'groq') {
      reply = await callGroq(message);
    } else {
      return res.status(400).json({ error: 'Invalid model. Use gemini or groq' });
    }

    res.json({
      reply,
      model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to get AI response', details: error.message });
  }
});

// Gemini API proxy
async function callGemini(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  // FIX: gemini-2.0-flash does not exist on this key's project (confirmed via
  // GET /v1beta/models) and returned a 404. gemini-2.5-flash is the current
  // stable flash model.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await axios.post(url, {
    contents: [{ parts: [{ text: message }] }]
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
}

// Groq API proxy (OpenAI-compatible chat completions endpoint)
async function callGroq(message) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: message }]
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  return response.data.choices?.[0]?.message?.content || 'No response from Groq';
}

app.listen(PORT, () => {
  console.log(`🚀 Aeterna Backend running on http://localhost:${PORT}`);
  console.log('📡 Endpoints:');
  console.log('   POST /api/chat       - AI chat (body: { message, model })');
  console.log('   POST /api/recommend  - Watch recommendation');
  console.log('   GET  /api/health     - Health check');
});
