# 🔍 Debug Supabase Chat Save

## 📋 Test Steps

### Bước 1: Pull Code Mới

```bash
cd /home/userland/Nilai
git pull origin stable
pnpm install
```

### Bước 2: Start Dev Server

```bash
pnpm run dev
```

### Bước 3: Mở Browser Console (F12)

Quan trọng! Phải mở Console để xem logs.

### Bước 4: Tạo Chat Mới

1. Mở http://localhost:5173
2. Gõ prompt: "Tạo app React đơn giản"
3. Đợi AI generate code
4. Quan sát Console

---

## 🔍 Logs Cần Kiểm Tra

### ✅ Nếu Hoạt Động Tốt:

```
[Supabase] Using credentials from import.meta.env
[Supabase] URL: https://swuowhorzbcjwlmxaybn.supabase.co
[Supabase] Key preview: eyJhbGciOiJIUzI1NiIs...
[Supabase Chat] Initialized for user: anon_1234567890_abc
[Supabase Chat] Service enabled: true
[Supabase Chat] Attempting to save messages: {conversationId: '...', messageCount: 2}
[Supabase Chat] Created conversation: abc-123-def
[Supabase Chat] Saving 2 messages to conversation abc-123-def
[Supabase Chat] Successfully saved 2/2 messages
```

### ❌ Nếu Có Lỗi:

**"Environment variables not found!"**
```
[Supabase] Environment variables not found!
[Supabase] VITE_SUPABASE_URL: ❌
[Supabase] VITE_SUPABASE_ANON_KEY: ❌
```
→ Fix: Restart dev server, check `.env.local` exists

**"Service not enabled"**
```
[Supabase Chat] Service enabled: false
[Supabase Chat] Service not enabled - check credentials
```
→ Check Supabase dashboard, SQL migration đã chạy chưa

**"Failed to create conversation"**
```
[Supabase Chat] Failed to create conversation
```
→ Check browser console for error details

---

## 🧪 Test API Route

### Test Connection:

Mở browser console và chạy:

```javascript
const response = await fetch('/api/supabase/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'connection' })
});
const data = await response.json();
console.log(data);
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Connection successful",
  "data": []
}
```

### Test Insert:

```javascript
const response = await fetch('/api/supabase/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'insert' })
});
const data = await response.json();
console.log(data);
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Insert test successful",
  "data": { "id": "...", "user_id": "test_...", "title": "Test Conversation" }
}
```

---

## 🐛 Các Lỗi Thường Gặp

### 1. "Invalid API key"

**Triệu chứng:**
```
error: "Invalid API key"
```

**Nguyên nhân:**
- Anon key sai trong `.env.local`
- Key bị copy thiếu

**Fix:**
1. Mở Supabase dashboard
2. Settings → API
3. Copy lại anon key
4. Update `.env.local`
5. Restart dev server

### 2. "Table does not exist"

**Triệu chứng:**
```
error: "relation 'conversations' does not exist"
```

**Nguyên nhân:**
- SQL migration chưa chạy

**Fix:**
1. Mở https://app.supabase.com/project/swuowhorzbcjwlmxaybn/sql/new
2. Copy nội dung `supabase/migrations/001_initial_schema.sql`
3. Paste và Run
4. Check Table Editor thấy 4 tables

### 3. "Permission denied"

**Triệu chứng:**
```
error: "permission denied for table conversations"
```

**Nguyên nhân:**
- RLS policies chặn

**Fix:**
1. Check RLS policies trong Supabase
2. Đảm bảo policies cho authenticated users
3. Hoặc disable RLS tạm thời để test

### 4. Env Vars Not Found

**Triệu chứng:**
```
[Supabase] VITE_SUPABASE_URL: ❌
[Supabase] VITE_SUPABASE_ANON_KEY: ❌
```

**Fix:**
```bash
# Check file exists
ls -la .env.local

# Check content
cat .env.local | grep SUPABASE

# Restart server
Ctrl+C
pnpm run dev
```

---

## 📊 Check Supabase Dashboard

### 1. Check Conversations:

https://app.supabase.com/project/swuowhorzbcjwlmxaybn/editor

Click **conversations** table → Should see:
- ✅ Row với title của chat bạn tạo
- ✅ user_id: `anon_...`
- ✅ created_at: timestamp

### 2. Check Messages:

Click **messages** table → Should see:
- ✅ Rows với conversation_id
- ✅ role: 'user', 'assistant'
- ✅ content: nội dung chat

### 3. Check Logs:

https://app.supabase.com/project/swuowhorzbcjwlmxaybn/logs

Filter:
- Time range: Last 15 minutes
- Should see INSERT queries thành công

---

## ✅ Checklist Debug

- [ ] Pull code mới nhất
- [ ] Install dependencies
- [ ] Start dev server
- [ ] Mở browser Console (F12)
- [ ] Tạo chat mới
- [ ] Check logs trong Console
- [ ] Check Supabase Table Editor
- [ ] Chạy API test route
- [ ] Check Supabase Logs

---

## 🆘 Vẫn Không Hoạt Động?

### Gửi thông tin sau để được giúp:

1. **Console logs** (copy từ F12)
2. **Screenshot** Supabase Table Editor
3. **Kết quả** API test route
4. **Nội dung** `.env.local` (che key, chỉ để lại preview)

### Temporary Workaround:

Trong khi chờ fix, chat vẫn được lưu vào:
- ✅ IndexedDB (local browser)
- ✅ Không mất data khi refresh
- ⚠️ Chỉ không sync lên cloud Supabase

---

## 📞 Contact

Cần giúp? Tạo issue với logs ở trên:
https://github.com/Nildadev/Nilai/issues
