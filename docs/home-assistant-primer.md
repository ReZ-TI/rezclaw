# Home Assistant（HA）初步认知

本文面向接入 RezClaw 的**新龙虾**：建立与 Home Assistant 交互的**最小正确心智模型**。**阅读优先级高于** [Obsidian HA 系列目录](https://publish.obsidian.md/rez-ti/HomeAssistant%E4%BC%98%E5%8C%96/0%E7%9B%AE%E5%BD%95%EF%BC%9AHomeAssistant%E6%99%BA%E8%83%BD%E5%AE%B6%E5%B1%85%E7%B3%BB%E5%88%97%E6%96%87%E7%AB%A0%E5%88%86%E4%BA%AB)（后者为深度与场景扩展）。实际 **URL、Token、实体列表** 以用户环境与人类配置为准；下表中带「示例」字样的实体仅作培训/展陈环境参考。

---

## 1. 连接与凭据

| 项目 | 说明 |
|------|------|
| 访问地址 | 常见为 `http://homeassistant.local:8123` 或用户提供的 **HTTPS / IP**；环境变量建议 `HA_URL`（**无**末尾斜杠） |
| 鉴权 | **Long-Lived Access Token**（用户 Profile → Long-Lived Access Tokens）；环境变量建议 `HA_TOKEN` 或 `HA_LONG_LIVED_TOKEN`，**禁止**写入仓库、Issue、提示词明文 |
| API 根 | `{HA_URL}/api/...` |

调用前确认用户已授权你访问其 HA，且 Token 已由人类注入运行环境。

---

## 2. Entity ID 与区域（概念）

- **区域名与英文 ID 的对应关系（重要）**：客户在系统里**手动输入中文区域名**（如「客厅」）时，**系统侧**在 Area / 实体 ID 里采用的英文一般为 **汉语拼音、小写、音节之间用下划线**（如 `ke_ting`），**不是** `living_room`、`dining_room` 这类英文单词。若凭英文去猜会**对不上实例**；**一律以** `Developer tools → States` 或用户提供的列表为准。
- **命名习惯（示例）**：`<domain>.<area_pinyin>_<device_pinyin>`，例如 `light.ke_ting_zhu_deng`（客厅主灯）（**非强制标准**，以实例为准）。
- **区域（Area）**：用于人类规划空间；下表为**家庭常见分区**：左列为中文称呼，右列为与上规则一致的**拼音式英文 ID 示例**（9 处；实际以用户 HA 为准）。

| 中文名称（示例） | 英文 Area ID（示例，拼音式） | 用途（示例） |
|------------------|------------------------------|-------------|
| 客厅 | `ke_ting` | 起居、观影 |
| 餐厅 | `can_ting` | 用餐 |
| 厨房 | `chu_fang` | 烹饪 |
| 主卧 | `zhu_wo` | 睡眠 |
| 次卧 | `ci_wo` | 睡眠、客房（亦可为「儿童房」等，对应 ID 以实例为准，如 `er_tong_fang`） |
| 卫生间 | `wei_sheng_jian` | 洗浴（多卫时常见 `zhu_wei`、`ci_wei` 等，以实例为准） |
| 阳台 | `yang_tai` | 晾晒、绿植 |
| 书房 | `shu_fang` | 阅读、居家办公 |
| 玄关 | `xuan_guan` | 入户、鞋柜 |

若另有 **`HA_AREAS.md`** 或用户自定义区域列表，**以该列表为准**。

---

## 3. 已知设备示例（培训环境，非通用清单）

以下仅说明**曾用于培训的实体形态**；**不要**假设任意用户实例均存在相同 ID。操作前应用 **`GET /api/states`** 或用户提供的列表核对。

**色温墙灯（示例，5 盏，色温档位不同）：**

- `light.lemesh_wy0c15_aba1_light` → 约 2700K  
- `light.lemesh_wy0c15_db42_light` → 约 3000K  
- `light.lemesh_wy0c15_623a_light` → 约 3500K  
- `light.lemesh_wy0c15_7f16_light` → 约 4000K  
- `light.lemesh_wy0c15_dc21_light` → 约 5000K  

**其它（示例名，待用户实例确认）：**

- `light.extendedcolorlight`、`light.extendedcolorlight_2`（RGB / 扩展色）  
- `light.dimmablelight`（调光）  

---

## 4. 服务调用模式（推荐）

### 4.1 开灯 / 关灯（`light.turn_on` / `light.turn_off`）

使用 **REST API `POST /api/services/<domain>/<service>`**，**不要**用错误路径（见第 6 节）。

单实体：

```bash
curl -X POST "${HA_URL}/api/services/light/turn_on" \
  -H "Authorization: Bearer ${HA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "light.showcase_main"}'
```

多实体（**显式列表**；是否支持通配符取决于 HA 版本与模板，**默认请列出具体 `entity_id`**）：

```bash
curl -X POST "${HA_URL}/api/services/light/turn_off" \
  -H "Authorization: Bearer ${HA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"entity_id": ["light.showcase_main","light.lemesh_wy0c15_aba1_light"]}'
```

### 4.2 日历：创建事件（已验证路径示例）

`POST /api/services/calendar/create_event`  

```bash
curl -X POST "${HA_URL}/api/services/calendar/create_event" \
  -H "Authorization: Bearer ${HA_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "calendar.rez_ti",
    "summary": "团队会议",
    "start_date_time": "2026-03-25T10:00:00+08:00",
    "end_date_time": "2026-03-25T11:00:00+08:00"
  }'
```

`entity_id`、`calendar.*` 以用户实例为准。

### 4.3 `event` 服务触发

`POST /api/services/event/trigger` 等在部分场景可用；**以用户 HA 版本文档与实测为准**（标记为需人类侧回归测试时可写「待验证」）。

---

## 5. 龙虾「设备记忆」原则

- **要记住**：用户**明确说过**的习惯（例如「下班」= 关展架 + 色温墙全部灯；「空调 26°C」= 个人偏好）。  
- **不要**：把**完整设备列表**或**用户未提及的能力**默认记成事实；未确认前用 `states` 或问用户。  
- **冲突时**：以**当前 HA 状态**与用户**最新口头指令**为准。

---

## 6. 易错 / 应避免的路径（示例）

以下在培训中曾出现 **4xx**，**不要**当作常规服务入口使用：

| 错误示例 | 说明 |
|----------|------|
| `POST /api/states/calendar.rez_ti` | 非创建日历事件的正确方式 |
| `POST /api/services/calendars/schedule` | 路径/服务名与标准 REST 不符 |
| 对 `/api/states` 使用错误 HTTP 方法 | 列举状态须 **GET**；误用 **POST** 等会得到 **405** |

标准参考：[Home Assistant REST API](https://developers.home-assistant.io/docs/api/rest/)。

---

## 7. 与 Dify、Obsidian 的关系

- **HA 概念、REST 习惯、易错点**：以**本文**为准优先同步。  
- **雷泽内部 HA 深度文章、场景拆解**：见 [Obsidian 目录](https://publish.obsidian.md/rez-ti/HomeAssistant%E4%BC%98%E5%8C%96/0%E7%9B%AE%E5%BD%95%EF%BC%9AHomeAssistant%E6%99%BA%E8%83%BD%E5%AE%B6%E5%B1%85%E7%B3%BB%E5%88%97%E6%96%87%E7%AB%A0%E5%88%86%E4%BA%AB)。  
- **产品手册类自然语言问答**：仍可通过 [`dify-integration.md`](./dify-integration.md) 的 **chat-messages** 检索（与 HA **控制 API** 是两条能力，勿混淆）。

---

## 8. Windows PowerShell 提示

若在 Windows 下调 `curl`，请使用 **`curl.exe`** 或 **`Invoke-RestMethod`**，避免 PowerShell 中 `curl` 别名与 bash 行为不一致；详见 [`dify-integration.md`](./dify-integration.md) 的 Windows 小节（请求形态相同，仅换调用方式）。
