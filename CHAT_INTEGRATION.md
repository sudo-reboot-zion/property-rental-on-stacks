# Frontend RAG Integration - Quick Start

## ✅ What Was Built

### API Service Layer
- `src/lib/api/chat.ts` - TypeScript API client for RAG backend

### Custom Hook
- `src/hooks/use-chat.ts` - React hook for chat state management

### UI Components
- `src/components/ChatInterface.tsx` - Main chat UI
- `src/components/ChatMessage.tsx` - Individual messages
- `src/components/PropertyChatCard.tsx` - Property cards in chat
- `src/components/AIChatButton.tsx` - Updated with dialog integration

---

## 🚀 Testing the Integration

### 1. Ensure Backend is Running

```bash
cd backend
# Make sure both indexes are created
curl -X POST http://localhost:8000/api/index
curl -X POST http://localhost:8000/api/index/knowledge
```

### 2. Set Environment Variable

Add to `frontend/.env`:
```bash
VITE_BACKEND_URL=http://localhost:8000
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Test the Chat

1. **Open the app** in your browser
2. **Click the AI chat button** (bottom right - animated bot icon)
3. **Try these queries:**

**Knowledge Question:**
```
What is StackNStay?
```
Expected: AI explains StackNStay, no property cards

**Property Search:**
```
Find me a 2-bedroom apartment
```
Expected: AI shows property cards

**Mixed Query:**
```
What is StackNStay and show me properties in Stockholm
```
Expected: Both explanation AND property cards

**Conversation Memory:**
```
Show me the cheapest one
```
Expected: AI remembers previous properties

---

## 🎨 Features

✅ **Smart Routing** - Auto-detects query type  
✅ **Property Cards** - Pop up in chat with images  
✅ **Knowledge Snippets** - FAQ answers displayed  
✅ **Suggested Actions** - Click to send  
✅ **Conversation Memory** - Remembers context  
✅ **Loading States** - Typing indicator  
✅ **Error Handling** - Graceful failures  
✅ **Responsive Design** - Works on mobile  

---

## 🐛 Troubleshooting

**Chat button doesn't open:**
- Check browser console for errors
- Ensure shadcn/ui Dialog component is installed

**"Failed to send message":**
- Check backend is running: `curl http://localhost:8000/health`
- Verify `VITE_BACKEND_URL` in `.env`
- Check browser console for CORS errors

**No properties shown:**
- Run `POST /api/index` to index properties
- Check backend logs for errors

**No knowledge answers:**
- Run `POST /api/index/knowledge` to index FAQ
- Check `backend/app/knowledge_base.md` exists

---

## 📝 Next Steps

- [ ] Test all query types
- [ ] Test on mobile devices
- [ ] Add localStorage for conversation persistence (optional)
- [ ] Add voice input (optional)
- [ ] Add property booking from chat (optional)
