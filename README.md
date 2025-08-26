# Bappa AI - Spiritual AI Assistant 🕉️

A fully functional AI-powered spiritual guidance application built with React, TypeScript, and Groq AI. Bappa AI provides wisdom, spiritual insights, and life guidance inspired by Lord Ganesha.

## ✨ Features

- **🤖 AI-Powered Responses**: Powered by Groq's Llama3-8b model for intelligent spiritual guidance
- **💬 Real-time Chat**: Interactive chat interface with typing indicators and smooth animations
- **🔐 User Authentication**: Secure user management with Supabase
- **💾 Local Storage**: Chat history stored locally in browser for privacy and offline access
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🌐 Offline Support**: Graceful fallback when offline
- **⚡ Rate Limiting**: Daily message limits to manage API usage
- **🎨 Beautiful Animations**: Smooth transitions and micro-interactions with Framer Motion

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project (for authentication only)
- Groq API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd bappa-ai
npm install
```

### 2. Environment Setup

Copy the environment file and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation

### Backend Services
- **Supabase** for authentication only
- **Groq AI** for AI responses
- **Local Storage** for chat history and sessions

### Key Components
- `ChatContext`: Manages chat state and AI interactions
- `GroqService`: Handles AI API calls
- `ChatService`: Manages local storage for messages and sessions
- `AuthContext`: Handles user authentication

## 🔧 Configuration

### Groq AI Models
The app is configured to use `llama3-8b-8192` by default. You can modify this in `backend/server.js`.

### Daily Message Limits
Default limit is 5 messages per day. Adjust this in `backend/server.js`.

### System Prompt
Customize Bappa's personality and responses in `backend/server.js`.

### Local Storage
Chat history is automatically stored in the browser's local storage:
- **Sessions**: `bappa_chat_sessions_{userId}`
- **Messages**: `bappa_messages_{sessionId}`
- **Daily Counts**: `bappa_daily_messages_{userId}_{date}`

## 📱 Usage

1. **Sign In**: Use Google authentication to create an account
2. **Start Chatting**: Ask Bappa anything about life, spirituality, or seek guidance
3. **Daily Limits**: You have 5 messages per day to maintain quality interactions
4. **Chat History**: Your conversations are automatically saved locally and restored

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set environment variables in the deployment platform
3. Deploy!

### Environment Variables for Production

Ensure these are set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GROQ_API_KEY`

## 🔒 Security Features

- **Local Storage**: Chat data stays on user's device for privacy
- **User Authentication**: Secure login via Supabase
- **API key protection**: Environment variables for sensitive data
- **Input validation**: Sanitized user inputs

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run type checking
npm run type-check
```

## 📊 Monitoring

- **API Usage**: Track Groq API usage in your Groq dashboard
- **Local Storage**: Monitor browser storage usage
- **Error Logging**: Check browser console for client-side errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Groq AI** for providing the AI capabilities
- **Supabase** for the authentication infrastructure
- **Lord Ganesha** for spiritual inspiration

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your environment variables are set correctly
3. Check your Groq API key and quota
4. Clear browser local storage if needed

## 🔮 Future Enhancements

- [ ] Voice chat capabilities
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Custom AI model fine-tuning
- [ ] Community features
- [ ] Meditation timer integration
- [ ] Export chat history
- [ ] Cloud backup options

---

**Om Gan Ganpataye Namo Namah** 🙏

May Bappa's wisdom guide you on your spiritual journey.
