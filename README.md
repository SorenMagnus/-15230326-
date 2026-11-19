# BEYOND THE GROUND — Joby Aviation S4 eVTOL 深度工程技术与商业可行性研究

《飞行汽车技术基础》课程调研项目 · 基于 **React + TypeScript + Three.js (WebGL) + Tailwind CSS** 构建的交互式航空工程研究平台。

---

## 一、研究对象与核心内容框架

本项目聚焦全球适航审定与工程验证进展最领先的全倾转六旋翼 eVTOL——**Joby Aviation S4 (JAS4-1)**，围绕以下 9 个章节展开全方位深度剖析：

- **Chapter 00 — The Future Is Vertical**：研究问题界定与数据可信度分级体系（Confirmed Data / Manufacturer Claims / Estimates / Assumptions）。
- **Chapter 01 — Meet The Aircraft**：全尺寸交互三维数字孪生机库，支持四阶段飞行模态切换（垂直起降 / 倾转过渡 / 固定翼巡航 / 减速进近）、**CAD 蓝图机械拆解**、**GLSL 气动流场 CFD 着色器**及 6 大子系统热点检查器。
- **Chapter 02 — Engineering The Impossible**：全倾转构型气动权衡、45.2 dBA 声学控制机理（NASA 实测）、288 Wh/kg 航空软包电芯四重交叉母线拓扑及电动布雷盖航程约束分析。
- **Chapter 03 — The Physics Of Flight**：交互式飞行物理实验室（基于一维动量理论与巡航阻力模型），支持实时调节起飞总重、电池能量、推进效率、目标航距与法规备降裕度，明确区分教学模型与 FAA 局方审定性能。
- **Chapter 04 — Autonomy & Safety**：四层级多余度安全与 FMEA 失效容错架构图，严格区分“已部署试飞”“FAA 适航审定中”与“远期自主规划”。
- **Chapter 05 — The World From Above**：三维都市低空走廊实时航迹仿真（纽约曼哈顿-JFK、上海 PVG-虹桥、迪拜 DXB-棕榈岛），计入首末公里接驳、安检登机与过站快充（GEACS）约束的真实门到门时间对比。
- **Chapter 06 — The Business Reality**：单位经济效益（CASM）与盈亏平衡敏感性计算器。
- **Chapter 07 — The Competitive Landscape**：Joby S4、Archer Midnight、亿航 EH216-S、峰飞盛世龙、Lilium Jet 五大代表性构型横评与多轴工程雷达图。
- **Chapter 08 — The Verdict & References**：针对技术可行性、关键瓶颈、商业闭环、风险与未来 5–10 年突破方向的六维研判结论，附 15 项可溯源权威文献索引。

---

## 二、技术栈与项目结构

- **前端框架**：React 19 + TypeScript + Vite
- **3D 图形与动效引擎**：Three.js + GSAP ScrollTrigger（程序化多子系统 PBR 实体模型、定制航空机库与黄金时刻 HDRI 环境贴图、实景航拍底片合成、可收放前三点起落架、自定义 GLSL CFD 压力流场着色器、`EdgesGeometry` CAD 蓝图线框、Catmull-Rom 电影运镜样条、Software-WebGL 自适应渲染保护）
- **核心目录**：
  - `index.html`：项目根目录入口文件（已通过 `vite.config.ts` 配置相对路径 `base: './'`，兼容 GitHub Pages 子路径部署）
  - `src/components/CityFlightCinemaSection.tsx`：滚轴驱动 4 镜城市飞行叙事试点与自由环绕接管场景
  - `src/three/jobyS4Model.ts` & `src/three/studioEnv.ts`：Joby S4 程序化三维数字孪生与定制 HDRI 光照环境
  - `src/components/AircraftShowcase3D.tsx`：实景工业机库三维交互实验室与可折叠底部控制台
  - `src/components/CityCorridor3D.tsx`：三维城市低空航线仿真场景
  - `src/utils/flightPhysics.ts` & `src/utils/cinemaTimeline.ts`：航空物理、UAM 单位经济与电影时间轴纯函数计算引擎（含 9 项 `node:test` 单元测试）
  - `src/data/researchData.ts`：全部工程规格、竞品参数、航线模型与 15 项参考文献数据集
  - `.github/workflows/deploy.yml`：GitHub Pages 自动化构建部署工作流（支持 `main` / `master` 分支）

---

## 三、本地运行与测试

```bash
# 1. 安装依赖
npm install

# 2. 运行物理与电影时间轴单元测试 (9/9)
npx --yes tsx --test src/utils/flightPhysics.test.ts src/utils/cinemaTimeline.test.ts

# 3. 启动开发服务器 (http://localhost:3000)
npm run dev

# 4. TypeScript 类型检查与生产构建
npm run lint
npm run build
```

---

## 四、课程作业 GitHub Pages 部署说明

仓库已配置 `vite.config.ts` 中的相对路径 `base: './'` 与 `.github/workflows/deploy.yml`，支持以下两种零报错部署方式：

### 方式 A（推荐）：推送完整源码 + GitHub Actions 自动构建
1. 在本人 GitHub 账号下新建 **Public** 仓库（注意：GitHub 仓库名不支持中文，建议命名为 `15230326-zhangbei-flying-car-hw1`，仓库描述里写「15230326张北第一次飞行汽车作业」）。
2. 将本项目全部代码推送至 `main` 分支（或直接通过 AI Studio 顶部「Save to GitHub」导出）。
3. 打开仓库 **Settings → Pages → Build and deployment**，将 **Source** 选为 **GitHub Actions**。
4. 等待 Actions 绿勾完成后，访问 `https://<你的用户名>.github.io/<仓库名>/` 确认打开正常，再将该链接填入课程飞书作业收集表。

### 方式 B（直接满足“根目录静态 index.html”）：直接上传 `dist/` 编译产物
1. 本地或云端执行 `npm run build`，将生成的 `dist/` 目录内的全部文件（`index.html`、`assets/`、`src/`）直接放到仓库根目录并推送。
2. 在仓库 **Settings → Pages** 中将 **Source** 选为 **Deploy from a branch** → `main` / `/ (root)`，保存后即可直接访问。
