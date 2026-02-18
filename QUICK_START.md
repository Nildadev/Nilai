# Supabase Integration - Quick Start Guide

## 🚀 Cài Đặt Nhanh (5 phút)

### 1. Cài đặt package
```bash
pnpm add @supabase/supabase-js
```

### 2. Tạo Supabase Project
1. Truy cập https://supabase.com
2. Đăng ký/Đăng nhập
3. Click "New Project"
4. Điền thông tin và tạo project

### 3. Lấy API Keys
1. Vào **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon key**: `eyJhbG...`

### 4. Cấu hình .env.local
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Chạy SQL Migration
1. Vào **SQL Editor** trong Supabase dashboard
2. Chạy script từ file: `supabase/migrations/001_initial_schema.sql`

### 6. Kết nối trong UI
1. Chạy `pnpm run dev`
2. Mở **Settings** → **Connections**
3. Nhập Supabase Access Token (lấy từ https://app.supabase.com/account/tokens)
4. Click **Connect**
5. Chọn project

---

## 📁 Files Đã Tạo

```
Nilai/
├── app/
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client
│   │       ├── service.ts      # Service layer
│   │       ├── hooks.ts        # React hooks
│   │       └── index.ts        # Exports
│   ├── types/
│   │   └── supabase.ts         # TypeScript types
│   └── components/
│       └── @settings/
│           └── tabs/
│               └── connections/
│                   └── SupabaseConnection.tsx  # UI component
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── SUPABASE_SETUP.md           # English docs
├── HUONG_DAN_SU_DUNG.md        # Vietnamese docs
└── QUICK_START.md              # This file
```

---

## 💡 Sử Dụng Cơ Bản

### Lưu chat history
```typescript
import { useSupabaseChat } from '~/lib/supabase/hooks';

const { saveMessage, createConversation } = useSupabaseChat({ userId: 'user-123' });

await createConversation('My Chat');
await saveMessage('user', 'Hello!');
await saveMessage('assistant', 'Hi there!');
```

### Load conversations
```typescript
const { conversations, loadConversation } = useSupabaseChat();

// Display list
{conversations.map(conv => (
  <div key={conv.id} onClick={() => loadConversation(conv.id)}>
    {conv.title}
  </div>
))}
```

### Quản lý projects
```typescript
import { useSupabaseProjects } from '~/lib/supabase/hooks';

const { createProject, projects } = useSupabaseProjects({ userId: 'user-123' });

await createProject('My App', 'Description', files);
```

---

## 🔗 Links Hữu Ích

- **Full Documentation**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Vietnamese Guide**: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md)
- **Supabase Docs**: https://supabase.com/docs
- **Community**: https://thinktank.ottomator.ai

---

## ✅ Checklist

- [ ] Cài đặt `@supabase/supabase-js`
- [ ] Tạo Supabase project
- [ ] Lấy API keys
- [ ] Cập nhật `.env.local`
- [ ] Chạy SQL migration
- [ ] Kết nối trong Settings
- [ ] Test lưu conversation
- [ ] Test tạo project

---

## 🆘 Troubleshooting

**Không connect được?**
- Kiểm tra token: https://app.supabase.com/account/tokens
- Tạo token mới và thử lại

**Lỗi permission?**
- Chạy lại SQL migration script
- Kiểm tra RLS policies trong Supabase dashboard

**Không thấy data?**
- Mở browser console xem lỗi
- Kiểm tra Supabase Table Editor

---

**Cần trợ giúp?** Đọc [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) để biết chi tiết!
