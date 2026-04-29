const modes = {
  text: {
    type: "TEXT",
    title: "文本生成",
    models: [
      {
        id: "gpt55",
        name: "GPT5.5",
        provider: "OpenAI",
        tags: ["长文", "推理", "多语言"],
      },
      {
        id: "deepseek-v4",
        name: "DeepSeek V4",
        provider: "DeepSeek",
        tags: ["代码", "策略", "中文"],
      },
    ],
    presets: ["品牌短片脚本", "小红书种草文案", "产品发布稿", "提示词优化"],
    prompt:
      "为淮南传媒集团 AI 创作平台写一段 30 秒品牌短片脚本，突出文本、图片、视频、音乐音频生成，以及自动上传个人云素材库。",
    controls: [
      ["输出格式", ["品牌脚本", "营销文案", "长文章", "提示词"]],
      ["语气", ["高级克制", "科技感", "热血", "轻松"]],
      ["长度", ["短", "中", "长", "超长"]],
    ],
  },
  image: {
    type: "IMAGE",
    title: "图片生成",
    models: [
      {
        id: "gpt-image2",
        name: "gpt-image2",
        provider: "OpenAI",
        tags: ["高保真", "文字", "编辑"],
      },
      {
        id: "nanobanana",
        name: "nanobanana",
        provider: "Custom",
        tags: ["角色", "风格化", "快速"],
      },
    ],
    presets: ["电商主图", "品牌海报", "人物写真", "概念场景"],
    prompt:
      "生成一张淮南传媒集团 AI 创作工作台的产品海报，画面包含多模态资产卡片、深蓝媒体集团界面、冷白高光，质感精致。",
    controls: [
      ["比例", ["16:9", "1:1", "4:5", "9:16"]],
      ["质量", ["高", "标准", "草稿"]],
      ["张数", ["1", "2", "4"]],
    ],
  },
  video: {
    type: "VIDEO",
    title: "视频生成",
    models: [
      {
        id: "seedance2",
        name: "即梦 Seedance 2.0",
        provider: "ByteDance",
        tags: ["运镜", "中文", "商拍"],
      },
      {
        id: "veo31",
        name: "Veo 3.1",
        provider: "Google",
        tags: ["电影感", "真实", "长镜头"],
      },
    ],
    presets: ["产品广告", "首帧转视频", "剧情分镜", "社媒短片"],
    prompt:
      "制作一段 8 秒产品广告视频：镜头穿过淮南传媒集团 AI 创作工作台，文本、图片、视频、音频资产依次生成并自动汇入云素材库。",
    controls: [
      ["时长", ["8 秒", "12 秒", "20 秒"]],
      ["比例", ["16:9", "9:16", "1:1"]],
      ["运动强度", ["低", "中", "高"]],
    ],
  },
  audio: {
    type: "AUDIO",
    title: "音乐音频生成",
    models: [
      {
        id: "sonic-lab",
        name: "SonicLab Pro",
        provider: "Audio",
        tags: ["BGM", "旋律", "商用"],
      },
      {
        id: "voicecraft",
        name: "VoiceCraft Studio",
        provider: "Audio",
        tags: ["配音", "音效", "人声"],
      },
    ],
    presets: ["品牌 BGM", "旁白配音", "按钮音效", "播客片头"],
    prompt:
      "生成一段 20 秒高端媒体科技品牌 BGM，节奏冷静、空间感强，适合淮南传媒集团 AI 创作平台产品演示视频。",
    controls: [
      ["类型", ["BGM", "歌曲", "配音", "音效"]],
      ["情绪", ["冷静", "振奋", "神秘", "温暖"]],
      ["时长", ["20 秒", "45 秒", "90 秒"]],
    ],
  },
};

let activeMode = "text";
let selectedModel = modes.text.models[0];
let filter = "all";
let runCount = 0;

