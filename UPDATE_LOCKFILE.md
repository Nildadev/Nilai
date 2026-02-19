# 🔧 Update Lockfile

## Lỗi hiện tại:
```
specifiers in the lockfile don't match specs in package.json
```

## ✅ Fix:

### Chạy lệnh này locally trên máy bạn:

```bash
cd /home/userland/Nilai

# Nếu dùng pnpm (khuyến nghị)
pnpm install

# Commit và push
git add pnpm-lock.yaml
git commit -m "chore: update lockfile for Supabase"
git push origin stable
```

### Hoặc nếu dùng npm:
```bash
npm install
git add package-lock.json
git commit -m "chore: update lockfile"
git push origin stable
```

---

## Sau khi push:
Cloudflare Pages sẽ tự động build lại với lockfile mới.

Kiểm tra build progress trong GitHub Actions tab!
