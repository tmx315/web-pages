---
title: "友链监控报告"
description: "友链网站访问监控报告，记录各友链网站的访问状态和截图"
published: 2026-03-23
tags: ["友链", "监控", "自动化"]
category: "技术"
draft: false
pinned: false
author: "孟轩科技"
licenseName: "CC BY 4.0"
image: ./images/placeholder.png
sourceLink: "https://blog.mxw2024.top/posts/friend-link-monitor/"
---

# 友链监控报告

## 报告信息

- **报告生成时间**: <!-- REPORT_TIME -->
- **监控网站数量**: <!-- TOTAL_SITES -->
- **可访问网站数量**: <!-- ACCESSIBLE_SITES -->
- **无法访问网站数量**: <!-- INACCESSIBLE_SITES -->

## 访问状态概览

| 状态 | 数量 |
|------|------|
| 正常访问 | <!-- NORMAL_COUNT --> |
| 无法访问 | <!-- INACCESSIBLE_COUNT --> |
| 证书错误 | <!-- CERT_ERROR_COUNT --> |
| 超时 | <!-- TIMEOUT_COUNT --> |

## 详细报告

<div class="overflow-x-auto">

<!-- FRIEND_LINKS_TABLE -->

</div>

## 无法访问的网站

<!-- INACCESSIBLE_LIST -->

## 截图预览

以下是本次监控拍摄的截图：

### 正常访问的网站截图

<!-- SCREENSHOTS_NORMAL -->

### 存在问题的网站截图

<!-- SCREENSHOTS_ERROR -->

## 报告说明

本报告由 GitHub Actions 自动化生成，每小时更新一次。

### 监控规则

- 网站可访问且能找到本站友链链接 → 标记为正常
- 网站无法访问（DNS 解析失败、证书错误、超时等）→ 标记为无法访问
- 网站可访问但找不到本站友链链接 → 标记为需检查

### 截图说明

- 每个网站会截取两张截图：主页截图和友链页面截图
- 截图保存于 `/gallery/friends/` 目录
- 文件名格式：`日期_序号_网站域名_类型.png`

### 注意事项

- 如果您的网站长期无法访问，可能会被从友链中移除
- 如果找不到您的网站友链信息，请检查是否正确添加
- 如有疑问，请在评论区留言

## 历史报告

- [2026-03-22 友链监控报告](./friend-link-monitor-2026-03-22)
- [2026-03-21 友链监控报告](./friend-link-monitor-2026-03-21)

<style>
  .screenshot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  .screenshot-item {
    border: 1px solid var(--line-divider);
    border-radius: 0.5rem;
    padding: 0.5rem;
    background: var(--bg-secondary);
  }
  .screenshot-item img {
    width: 100%;
    height: auto;
    border-radius: 0.25rem;
  }
  .screenshot-item p {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  .site-status {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
  }
  .status-ok { background: #dcfce7; color: #166534; }
  .status-warn { background: #fef9c3; color: #854d0e; }
  .status-error { background: #fee2e2; color: #991b1b; }
</style>
