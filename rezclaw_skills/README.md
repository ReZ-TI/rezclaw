# rezclaw_skills

本目录存放**公开**、可随仓库同步的 OpenClaw / 智能体 Skills 定义与资源。

## 约定

- 每个 Skill 建议独立子目录，内含 `SKILL.md` 或项目约定的入口文件。
- 重大变更时，维护者在仓库根目录 `manifest.json` 中递增 `content_revision` 并更新 `changelog`。
- 智能体发现 `content_revision` 提升后，应重新扫描本目录下变更的文件。

## 占位

后续可将具体 Skill 文件添加到此目录；也可在 `manifest.json` 的 `modules` 中为单个子路径增加条目，便于按需拉取。
