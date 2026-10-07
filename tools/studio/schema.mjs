// 本地发布台（tools/studio/server.mjs）和线上后台（worker/index.js）共用这一份定义。
// 两边都必须校验：线上 Worker 放过的坏数据会让 Actions 构建失败，
// 而构建失败 = 站点悄悄停在旧版本，比报错更难查。

export const SCHEMA = {
  projects: {
    label: "项目",
    file: "projects.json",
    labelField: "name",
    fields: [
      ["name", "名称", "text"],
      ["description", "简介", "textarea"],
      ["url", "链接", "text"],
      ["tags", "技术栈", "list"],
      ["progress", "进度 %", "number"],
      ["status", "状态", "enum", ["编码中", "规划中", "已完成", "测试中"]],
    ],
  },
  photos: {
    label: "照片",
    file: "photos.json",
    id: true,
    labelField: "src",
    fields: [
      ["src", "图片", "image"],
      ["caption", "说明", "text"],
      ["date", "日期", "date"],
      ["location", "地点", "text"],
    ],
  },
  friends: {
    label: "友链",
    file: "friends.json",
    labelField: "name",
    fields: [
      ["name", "名称", "text"],
      ["url", "链接", "text"],
      ["avatar", "头像", "image"],
      ["bio", "介绍", "textarea"],
    ],
  },
  music: {
    label: "音乐",
    file: "music.json",
    id: true,
    labelField: "title",
    fields: [
      ["title", "曲名", "text"],
      ["artist", "作者", "text"],
      ["src", "音频地址", "text"],
      ["cover", "封面", "image"],
    ],
  },
};

export const PROFILE_PATH = "src/content/profile.json";
export const PROFILE_IMAGE_FIELDS = ["avatarUrl"];
export const KEYS = Object.keys(SCHEMA);
export const CONTENT_PATHS = [PROFILE_PATH, ...KEYS.map((k) => `src/content/${SCHEMA[k].file}`)];

export function validate(key, items) {
  const schema = SCHEMA[key];
  const errors = [];
  items.forEach((item, i) => {
    for (const [field, label, kind, allowed] of schema.fields) {
      const value = item[field];
      if (value === undefined || value === null) {
        errors.push(`${schema.label} 第 ${i + 1} 项缺少「${label}」字段`);
        continue;
      }
      // 点了「新增」却没填就保存，会在页面上留下一张什么都没有的卡片，
      // 而且照片/头像的 src 为空还是张破图。标识字段必须有内容。
      if (field === schema.labelField && !String(value).trim()) {
        errors.push(`${schema.label} 第 ${i + 1} 项是空的（「${label}」没填），要么填完再保存，要么直接删掉这一项`);
      }
      if (kind === "number" && (!Number.isFinite(value) || value < 0 || value > 100)) {
        errors.push(`${schema.label} 第 ${i + 1} 项「${label}」必须是 0-100 的数字`);
      }
      if (kind === "enum" && !allowed.includes(value)) {
        errors.push(`${schema.label} 第 ${i + 1} 项「${label}」只能是：${allowed.join(" / ")}`);
      }
      if (kind === "list" && !Array.isArray(value)) {
        errors.push(`${schema.label} 第 ${i + 1} 项「${label}」必须是数组`);
      }
    }
  });
  if (schema.id) {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item.id)) errors.push(`${schema.label} 有重复 id：${item.id}`);
      seen.add(item.id);
    }
  }
  return errors;
}

// 纯字符串数组折回一行，否则每次保存都会把仓库里的 tags 撑成一大坨 diff。
export function stringify(value) {
  return JSON.stringify(value, null, 2).replace(
    /\[\s*\n((?:\s*"(?:[^"\\]|\\.)*",?\s*\n)+)\s*\]/g,
    (_m, inner) => `[${inner.trim().split("\n").map((s) => s.trim().replace(/,$/, "")).join(", ")}]`
  );
}

// Cloudflare 的文件名不允许非 ASCII，GitHub 路径也一样按最保守的来。
export function safeImageName(name) {
  const safe = String(name)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  if (!safe) throw new Error("文件名清理后为空，请换一个含英文或数字的名字");
  return safe;
}

// 图片在仓库里的路径，以及站点上访问它的路径。public/ 是静态导出的根，URL 里不带这一层。
export const imageDir = (filename) => `public/images/posts/${filename}`;
export const siteImageSrc = (filename) => `/${imageDir(filename).replace(/^public\//, "")}`;
