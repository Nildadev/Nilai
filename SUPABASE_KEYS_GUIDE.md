# 🔑 Hướng Dẫn Lấy Supabase API Keys

## Bước 1: Truy cập Supabase Dashboard

1. Mở https://app.supabase.com
2. Đăng nhập vào tài khoản
3. Chọn project: **swuowhorzbcjwlmxaybn**

## Bước 2: Lấy API Keys

1. Click **Settings** (biểu tượng bánh răng dưới cùng sidebar)
2. Chọn **API**
3. Bạn sẽ thấy 2 keys quan trọng:

### ✅ Project URL
```
https://swuowhorzbcjwlmxaybn.supabase.co
```

### ✅ Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dW93aG9yemJjandtbHhheWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxODc2NzMsImV4cCI6MjA1NDc2MzY3M30.6X8G7N9K5J8L4M3P2Q1R0S9T8U7V6W5X4Y3Z2A1B0C
```

**Lưu ý quan trọng:**
- ✅ **Anon Key** (public) - Dùng cho client-side (VITE_SUPABASE_ANON_KEY)
- 🔒 **Service Role Key** (secret) - Chỉ dùng server-side, KHÔNG commit lên Git!

## Bước 3: Cấu hình .env.local

Copy và paste vào file `.env.local`:

```env
VITE_SUPABASE_URL=https://swuowhorzbcjwlmxaybn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dW93aG9yemJjandtbHhheWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxODc2NzMsImV4cCI6MjA1NDc2MzY3M30.6X8G7N9K5J8L4M3P2Q1R0S9T8U7V6W5X4Y3Z2A1B0C
```

## Bước 4: Chạy SQL Migration

**Quan trọng:** Chạy script SQL để tạo database schema!

1. Trong Supabase dashboard, chọn **SQL Editor**
2. Click **New query**
3. Copy nội dung file `supabase/migrations/001_initial_schema.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)

## Bước 5: Kiểm tra

1. Vào **Table Editor** để xem tables đã tạo:
   - ✅ profiles
   - ✅ conversations
   - ✅ messages
   - ✅ projects

2. Vào **Authentication** → **Policies** để kiểm tra RLS

## Bước 6: Test trong bolt.diy

```bash
# Start dev server
pnpm run dev

# Mở browser tại http://localhost:5173
# Vào Settings → Connections → Supabase
# Connect với Access Token từ: https://app.supabase.com/account/tokens
```

---

## 🆘 Troubleshooting

### Lỗi: "Invalid API key"
- Kiểm tra lại key trong Supabase dashboard
- Đảm bảo không copy thừa khoảng trắng

### Lỗi: "Table does not exist"
- Chạy SQL migration script
- Kiểm tra trong Table Editor

### Lỗi: "Permission denied"
- Kiểm tra RLS policies đã enable
- Đảm bảo user đã authenticated

---

**Cần trợ giúp?** Đọc [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md)
