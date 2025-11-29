// ==UserScript==
// @name         m3u8 解析
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  参考现有代码：精准抓取 <uuid>/playlist.m3u8，列出分辨率，并在右下角提供“复制 seek 0 100”按钮
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    /* =================== 样式（右下角按钮固定悬浮） =================== */
    GM_addStyle(`
    #copySeekBtn {
      position: fixed !important;
      right: 24px !important;
      bottom: 90px !important;
      z-index: 2147483647 !important;
      background-color: #28a745;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.3);
      opacity: .95;
      transition: all .2s ease;
    }
    #copySeekBtn:hover {
      background-color: #218838;
      opacity: 1;
    }
  `);

    /* =================== 工具函数 =================== */
    async function fetchVideoList(url) {
        console.log('fetch url :', url);
        const resp = await fetch(url);
        return resp.text();
    }

    async function fetchVideoPart(url) {
        console.log('fetch item url :', url);
        const resp = await fetch(url);
        return resp.blob();
    }

    async function mergeBatch(mediaUrls, target) {
        const blobs = [];
        const total = mediaUrls.length;
        for (let i = 0; i < mediaUrls.length; i += 100) {
            const part = await Promise.all(
                mediaUrls.slice(i, i + 100).map(item => fetch(item.url).then(r => r.blob()))
            ).then(bs => new Blob(bs, { type: 'video/mp4' }));
            const current = Math.min(i + 100, total);
            target.textContent = ((current / total) * 100).toFixed(1) + '%';
            blobs.push(part);
        }
        return new Blob(blobs, { type: 'video/mp4' });
    }

    function generateSafeFileName(selector) {
        const elements = document.querySelectorAll(selector);
        const combinedText = Array.from(elements).map(el => el.textContent.trim()).join(' ');
        const safeFileName = combinedText.replace(/[\\/:*?"<>|]/g, '').substring(0, 100);
        return safeFileName || 'video';
    }

    function createUrlElement(fileInfo) {
        const html = `
<div class="flex" style="height:auto;flex-wrap:wrap;padding:5px;">
  <a style="color:lightgreen;font-weight:bold;border:2px solid lightgreen;flex:1 1 auto;">
    ${fileInfo.display}
  </a>
  <div class="flex flex-col justify-center" style="flex:1 1 100%;">
    <span style="margin-left:10px;font-style:italic;border-bottom:2px groove lightgrey;color:white;font-size:12px;height:100%;align-content:end;">
      ${fileInfo.url}
    </span>
    <div style="height:15%;width:95%;background-color:red;margin-left:10px;"></div>
  </div>
  <button style="margin-left:10px;background-color:lightgray;color:black;flex:1 1 auto;">复制</button>
  <button style="margin-left:10px;background-color:lightgray;color:black;flex:1 1 auto;" data-ref="${fileInfo.url}" data-prefix="${fileInfo.prefix}" file-name="test.mp4">下载</button>
</div>

<style>
  @media (max-width: 600px) {
    .flex { flex-direction: column; align-items: flex-start; }
    a, button { width: 50%; margin-left: 0; margin-bottom: 5px; }
  }
</style>
`;
        const flexDiv = document.createElement('div');
        flexDiv.innerHTML = html;

        // 复制按钮
        const copyButton = flexDiv.querySelector('button:nth-of-type(1)');
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(fileInfo.url + '#' + generateSafeFileName('span.font-medium'))
                .then(() => {
                console.log('已复制文本：', fileInfo.url + '#' + generateSafeFileName('span.font-medium'));
                alert('链接已复制到剪贴板');
            })
                .catch(err => {
                console.error('复制文本时出错：', err);
                alert('复制失败，请稍后重试');
            });
        });

        // 下载按钮（合并分片）
        const downloadButton = flexDiv.querySelector('button:nth-of-type(2)');
        downloadButton.addEventListener('click', async (event) => {
            const target = event.target;
            target.disabled = true;
            target.textContent = '下载中...';
            target.style.backgroundColor = 'lightgreen';

            const url = target.getAttribute('data-ref');     // 例如：https://surrit.com/<uuid>/1080p/video.m3u8
            const urlPrefix = target.getAttribute('data-prefix'); // 例如：https://surrit.com/<uuid>/1080p/

            const text = await fetchVideoList(url);
            const lines = text.split('\n');
            const mediaUrls = [];
            lines.forEach(line => {
                if (line.trim() && !line.startsWith('#')) {
                    // 分片文件（.ts 或 .m4s 等）
                    const file = line.trim();
                    // 尝试从文件名里取索引（可选）
                    let idx = 0;
                    const name = file.split('.')[0];
                    const m = name.match(/\d+/);
                    if (m) idx = parseInt(m[0], 10);
                    mediaUrls.push({ index: idx, url: urlPrefix + file });
                }
            });

            // 排序（按 index，防止乱序）
            mediaUrls.sort((a, b) => a.index - b.index);

            const blob = await mergeBatch(mediaUrls, target);
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = (fileInfo.filename || 'video') + '.mp4';
            a.click();

            setTimeout(() => {
                target.disabled = false;
                target.textContent = '下载';
                target.style.backgroundColor = 'lightgray';
            }, 1000);
        });

        return flexDiv;
    }

    /** 从页面脚本中提取 uuid（比固定 XPath 更稳：遍历所有 <script> 内文本） */
    function extractUUIDFromScripts() {
        const scripts = Array.from(document.scripts).map(s => s.textContent || '');
        const bigText = scripts.join('\n');
        // 1) 优先匹配包含 /seek 的完整 URL： https://surrit.com/<uuid>/seek
        let m = bigText.match(/https?:\/\/surrit\.com\/([0-9a-f-]{36})\/seek/);
        if (m && m[1]) return m[1];

        // 2) 其次匹配 uuid 本体（前后可能跟 /1080p 或 /playlist 等）
        m = bigText.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
        if (m && m[1]) return m[1];

        // 3) 兼容你原有的“seek”相对截取逻辑（若仍需）
        const idx = bigText.indexOf('seek');
        if (idx !== -1 && idx - 38 >= 0) {
            // 原参考代码：substring(index - 38, index - 2)
            const maybe = bigText.substring(idx - 38, idx - 2);
            const m2 = maybe.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
            if (m2) return m2[1];
        }

        return null;
    }

    /** 解析 <uuid>/playlist.m3u8，列出每个清晰度，并生成行 */
    async function buildListUI(uuid) {
        const prefix = 'https://surrit.com/';
        const listUrl = prefix + uuid + '/playlist.m3u8';
        console.log('the m3u8 url is:', listUrl);

        const tools = document.querySelector('.order-first .mt-4');
        const flexDiv = document.createElement('div');
        const filenameNode = document.querySelector('.order-first .mt-4 h1');
        const filename = filenameNode ? filenameNode.textContent.trim() : 'video';

        flexDiv.className = 'flex justify-center space-x-4 md:space-x-6 py-8 rounded-md shadow-sm';
        flexDiv.style.flexDirection = 'column';
        flexDiv.style.alignItems = 'baseline';

        // 尝试把页面原有第二个子节点移除（按你给的参考保持）
        try {
            if (tools && tools.children && tools.children[1]) {
                tools.removeChild(tools.children[1]);
            }
        } catch (e) {}

        if (tools) tools.appendChild(flexDiv);
        else document.body.appendChild(flexDiv);

        // 拉取 playlist.m3u8
        const text = await fetchVideoList(listUrl);
        const lines = text.split('\n');

        const entries = [];
        lines.forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                // 例如： "1080p/video.m3u8"
                const path = line.trim();
                const folder = path.split('/')[0]; // 1080p / 720p ...
                const fileInfo = {
                    filename: filename,
                    prefix: prefix + uuid + '/' + folder + '/', // 分片前缀
                    display: folder,
                    url: prefix + uuid + '/' + path
                };
                entries.push(fileInfo);
                flexDiv.appendChild(createUrlElement(fileInfo));
            }
        });

        // 控制台输出一下
        console.log('m3u8 entries:', entries);

        // 生成右下角固定按钮（复制 seek 0 100）
        ensureFixedCopyBtn(prefix + uuid + '/seek');
    }

    /** 右下角复制按钮（只复制 URL + min + max，不带当前值） */
    function ensureFixedCopyBtn(seekBase) {
        if (document.getElementById('copySeekBtn')) return;
        const btn = document.createElement('button');
        btn.id = 'copySeekBtn';
        btn.textContent = '复制 seek 0 100';
        btn.title = '复制：<seekUrl> 0 100';
        btn.addEventListener('click', () => {
            const content = `${seekBase} 0 100`;
            GM_setClipboard(content);
            btn.textContent = '✅ 已复制';
            btn.style.backgroundColor = '#20c997';
            setTimeout(() => {
                btn.textContent = '复制 seek 0 100';
                btn.style.backgroundColor = '#28a745';
            }, 1200);
        });
        document.body.appendChild(btn);

        // 保活：避免被站点脚本删掉
        setInterval(() => {
            if (!document.body.contains(btn)) document.body.appendChild(btn);
        }, 3000);
    }

    /* =================== 启动逻辑 =================== */
    async function boot() {
        const videoDoc = document.querySelector('.order-first'); // 与参考保持一致
        if (!videoDoc) {
            // 兜底也尝试执行（某些页 class 可能不同）
            console.log('未找到 .order-first，仍尝试解析 uuid。');
        }

        // 1) 从脚本文本中提取 uuid（参考你的做法，但更稳健）
        const uuid = extractUUIDFromScripts();
        if (!uuid) {
            console.log('未能从页面脚本中提取到 uuid。');
            return;
        }

        // 2) 按 <uuid>/playlist.m3u8 解析
        await buildListUI(uuid);
    }

    // 等待 DOM
    let tries = 0;
    const t = setInterval(() => {
        tries++;
        if (document.readyState === 'complete' || document.body) {
            clearInterval(t);
            boot();
        }
        if (tries > 40) clearInterval(t);
    }, 250);
})();
