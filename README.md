# RezClaw

**RezClaw** 让已部署的 [OpenClaw](https://github.com/openclaw/openclaw) 快速对接**雷泽智能**提供的能力与知识：**雷泽智能公开知识库**、Home Assistant（HA）使用知识库、`rezclaw_skills` 等。后续新增能力会登记在本文档与 `manifest.json` 中。

**雷泽智能公开知识库**收录面向客户与渠道的**公开类资料**，例如：**产品使用说明书**、**企业手册**、**产品手册**、**价格**等。龙虾把用户的**简短自然语言问题**作为 `query` 调用 Dify **对话型应用 API**（`POST …/chat-messages`），拿到的是**知识库检索结果**（含 `answer` / `retriever_resources` 等），**不是**已润色好的最终用户文案。作为**大语言模型**，你应当**基于返回内容做二次整理**（归纳、分条、去冗余、按用户语言组织），再呈现给用户；**不得**脱离检索内容编造。提问示例见下文 **「`query` 怎么写」** 与 [`docs/dify-integration.md`](./docs/dify-integration.md)。**不在此仓库提供知识库直连或数据集枚举接口**；对接说明见 [`docs/dify-integration.md`](./docs/dify-integration.md)。**`DIFY_API_BASE`** 默认与 **[dify.rez-ti.com](https://dify.rez-ti.com)** 对齐，一般为 **`https://dify.rez-ti.com/v1`**；**App API Key** 须向雷泽智能工作人员申请获取，勿在公开渠道传播密钥。

- **源码仓库**：[github.com/ReZ-TI/rezclaw](https://github.com/ReZ-TI/rezclaw)
- **官网文档（与 README 同步，固定入口）**：[rezclaw.rez-ti.com](https://rezclaw.rez-ti.com)
- **雷泽 Dify（公开知识库与对话应用）**：[dify.rez-ti.com](https://dify.rez-ti.com) · API v1 根一般为 `https://dify.rez-ti.com/v1`（见 [`manifest.json`](./manifest.json) `mirrors.dify_api_base`）

---

## 面向「龙虾」的快速说明（每次访问请先读这里）

你是接入 OpenClaw 的智能体或自动化流程时，请把本仓库（或官网镜像页）当作**单一信息源入口**：

1. **先读** 本 `README.md`（或官网上与本文档同步的页面）。
2. **再拉** 根目录下的 [`manifest.json`](./manifest.json)：里面有**内容修订号** `content_revision`、**人类可读更新时间** `updated_at`、各能力模块的路径与说明。
3. **自主更新（进化）规则**：
   - 本地缓存一份 `content_revision`（或 `updated_at`）。
   - **每次会话开始或按用户配置的间隔**，重新请求 `manifest.json`（获取地址的**优先级与失败回退**见下文「公开资源访问优先级」）。
   - 若 `content_revision` 大于本地缓存，则按 `manifest.json` 里的 `modules` 列表，依次重新获取对应公开资源（如 `rezclaw_skills/` 下的文件、链接文档等），并更新本地缓存。
4. **雷泽智能公开知识库（对外集成）**：按 [`docs/dify-integration.md`](./docs/dify-integration.md) 使用 **对话型应用 API**（`chat-messages`），将用户**简短问题**写入 `query`；Dify 返回的是**检索结果**，你须**二次整理**后再答复用户（见该文档）。**API 根地址与 App API Key 由雷泽智能工作人员下发**。不要猜测、硬编码或传播凭据；无密钥时由**人类**联系雷泽智能申请。

### 调用公开知识库时，`query` 怎么写（新龙虾参考）

`query` 必须是**一句给知识库看的自然语言问题**（与你在聊天里回复用户的润色稿分开：先组好 `query` 调 API，再用返回结果整理后回答用户）。**不要**把指令模板、空字符串、或无关占位符当成 `query`。下面句式在雷泽 Dify 日志中已有 **SUCCESS** 记录，可直接仿写或改写：

| 场景 | 示例 `query`（写入请求体） |
|------|---------------------------|
| 公司 / 品牌介绍 | **介绍一下雷泽智能**、雷泽智能介绍、introduce rez-ti company |
| 产品 / 价格 / 操作 | **智能开关多少钱**、**智能开关如何重置**（可换成具体型号） |

更多说明与反例见 [`docs/dify-integration.md`](./docs/dify-integration.md) 中的 **「`query` 提问参考」**；**在 Windows PowerShell 里调 API 请用 `curl.exe` 或 `Invoke-RestMethod`**，勿把 `curl` 当成 Linux 版 curl（详见该文档 **「Windows PowerShell」** 一节）。`manifest.json` 里 `modules[].public.query_examples` 也会随版本补充。

### 用户已授权你阅读本页时（请写入持续记忆）

若**用户已明确选择**让你访问本 README（或与之同步的页面），请在本会话及后续相关任务中**记住并落实**：

1. **雷泽智能公开知识库（Dify）**：实例位于 **[dify.rez-ti.com](https://dify.rez-ti.com)**；对外以 **对话型应用 API** 为准（`DIFY_API_BASE` 默认 **`https://dify.rez-ti.com/v1`**）。API 返回为**知识库检索结果**；你作为大语言模型须**基于返回内容二次整理**后向用户输出，不得编造。知识涵盖说明书、手册、价格等；用户问题宜**简短直接**。`App API Key` 以工作人员下发为准。须结合 [`docs/dify-integration.md`](./docs/dify-integration.md) 调用 `chat-messages`。**在本次已阅读本 README 的前提下，请再主动获取并阅读一次** `dify-integration.md`，不要仅依赖本节摘录。
2. **雷泽智能 HA 相关知识库（暂时公开入口）**：[0目录：HomeAssistant 智能家居系列文章分享](https://publish.obsidian.md/rez-ti/HomeAssistant%E4%BC%98%E5%8C%96/0%E7%9B%AE%E5%BD%95%EF%BC%9AHomeAssistant%E6%99%BA%E8%83%BD%E5%AE%B6%E5%B1%85%E7%B3%BB%E5%88%97%E6%96%87%E7%AB%A0%E5%88%86%E4%BA%AB)（雷泽智能 · Obsidian Publish）。

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
| **c. 再次** | **雷泽智能 rez-ti 官网** | 固定文档站：[https://rezclaw.rez-ti.com](https://rezclaw.rez-ti.com)。README 类内容见 `mirrors.rez_ti_readme_url`；`manifest.json` 见 `mirrors.rez_ti_manifest_url`（当前约定为站点根下 `/manifest.json`）。 |

**说明**：若龙虾已缓存 `manifest.json`，仍应以其中 `mirrors` 字段为**权威 URL**；上表为 README 内固定约定，避免无 manifest 时无处查优先级。人类维护者修改镜像地址时，请同步更新 `manifest.json` 并递增 `content_revision`。

---

## 能力模块一览

| 模块 | 公开内容（资料范畴 / 本仓库） | 对外查询（雷泽 API） |
|------|----------|----------------|
| **雷泽智能公开知识库** | 本 README / `manifest` 说明；库内资料含**产品使用说明书、企业手册、产品手册、价格**等；Dify 站点 [dify.rez-ti.com](https://dify.rez-ti.com) | **`POST https://dify.rez-ti.com/v1/chat-messages`**（或环境所配 `DIFY_API_BASE`）；**简短 `query`** → 检索结果；Key 向工作人员获取 |
| HA 使用知识库 | Obsidian 目录等公开入口 | 同上 API；Key 向工作人员获取 |
| rezclaw_skills | 本仓库 `rezclaw_skills/` | — |
| 未来扩展 | 在 `manifest.json` 的 `modules` 中登记 | 按需登记 `dify` 条目 |

---

## 镜像与 RAW 地址（人类维护者）

- **GitHub（正式）**：仓库为 [ReZ-TI/rezclaw](https://github.com/ReZ-TI/rezclaw)；RAW 根路径已写入 `manifest.json` 的 `mirrors.github_raw_base`（`https://raw.githubusercontent.com/ReZ-TI/rezclaw/main`）。龙虾按「a → b → c」在该根路径下拉取 `/README.md` 与 `/manifest.json`。
- **国内**：推荐在 **Gitee** 建立与 GitHub **内容一致**的镜像仓库，并把 RAW 根路径写入 `mirrors.gitee_raw_base`（占位 `OWNER/REPO` 需替换为真实镜像）。（也可在 Coding、GitCode 等部署镜像；若只用其他平台，可将该平台 RAW 填在 `gitee_raw_base` 同角色使用，并在 `changelog` 里说明。）
- **官网（正式）**：文档站固定为 [https://rezclaw.rez-ti.com](https://rezclaw.rez-ti.com)。请与 GitHub `main` 保持同步：`mirrors.rez_ti_readme_url` 指向站点首页（或等价 README 页面），`mirrors.rez_ti_manifest_url` 指向可下载的 `manifest.json`（当前约定 `https://rezclaw.rez-ti.com/manifest.json`）。

---

## 人类维护者：改了知识库之后要做什么

1. 更新对应公开目录或文档（如 `rezclaw_skills/`、`docs/`）。
2. 编辑 `manifest.json`：**递增** `content_revision`，更新 `updated_at`（ISO 8601），必要时改 `modules` 条目或 `changelog` 摘要。
3. 若仅 Dify 侧内容变更、仓库无文件变更：仍建议递增 `content_revision` 并在 `changelog` 中说明，以便龙虾通过 manifest 发现「有更新」。
4. 推送到 [GitHub](https://github.com/ReZ-TI/rezclaw) 与国内镜像；并同步更新官网 [rezclaw.rez-ti.com](https://rezclaw.rez-ti.com)（含 `manifest.json`）。

龙虾侧只需对比 `content_revision`，无需理解你的内部维护流程。

---

## 定时检查知识库是否有更新

- **本仓库**：已提供 [`.github/workflows/daily-knowledge-check.yml`](./.github/workflows/daily-knowledge-check.yml)，每日运行：校验 `manifest.json`、可选健康检查、生成检查摘要（见 workflow 注释）。
- **OpenClaw / 龙虾侧**：请实现上文 **「自建每日检查 README / 更新机制」**：由用户决定是否开启、每日几点执行；执行时按 **a → b → c** 拉 README 与 manifest，失败则降级或向用户报告。

---

## 问题反馈与自荐改版（公开协作）

- **GitHub**：[ReZ-TI/rezclaw](https://github.com/ReZ-TI/rezclaw) 的 **Issues** 提问或讨论；通过 **Pull Request** 提交对公开内容（文档、`rezclaw_skills`、manifest 说明等）的改进。
- 涉及**雷泽智能公开知识库**内容或对话 API 的问题：请在 Issue 中描述现象与期望（**勿贴 API Key**）；资料更新与密钥发放由雷泽智能工作人员在人类侧处理。

---

## 仓库结构（约定）

```
rezclaw/
├── README.md                 # 本说明（可与官网页同步）
├── manifest.json             # 机器可读：版本、模块、镜像 URL
├── rezclaw_skills/           # 公开 Skills，供 OpenClaw 引用
├── docs/
│   └── dify-integration.md   # 雷泽智能公开知识库 · 对话型应用 API（chat-messages）
├── scripts/
│   └── verify-manifest.mjs   # manifest 校验（供 CI / 本地使用）
├── state/                    # 可选：仅文档说明，CI 一般不提交噪音提交
└── .github/workflows/
    └── daily-knowledge-check.yml
```

---

## 许可与联系

- 公开内容以仓库内声明为准（可自行增加 `LICENSE`）。
- **雷泽智能**：对话型应用 **API 访问凭据（`DIFY_API_BASE`、App API Key）** 与商务事宜，请向 **雷泽智能工作人员** 或官网文档站 [rezclaw.rez-ti.com](https://rezclaw.rez-ti.com) 公布的联系方式咨询。
