# rezclaw_skills

本目录存放**公开**、可随仓库同步的 OpenClaw / 智能体 Skills 定义与资源。

## 约定

- 每个 Skill 建议独立子目录，内含 `SKILL.md` 或项目约定的入口文件。
- 重大变更时，维护者在仓库根目录 `manifest.json` 中递增 `content_revision` 并更新 `changelog`。
- 智能体发现 `content_revision` 提升后，应重新扫描本目录下变更的文件。

## 已登记 Skill / 角色

| 目录 / 角色 ID | 入口文件 | 说明 |
|----------------|----------|------|
| `ec_manager_china/` | [`ec_manager_china/skills.md`](./ec_manager_china/skills.md) | 中国电商投放分析（淘宝直通车关键词推广：口径、指标、诊断、模板、周报） |
| `marketing/` | [`marketing/skills.md`](./marketing/skills.md) | 本地营销线索收集与跟进（小红书等平台：关键词、筛选口径、话术、日报） |

其它 Skill 可按「一角色一子目录」追加；若需单独登记拉取路径，可在仓库根目录 `manifest.json` 的 `modules` 中扩展。