const assets = [
  {
    id: 1,
    type: "text",
    title: "品牌短片脚本草案",
    model: "GPT5.5",
    prompt: modes.text.prompt,
    tags: ["脚本", "品牌", "30s"],
    time: "刚刚",
  },
  {
    id: 2,
    type: "image",
    title: "AI 工作台主视觉",
    model: "gpt-image2",
    prompt: modes.image.prompt,
    tags: ["海报", "16:9", "高质量"],
    time: "12 分钟前",
  },
  {
    id: 3,
    type: "video",
    title: "云素材库转场短片",
    model: "Veo 3.1",
    prompt: modes.video.prompt,
    tags: ["8s", "广告", "电影感"],
    time: "38 分钟前",
  },
  {
    id: 4,
    type: "audio",
    title: "科技品牌 BGM",
    model: "SonicLab Pro",
    prompt: modes.audio.prompt,
    tags: ["BGM", "20s", "冷静"],
    time: "1 小时前",
  },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const activeTypeLabel = $("#activeTypeLabel");
const activeTitle = $("#activeTitle");
const providerCount = $("#providerCount");
const modelStrip = $("#modelStrip");
const promptInput = $("#promptInput");
const presetRow = $("#presetRow");
const controlGrid = $("#controlGrid");
const selectedModelName = $("#selectedModelName");
const generateButton = $("#generateButton");
const generationStage = $("#generationStage");
const outputCopy = $("#outputCopy");
const progressBlock = $("#progressBlock");
const progressLabel = $("#progressLabel");
const progressValue = $("#progressValue");
const progressFill = $("#progressFill");
const queueList = $("#queueList");
const assetGrid = $("#assetGrid");
const assetDialog = $("#assetDialog");

function renderMode() {
  const mode = modes[activeMode];
  activeTypeLabel.textContent = mode.type;
  activeTitle.textContent = mode.title;
  providerCount.textContent = `${mode.models.length} 模型在线`;
  selectedModel = mode.models[0];
  selectedModelName.textContent = selectedModel.name;
  promptInput.value = mode.prompt;

  modelStrip.innerHTML = mode.models
    .map(
      (model, index) => `
        <button class="model-card ${index === 0 ? "active" : ""}" data-model="${model.id}">
          <small>${model.provider}</small>
          <strong>${model.name}</strong>
          <div class="model-tags">${model.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        </button>
      `
    )
    .join("");

  presetRow.innerHTML = mode.presets
    .map((preset) => `<button class="preset-chip" data-preset="${preset}">${preset}</button>`)
    .join("");

  controlGrid.innerHTML = mode.controls
    .map(
      ([label, options]) => `
        <label class="control-field">
          <span>${label}</span>
          <select>
            ${options.map((option) => `<option>${option}</option>`).join("")}
          </select>
        </label>
      `
    )
    .join("");

  $$(".model-card").forEach((card) => {
    card.addEventListener("click", () => {
      $$(".model-card").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      selectedModel = modes[activeMode].models.find((model) => model.id === card.dataset.model);
      selectedModelName.textContent = selectedModel.name;
    });
  });

  $$(".preset-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      promptInput.value = buildPresetPrompt(chip.dataset.preset);
      promptInput.focus();
    });
  });

  renderStagePreview();
}

function buildPresetPrompt(preset) {
  const library = {
    品牌短片脚本: modes.text.prompt,
    小红书种草文案: "写一篇面向媒体编辑、设计师和内容团队的小红书种草文案，介绍淮南传媒集团 AI 全模态创作台的工作流优势。",
    产品发布稿: "写一篇淮南传媒集团 AI 全模态创作平台的产品发布稿，语气专业，强调模型生态、云素材库和内容生产效率。",
    提示词优化: "优化以下提示词，让它更适合用于生成高端商业视觉资产。",
    电商主图: "生成一张高端产品主图，主体为淮南传媒集团 AI 创作平台的界面大屏，深蓝背景，真实设备质感。",
    品牌海报: modes.image.prompt,
    人物写真: "生成一张 AI 创作者的专业人物写真，置身未来感创作工作室，真实摄影，高级布光。",
    概念场景: "生成一个淮南传媒集团未来 AI 内容指挥中心，包含多屏幕、多模态资产流和云端同步视觉。",
    产品广告: modes.video.prompt,
    首帧转视频: "将首帧画面转成 8 秒视频，镜头缓慢推进，界面中的素材卡片逐步亮起。",
    剧情分镜: "生成一段 AI 创作者从输入灵感到发布作品的 6 镜头分镜短片。",
    社媒短片: "生成一条 9:16 竖屏短视频，突出四种生成能力和自动入库流程。",
    "品牌 BGM": modes.audio.prompt,
    旁白配音: "生成一段沉稳、可信赖的中文旁白，适合淮南传媒集团 AI 创作平台产品演示。",
    按钮音效: "生成一组高级、短促、干净的 UI 操作音效，用于生成完成和保存成功。",
    播客片头: "生成一段 12 秒科技播客片头音乐，清晰、有记忆点、适合知识类内容。",
  };
  return library[preset] || modes[activeMode].prompt;
}

