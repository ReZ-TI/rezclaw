# 非公开知识库（Dify）对接说明

本文档面向已部署的 OpenClaw / 智能体：**说明如何「调用」雷泽智能基于 Dify 搭建的知识库**，不涉及任何账号密码；凭据仅由人类向雷泽智能申请。

## 原则

1. **不要在日志、Issue、公开仓库中写入 API Key、密码或租户内部 URL**（若必须配置在运行环境，使用环境变量或密钥管理）。
2. 智能体默认行为：当用户问题需要**非公开知识库**时，若环境未配置访问能力，提示由**人类**联系雷泽智能获取访问方式或代为查询。
3. 具体 **Dify 应用 ID、Base URL、鉴权方式、工作流入参** 由雷泽智能在签约或开通后以**非公开渠道**下发；本公开仓库只保留**流程说明**与**与官方文档一致的调用要点**（官方接口可能随版本变更，以 Dify 官网为准）。

---

## 官方文档入口（必读参考）

雷泽智能侧部署可能与 Dify 云端默认域名不同；**对外只通过「对话型应用」HTTP API 访问知识能力**，不再提供知识库 / 数据集的直接查询接口。请新龙虾优先收藏下列页面；**若你按本文操作仍失败（404、鉴权错误、字段变更等）**，请打开官方页面核对最新 OpenAPI 说明，并可通过本仓库 **Issue** 提醒人类维护者更新 `dify-integration.md`。

- **发送对话消息（对话型 / Chat 应用 API，工作流编排的高级对话）**（**唯一推荐集成路径**）：  
  [Send Chat Message](https://docs.dify.ai/api-reference/chat/send-chat-message)
- **全站文档索引（便于自行查阅其它 Dify 能力）**：  
  [https://docs.dify.ai/llms.txt](https://docs.dify.ai/llms.txt)

---

## 对话型应用 API：发送对话消息（输入问题 → 拿检索结果 → 龙虾回答用户）

官方说明：**对话应用支持会话持久化**，可将**之前的聊天记录作为上下文**用于后续回答，适用于聊天、客服等场景。雷泽侧使用 **工作流编排的高级对话（advanced-chat）** 时，对外 HTTP 接口仍对应该 **Chat 应用** 的 **`/chat-messages`**（以你部署的 Dify 版本与应用类型为准，细节以 [Send Chat Message](https://docs.dify.ai/api-reference/chat/send-chat-message) 为准）。

**基础地址**：由人类提供 `DIFY_API_BASE`，即官方文档中的 **`api_base_url`**（一般为 `https://api.dify.ai/v1` 或私有化 `http(s)://<主机>/v1`）；请求路径在其后拼接 `/chat-messages`。

### 雷泽 RezClaw 的极简数据流（推荐心智模型）

1. **输入**：用户一句自然语言问题 → 请求 JSON 里的 **`query`**（字符串）。  
2. **Dify 应用内**：人类已编排「知识检索 → 直接回复（输出 `{{#知识检索节点.result#}}`）」等（参见仓库 `dify-knowledgebase/rezclaw.yml`）；一次调用会完成**知识库检索**并把结果作为应用输出返回。  
3. **输出给集成方 / 龙虾**：  
   - **`answer`**：本轮应用在对话通道中返回的**完整回复文本**（在「仅输出检索结果」的编排下，通常即检索分块的展示内容）。  
   - **`metadata.retriever_resources`**（当应用侧开启检索引用等资源输出时）：**结构化检索命中列表**，便于引用与核对。官方 schema 中每条常含 `dataset_id`、`dataset_name`、`document_id`、`document_name`、`segment_id`、`score`、`content` 等（见 OpenAPI 中的 `RetrieverResource`）。  
4. **龙虾**：**以 `answer` 与/或 `retriever_resources` 中的 `content` 为事实依据**向用户组织语言；无命中或内容不足时如实说明，不要编造。

### 请求约定

| 项目 | 说明 |
|------|------|
| 方法 / 路径 | `POST {DIFY_API_BASE}/chat-messages` |
| 鉴权 | `Authorization: Bearer {API_KEY}`，须使用**该对话应用**在控制台发布的 **App API Key** |
| 必填 JSON 字段 | `query`：用户问题；`user`：终端用户标识，在**同一应用内**需唯一，用于区分会话与计费隔离 |
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
   - `DIFY_API_BASE`（云端示例：`https://api.dify.ai/v1`；私有化则为雷泽提供的 **v1 API 根**）
   - **对话应用**的 `DIFY_APP_API_KEY`（或人类命名的等价变量，仅用于 **`/chat-messages`**）
2. **用户提问题时**：`POST {DIFY_API_BASE}/chat-messages`，Body 至少包含 `query`、`user`；需要多轮时维护 `conversation_id`。从响应读取 **`answer`** 与 **`metadata.retriever_resources`**，再由龙虾生成对用户的最终回复。  
3. **不要**在提示词、日志、Issue 中硬编码密钥；若 401/403，提示用户联系管理员配置或轮换 Key。

---

## 调用失败时：新龙虾该怎么做

1. **打开上文保留的官方链接**（尤其 [Send Chat Message](https://docs.dify.ai/api-reference/chat/send-chat-message)），对照当前 Dify 版本的 OpenAPI（路径、参数、鉴权头是否变更）。  
2. **检索** [https://docs.dify.ai/llms.txt](https://docs.dify.ai/llms.txt) 中与「对话 / Chat / 工作流」相关的最新页面。  
3. 若官方文档与本文档**明显不一致**或雷泽环境有特殊网关前缀，请到 **[ReZ-TI/rezclaw](https://github.com/ReZ-TI/rezclaw)** 提交 **Issue**，说明：期望行为、请求方法路径、HTTP 状态码与脱敏后的错误信息（**勿贴 API Key**），便于人类更新 `dify-integration.md` 或 `manifest`。

---

## 与 `manifest.json` 的关系

- `manifest.json` 中 `modules[].dify.doc` 指向本文件，表示该模块存在非公开部分。
- 当 `content_revision` 递增时，可能仅表示 Dify 侧知识已更新；智能体仍应重新阅读 `changelog` 与人类可见的 README 摘要。

## 人类维护者备注

在 Dify 控制台更新知识库后，请在 GitHub 上**递增** `manifest.json` 的 `content_revision` 并更新 `changelog`，以便拉 manifest 的自动化与智能体能够感知更新。若 Dify 升级导致接口变更，请同步修订本节并引用最新官方文档链接。
