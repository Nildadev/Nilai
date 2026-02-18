# 🚀 Hướng Dẫn Deploy bolt.diy Lên Cloudflare Pages

Hướng dẫn chi tiết từng bước để deploy bolt.diy với Supabase integration lên Cloudflare Pages.

---

## 📋 Mục Lục

1. [Yêu Cầu Trước Khi Deploy](#yêu-cầu-trước-khi-deploy)
2. [Cách 1: Deploy Tự Động Với GitHub](#cách-1-deploy-tự-động-với-github)
3. [Cách 2: Deploy Từ CLI](#cách-2-deploy-từ-cli)
4. [Cấu Hình Environment Variables](#cấu-hình-environment-variables)
5. [Supabase Integration Trên Cloud](#supabase-integration-trên-cloud)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Yêu Cầu Trước Khi Deploy

### 1. Tài khoản Cloudflare

- [ ] Tạo tài khoản tại https://cloudflare.com
- [ ] Xác nhận email
- [ ] Đăng nhập vào Cloudflare dashboard

### 2. Chuẩn bị GitHub Repository

- [ ] Repository đã được push lên GitHub
- [ ] Branch chính: `stable` hoặc `main`

### 3. Supabase Đã Được Cấu Hình

- [ ] Supabase project đã tạo
- [ ] SQL migration đã chạy
- [ ] API keys đã sẵn sàng

---

## 🎯 Cách 1: Deploy Tự Động Với GitHub (Khuyến Nghị)

### Bước 1: Truy Cập Cloudflare Pages

1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Chọn **Workers & Pages** ở sidebar trái
3. Click **Create application**
4. Chọn tab **Pages**
5. Click **Connect to Git**

### Bước 2: Kết Nối GitHub

1. Click **Authorize Cloudflare** để cho phép truy cập GitHub
2. Chọn tài khoản GitHub của bạn
3. Chọn repository **Nilai** (hoặc tên repo của bạn)
4. Click **Begin setup**

### Bước 3: Cấu Hình Build

Điền thông tin sau:

| Setting | Giá trị |
|---------|---------|
| **Project name** | `bolt-diy-nilai` (hoặc tên bạn muốn) |
| **Production branch** | `stable` |
| **Framework preset** | `Remix` |
| **Build command** | `pnpm run build` |
| **Build output directory** | `build/client` |
| **Root directory** | (để trống) |

### Bước 4: Cài Đặt Environment Variables

Click **Add variables** và thêm các biến sau:

#### **API Keys:**
```
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
DEEPSEEK_API_KEY=your_deepseek_key
MISTRAL_API_KEY=your_mistral_key
COHERE_API_KEY=your_cohere_key
XAI_API_KEY=your_xai_key
PERPLEXITY_API_KEY=your_perplexity_key
TOGETHER_API_KEY=your_together_key
```

#### **Supabase Configuration:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### **GitHub Integration (Optional):**
```
VITE_GITHUB_ACCESS_TOKEN=your_github_token
VITE_GITHUB_TOKEN_TYPE=classic
```

#### **Other Settings:**
```
VITE_LOG_LEVEL=info
NODE_VERSION=18
```

### Bước 5: Deploy

1. Click **Save and Deploy**
2. Đợi build hoàn thành (5-10 phút)
3. Khi thấy status **Ready**, click vào domain để truy cập

### Bước 6: Cấu Hình Custom Domain (Optional)

1. Vào project Pages trong Cloudflare dashboard
2. Chọn **Custom domains**
3. Click **Add custom domain**
4. Nhập domain của bạn
5. Làm theo hướng dẫn để cấu hình DNS

---

## 💻 Cách 2: Deploy Từ CLI (Command Line)

### Bước 1: Cài Đặt Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Hoặc dùng npx
npx wrangler --version
```

### Bước 2: Đăng Nhập Cloudflare

```bash
wrangler login
```

Lệnh này sẽ mở trình duyệt để bạn đăng nhập.

### Bước 3: Tạo wrangler.toml (Nếu Chưa Có)

Tạo file `wrangler.toml` trong thư mục gốc:

```toml
name = "bolt-diy-nilai"
compatibility_date = "2024-01-01"
pages_build_output_dir = "./build/client"

[vars]
# Supabase Configuration
VITE_SUPABASE_URL = "https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY = "your-anon-key"

# API Keys
ANTHROPIC_API_KEY = "your_anthropic_key"
OPENAI_API_KEY = "your_openai_key"
GROQ_API_KEY = "your_groq_key"

# Other
VITE_LOG_LEVEL = "info"
```

### Bước 4: Build Project

```bash
# Install dependencies
pnpm install

# Build
pnpm run build
```

### Bước 5: Deploy

```bash
# Deploy production
wrangler pages deploy ./build/client --project-name=bolt-diy-nilai

# Hoặc deploy với branch
wrangler pages deploy ./build/client --branch=stable
```

### Bước 6: Xem Preview URL

Sau khi deploy thành công, bạn sẽ thấy URL:
```
✨ Deployment complete!
🌐 Your deployment is live at: https://your-deployment-id.pages.dev
```

---

## 🔐 Cấu Hình Environment Variables

### Trên Cloudflare Dashboard

1. Vào **Workers & Pages** → Chọn project của bạn
2. Chọn **Settings** → **Environment variables**
3. Click **Add variable**
4. Điền:
   - **Variable name**: `VITE_SUPABASE_URL`
   - **Value**: `https://your-project.supabase.co`
   - **Environment**: `Production` (hoặc `Preview`)
5. Click **Save**

### Danh Sách Variables Cần Thiết

#### **Bắt Buộc:**
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Ít nhất 1 LLM Provider
ANTHROPIC_API_KEY=sk-ant-...
```

#### **Khuyến Nghị:**
```bash
# Multiple LLM Providers
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
DEEPSEEK_API_KEY=sk-...
MISTRAL_API_KEY=...
XAI_API_KEY=xai-...

# GitHub Integration
VITE_GITHUB_ACCESS_TOKEN=ghp_...
VITE_GITHUB_TOKEN_TYPE=classic

# Logging
VITE_LOG_LEVEL=info
```

---

## 🔗 Supabase Integration Trên Cloud

### Cấu Hình Supabase Cho Production

1. **Trong Supabase Dashboard:**
   - Vào **Settings** → **API**
   - Copy **Project URL** và **anon key**
   - Dán vào Cloudflare environment variables

2. **RLS Policies:**
   - Đảm bảo RLS đã được enable
   - Kiểm tra policies trong **Authentication** → **Policies**

3. **Supabase Realtime (Optional):**
   ```bash
   # Thêm variable nếu dùng realtime
   VITE_SUPABASE_REALTIME_KEY=your-realtime-key
   ```

### Test Supabase Connection

Sau khi deploy, test bằng cách:

1. Mở ứng dụng trên Cloudflare Pages
2. Vào **Settings** → **Connections**
3. Kết nối Supabase với access token
4. Tạo conversation mới
5. Kiểm tra trong Supabase Table Editor

---

## 🐛 Troubleshooting

### Lỗi: "Build failed"

**Kiểm tra:**
```bash
# Chạy build locally
pnpm run build

# Xem lỗi gì
```

**Sửa:**
- Đảm bảo Node.js version >= 18
- Xóa `node_modules` và install lại: `rm -rf node_modules && pnpm install`
- Kiểm tra syntax errors trong code

### Lỗi: "Environment variables not found"

**Kiểm tra:**
1. Variables đã được thêm trong Cloudflare dashboard
2. Tên variables chính xác (case-sensitive)
3. Environment (Production/Preview) đúng

**Sửa:**
- Add lại variables
- Redeploy: `wrangler pages deploy ./build/client`

### Lỗi: "Supabase connection failed"

**Kiểm tra:**
1. `VITE_SUPABASE_URL` đúng format: `https://xxx.supabase.co`
2. `VITE_SUPABASE_ANON_KEY` đầy đủ
3. Supabase project đang active

**Sửa:**
- Test URL trong browser: `https://your-project.supabase.co/rest/v1/`
- Regenerate anon key trong Supabase dashboard
- Kiểm tra CORS settings trong Supabase

### Lỗi: "404 Not Found"

**Nguyên nhân:**
- Build output directory sai
- Remix routes không đúng

**Sửa:**
```bash
# Kiểm tra build output
ls -la build/client

# Đảm bảo có file index.html
```

### Lỗi: "API calls failed"

**Kiểm tra:**
- API keys có trong environment variables
- API keys còn hạn
- Không bị CORS block

**Sửa:**
```bash
# Test API call locally
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

---

## 📊 Monitoring & Analytics

### Cloudflare Analytics

1. Vào project Pages trong dashboard
2. Chọn **Analytics**
3. Xem:
   - Total requests
   - Bandwidth usage
   - Cache hit rate
   - Errors

### Supabase Logs

1. Vào Supabase dashboard
2. Chọn **Logs**
3. Filter theo thời gian và mức độ

### Setup Alerts

```bash
# Trong Cloudflare dashboard
Settings → Notifications → Create notification

# Chọn events:
- Deployment failed
- High error rate
- High bandwidth usage
```

---

## 🚀 CI/CD Tự Động

### Tự Động Deploy Khi Push Code

Cloudflare Pages tự động deploy khi:

1. Push code lên branch `stable`
2. Tạo pull request (tạo preview deployment)
3. Merge pull request

### Custom Deploy Commands

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - stable

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy ./build/client --project-name=bolt-diy-nilai
```

### Setup Cloudflare API Token

1. Vào [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. **Create Token** → **Custom token**
3. Permissions:
   - `Account:Cloudflare Pages:Edit`
   - `Account:Workers Scripts:Edit`
4. Copy token
5. Thêm vào GitHub Secrets: `CLOUDFLARE_API_TOKEN`

---

## 💰 Chi Phí

### Cloudflare Pages Free Tier

- ✅ **Unlimited requests**
- ✅ **100GB bandwidth/month**
- ✅ **500 builds/month**
- ✅ **Unlimited preview deployments**
- ✅ **Free SSL**

### Supabase Free Tier

- ✅ **500MB database**
- ✅ **1GB file storage**
- ✅ **50,000 monthly active users**
- ✅ **Community support**

**Lưu ý:** Theo dõi usage trong dashboard để tránh vượt quá hạn mức.

---

## 🎯 Best Practices

### 1. Security

- ✅ Không commit API keys vào Git
- ✅ Sử dụng environment variables
- ✅ Enable RLS trong Supabase
- ✅ Sử dụng HTTPS
- ✅ Setup CSP headers

### 2. Performance

- ✅ Enable caching
- ✅ Optimize images
- ✅ Minimize bundle size
- ✅ Use CDN (Cloudflare tự động)

### 3. Monitoring

- ✅ Setup error tracking
- ✅ Monitor bandwidth
- ✅ Check deployment logs
- ✅ Test regularly

---

## 📖 Tài Liệu Tham Khảo

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Supabase Docs](https://supabase.com/docs)
- [Remix on Cloudflare](https://remix.run/docs/en/main/guides/cloudflare)

---

## 🎉 Checklist Deploy Thành Công

- [ ] Cloudflare account đã tạo
- [ ] GitHub repository đã kết nối
- [ ] Build configuration đã đúng
- [ ] Environment variables đã thêm
- [ ] Supabase integration đã test
- [ ] Custom domain (nếu dùng)
- [ ] Monitoring đã setup
- [ ] CI/CD tự động đã configure

---

## 🆘 Cần Trợ Giúp?

- **Cloudflare Community**: https://community.cloudflare.com
- **Supabase Discord**: https://discord.supabase.com
- **bolt.diy Community**: https://thinktank.ottomator.ai
- **GitHub Issues**: https://github.com/Nildadev/Nilai/issues

---

**Chúc bạn deploy thành công! 🚀**