function renderStagePreview(asset) {
  const type = asset?.type || activeMode;
  const title =
    asset?.title ||
    {
      text: "品牌短片脚本草案",
      image: "AI 工作台主视觉",
      video: "云素材库转场短片",
      audio: "科技品牌 BGM",
    }[type];
  const body =
    asset?.prompt ||
    {
      text: "在 30 秒内呈现一个从灵感、生成、归档到二次创作的闭环。画面节奏冷静、利落，旁白强调“所有创意资产自动进入个人云素材库”。",
      image: "深色科技界面上，文本、图片、视频、音频资产在统一工作台中流动，蓝绿色高光勾勒出云同步状态。",
      video: "镜头穿过创作界面，多个生成任务依次完成，最终汇聚成一个整洁的云素材库网格。",
      audio: "低频稳定，合成器铺底，轻微玻璃质感打击乐进入，整体冷静而有未来感。",
    }[type];

  const visual = {
    text: `<div class="stage-visual text-stage"><div class="doc-line wide"></div><div class="doc-line"></div><div class="doc-line short"></div><div class="doc-glow"></div></div>`,
    image: `<div class="stage-visual image-stage"></div>`,
    video: `<div class="stage-visual video-stage"><span class="play-shape"></span></div>`,
    audio: `<div class="stage-visual audio-stage">${[62, 112, 82, 152, 104, 176, 92, 132, 70, 118, 88].map((h) => `<span class="wave-bar" style="height:${h}px"></span>`).join("")}</div>`,
  }[type];

  generationStage.innerHTML = `${visual}<article class="output-copy" id="outputCopy"><h3>${title}</h3><p>${body}</p></article>`;
}

function renderAssets() {
  const visible = filter === "all" ? assets : assets.filter((asset) => asset.type === filter);
  assetGrid.innerHTML = visible.map(renderAssetCard).join("");
  $$(".asset-card").forEach((card) => {
    card.addEventListener("click", () => {
      const asset = assets.find((item) => item.id === Number(card.dataset.asset));
      openAsset(asset);
    });
  });
}

function renderAssetCard(asset) {
  return `
    <article class="asset-card" data-asset="${asset.id}">
      ${renderThumb(asset.type)}
      <div class="asset-body">
        <small>${asset.model} · ${asset.time}</small>
        <h3>${asset.title}</h3>
        <p>${asset.prompt}</p>
        <div class="asset-tags">${asset.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      </div>
    </article>
  `;
}

function renderThumb(type) {
  if (type === "text") {
    return `<div class="asset-thumb text"><span style="width:92%"></span><span style="width:76%"></span><span style="width:54%"></span></div>`;
  }
  if (type === "audio") {
    return `<div class="asset-thumb audio">${[42, 92, 64, 120, 76, 102, 54, 84].map((h) => `<span style="height:${h}px"></span>`).join("")}</div>`;
  }
  return `<div class="asset-thumb ${type}"></div>`;
}

function openAsset(asset) {
  $("#dialogType").textContent = asset.type.toUpperCase();
  $("#dialogTitle").textContent = asset.title;
  $("#dialogPrompt").textContent = asset.prompt;
  $("#dialogMeta").innerHTML = [
    `模型 ${asset.model}`,
    `类型 ${asset.type}`,
    "状态 已上传",
    ...asset.tags,
  ]
    .map((item) => `<span>${item}</span>`)
    .join("");
  $("#dialogPreview").className = `dialog-preview asset-thumb ${asset.type}`;
  $("#dialogPreview").innerHTML =
    asset.type === "audio"
      ? [88, 160, 114, 210, 138, 178, 102, 146].map((h) => `<span style="height:${h}px"></span>`).join("")
      : asset.type === "text"
        ? `<span style="width:86%"></span><span style="width:72%"></span><span style="width:52%"></span>`
        : "";
  assetDialog.showModal();
}

