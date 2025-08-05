# TriggerLines

Transform any word into raw, unstoppable motivation.

## What It Does

TriggerLines generates powerful, uppercase motivational messages in the style of intense speeches and manifestos. Every word in each message becomes a hyperlink - click any word to generate a new motivational message incorporating that word as the central theme.

## Features

- **Single Page Application** - Instant loading, no navigation
- **Word-Triggered Generation** - Click any word to generate new content around it
- **Raw, Intense Style** - Uppercase, punchy lines like battle cries and manifestos
- **Dual AI Support** - Works with both Google Gemini and OpenAI GPT
- **Backend API** - Secure server-side API key management
- **Minimalist Design** - Clean, distraction-free interface

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Keys**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API key(s)
   ```

3. **Add Your API Keys to `.env`**
   ```env
   # Get from: https://makersuite.google.com/app/apikey
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # OR get from: https://platform.openai.com/api-keys  
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Choose default provider
   DEFAULT_PROVIDER=gemini
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Open Your Browser**
   - Go to `http://localhost:3000`
   - Start clicking words and get motivated! 🔥

## How It Works

1. **Backend Server**: Handles API calls securely with your configured keys
2. **Frontend**: Clean interface that sends trigger words to backend
3. **AI Generation**: Server calls Gemini/OpenAI with your motivational prompt template
4. **Word Triggers**: Every word becomes clickable to generate new focused content
5. **Infinite Chain**: Keep clicking words to explore endless motivational content

## API Endpoints

- `GET /` - Serves the frontend application
- `POST /api/generate` - Generate motivational message
  ```json
  {
    "triggerWord": "POWER",
    "provider": "gemini" // optional
  }
  ```
- `GET /api/health` - Check server and provider status

## Style

Messages are generated in the style of:
- Intense locker room speeches
- Personal manifestos  
- Battle cries and rally calls
- Raw, emotional motivation
- Short, punchy lines with powerful rhythm

All content is:
- ✅ UPPERCASE for maximum impact
- ✅ Broken into short, rhythmic lines
- ✅ Emotionally charged and inspiring
- ✅ Free of hashtags, emojis, or signatures
- ✅ Focused on the triggered word

## Development

```bash
# Install dependencies
npm install

# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Deployment

### Environment Variables
Set these in your deployment platform:
- `GEMINI_API_KEY` - Your Google Gemini API key
- `OPENAI_API_KEY` - Your OpenAI API key (alternative)
- `DEFAULT_PROVIDER` - Either "gemini" or "openai"
- `PORT` - Server port (defaults to 3000)

### Platforms
- **Vercel**: Deploy directly from GitHub
- **Heroku**: `git push heroku main`
- **Railway**: Connect your repo
- **DigitalOcean App Platform**: One-click deploy

## Security

- ✅ API keys stored server-side only
- ✅ CORS configured for security
- ✅ No client-side API key exposure
- ✅ Environment variable configuration

## Keyboard Shortcuts

- **R** - Generate new random message
- Standard browser shortcuts work

---

*Ready to unleash your potential? Every word is a trigger waiting to ignite your fire.*