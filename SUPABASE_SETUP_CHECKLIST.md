# ✅ Supabase Setup Checklist - Project: swuowhorzbcjwlmxaybn

## 🎯 Checklist Nhanh (5 phút)

### Bước 1: Lấy API Keys ✅
- [ ] Mở https://app.supabase.com/project/swuowhorzbcjwlmxaybn/settings/api
- [ ] Copy **anon public** key (bắt đầu bằng `eyJhbG...`)
- [ ] Paste vào `.env.local`:
  ```env
  VITE_SUPABASE_ANON_KEY=eyJhbG...
  ```

### Bước 2: Chạy SQL Migration ⚠️
- [ ] Mở https://app.supabase.com/project/swuowhorzbcjwlmxaybn/sql
- [ ] Click **New query**
- [ ] Copy toàn bộ nội dung file `supabase/migrations/001_initial_schema.sql`
- [ ] Paste vào SQL Editor
- [ ] Click **Run** (Ctrl+Enter)
- [ ] Kiểm tra kết quả: "Success. No rows returned"

### Bước 3: Kiểm Tra Tables ✅
- [ ] Mở https://app.supabase.com/project/swuowhorzbcjwlmxaybn/editor
- [ ] Kiểm tra có các tables:
  - ✅ profiles
  - ✅ conversations
  - ✅ messages
  - ✅ projects

### Bước 4: Test Local Dev 💻
```bash
# Install dependencies (nếu chưa)
pnpm install

# Start dev server
pnpm run dev
```

- [ ] Mở http://localhost:5173
- [ ] Vào Settings → Connections
- [ ] Connect Supabase với access token

### Bước 5: Deploy Lên Cloudflare 🚀

**Option A: Cloudflare Dashboard**
- [ ] https://dash.cloudflare.com/sign-up/pages
- [ ] Connect GitHub repository Nilai
- [ ] Build command: `pnpm run build`
- [ ] Output: `build/client`
- [ ] Thêm environment variables:
  ```
  VITE_SUPABASE_URL=https://swuowhorzbcjwlmxaybn.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

**Option B: GitHub Actions**
- [ ] Setup secrets trong GitHub Settings
- [ ] Push lên branch `stable`
- [ ] Tự động deploy!

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://app.supabase.com/project/swuowhorzbcjwlmxaybn |
| SQL Editor | https://app.supabase.com/project/swuowhorzbcjwlmxaybn/sql |
| Table Editor | https://app.supabase.com/project/swuowhorzbcjwlmxaybn/editor |
| API Settings | https://app.supabase.com/project/swuowhorzbcjwlmxaybn/settings/api |
| Auth Policies | https://app.supabase.com/project/swuowhorzbcjwlmxaybn/auth/policies |

---

## 📝 Environment Variables

**.env.local** (local development):
```env
VITE_SUPABASE_URL=https://swuowhorzbcjwlmxaybn.supabase.co
VITE_SUPABASE_ANON_KEY=<paste-your-anon-key-here>
```

**Cloudflare Pages** (production):
```
VITE_SUPABASE_URL=https://swuowhorzbcjwlmxaybn.supabase.co
VITE_SUPABASE_ANON_KEY=<paste-your-anon-key-here>
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🆘 Troubleshooting

### "Invalid API key"
→ Check lại anon key từ Supabase dashboard

### "Table does not exist"
→ Chạy SQL migration script

### "Permission denied"
→ Check RLS policies trong Auth → Policies

### Build failed
→ `pnpm run build` locally first

---

## 📞 Need Help?

- Docs: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md)
- Deploy: [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)
- Quick: [DEPLOY_QUICK.md](./DEPLOY_QUICK.md)

---

**Status:** 🟡 Pending - Need to complete steps above
