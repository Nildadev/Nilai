# GitHub Secrets Setup Guide

Hướng dẫn thiết lập GitHub Secrets để deploy tự động lên Cloudflare Pages.

---

## 🔐 Thiết Lập GitHub Secrets

### Bước 1: Truy Cập GitHub Repository

1. Mở repository của bạn trên GitHub
2. Click **Settings** (tab trên cùng)
3. Click **Secrets and variables** → **Actions** (sidebar trái)
4. Click **New repository secret**

### Bước 2: Tạo Cloudflare API Token

1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Chọn **Custom token**
4. Đặt tên: `bolt-diy-deploy`
5. Permissions:
   - `Account:Cloudflare Pages:Edit`
   - `Account:Workers Scripts:Edit`
6. Click **Continue to summary**
7. Click **Create token**
8. **Copy token ngay** (chỉ hiện 1 lần!)

### Bước 3: Thêm Secrets Vào GitHub

Thêm các secrets sau:

#### **Cloudflare Configuration:**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CLOUDFLARE_API_TOKEN` | Token từ bước 2 | API token để deploy |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID từ dashboard | Tìm trong Workers & Pages |

**Lấy Account ID:**
1. Đăng nhập Cloudflare
2. Xem Account ID ở góc phải dashboard
3. Hoặc vào [Profile](https://dash.cloudflare.com/profile)

#### **Supabase Configuration:**

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase anon key |

#### **API Keys (Optional - chỉ thêm nếu dùng):**

| Secret Name | Value |
|-------------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `OPENAI_API_KEY` | `sk-...` |
| `GROQ_API_KEY` | `gsk_...` |
| `DEEPSEEK_API_KEY` | `sk-...` |
| `MISTRAL_API_KEY` | `...` |
| `XAI_API_KEY` | `xai-...` |
| `COHERE_API_KEY` | `...` |
| `PERPLEXITY_API_KEY` | `...` |
| `TOGETHER_API_KEY` | `...` |

#### **GitHub Integration (Optional):**

| Secret Name | Value |
|-------------|-------|
| `VITE_GITHUB_ACCESS_TOKEN` | `ghp_...` |
| `VITE_GITHUB_TOKEN_TYPE` | `classic` |

---

## 🚀 Deploy Tự Động

### Khi Push Code

Sau khi setup secrets, workflow sẽ tự động:

1. **Push lên branch `stable`** → Deploy production
2. **Tạo Pull Request** → Deploy preview
3. **Merge PR** → Deploy production

### Xem Deployment Status

1. Vào tab **Actions** của repository
2. Chọn workflow **Deploy to Cloudflare Pages**
3. Click vào run để xem logs
4. Xem deployment URL trong output

---

## 📋 Manual Deploy (CLI)

Nếu không dùng GitHub Actions:

### Bước 1: Cài Wrangler

```bash
npm install -g wrangler
```

### Bước 2: Login

```bash
wrangler login
```

### Bước 3: Deploy

```bash
# Build
pnpm run build

# Deploy preview
wrangler pages deploy ./build/client --project-name=bolt-diy-nilai-preview

# Deploy production
wrangler pages deploy ./build/client --project-name=bolt-diy-nilai --branch=stable
```

---

## 🔍 Troubleshooting

### Lỗi: "Permission denied"

**Nguyên nhân:** API token không đủ permissions

**Sửa:**
1. Tạo token mới với permissions:
   - `Account:Cloudflare Pages:Edit`
   - `Account:Workers Scripts:Edit`

### Lỗi: "Secrets not found"

**Kiểm tra:**
1. Secrets đã thêm đúng tên (case-sensitive)
2. Secrets ở repository level (không phải organization)
3. Workflow file đúng path: `.github/workflows/`

### Lỗi: "Build failed"

**Xem logs:**
1. Actions tab → Chọn workflow run
2. Expand "Build project" step
3. Xem lỗi cụ thể

**Sửa phổ biến:**
- Xóa cache: `pnpm store prune`
- Reinstall: `rm -rf node_modules && pnpm install`
- Check code: `pnpm run build` locally

---

## ✅ Checklist

- [ ] Cloudflare API token đã tạo
- [ ] Account ID đã lấy
- [ ] Secrets đã thêm vào GitHub
- [ ] Workflow file đã tạo
- [ ] Test push code lên branch `stable`
- [ ] Xem deployment trong Actions tab
- [ ] Truy cập deployment URL

---

## 📖 Tham Khảo

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler Action](https://github.com/cloudflare/wrangler-action)

---

**Chúc bạn setup thành công! 🎉**
