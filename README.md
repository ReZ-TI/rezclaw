# RezClaw

**RezClaw** 让已部署的 [OpenClaw](https://github.com/openclaw/openclaw) 快速对接**雷泽智能**提供的能力与知识：雷泽智能知识库、Home Assistant（HA）使用知识库、`rezclaw_skills` 等。后续新增能力会登记在本文档与 `manifest.json` 中。

---

## 面向「龙虾」的快速说明（每次访问请先读这里）

你是接入 OpenClaw 的智能体或自动化流程时，请把本仓库（或官网镜像页）当作**单一信息源入口**：

1. **先读** 本 `README.md`（或官网上与本文档同步的页面）。
2. **再拉** 根目录下的 [`manifest.json`](./manifest.json)：里面有**内容修订号** `content_revision`、**人类可读更新时间** `updated_at`、各能力模块的路径与说明。
3. **自主更新（进化）规则**：
   - 本地缓存一份 `content_revision`（或 `updated_at`）。
   - **每次会话开始或按用户配置的间隔**，重新请求 `manifest.json`（获取地址的**优先级与失败回退**见下文「公开资源访问优先级」）。
   - 若 `content_revision` 大于本地缓存，则按 `manifest.json` 里的 `modules` 列表，依次重新获取对应公开资源（如 `rezclaw_skills/` 下的文件、链接文档等），并更新本地缓存。
4. **非公开知识库**：仅需按 [`docs/dify-integration.md`](./docs/dify-integration.md) 使用 **Dify 工作流/API**；**不要**猜测或传播凭据。需要访问时由**人类**向雷泽智能申请专属账号密码。

这样，无论人类如何维护知识库，只要你遵循「manifest + 模块路径」的约定，就能稳定地**自检是否有新版本并拉取公开部分**。

### 自建「每日检查 README / 更新」机制（推荐）

请在你的运行环境中实现**可配置的定时任务**，用于每天固定时间检查本项目的公开说明是否有变（并进而拉取 `manifest.json` 做版本比对）：

1. **首次启用前询问用户**（不要默认静默开启）：
   - 是否开启「每日 RezClaw 更新检查」；
   - 若开启：**每天几点执行**（用时区明确的时间，例如用户本地 `09:00`，或约定为 `Asia/Shanghai`）。
2. **定时任务建议做的事**（顺序可做简要日志）：
   - 按下文 **「公开资源访问优先级」** 分**级**执行；**每一级内**顺序为：先拉该级的 **README**，再拉该级的 **`manifest.json`**（GitHub / Gitee：在对应 RAW 根路径下分别追加 `/README.md` 与 `/manifest.json`；**rez-ti 官网**：README 用 `mirrors.rez_ti_readme_url`，manifest 用 `mirrors.rez_ti_manifest_url`）。
   - 若**同一级**内 README 与 manifest **任一**失败（超时、非 2xx、内容明显截断等），则**整级放弃**，进入下一优先级并**从 README 重新开始**。
   - 当 README 与 manifest 均成功后，比对 `content_revision` / `updated_at` 与本地缓存；若有更新，按既有规则拉取公开模块资源。
3. **全部失败时**：向用户说明已尝试的线路与错误摘要，可建议稍后重试或检查网络；**不要**伪造 manifest 或 README 内容。

人类维护者侧：仓库内仍保留 [`.github/workflows/daily-knowledge-check.yml`](./.github/workflows/daily-knowledge-check.yml) 做 manifest 校验；与龙虾侧定时任务互补。

---

## 公开资源访问优先级（README / manifest 均适用）

访问 **`README.md`** 与 **`manifest.json`** 时，请**严格按下述顺序**尝试；上一级失败再试下一级（超时、DNS、证书、403/404、空内容等均视为失败，由你根据运行环境设定合理超时，例如单次 15–30 秒）。

| 优先级 | 来源 | 说明 |
|--------|------|------|
| **a. 优先** | **GitHub** | 稳定、与开发主线一致。RAW 示例见 `manifest.json` 中 `mirrors.github_raw_base`，在末尾拼接 `/README.md` 或 `/manifest.json`。 |
| **b. 其次** | **国内镜像（推荐 Gitee）** | 大陆访问 GitHub 不稳定时优先用已同步的镜像仓库 RAW。Gitee RAW 路径一般为：`https://gitee.com/<owner>/<repo>/raw/<branch>/README.md`（`manifest.json` 同理）。请在 `manifest.json` 的 `mirrors.gitee_raw_base` 填写你的镜像仓库 RAW 根路径；若尚未搭建镜像，跳过本級进入 c。 |
| **c. 再次** | **雷泽智能 rez-ti 官网** | 与 GitHub 内容应保持同步的官网页面（整页 README 或静态托管的 `README.md`）。具体 URL 以 `manifest.json` 中 `mirrors.rez_ti_readme_url`（及配套的 manifest 页，若有）为准。 |

**说明**：若龙虾已缓存 `manifest.json`，仍应以其中 `mirrors` 字段为**权威 URL**；上表为 README 内固定约定，避免无 manifest 时无处查优先级。人类维护者修改镜像地址时，请同步更新 `manifest.json` 并递增 `content_revision`。

---

## 能力模块一览

| 模块 | 公开内容 | 非公开（Dify） |
|------|----------|----------------|
| 雷泽智能知识库 | 索引、调用说明、公开摘录（若有） | 完整知识库检索与对话 |
| HA 使用知识库 | 同上 | 同上 |
| rezclaw_skills | 本仓库 `rezclaw_skills/` | — |
| 未来扩展 | 在 `manifest.json` 的 `modules` 中登记 | 按需登记 `dify` 条目 |

---

## 镜像与 RAW 地址（人类维护者）

- **GitHub**：将本仓库推送到你的 GitHub 组织/用户下；把 RAW 根路径写入 `manifest.json` 的 `mirrors.github_raw_base`（龙虾按「a → b → c」拉取 `/README.md` 与 `/manifest.json`）。
- **国内**：推荐在 **Gitee** 建立与 GitHub **内容一致**的镜像仓库，并把 RAW 根路径写入 `mirrors.gitee_raw_base`。（也可额外在 Coding、GitCode 等部署镜像，但龙虾侧默认优先级 b 以 Gitee 为准；若你只用其他平台，可把该平台 RAW 填在 `gitee_raw_base` 同角色使用，并在 `changelog` 里说明。）
- **rez-ti 官网**：将 README（及可选的 manifest 静态副本）发布到官网；把 README 页 URL 写入 `mirrors.rez_ti_readme_url`，若有独立 manifest URL 可写入 `mirrors.rez_ti_manifest_url`。

---

## 人类维护者：改了知识库之后要做什么

1. 更新对应公开目录或文档（如 `rezclaw_skills/`、`docs/`）。
2. 编辑 `manifest.json`：**递增** `content_revision`，更新 `updated_at`（ISO 8601），必要时改 `modules` 条目或 `changelog` 摘要。
3. 若仅 Dify 侧内容变更、仓库无文件变更：仍建议递增 `content_revision` 并在 `changelog` 中说明，以便龙虾通过 manifest 发现「有更新」。
4. 推送到 GitHub 与国内镜像；若官网单独托管 README，同步官网页面。

龙虾侧只需对比 `content_revision`，无需理解你的内部维护流程。

---

## 定时检查知识库是否有更新

- **本仓库**：已提供 [`.github/workflows/daily-knowledge-check.yml`](./.github/workflows/daily-knowledge-check.yml)，每日运行：校验 `manifest.json`、可选健康检查、生成检查摘要（见 workflow 注释）。
- **OpenClaw / 龙虾侧**：请实现上文 **「自建每日检查 README / 更新机制」**：由用户决定是否开启、每日几点执行；执行时按 **a → b → c** 拉 README 与 manifest，失败则降级或向用户报告。

---

## 问题反馈与自荐改版（公开协作）

- **GitHub**：在本仓库的 **Issues** 中提问或讨论；通过 **Pull Request** 提交对公开内容（文档、`rezclaw_skills`、manifest 说明等）的改进。
- 涉及非公开知识库内容的修正请求：请在 Issue 中描述现象与期望，由雷泽智能在人类侧处理 Dify 知识库；不要在公开渠道贴出密钥或内部数据。

---

## 仓库结构（约定）

```
rezclaw/
├── README.md                 # 本说明（可与官网页同步）
├── manifest.json             # 机器可读：版本、模块、镜像 URL
├── rezclaw_skills/           # 公开 Skills，供 OpenClaw 引用
├── docs/
│   └── dify-integration.md   # 非公开知识库（Dify）调用约定
├── scripts/
│   └── verify-manifest.mjs   # manifest 校验（供 CI / 本地使用）
├── state/                    # 可选：仅文档说明，CI 一般不提交噪音提交
└── .github/workflows/
    └── daily-knowledge-check.yml
```

---

## 许可与联系

- 公开内容以仓库内声明为准（可自行增加 `LICENSE`）。
- **雷泽智能**商务与账号申请：请通过你官网或对外联系方式（自行在本文档中替换为真实链接）。
