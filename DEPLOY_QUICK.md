# 🚀 Quick Deploy Guide - Bolt.diy lên Cloudflare Pages

## 📋 3 Bước Deploy Nhanh

### Cách 1: Cloudflare Dashboard (Dễ nhất - 5 phút)

1. **Truy cập Cloudflare Pages**
   - https://dash.cloudflare.com/sign-up/pages
   - Đăng nhập / Đăng ký

2. **Connect GitHub**
   - Click "Connect to Git"
   - Chọn repository **Nilai**
   - Branch: `stable`

3. **Cấu hình Build**
   ```
   Framework preset: Remix
   Build command: pnpm run build
   Output directory: build/client
   ```

4. **Thêm Environment Variables**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ANTHROPIC_API_KEY=sk-ant-...
   ```

5. **Deploy!**
   - Click "Save and Deploy"
   - Đợi 5-10 phút
   - ✅ Live!

---

### Cách 2: GitHub Actions (Tự động - Khuyến nghị)

1. **Setup GitHub Secrets**

Vào Settings → Secrets and variables → Actions → Thêm:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-...
```

2. **Push code lên branch `stable`**
   ```bash
   git add .
   git commit -m "update"
   git push origin stable
   ```

3. **Tự động deploy!**
   - Xem progress trong tab **Actions**
   - URL sẽ hiện trong deployment logs

---

### Cách 3: CLI (Nhanh cho testing)

```bash
# 1. Cài Wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Build & Deploy
pnpm install
pnpm run build
wrangler pages deploy ./build/client --project-name=bolt-diy-nilai
```

---

## 🔐 Environment Variables Cần Thiết

### Bắt buộc:
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### Khuyến nghị (ít nhất 1 provider):
```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
XAI_API_KEY=xai-...
```

### Optional:
```bash
VITE_GITHUB_ACCESS_TOKEN=ghp_...
VITE_GITHUB_TOKEN_TYPE=classic
VITE_LOG_LEVEL=info
```

---

## 📖 Tài Liệu Chi Tiết

- **Full guide**: [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)
- **GitHub Secrets**: [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)
- **Supabase setup**: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md)

---

## ✅ Checklist Deploy

- [ ] Cloudflare account đã tạo
- [ ] Repository đã kết nối
- [ ] Environment variables đã thêm
- [ ] Supabase integration đã test
- [ ] Build thành công locally
- [ ] Deploy thành công

---

## 🆘 Troubleshooting Nhanh

**Build failed?**
```bash
pnpm run build  # Test locally
```

**Variables not found?**
- Check names (case-sensitive)
- Redeploy after adding

**Supabase connection failed?**
- Check URL format: `https://xxx.supabase.co`
- Regenerate anon key

---

**Cần trợ giúp?** Đọc [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) 👍
