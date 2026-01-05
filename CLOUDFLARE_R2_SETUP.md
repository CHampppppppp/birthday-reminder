# Cloudflare R2 设置指南

## 概述

本项目使用 Cloudflare R2 存储用户头像和朋友头像。R2 是一个低成本、高性能的对象存储服务。

## 设置步骤

### 1. 创建 Cloudflare R2 存储桶

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 部分
3. 点击 "Create bucket"
4. 输入存储桶名称（例如：`birthday-reminder-avatars`）
5. 选择区域（推荐使用 `auto`）

### 2. 创建 API Token

1. 在 Cloudflare Dashboard 中，进入 R2 → Manage API tokens
2. 点击 "Create API token"
3. 选择 "Object Read & Write" 权限
4. 选择你创建的存储桶
5. 保存生成的 Token

### 3. 配置环境变量

在你的 `.env.local` 文件中添加以下环境变量：

```env
# Cloudflare R2
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_ACCOUNT_ID=your-r2-account-id
R2_BUCKET_NAME=birthday-reminder-avatars
R2_PUBLIC_URL=https://your-custom-domain.com
```

### 4. 配置自定义域名（可选但推荐）

1. 在 Cloudflare R2 中，进入你的存储桶设置
2. 点击 "Custom Domains"
3. 添加你的自定义域名
4. 配置 DNS 记录指向 Cloudflare

### 5. 权限设置

确保你的 R2 存储桶允许公共读取（用于头像显示）：

1. 进入存储桶设置
2. 在 "Permissions" 部分启用 "Allow public access"

## 环境变量说明

- `R2_ACCESS_KEY_ID`: R2 API Token 的 Access Key ID
- `R2_SECRET_ACCESS_KEY`: R2 API Token 的 Secret Access Key
- `R2_ACCOUNT_ID`: 你的 Cloudflare Account ID（可以在 Dashboard URL 中找到）
- `R2_BUCKET_NAME`: 存储桶名称
- `R2_PUBLIC_URL`: 公共访问 URL（如果你使用自定义域名）

## 头像存储结构

头像文件将按以下结构存储在 R2 中：

```
/avatars/
  /users/
    {userId}/
      {timestamp}-{random}.jpg
  /friends/
    {userId}/
      {friendId}/
        {timestamp}-{random}.jpg
```

## 注意事项

1. 头像会被自动压缩并调整为 300x300 像素
2. 支持的文件格式：JPG, PNG（最大 5MB）
3. 所有头像都设置为公开可读
4. 文件名包含时间戳和随机字符串以避免冲突

## 故障排除

如果头像上传失败：

1. 检查环境变量是否正确配置
2. 确认 R2 API Token 有正确的权限
3. 检查存储桶名称是否正确
4. 确认网络连接正常

如果头像无法显示：

1. 检查 `R2_PUBLIC_URL` 是否正确
2. 确认存储桶允许公共访问
3. 检查浏览器控制台是否有 CORS 错误