function simulateGeneration() {
  runCount += 1;
  const buttonLabel = generateButton.querySelector("span");
  const mode = modes[activeMode];
  const prompt = promptInput.value.trim() || mode.prompt;
  const newAsset = {
    id: Date.now(),
    type: activeMode,
    title: makeTitle(activeMode, runCount),
    model: selectedModel.name,
    prompt,
    tags: makeTags(activeMode),
    time: "刚刚",
  };

  generateButton.disabled = true;
  buttonLabel.textContent = "生成中";
  progressLabel.textContent = "模型生成中";
  progressValue.textContent = "0%";
  progressFill.style.width = "0%";
  queueList.innerHTML = `
    <div class="queue-row"><span></span><div><strong>任务排队</strong><small>${selectedModel.name} · ${mode.title}</small></div></div>
  `;

  let progress = 0;
  const timer = setInterval(() => {
    progress += activeMode === "video" ? 14 : 20;
    const capped = Math.min(progress, 100);
    progressValue.textContent = `${capped}%`;
    progressFill.style.width = `${capped}%`;

    if (capped >= 42 && !queueList.dataset.rendered) {
      queueList.dataset.rendered = "running";
      queueList.innerHTML = `
        <div class="queue-row complete"><span></span><div><strong>任务排队</strong><small>${selectedModel.name} · 已接收</small></div></div>
        <div class="queue-row"><span></span><div><strong>内容生成</strong><small>${mode.type} · 渲染中</small></div></div>
      `;
    }

    if (capped >= 78 && queueList.dataset.rendered !== "uploading") {
      queueList.dataset.rendered = "uploading";
      progressLabel.textContent = "自动上传云素材库";
      queueList.innerHTML = `
        <div class="queue-row complete"><span></span><div><strong>任务排队</strong><small>${selectedModel.name} · 已接收</small></div></div>
        <div class="queue-row complete"><span></span><div><strong>内容生成</strong><small>${mode.type} · 已完成</small></div></div>
        <div class="queue-row"><span></span><div><strong>自动上传</strong><small>Cloud Library · 同步中</small></div></div>
      `;
    }

    if (capped === 100) {
      clearInterval(timer);
      delete queueList.dataset.rendered;
      assets.unshift(newAsset);
      renderStagePreview(newAsset);
      renderAssets();
      progressLabel.textContent = "已同步到云素材库";
      queueList.innerHTML = `
        <div class="queue-row complete"><span></span><div><strong>内容生成</strong><small>${selectedModel.name} · ${mode.title}</small></div></div>
        <div class="queue-row complete"><span></span><div><strong>自动上传</strong><small>Cloud Library · 已归档</small></div></div>
      `;
      buttonLabel.textContent = "生成并入库";
      generateButton.disabled = false;
    }
  }, 360);
}

function makeTitle(type, count) {
  const names = {
    text: "AI 文案资产",
    image: "视觉生成资产",
    video: "视频生成资产",
    audio: "音频生成资产",
  };
  return `${names[type]} #${String(count).padStart(2, "0")}`;
}

function makeTags(type) {
  return {
    text: ["文本", "自动归档", "Prompt"],
    image: ["图片", "高清", "云同步"],
    video: ["视频", "队列", "云同步"],
    audio: ["音频", "波形", "云同步"],
  }[type];
}

$$(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".mode-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeMode = button.dataset.mode;
    renderMode();
  });
});

$$(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".filter-chip").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filter = button.dataset.filter;
    renderAssets();
  });
});

generateButton.addEventListener("click", simulateGeneration);

$("#saveAgainButton").addEventListener("click", () => {
  const latest = {
    id: Date.now(),
    type: activeMode,
    title: `${modes[activeMode].title}版本快照`,
    model: selectedModel.name,
    prompt: promptInput.value.trim() || modes[activeMode].prompt,
    tags: ["版本", "收藏", "云同步"],
    time: "刚刚",
  };
  assets.unshift(latest);
  renderAssets();
  progressLabel.textContent = "版本已保存到云素材库";
});

$("#dialogClose").addEventListener("click", () => assetDialog.close());
assetDialog.addEventListener("click", (event) => {
  if (event.target === assetDialog) {
    assetDialog.close();
  }
});

renderMode();
renderAssets();

