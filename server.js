const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuration
const CONFIG = {
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions'
    },
    defaultProvider: process.env.DEFAULT_PROVIDER || 'gemini'
};

// Validate configuration on startup
function validateConfig() {
    const hasGemini = !!CONFIG.gemini.apiKey;
    const hasOpenAI = !!CONFIG.openai.apiKey;
    
    if (!hasGemini && !hasOpenAI) {
        console.error('❌ ERROR: No API keys configured!');
        console.error('Please set GEMINI_API_KEY or OPENAI_API_KEY in your .env file');
        process.exit(1);
    }
    
    console.log('✅ API Configuration:');
    console.log(`   Gemini: ${hasGemini ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`   OpenAI: ${hasOpenAI ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`   Default Provider: ${CONFIG.defaultProvider}`);
}

// Build motivational prompt
function buildPrompt(triggerWord) {
    return `Write a long motivational message in uppercase. Use short, punchy lines like a speech or spoken word poetry. Break it into multiple lines and paragraphs. The tone should be bold, emotional, and raw — like it's meant to fire someone up.

Include the word: "${triggerWord}" meaningfully and powerfully in the message. Avoid rhyming. Do not use hashtags, emojis, or any signature.

Format only as plain text in uppercase.

Make it intense, passionate, and inspiring - like a manifesto or battle cry. Use line breaks to create rhythm and impact.`;
}

// Call Gemini API
async function callGemini(triggerWord) {
    if (!CONFIG.gemini.apiKey) {
        throw new Error('Gemini API key not configured');
    }

    const prompt = buildPrompt(triggerWord);
    const url = `${CONFIG.gemini.endpoint}?key=${CONFIG.gemini.apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
}

// Call OpenAI API
async function callOpenAI(triggerWord) {
    if (!CONFIG.openai.apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const prompt = buildPrompt(triggerWord);
    
    const response = await fetch(CONFIG.openai.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.openai.apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a motivational writer. Your writing style is intense, poetic, raw, and inspiring — like a locker room speech or manifesto.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.9,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
    }

    return data.choices[0].message.content;
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Generate motivational message
app.post('/api/generate', async (req, res) => {
    try {
        const { triggerWord, provider } = req.body;
        
        if (!triggerWord) {
            return res.status(400).json({ 
                error: 'Missing triggerWord in request body' 
            });
        }

        // Determine which provider to use
        const useProvider = provider || CONFIG.defaultProvider;
        
        console.log(`🔥 Generating message for "${triggerWord}" using ${useProvider}`);
        
        let message;
        if (useProvider === 'gemini' && CONFIG.gemini.apiKey) {
            message = await callGemini(triggerWord);
        } else if (useProvider === 'openai' && CONFIG.openai.apiKey) {
            message = await callOpenAI(triggerWord);
        } else {
            // Fallback to available provider
            if (CONFIG.gemini.apiKey) {
                message = await callGemini(triggerWord);
            } else if (CONFIG.openai.apiKey) {
                message = await callOpenAI(triggerWord);
            } else {
                throw new Error('No API providers available');
            }
        }

        res.json({ 
            message,
            triggerWord,
            provider: useProvider
        });

    } catch (error) {
        console.error('❌ Error generating message:', error.message);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        providers: {
            gemini: !!CONFIG.gemini.apiKey,
            openai: !!CONFIG.openai.apiKey
        },
        defaultProvider: CONFIG.defaultProvider
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
validateConfig();

app.listen(PORT, () => {
    console.log('🚀 TriggerLines Backend Server Started!');
    console.log(`   📍 Server: http://localhost:${PORT}`);
    console.log(`   🔥 Ready to generate motivational messages!`);
    console.log('');
    console.log('API Endpoints:');
    console.log(`   POST /api/generate - Generate motivational message`);
    console.log(`   GET  /api/health   - Check server status`);
});

module.exports = app;