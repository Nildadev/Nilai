# ✅ Supabase Integration Checklist

Dưới đây là danh sách các bước cần làm để hoàn tất việc tích hợp Supabase vào bolt.diy.

---

## 📦 Bước 1: Cài đặt Dependencies

- [ ] Mở terminal trong thư mục project
- [ ] Chạy lệnh: `pnpm add @supabase/supabase-js`
- [ ] Kiểm tra installation thành công: `ls node_modules/@supabase`

---

## 🔐 Bước 2: Tạo Supabase Account

- [ ] Truy cập https://supabase.com
- [ ] Click "Sign Up" nếu chưa có tài khoản
- [ ] Điền email và password
- [ ] Xác nhận email (kiểm tra hộp thư)
- [ ] Đăng nhập vào Supabase dashboard

---

## 🆕 Bước 3: Tạo Supabase Project

- [ ] Click "New Project" trong dashboard
- [ ] Điền thông tin:
  - [ ] **Name**: bolt-diy-chat (hoặc tên khác)
  - [ ] **Database Password**: (chọn mật khẩu mạnh, lưu lại)
  - [ ] **Region**: Singapore (gần VN nhất)
  - [ ] **Pricing Plan**: Free
- [ ] Click "Create new project"
- [ ] Đợi 2-5 phút project được tạo xong

---

## 🔑 Bước 4: Lấy API Keys

- [ ] Trong Supabase dashboard, chọn project vừa tạo
- [ ] Click **Settings** (biểu tượng bánh răng, dưới cùng sidebar)
- [ ] Chọn **API**
- [ ] Copy **Project URL**: `https://xxxxx.supabase.co`
- [ ] Copy **anon/public key**: `eyJhbG...` (chuỗi dài)
- [ ] Lưu vào file `.env.local` (xem bước 5)

---

## 📝 Bước 5: Cấu hình Environment Variables

