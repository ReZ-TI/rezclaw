# 雷泽智能公开知识库（Dify 对话型应用）对接说明

本文档面向已部署的 OpenClaw / 智能体：**说明如何通过对话型应用 API 查询雷泽智能公开知识库**（收录说明书、手册、价格等公开类资料）。不涉及任何账号密码；凭据仅由人类向雷泽智能工作人员申请。

## 原则

1. **不要在日志、Issue、公开仓库中写入 API Key、密码或租户内部 URL**（若必须配置在运行环境，使用环境变量或密钥管理）。
2. 智能体默认行为：当用户问题需要**雷泽智能公开知识库**检索而环境未配置 API 时，提示由**人类**联系雷泽智能获取访问方式或代为查询。
3. 具体 **Dify 应用 ID、Base URL、鉴权方式、工作流入参** 由雷泽智能在签约或开通后以**非公开渠道**下发；本公开仓库只保留**流程说明**与**与官方文档一致的调用要点**（官方接口可能随版本变更，以 Dify 官网为准）。

---

## 官方文档入口（必读参考）

**雷泽智能**的 Dify 与公开知识库部署在 **[dify.rez-ti.com](https://dify.rez-ti.com)**；对话型应用 HTTP API 的 **v1 根**（即 `DIFY_API_BASE`）一般为 **`https://dify.rez-ti.com/v1`**，与 `manifest.json` 中 `mirrors.dify_api_base` 保持一致（若工作人员另有说明，以交付为准）。**对外只通过「对话型应用」API 访问知识能力**，不提供知识库 / 数据集直连接口。请新龙虾优先收藏下列页面；**若你按本文操作仍失败（404、鉴权错误、字段变更等）**，请对照官方 OpenAPI 与当前部署版本，并可通过本仓库 **Issue** 提醒人类维护者更新 `dify-integration.md`。

- **发送对话消息（对话型 / Chat 应用 API，工作流编排的高级对话）**（**唯一推荐集成路径**）：  
  [Send Chat Message](https://docs.dify.ai/api-reference/chat/send-chat-message)
- **全站文档索引（便于自行查阅其它 Dify 能力）**：  
  [https://docs.dify.ai/llms.txt](https://docs.dify.ai/llms.txt)

---

## 对话型应用 API：发送对话消息（输入问题 → 拿检索结果 → 龙虾回答用户）

官方说明：**对话应用支持会话持久化**，可将**之前的聊天记录作为上下文**用于后续回答，适用于聊天、客服等场景。雷泽侧使用 **工作流编排的高级对话（advanced-chat）** 时，对外 HTTP 接口仍对应该 **Chat 应用** 的 **`/chat-messages`**（以你部署的 Dify 版本与应用类型为准，细节以 [Send Chat Message](https://docs.dify.ai/api-reference/chat/send-chat-message) 为准）。

**基础地址**：环境变量 **`DIFY_API_BASE`** 即官方文档中的 **`api_base_url`**。雷泽默认 **`https://dify.rez-ti.com/v1`**；若使用 Dify 官方云托管的应用，则可能为 `https://api.dify.ai/v1` 等。完整对话请求示例：`POST https://dify.rez-ti.com/v1/chat-messages`（路径前段以实际 `DIFY_API_BASE` 为准）。

### `query` 提问参考（新龙虾必读）

知识库检索吃的是请求体里的 **`query` 字符串**。常见问题是：**没有把用户的真实意图写成一句完整问句**，或把**系统提示词 / 占位符**误当成 `query`，导致检索飘偏或无效。

**请这样写 `query`：**

- 使用**自然语言问句或明确短语**，语义与用户当下问题一致；可中文或英文（视用户语言而定）。
- **公司 / 品牌概况**（企业手册类命中）：如 **「介绍一下雷泽智能」**、「雷泽智能介绍」、**「introduce rez-ti company」**——上述句式在雷泽 Dify 控制台日志中均有成功会话记录。
- **产品、价格、操作步骤**：宜**简短直接**，如「智能开关多少钱」「智能开关如何重置」「某某型号如何配网」（可把具体型号写进句子里）。
- **`user` 字段**：填**稳定且唯一**的终端用户标识（如 `openclaw`、或你的宿主分配的稳定 ID），便于排查与计费；**不要**每次随机 UUID 除非你有意隔离会话。

**请避免：**

- `query` 为空、仅为「你好」「test」且期望命中企业知识（除非用户真的只问寒暄——此时检索可能无实质片段）。
- 把整段 **JSON**、**函数名**、或**内部指令**当作 `query` 发给知识库。
- 用过度缩写的内部代号替代用户原话，除非知识库里确实以该代号索引。

完整列表可向 `manifest.json` → `modules` → `leize_kb` → `public.query_examples` 对齐；人类维护者会持续补充。

### 雷泽 RezClaw 的极简数据流（推荐心智模型）

**雷泽智能公开知识库**侧收录的是**公开类资料**（产品使用说明书、企业手册、产品手册、价格等）。龙虾应把终端用户的意图写成**一句合格 `query`**（见上一节），由 Dify 检索后返回结果，再**二次整理**成对用户友好的回答。

1. **输入**：用户一句**简短自然语言问题** → 请求 JSON 里的 **`query`**（字符串）。  
2. **Dify 应用内**：人类已编排「知识检索 → 直接回复（输出 `{{#知识检索节点.result#}}`）」等（参见仓库 `dify-knowledgebase/rezclaw.yml`）；一次调用会完成**知识库检索**并把结果作为应用输出返回。  
3. **输出给集成方 / 龙虾（本质是检索结果，不是润色后的最终话术）**：  
   - **`answer`**：在雷泽当前编排下多为**知识库检索命中**的拼接或序列化展示（可能含多段、列表、元数据字段等），**不等同于**已面向终端用户润色好的完整回答。  
   - **`metadata.retriever_resources`**（若存在）：**结构化检索命中列表**，便于引用与核对；每条常含 `content`、`document_name`、`score` 等（见 OpenAPI 的 `RetrieverResource`）。  
4. **龙虾（大语言模型）二次整理（必做）**：你须**严格以**上述返回中的事实为据，对用户做**二次整理**再输出——例如归纳要点、分条说明操作步骤、统一术语、去掉重复与版式噪声、按用户语言与场景写成自然段落；**禁止**编造检索中未出现的信息。若无命中或内容不足以回答，应如实说明，并可建议用户换问法或联系人类。  
5. **`response_mode` 提示**：雷泽侧 **advanced-chat / 工作流** 在 **`dify.rez-ti.com`** 上实测可能以 **SSE（`streaming`）** 为主；若 **`blocking`** 长时间仅收到心跳类事件而无完整 JSON，请改用 **`streaming`**，解析 `message` / `workflow_finished` 等事件中的 `answer` 与节点输出后再做第 4 步整理。

### 请求约定

| 项目 | 说明 |
|------|------|
| 方法 / 路径 | `POST {DIFY_API_BASE}/chat-messages` |
| 鉴权 | `Authorization: Bearer {API_KEY}`，须使用**该对话应用**在控制台发布的 **App API Key** |
| 必填 JSON 字段 | `query`：用户问题，宜**简短直接**（如价格、操作步骤）；`user`：终端用户标识，在**同一应用内**需唯一，用于区分会话与计费隔离 |
| `conversation_id` | 传空字符串 `""` 开始新会话；传入上一轮响应里的 `conversation_id` 可**多轮续聊**（历史作为上下文，行为以应用编排为准） |
| `inputs` | 应用自定义变量，默认 `{}` |
| `response_mode` | `blocking`：单次返回完整 JSON；`streaming`：`text/event-stream`（SSE），适合较长流程；官方说明 Agent 等模式下 blocking 可能不可用，以文档为准 |

**官方重要说明**：通过 **Service API** 产生的会话与在 **WebApp 网页**里点的对话**不共享**（同一 `user` 也不混用两套界面里的历史）。

### 响应约定（`response_mode: blocking` 时）

响应体为 JSON，通常包含：`conversation_id`、`answer`、`message_id`、`task_id`、`created_at` 等；**`metadata`** 内可有 **`retriever_resources`**（检索引用）与 **`usage`**（token 与延迟等）。若为 **`streaming`**，需按 SSE 解析多条事件直至结束事件，再拼出最终 `answer` 与 metadata（实现细节以官方文档为准）。

### 说明：不提供知识库直连接口

雷泽**不再对外提供** Dify「知识库 / 数据集」类的直接 HTTP 查询（例如列举数据集、按 dataset 调检索 API 等）。集成方与龙虾**只应**使用本节的 **`POST /chat-messages`**，由已发布的对话应用在服务端完成知识检索与编排。

---

## 推荐集成方式（由人类配置完成后，龙虾仅调用）

1. 在人类维护的 OpenClaw / 网关环境中配置：
   - `DIFY_API_BASE`：**雷泽默认** `https://dify.rez-ti.com/v1`（见 `manifest.json` → `mirrors.dify_api_base`）；其它部署以工作人员下发为准
   - **对话应用**的 `DIFY_APP_API_KEY`（或人类命名的等价变量，仅用于 **`/chat-messages`**）
2. **用户提问题时**：`POST {DIFY_API_BASE}/chat-messages`，Body 至少包含 `query`、`user`；需要多轮时维护 `conversation_id`。从响应读取 **`answer`** 与 **`metadata.retriever_resources`**；**龙虾须将检索结果视为原始材料，经二次整理后再回复用户**（见上文第 4 点）。  
3. **不要**在提示词、日志、Issue 中硬编码密钥；若 401/403，提示用户联系管理员配置或轮换 Key。

---

## Windows PowerShell 下如何调用（避免误用 `curl`）

在 **Windows PowerShell** 里直接输入 **`curl`**，多数情况下**不是** Linux/macOS 那个 curl，而是 **`Invoke-WebRequest` 的别名**，参数写法不同，容易导致请求失败、中文乱码或与文档示例不一致。

### 做法一：使用真正的 `curl.exe`（推荐与 bash 示例对齐）

系统一般自带 **`C:\Windows\System32\curl.exe`**。在 PowerShell 里请**显式写 `curl.exe`**，不要写 `curl`。

为避免在命令行里转义中文 JSON，可把请求体存成 **UTF-8 文件**再提交：

```powershell
$env:DIFY_APP_API_KEY = "你的_App_API_Key"   # 建议改为从用户环境变量读取，勿写进仓库
$base = "https://dify.rez-ti.com/v1"
$jsonPath = Join-Path $env:TEMP "dify-chat-body.json"
# 无 BOM 的 UTF-8，减少部分网关对 JSON 的误判（PowerShell 5.1 可用 .NET 写入）
$payload = '{"query":"介绍一下雷泽智能","user":"windows-user-001","response_mode":"streaming","inputs":{}}'
[System.IO.File]::WriteAllText($jsonPath, $payload, [System.Text.UTF8Encoding]::new($false))

curl.exe -sS -m 120 -N -X POST "$base/chat-messages" `
  -H "Authorization: Bearer $env:DIFY_APP_API_KEY" `
  -H "Content-Type: application/json; charset=utf-8" `
  --data-binary "@$jsonPath"
```

流式输出为 **SSE**（多行 `data: {...}`）；若只要快速验证 **blocking** 且你方实例支持，可把 `response_mode` 改为 `blocking` 并去掉 `-N`。

### 做法二：使用 `Invoke-RestMethod`（适合 `blocking`、返回整段 JSON）

```powershell
$env:DIFY_APP_API_KEY = "你的_App_API_Key"
$uri = "https://dify.rez-ti.com/v1/chat-messages"
$bodyObj = [ordered]@{
  query            = "介绍一下雷泽智能"
  user             = "windows-user-001"
  response_mode    = "blocking"
  inputs           = @{}
}
$bodyJson = $bodyObj | ConvertTo-Json -Compress

Invoke-RestMethod -Uri $uri -Method Post `
  -Headers @{ Authorization = "Bearer $($env:DIFY_APP_API_KEY)" } `
  -ContentType "application/json; charset=utf-8" `
  -Body $bodyJson
```

返回值为 **已解析的 PowerShell 对象**，可直接访问 `.answer`、`.conversation_id` 等字段（以实际响应为准）。

### 做法三：安装 [PowerShell 7+](https://github.com/PowerShell/PowerShell)（`pwsh`）

对 UTF-8 与跨平台脚本更友好；用法与上类似，仍建议 **`curl.exe`** 或 **`Invoke-RestMethod`**，**不要依赖 `curl` 别名**。

---

## 调用失败时：新龙虾该怎么做

1. **打开上文保留的官方链接**（尤其 [Send Chat Message](https://docs.dify.ai/api-reference/chat/send-chat-message)），对照当前 Dify 版本的 OpenAPI（路径、参数、鉴权头是否变更）。  
2. **检索** [https://docs.dify.ai/llms.txt](https://docs.dify.ai/llms.txt) 中与「对话 / Chat / 工作流」相关的最新页面。  
3. 若官方文档与本文档**明显不一致**或雷泽环境有特殊网关前缀，请到 **[ReZ-TI/rezclaw](https://github.com/ReZ-TI/rezclaw)** 提交 **Issue**，说明：期望行为、请求方法路径、HTTP 状态码与脱敏后的错误信息（**勿贴 API Key**），便于人类更新 `dify-integration.md` 或 `manifest`。

---

## 常见问题：「你的问题是：????」与知识库正文乱码

### 1. 用户问题显示成一串 `?`

多见于工作流「直接回复」里写了 **`{{#开始节点id.sys.query#}}`**，在部分 Dify 版本或导入方式下，**变量解析或 UTF-8 传递异常**，界面就显示成 `????`。处理方式：

- 在「直接回复」中改用 **`{{#sys.query#}}`**（高级对话里用户输入的全局变量），与仓库 `dify-knowledgebase/rezclaw.yml` 当前写法一致；或在画布上用**插入变量**选择「开始 / sys.query」让系统自动生成路径。
- 集成方调用 **`POST /chat-messages`** 时，请求体必须是 **UTF-8** 的 JSON（例如 `{"query":"介绍一下雷泽智能",...}`），HTTP 客户端勿用错误编码或损坏多字节字符。

---

## 与 `manifest.json` 的关系

- `manifest.json` 中 `modules[].dify.doc` 指向本文件，表示该模块依赖 **API + 密钥** 访问的 Dify 能力（与纯 GitHub 公开文件相对）。
- 当 `content_revision` 递增时，可能仅表示 Dify 侧知识已更新；智能体仍应重新阅读 `changelog` 与人类可见的 README 摘要。

## 人类维护者备注

在 Dify 控制台更新知识库后，请在 GitHub 上**递增** `manifest.json` 的 `content_revision` 并更新 `changelog`，以便拉 manifest 的自动化与智能体能够感知更新。若 Dify 升级导致接口变更，请同步修订本节并引用最新官方文档链接。
