# My Meting API

一个部署在 Vercel 上的 Meting API，用来给博客音乐卡片提供歌曲信息、封面、音频地址和歌词数据。

## API

GET /api/meting?server=netease&type=song&id=2666842841

## 参数

| 参数 | 说明 | 示例 |
| --- | --- | --- |
| server | 音乐平台 | netease |
| type | 数据类型 | song |
| id | 歌曲 / 歌单 / 专辑 / 歌手 ID | 2666842841 |

## 支持的平台

netease, tencent, kugou, baidu, kuwo

## 支持的类型

song, playlist, album, artist

## 部署

安装依赖：

```bash
pnpm install
```

本地运行：

```bash
pnpm dlx vercel dev
```

部署到 Vercel：

```bash
pnpm dlx vercel
```

## 博客用法

简写：

```md
::music{netease="2666842841" metingApi="https://your-project.vercel.app/api/meting"}
```

原始链接：

```md
::music{meting="https://your-project.vercel.app/api/meting?server=netease&type=song&id=2666842841"}
```

## 说明

本项目只是一个轻量 API 包装层，核心解析能力来自：

- https://github.com/metowolf/Meting
- npm 包 @meting/core

建议给接口加缓存，避免频繁请求音乐平台。
