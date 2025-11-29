// ==UserScript==
// @name         save note
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  在网页右下角显示一个悬浮按钮，点击弹出窗口并提交数据，支持图片粘贴功能
// @author       Your Name
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 配置
    const API_BASE_URL = 'http://localhost:12191';
    const FILE_UPLOAD_URL = `${API_BASE_URL}/api/file-resource`;
    const NOTE_CREATE_URL = `${API_BASE_URL}/api/notes`;

    // 创建悬浮按钮
    var button = document.createElement('button');
    button.textContent = '提交数据';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '-50px'; // 初始位置在屏幕外
    button.style.zIndex = '1000';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.padding = '10px 20px';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.transition = 'right 0.3s ease'; // 平滑过渡效果
    document.body.appendChild(button);

    let hideDistance = 100; // 设置离开按钮多远时才隐藏
    let leaveTimeout;

    // 获取按钮的矩形区域
    function getButtonRect() {
        return button.getBoundingClientRect();
    }

    // 计算鼠标和按钮的距离
    function calculateDistance(x, y, rect) {
        let dx = Math.max(rect.left - x, x - rect.right, 0);
        let dy = Math.max(rect.top - y, y - rect.bottom, 0);
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 鼠标悬停时滑入屏幕
    button.addEventListener('mouseenter', function() {
        clearTimeout(leaveTimeout);
        button.style.right = '20px';
    });

    // 鼠标移出时，监测鼠标距离，只有足够远才隐藏
    button.addEventListener('mouseleave', function() {
        const buttonRect = getButtonRect();
        function onMouseMove(e) {
            let distance = calculateDistance(e.clientX, e.clientY, buttonRect);
            if (distance > hideDistance) {
                button.style.right = '-50px';
                document.removeEventListener('mousemove', onMouseMove); // 移除 mousemove 监听
            }
        }
        document.addEventListener('mousemove', onMouseMove);
        leaveTimeout = setTimeout(function() {
            document.removeEventListener('mousemove', onMouseMove); // 防止长时间监测
        }, 3000); // 3秒后停止监测
    });

    // 生成图片 HTML 格式
    function generateImageHtml(imageUrl) {
        // 服务器返回的可能是完整URL或相对路径，统一处理
        let imagePath;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // 完整URL，提取相对路径部分
            const urlObj = new URL(imageUrl);
            imagePath = urlObj.pathname;
        } else if (imageUrl.startsWith('/')) {
            // 已经是相对路径
            imagePath = imageUrl;
        } else {
            // 只有文件ID，构建完整路径
            imagePath = `/api/file-resource/${imageUrl}`;
        }
        
        return `<p><span style="text-align: center;" class="image"><img height="auto" style="" src="${imagePath}" flipx="false" flipy="false" align="middle" inline="true"></span></p>`;
    }

    // 点击按钮时弹出窗口
    button.addEventListener('click', function() {
        var title = document.title;
        var url = window.location.href;
        const maxLength = 50; // 设置 URL 显示的最大字符长度
        let truncatedUrl = url.length > maxLength ? url.substring(0, maxLength) + '...' : url;

        // 生成 <a> 标签的默认链接
        var defaultContent = `<a href="${url}" target="_blank">${url}</a>`;

        var formHtml = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #f9f9f9; padding: 20px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); z-index: 1001; max-width: 400px; width: 100%; max-height: 80vh; overflow-y: auto; font-family: Arial, sans-serif;">
        <p style="color: #555; margin: 0 0 10px;"><strong>标题：</strong>${title}</p>
        <p style="color: #555; margin: 0 0 15px;"><strong>URL：</strong>${truncatedUrl}</p>
        <textarea id="content" placeholder="输入内容..." style="width: 100%; height: 120px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; resize: none; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);">${defaultContent}</textarea>
        <div id="imageContainer" style="margin-top: 10px;"></div>
        <div style="margin-top: 20px; text-align: right;">
            <button id="saveButton" style="background-color: #28a745; color: #fff; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: background-color 0.3s ease;">保存</button>
            <button id="closeButton" style="background-color: #dc3545; color: #fff; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 10px; transition: background-color 0.3s ease;">关闭</button>
        </div>
    </div>
`;

        var formDiv = document.createElement('div');
        formDiv.innerHTML = formHtml;
        document.body.appendChild(formDiv);

        const contentTextarea = document.getElementById('content');
        const imageContainer = document.getElementById('imageContainer');

        // 关闭窗口
        document.getElementById('closeButton').addEventListener('click', function() {
            document.body.removeChild(formDiv);
        });

        // 粘贴图片功能
        contentTextarea.addEventListener('paste', function(event) {
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;

            for (var i = 0; i < items.length; i++) {
                if (items[i].kind === 'file' && items[i].type.indexOf('image/') !== -1) {
                    event.preventDefault(); // 阻止默认粘贴行为
                    
                    var file = items[i].getAsFile();
                    var formData = new FormData();
                    formData.append('file', file);

                    // 显示上传中提示
                    showMessage('正在上传图片...', 'info');

                    // 上传图片到服务器
                    GM_xmlhttpRequest({
                        method: 'POST',
                        url: FILE_UPLOAD_URL,
                        data: formData,
                        onload: function(response) {
                            if (response.status === 200) {
                                // 服务器返回的为图片 URL（如 /api/file-resource/0DM1PKAHDPWQK）
                                var imageUrl = response.responseText.trim();
                                
                                // 生成图片 HTML
                                var imageHtml = generateImageHtml(imageUrl);
                                
                                // 在文本框中插入图片 HTML
                                var cursorPos = contentTextarea.selectionStart;
                                var textBefore = contentTextarea.value.substring(0, cursorPos);
                                var textAfter = contentTextarea.value.substring(cursorPos);
                                contentTextarea.value = textBefore + '\n' + imageHtml + '\n' + textAfter;
                                
                                // 设置光标位置到插入内容之后
                                var newCursorPos = cursorPos + imageHtml.length + 2;
                                contentTextarea.setSelectionRange(newCursorPos, newCursorPos);
                                
                                // 预览图片（使用完整URL确保可见）
                                var previewDiv = document.createElement('div');
                                previewDiv.style.marginTop = '10px';
                                previewDiv.style.padding = '10px';
                                previewDiv.style.border = '1px solid #ddd';
                                previewDiv.style.borderRadius = '4px';
                                previewDiv.style.backgroundColor = '#fff';
                                
                                // 为预览生成完整URL的图片HTML
                                let previewImagePath;
                                if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                                    const urlObj = new URL(imageUrl);
                                    previewImagePath = urlObj.pathname;
                                } else if (imageUrl.startsWith('/')) {
                                    previewImagePath = imageUrl;
                                } else {
                                    previewImagePath = `/api/file-resource/${imageUrl}`;
                                }
                                const previewImageUrl = API_BASE_URL + previewImagePath;
                                previewDiv.innerHTML = `<p><span style="text-align: center;" class="image"><img height="auto" style="max-width: 100%;" src="${previewImageUrl}" flipx="false" flipy="false" align="middle" inline="true"></span></p>`;
                                imageContainer.appendChild(previewDiv);
                                
                                showMessage('图片上传成功！', 'success');
                            } else {
                                showMessage('图片上传失败，请重试。', 'error');
                            }
                        },
                        onerror: function(response) {
                            showMessage('图片上传失败，请重试。', 'error');
                        }
                    });
                }
            }
        });

        // 保存数据并发送到服务器
        document.getElementById('saveButton').addEventListener('click', function() {
            var content = contentTextarea.value;

            if (!content || content.trim().length === 0) {
                showMessage('内容不能为空！', 'error');
                return;
            }

            // 构建提交的数据（使用 record 格式）
            var postData = {
                title: title,
                content: content
            };

            // 显示提交中提示
            showMessage('正在提交...', 'info');

            // 发送数据
            GM_xmlhttpRequest({
                method: 'POST',
                url: NOTE_CREATE_URL,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(postData),
                onload: function(response) {
                    if (response.status === 201) {
                        try {
                            var result = JSON.parse(response.responseText);
                            showMessage('数据已提交成功！Note ID: ' + result.noteId, 'success');
                            // 立即关闭窗口
                            document.body.removeChild(formDiv);
                        } catch (e) {
                            showMessage('数据已提交！', 'success');
                            // 立即关闭窗口
                            document.body.removeChild(formDiv);
                        }
                    } else {
                        try {
                            var error = JSON.parse(response.responseText);
                            showMessage('提交失败：' + (error.message || error.error || '未知错误'), 'error');
                        } catch (e) {
                            showMessage('提交失败，请重试。', 'error');
                        }
                    }
                },
                onerror: function(response) {
                    showMessage('提交失败，请重试。', 'error');
                }
            });
        });
    });

    // 显示消息提示框并自动消失
    function showMessage(message, type) {
        // 移除已存在的消息
        var existingMessage = document.getElementById('tampermonkey-message');
        if (existingMessage) {
            document.body.removeChild(existingMessage);
        }

        var messageDiv = document.createElement('div');
        messageDiv.id = 'tampermonkey-message';
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '10px';
        messageDiv.style.right = '10px';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '1002';
        messageDiv.style.fontSize = '14px';
        messageDiv.style.fontWeight = '500';
        messageDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';

        // 根据类型设置颜色
        switch(type) {
            case 'success':
                messageDiv.style.backgroundColor = '#28a745';
                messageDiv.style.color = '#fff';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#dc3545';
                messageDiv.style.color = '#fff';
                break;
            case 'info':
            default:
                messageDiv.style.backgroundColor = '#17a2b8';
                messageDiv.style.color = '#fff';
                break;
        }

        document.body.appendChild(messageDiv);

        setTimeout(function() {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 3000); // 3秒后自动消失
    }
})();

