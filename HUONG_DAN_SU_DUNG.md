# Hướng Dẫn Tích Hợp Supabase Cho bolt.diy

Xin chúc mừng! Supabase đã được tích hợp thành công vào bolt.diy của bạn. Dưới đây là hướng dẫn chi tiết để thiết lập và sử dụng.

---

## 📋 Mục Lục

1. [Cài Đặt](#cài-đặt)
2. [Cấu Hình Supabase](#cấu-hình-supabase)
3. [Chạy SQL Migration](#chạy-sql-migration)
4. [Sử Dụng Giao Diện](#sử-dụng-giao-diện)
5. [Sử Dụng API](#sử-dụng-api)
6. [Ví Dụ Code](#ví-dụ-code)
7. [Xử Lý Sự Cố](#xử-lý-sự-cố)

---

## 🚀 Cài Đặt

### Bước 1: Cài đặt Supabase Client

Mở terminal và chạy lệnh:

```bash
# Nếu bạn dùng pnpm (khuyến nghị)
pnpm add @supabase/supabase-js

# Hoặc nếu bạn dùng npm
npm install @supabase/supabase-js

# Hoặc nếu bạn dùng yarn
yarn add @supabase/supabase-js
```

### Bước 2: Thêm Biến Môi Trường

Tạo hoặc cập nhật file `.env.local` trong thư mục gốc:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Lưu ý:** 
- Thay `your-project` bằng ID project Supabase của bạn
- Thay `your-supabase-anon-key` bằng anon key từ Supabase dashboard

---

## ⚙️ Cấu Hình Supabase

### Tạo Supabase Account

1. Truy cập [Supabase](https://supabase.com)
2. Đăng ký tài khoản miễn phí (hoặc đăng nhập nếu đã có)
3. Click **"New Project"**

### Tạo Project Mới

Điền thông tin project:

- **Name**: Tên project (ví dụ: `bolt-diy-chat`)
- **Database Password**: Mật khẩu database (chọn mật khẩu mạnh)
- **Region**: Chọn region gần bạn nhất (ví dụ: `Singapore` cho VN)
- **Pricing Plan**: Chọn **Free** (miễn phí)

Click **"Create new project"** và đợi vài phút để project được tạo.

### Lấy API Keys

Sau khi project được tạo:

1. Vào **Settings** (biểu tượng bánh răng ở sidebar dưới cùng)
2. Chọn **API**
3. Copy các giá trị sau:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (chuỗi dài)

Dán các giá trị này vào file `.env.local` ở bước trên.

---

## 🗄️ Chạy SQL Migration

### Bước 1: Mở SQL Editor

1. Trong Supabase dashboard, chọn **SQL Editor** ở sidebar
2. Click **"New query"**

### Bước 2: Chạy SQL Script

Copy toàn bộ nội dung file `supabase/migrations/001_initial_schema.sql` và paste vào SQL Editor.

Click **"Run"** để thực thi.

**Kết quả mong đợi:**
- ✅ Tables created: `profiles`, `conversations`, `messages`, `projects`
- ✅ Indexes created
- ✅ RLS policies enabled
- ✅ Triggers created

### Bước 3: Kiểm Tra Database

Vào **Table Editor** để xem các tables đã được tạo:
- `profiles` - Lưu thông tin user
- `conversations` - Lưu các cuộc trò chuyện
- `messages` - Lưu tin nhắn trong conversations
- `projects` - Lưu các projects

---

## 💻 Sử Dụng Giao Diện

### Mở Settings

1. Khởi động bolt.diy:
   ```bash
   pnpm run dev
   ```

2. Mở trình duyệt tại `http://localhost:5173`
3. Click vào biểu tượng **Settings** (bánh răng) ở sidebar

### Kết Nối Supabase

1. Chọn tab **Connections**
2. Tìm section **Supabase Connection**
3. Nhập **Supabase Access Token**:
   - Click vào link **"Get your token →"**
   - Đăng nhập Supabase nếu được yêu cầu
   - Tạo token mới tại [Supabase Tokens](https://app.supabase.com/account/tokens)
   - Copy và paste token vào ô input

4. Click **"Connect"**

### Chọn Project

Sau khi connect thành công:

1. Click vào **"Projects"** để mở danh sách
2. Chọn project bạn muốn kết nối
3. System sẽ tự động lấy API keys

**Trạng thái kết nối thành công:**
- ✅ Hiển thị "Connected as your-email@example.com"
- ✅ API keys được hiển thị
- ✅ Nút "Disconnect" xuất hiện

---

## 🔌 Sử Dụng API

### Import Supabase Client

```typescript
import { supabase, supabaseService } from '~/lib/supabase';
import { useSupabaseChat, useSupabaseProjects } from '~/lib/supabase/hooks';
```

### Lưu Chat History

```typescript
// Sử dụng hook
const {
  conversations,
  currentConversation,
  messages,
  createConversation,
  saveMessage,
  loadConversation,
  deleteConversation,
} = useSupabaseChat({
  userId: 'user-123',
  autoSave: true,
  enabled: true,
});

// Tạo conversation mới
await createConversation('Chat về React Hooks');

// Lưu tin nhắn
await saveMessage('user', 'Xin chào, giúp tôi học React!');
await saveMessage('assistant', 'Chào bạn! Tôi rất vui được giúp bạn học React.');
```

### Quản Lý Projects

```typescript
// Sử dụng hook
const {
  projects,
  currentProject,
  createProject,
  updateProject,
  deleteProject,
  refreshProjects,
} = useSupabaseProjects({
  userId: 'user-123',
  enabled: true,
});

// Tạo project mới
await createProject(
  'My React App',
  'Ứng dụng React với TypeScript',
  [
    { name: 'App.tsx', content: '...' },
    { name: 'index.tsx', content: '...' }
  ]
);

// Cập nhật project
await updateProject(projectId, {
  name: 'Updated Project Name',
  files: [...files, newFile]
});
```

---

## 📚 Ví Dụ Code

### Ví dụ 1: Tự động lưu chat history

```typescript
// Trong component Chat
import { useSupabaseChat } from '~/lib/supabase/hooks';

export function ChatComponent() {
  const { saveMessage, createConversation } = useSupabaseChat({
    userId: currentUser.id,
    autoSave: true,
  });

  const handleSendMessage = async (content: string) => {
    // Lưu tin nhắn của user
    await saveMessage('user', content);

    // Gửi đến AI và nhận response
    const response = await callAI(content);

    // Lưu phản hồi của AI
    await saveMessage('assistant', response.content);
  };

  return (
    // JSX của bạn
  );
}
```

### Ví dụ 2: Load conversation cũ

```typescript
import { useSupabaseChat } from '~/lib/supabase/hooks';

export function ConversationList() {
  const { conversations, loadConversation } = useSupabaseChat();

  return (
    <div>
      <h3>Lịch sử chat</h3>
      <ul>
        {conversations.map((conv) => (
          <li
            key={conv.id}
            onClick={() => loadConversation(conv.id)}
            style={{ cursor: 'pointer' }}
          >
            {conv.title}
            <small>{new Date(conv.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Ví dụ 3: Export dữ liệu

```typescript
import { supabaseService } from '~/lib/supabase';

export async function exportUserData() {
  const data = await supabaseService.exportUserData();
  
  // Download as JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bolt-diy-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}
```

### Ví dụ 4: Search conversations

```typescript
import { supabase } from '~/lib/supabase';

export async function searchConversations(query: string, userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .ilike('title', `%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

---

## 🐛 Xử Lý Sự Cố

### Lỗi: "Failed to connect to Supabase"

**Nguyên nhân:**
- Token không đúng hoặc hết hạn
- Mất kết nối internet

**Cách sửa:**
1. Kiểm tra token tại [Supabase Tokens](https://app.supabase.com/account/tokens)
2. Tạo token mới và cập nhật
3. Kiểm tra kết nối internet

### Lỗi: "Permission denied"

**Nguyên nhân:**
- RLS policies chưa được cấu hình đúng
- User chưa được xác thực

**Cách sửa:**
1. Chạy lại SQL migration script
2. Kiểm tra RLS policies trong Supabase dashboard
3. Đảm bảo user đã đăng nhập

### Lỗi: "Environment variables not found"

**Nguyên nhân:**
- File `.env.local` chưa được tạo
- Tên biến môi trường không đúng

**Cách sửa:**
```bash
# Kiểm tra file tồn tại
ls -la .env.local

# Nội dung file phải có:
cat .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart server sau khi thay đổi:
```bash
pnpm run dev
```

### Lỗi: "Table does not exist"

**Nguyên nhân:**
- SQL migration chưa được chạy

**Cách sửa:**
1. Mở Supabase SQL Editor
2. Chạy lại script từ `supabase/migrations/001_initial_schema.sql`
3. Kiểm tra trong Table Editor

---

## 📊 Theo Dõi & Giám Sát

### Kiểm Tra Database Usage

1. Vào Supabase dashboard
2. Chọn **Settings** → **Usage**
3. Xem:
   - Database size
   - API requests
   - Storage usage

### Xem Logs

1. Vào **Logs** ở sidebar
2. Filter theo:
   - Time range
   - Log levels (INFO, ERROR, WARN)
   - Specific tables

### Setup Alerts (Tùy chọn)

1. Vào **Settings** → **Notifications**
2. Thêm email để nhận cảnh báo
3. Cấu hình alerts cho:
   - Database errors
   - High API usage
   - Storage limits

---

## 🔐 Bảo Mật

### Best Practices

1. **Không commit API keys** vào Git
   ```bash
   # Thêm vào .gitignore
   .env.local
   ```

2. **Sử dụng RLS policies** - Đã được cấu hình trong migration script

3. **Regular backups**:
   ```bash
   # Export data định kỳ
   pnpm run export-data
   ```

4. **Giới hạn permissions** - Chỉ cấp quyền cần thiết

5. **Monitor usage** - Kiểm tra dashboard thường xuyên

---

## 📈 Next Steps

### Tính năng có thể thêm:

- [ ] Real-time sync với Supabase Realtime
- [ ] Full-text search cho conversations
- [ ] Export/Import conversations
- [ ] Share projects với team members
- [ ] Version history cho projects
- [ ] Analytics dashboard

---

## 📞 Hỗ Trợ

Nếu bạn gặp khó khăn:

1. **Documentation**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. **Supabase Docs**: https://supabase.com/docs
3. **bolt.diy Community**: https://thinktank.ottomator.ai
4. **GitHub Issues**: https://github.com/stackblitz-labs/bolt.diy/issues

---

## 🎉 Tổng Kết

Bạn đã hoàn thành việc tích hợp Supabase vào bolt.diy! Bây giờ bạn có thể:

✅ Lưu trữ chat history trên cloud
✅ Đồng bộ hóa giữa các thiết bị
✅ Quản lý projects với database
✅ Export/Import dữ liệu dễ dàng
✅ Tìm kiếm conversations nhanh chóng

Chúc bạn thành công! 🚀
