# STAGING-WORKFLOW.md — 暂存数据固化流程

## 概述

MyBlogs 是纯静态导出站点，没有后端。暂存系统允许用户在网页上添加内容，导出 JSON 文件后，由 Claude 读取并写入源码，重新构建后固化到网页。

## 工作流

```
1. 用户在网页点击 "+" → 填写表单 → 暂存到 localStorage
2. 用户点击导航栏数据管理图标 → 导出 JSON 文件下载
3. 用户把 JSON 文件放到项目根目录
4. 告诉 Claude："请固化暂存数据"
5. Claude 读取 JSON → 解析 items → 写入源码常量 → 构建部署
```

## JSON 文件格式

导出文件名：`myblog-pending-{timestamp}.json`

```json
{
  "version": 1,
  "exportedAt": "2026-07-15T10:30:00.000Z",
  "source": "myblog-staging",
  "items": [
    {
      "type": "article",
      "data": { "id": "5", "title": "...", "description": "...", "cover": "...", "date": "...", "tags": [...], "variant": "image" }
    },
    {
      "type": "project",
      "data": { "name": "...", "description": "...", "tags": [...], "url": "..." }
    },
    {
      "type": "friend",
      "data": { "name": "...", "url": "...", "avatar": "😎", "bio": "..." }
    },
    {
      "type": "music",
      "data": { "id": "4", "title": "...", "artist": "...", "cover": "...", "src": "..." }
    },
    {
      "type": "photo",
      "data": { "id": "1", "src": "...", "caption": "...", "date": "...", "location": "..." }
    }
  ]
}
```

## 数据写入位置映射

| type | 写入文件 | 追加到哪个数组 | TypeScript 接口 |
|------|----------|---------------|----------------|
| `article` | `src/lib/constants.ts` | `articles: Article[]` | `Article` |
| `project` | `src/lib/constants.ts` | `projects: Project[]` | `Project` |
| `friend` | `src/lib/constants.ts` | `friends: Friend[]` | `Friend` |
| `music` | `src/lib/constants.ts` | `musicTracks: MusicTrack[]` | `MusicTrack` |
| `photo` | `src/lib/constants.ts` | `photos: Photo[]` | `Photo` |

## Claude 固化步骤

1. 读取项目根目录下的 `myblog-pending-*.json` 文件
2. 解析 `items` 数组
3. 按 `type` 分组
4. 对每个 item：
   - **article**: 追加到 `articles` 数组，确保 `id` 不重复（自增最大 id + 1）
   - **project**: 追加到 `projects` 数组
   - **friend**: 追加到 `friends` 数组
   - **music**: 追加到 `musicTracks` 数组，确保 `id` 不重复
   - **photo**: 追加到 `photos` 数组，确保 `id` 不重复
5. 更新 `siteConfig.stats.articles` 为实际文章数量
6. 运行 `npm run build` 验证构建成功
7. 提交并推送
8. 删除已处理的 JSON 文件

## 注意事项

- **图片文件**：用户需要在 `public/` 目录下放置对应的图片文件，JSON 中的路径如 `/images/posts/post-5.jpg` 对应 `public/images/posts/post-5.jpg`
- **音频文件**：同上，`/music/song.mp3` 对应 `public/music/song.mp3`
- **ID 去重**：追加时检查现有数据的最大 id，新条目 id = max + 1
- **标签格式**：tags 字段是字符串数组，直接写入即可
- **variant 字段**：article 的 variant 只接受 `"image"` 或 `"text-overlay"`
