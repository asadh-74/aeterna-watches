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

// AI Chat endpoint - proxies to Gemini and Ollama
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model = 'gemini' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let reply;

    if (model === 'gemini') {
      reply = await callGemini(message);
    } else if (model === 'ollama') {
      reply = await callOllama(message);
    } else {
      return res.status(400).json({ error: 'Invalid model. Use gemini or ollama' });
    }

    res.json({ 
      reply, 
      model,
      timestamp: new Date().toISOString() 
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
});

// Gemini API proxy
async function callGemini(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await axios.post(url, {
    contents: [{
      parts: [{ text: message }]
    }]
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
}

// Ollama API proxy
async function callOllama(message) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const apiKey = process.env.OLLAMA_API_KEY;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await axios.post(`${baseUrl}/api/generate`, {
    model: process.env.OLLAMA_MODEL || 'llama3',
    prompt: message,
    stream: false
  }, { headers });

  return response.data.response || 'No response from Ollama';
}

// Watch recommendation endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const { style, budget, occasion } = req.body;

    const prompt = `You are a luxury watch concierge for Aeterna Watches (priced $70-$80). 
Recommend a watch from our collection based on:
- Style preference: ${style || 'any'}
- Budget: ${budget || '$70-$80'}
- Occasion: ${occasion || 'daily wear'}

Our collection:
1. Commander Two-Tone ($75) - Stainless steel with gold accents, day-date display
2. Roman Classic ($72) - Black leather strap, Roman numerals, formal style
3. Gold Minimalist ($78) - All-gold stainless steel, clean dial, bold
4. Silver Elegance ($70) - Two-tone silver and gold, date window, versatile
5. Sport Chrono ($76) - Chronograph, brown leather, sporty
6. Executive Silver ($74) - Multi-dial chronograph, black leather, executive
7. Deep Blue Diver ($80) - Navy blue dial, black PVD, adventurous
8. Midnight Chrono ($73) - Black dial with red accents, triple chronograph

Give a concise, elegant recommendation in 2-3 sentences. Contact: Aeternapk.gmail.com`;

    const reply = await callGemini(prompt);
    res.json({ recommendation: reply });

  } catch (error) {
    console.error('Recommend error:', error.message);
    res.status(500).json({ error: 'Recommendation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Aeterna Backend running on http://localhost:${PORT}`);
  console.log(`\n📡 Endpoints:`);
  console.log(`   POST /api/chat       - AI chat (body: { message, model })`);
  console.log(`   POST /api/recommend  - Watch recommendation`);
  console.log(`   GET  /api/health     - Health check\n`);
});