- [ ] Tạo file `.env.local` trong thư mục gốc (cùng cấp với package.json)
- [ ] Thêm nội dung:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```
- [ ] Thay `your-project` bằng project URL thực tế
- [ ] Thay `your-anon-key-here` bằng anon key thực tế
- [ ] Lưu file
- [ ] **Quan trọng**: Thêm `.env.local` vào `.gitignore`

---

## 🗄️ Bước 6: Chạy SQL Migration

- [ ] Trong Supabase dashboard, chọn **SQL Editor** (sidebar trái)
- [ ] Click **"New query"**
- [ ] Mở file `supabase/migrations/001_initial_schema.sql` trong project
- [ ] Copy toàn bộ nội dung
- [ ] Paste vào SQL Editor
- [ ] Click **"Run"** (hoặc Ctrl+Enter / Cmd+Enter)
- [ ] Đợi chạy xong (khoảng 5-10 giây)
- [ ] Kiểm tra kết quả:
  - [ ] Tables created: profiles, conversations, messages, projects
  - [ ] Indexes created
  - [ ] RLS policies enabled
  - [ ] Triggers created
- [ ] Vào **Table Editor** để xem các tables đã tạo

---

## 🔗 Bước 7: Lấy Supabase Access Token

- [ ] Truy cập https://app.supabase.com/account/tokens
- [ ] Đăng nhập nếu được yêu cầu
- [ ] Click **"Create new token"** hoặc **"Generate token"**
- [ ] Đặt tên cho token (ví dụ: "bolt-diy-local")
- [ ] Chọn permissions: Full access (hoặc tối thiểu là read/write)
- [ ] Click **"Create token"**
- [ ] **Copy token ngay lập tức** (chỉ hiện 1 lần duy nhất!)
- [ ] Lưu token vào password manager hoặc nơi an toàn

---

## 💻 Bước 8: Chạy bolt.diy

- [ ] Mở terminal trong thư mục project
- [ ] Chạy: `pnpm run dev`
- [ ] Đợi server khởi động
- [ ] Mở trình duyệt tại http://localhost:5173
- [ ] Kiểm tra trang web load thành công

---

## ⚙️ Bước 9: Kết nối Supabase trong UI

- [ ] Click biểu tượng **Settings** (bánh răng) ở sidebar
- [ ] Chọn tab **Connections**
- [ ] Tìm section **Supabase Connection**
- [ ] Paste Access Token vào ô input
- [ ] Click **"Connect"**
- [ ] Đợi kết nối (3-5 giây)
- [ ] Kiểm tra thông báo "Connected as your-email@example.com"

---

## 📁 Bước 10: Chọn Project

- [ ] Click vào **"Projects"** để mở danh sách
- [ ] Tìm project bạn đã tạo ở Bước 3
- [ ] Click vào project để chọn
- [ ] Đợi system lấy API keys
- [ ] Kiểm tra thông tin hiển thị:
  - [ ] Supabase URL
  - [ ] Anon Key (ẩn một phần)

---

## 🧪 Bước 11: Test Chat History

- [ ] Tạo một conversation mới trong bolt.diy
- [ ] Gửi một tin nhắn
- [ ] Vào Supabase dashboard → **Table Editor** → **messages**
- [ ] Kiểm tra tin nhắn đã được lưu
- [ ] Reload trang bolt.diy
- [ ] Kiểm tra conversation vẫn còn

---

## 📊 Bước 12: Test Project Management

- [ ] Tạo một project mới trong bolt.diy
- [ ] Thêm files vào project
- [ ] Vào Supabase dashboard → **Table Editor** → **projects**
- [ ] Kiểm tra project đã được lưu
- [ ] Thử update project
- [ ] Thử delete project

---

## 🔍 Bước 13: Kiểm tra Supabase Dashboard

- [ ] Vào Supabase dashboard
- [ ] Kiểm tra **Table Editor**:
  - [ ] profiles table có data
  - [ ] conversations table có data
  - [ ] messages table có data
  - [ ] projects table có data (nếu đã test)
- [ ] Kiểm tra **Logs**:
  - [ ] Không có lỗi ERROR
  - [ ] Có các request thành công
- [ ] Kiểm tra **Usage**:
  - [ ] Database size còn trong hạn mức free
  - [ ] API requests bình thường

---

## 🔐 Bước 14: Kiểm tra Bảo mật

- [ ] Vào Supabase dashboard → **Authentication** → **Policies**
- [ ] Kiểm tra RLS policies:
  - [ ] profiles: Users can view/update own profile
  - [ ] conversations: Users can CRUD own conversations
  - [ ] messages: Users can CRUD messages in own conversations
  - [ ] projects: Users can CRUD own projects
- [ ] Thử query data trong SQL Editor:
  ```sql
  select * from conversations;
  ```
  (Phải đăng nhập mới thấy data)

---

## 📚 Bước 15: Đọc Documentation

- [ ] Đọc [QUICK_START.md](./QUICK_START.md) - Hướng dẫn nhanh
- [ ] Đọc [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) - Hướng dẫn chi tiết tiếng Việt
- [ ] Đọc [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Tài liệu tiếng Anh
- [ ] Đọc [SUPABASE_INTEGRATION_SUMMARY.md](./SUPABASE_INTEGRATION_SUMMARY.md) - Tổng quan

---

## 🎯 Bước 16: Tích hợp vào Code (Optional)

Nếu bạn muốn tích hợp sâu vào code:

- [ ] Mở file cần tích hợp (ví dụ: Chat component)
- [ ] Import hook:
  ```typescript
  import { useSupabaseChat } from '~/lib/supabase/hooks';
  ```
- [ ] Sử dụng hook trong component:
  ```typescript
  const { saveMessage, conversations } = useSupabaseChat({ userId: 'user-id' });
  ```
- [ ] Test functionality
- [ ] Commit code (không commit .env.local!)

---

## ✅ Bước 17: Final Checklist

- [ ] Dependencies đã cài đặt
- [ ] Supabase project đã tạo
- [ ] API keys đã cấu hình
- [ ] SQL migration đã chạy
- [ ] Connection trong UI đã thành công
- [ ] Chat history được lưu
- [ ] Projects được lưu
- [ ] Không có lỗi trong console
- [ ] RLS policies đã enable
- [ ] Documentation đã đọc

---

## 🎉 HOÀN THÀNH!

Chúc mừng! Bạn đã tích hợp Supabase thành công vào bolt.diy!

**Bạn có thể:**
- ✅ Lưu chat history tự động
- ✅ Quản lý projects trên cloud
- ✅ Sync data giữa các thiết bị
- ✅ Export/Import dữ liệu
- ✅ Tìm kiếm conversations

---

## 🆘 Nếu Gặp Khó Khăn

Xem phần Troubleshooting trong:
- [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md) - Phần "Xử Lý Sự Cố"
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Phần "Troubleshooting"
- [QUICK_START.md](./QUICK_START.md) - Phần "Troubleshooting"

Hoặc:
- Join community: https://thinktank.ottomator.ai
- Open issue: https://github.com/stackblitz-labs/bolt.diy/issues

---

**Good luck! 🚀**
