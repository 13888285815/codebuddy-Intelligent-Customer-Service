/**
 * 智能客服 Widget
 * 可嵌入到任何网站的客服组件
 */
(function(window, document) {
  'use strict';

  // 版本号
  const VERSION = '1.0.0';

  // 默认配置
  const DEFAULT_CONFIG = {
    // API 配置
    apiKey: '',
    apiEndpoint: '',

    // 外观配置
    theme: 'light',
    position: 'right',
    primaryColor: '#4F46E5',
    headerColor: '#4F46E5',
    headerText: '智能客服',
    
    // 尺寸配置
    width: '380px',
    height: '500px',
    buttonSize: '60px',
    
    // 欢迎消息
    welcomeMessage: '您好！有什么可以帮助您的？',
    welcomeAvatar: '🤖',
    
    // 快捷问题
    quickQuestions: [
      '如何申请退款？',
      '订单什么时候发货？',
      '联系人工客服'
    ],
    
    // 功能开关
    enableFileUpload: true,
    enableVoiceInput: true,
    enableEmoji: true,
    enableScreenshot: true,
    
    // 语言
    language: 'zh-CN',
    
    // 自动打开
    autoOpen: false,
    delayOpen: 0,
    
    // 用户信息
    userId: '',
    userName: '',
    userEmail: '',
    
    // 自定义样式
    customStyles: {},
    
    // 事件回调
    onOpen: null,
    onClose: null,
    onMessage: null,
    onError: null
  };

  // 当前配置
  let config = { ...DEFAULT_CONFIG };
  
  // 状态
  let isOpen = false;
  let sessionId = localStorage.getItem('cs_session_id');
  let isInitialized = false;

  // 事件监听器
  const eventListeners = {};

  /**
   * 初始化 Widget
   */
  function init(options) {
    if (isInitialized) {
      console.warn('Widget already initialized');
      return;
    }

    config = { ...DEFAULT_CONFIG, ...options };
    
    // 验证必需参数
    if (!config.apiKey) {
      console.error('API Key is required');
      return;
    }

    createWidget();
    addEventListeners();
    isInitialized = true;

    // 自动打开
    if (config.autoOpen) {
      setTimeout(() => open(), config.delayOpen);
    }

    console.log('Customer Service Widget initialized');
  }

  /**
   * 创建 Widget DOM
   */
  function createWidget() {
    // 创建容器
    const container = document.createElement('div');
    container.id = 'customer-service-widget';
    container.className = `cs-widget cs-theme-${config.theme} cs-position-${config.position}`;
    
    // 应用自定义样式
    applyCustomStyles(container);
    
    // Widget 内容
    container.innerHTML = `
      <div class="cs-widget-button">
        <div class="cs-button-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="cs-button-badge" style="display: none;"></div>
      </div>
      
      <div class="cs-widget-window" style="display: none;">
        <div class="cs-widget-header" style="background-color: ${config.headerColor}">
          <div class="cs-header-content">
            <div class="cs-header-avatar">${config.welcomeAvatar}</div>
            <div class="cs-header-info">
              <h3>${config.headerText}</h3>
              <div class="cs-header-status">
                <span class="cs-status-dot"></span>
                <span>在线</span>
              </div>
            </div>
          </div>
          <button class="cs-close-btn" aria-label="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="cs-widget-body">
          <div class="cs-messages-container">
            <div class="cs-welcome-message">
              <div class="cs-message-avatar">${config.welcomeAvatar}</div>
              <div class="cs-message-content">
                <p>${config.welcomeMessage}</p>
                <div class="cs-quick-questions">
                  ${config.quickQuestions.map(q => `
                    <button class="cs-quick-question-btn" data-question="${q}">
                      ${q}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
          
          <div class="cs-input-area">
            ${config.enableFileUpload ? `
              <button class="cs-attachment-btn" title="上传文件">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
              </button>
            ` : ''}
            
            <input type="text" class="cs-message-input" placeholder="请输入您的问题..." />
            
            ${config.enableVoiceInput ? `
              <button class="cs-voice-btn" title="语音输入">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
            ` : ''}
            
            <button class="cs-send-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <input type="file" id="cs-file-input" style="display: none;" accept="image/*" />
    `;
    
    document.body.appendChild(container);
  }

  /**
   * 应用自定义样式
   */
  function applyCustomStyles(container) {
    const styles = {
      '--cs-primary-color': config.primaryColor,
      '--cs-header-color': config.headerColor,
      '--cs-width': config.width,
      '--cs-height': config.height,
      '--cs-button-size': config.buttonSize,
      ...config.customStyles
    };
    
    Object.entries(styles).forEach(([property, value]) => {
      container.style.setProperty(property, value);
    });
  }

  /**
   * 添加事件监听器
   */
  function addEventListeners() {
    const container = document.getElementById('customer-service-widget');
    
    // 打开/关闭按钮
    const button = container.querySelector('.cs-widget-button');
    button.addEventListener('click', () => {
      isOpen ? close() : open();
    });
    
    // 关闭按钮
    const closeBtn = container.querySelector('.cs-close-btn');
    closeBtn.addEventListener('click', close);
    
    // 快捷问题
    const quickQuestionBtns = container.querySelectorAll('.cs-quick-question-btn');
    quickQuestionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const question = btn.dataset.question;
        sendMessage(question);
      });
    });
    
    // 发送消息
    const input = container.querySelector('.cs-message-input');
    const sendBtn = container.querySelector('.cs-send-btn');
    
    sendBtn.addEventListener('click', () => {
      const message = input.value.trim();
      if (message) {
        sendMessage(message);
        input.value = '';
      }
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const message = input.value.trim();
        if (message) {
          sendMessage(message);
          input.value = '';
        }
      }
    });
    
    // 文件上传
    if (config.enableFileUpload) {
      const attachmentBtn = container.querySelector('.cs-attachment-btn');
      const fileInput = container.querySelector('#cs-file-input');
      
      attachmentBtn.addEventListener('click', () => fileInput.click());
      
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          uploadFile(file);
        }
      });
    }
  }

  /**
   * 打开 Widget
   */
  function open() {
    const container = document.getElementById('customer-service-widget');
    const window = container.querySelector('.cs-widget-window');
    
    window.style.display = 'block';
    container.classList.add('cs-open');
    isOpen = true;
    
    if (config.onOpen) {
      config.onOpen();
    }
    
    triggerEvent('open');
  }

  /**
   * 关闭 Widget
   */
  function close() {
    const container = document.getElementById('customer-service-widget');
    const window = container.querySelector('.cs-widget-window');
    
    window.style.display = 'none';
    container.classList.remove('cs-open');
    isOpen = false;
    
    if (config.onClose) {
      config.onClose();
    }
    
    triggerEvent('close');
  }

  /**
   * 发送消息
   */
  async function sendMessage(message) {
    if (!message) return;
    
    addMessage(message, 'user');
    
    try {
      let response;
      
      // 如果配置了 API 端点和 Key，调用真实 API
      if (config.apiEndpoint && config.apiKey) {
        response = await callRealAPI(message);
      } else {
        // 否则使用模拟响应
        response = await simulateAIResponse(message);
      }
      
      addMessage(response, 'assistant');
      
      if (config.onMessage) {
        config.onMessage({ type: 'assistant', content: response });
      }
      
      triggerEvent('message:received', { message: response });
    } catch (error) {
      console.error('发送消息失败:', error);
      
      if (config.onError) {
        config.onError(error);
      }
      
      addMessage('抱歉，服务出了点问题，请稍后再试。', 'assistant');
    }
  }

  /**
   * 调用真实 API
   */
  async function callRealAPI(message) {
    try {
      const response = await fetch(`${config.apiEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          user_id: config.userId || 'widget_user',
          use_ai: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data.message;
      } else {
        throw new Error(data.error || 'API 调用失败');
      }
    } catch (error) {
      console.error('API 调用失败，使用模拟响应:', error);
      return await simulateAIResponse(message);
    }
  }

  /**
   * 添加消息到界面
   */
  function addMessage(content, role) {
    const container = document.getElementById('customer-service-widget');
    const messagesContainer = container.querySelector('.cs-messages-container');
    
    // 移除欢迎消息
    const welcomeMessage = container.querySelector('.cs-welcome-message');
    if (welcomeMessage) {
      welcomeMessage.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `cs-message cs-message-${role}`;
    
    const avatar = role === 'assistant' ? config.welcomeAvatar : '👤';
    const time = new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
      <div class="cs-message-avatar">${avatar}</div>
      <div class="cs-message-content">
        <p>${content.replace(/\n/g, '<br>')}</p>
        <span class="cs-message-time">${time}</span>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    triggerEvent('message:sent', { role, content });
  }

  /**
   * 模拟 AI 响应
   */
  async function simulateAIResponse(message) {
    // 这里应该调用实际的 API
    // 暂时返回模拟响应
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = [
      '感谢您的提问！这是一个很好的问题。',
      '我明白了，让我来帮您解答。',
      '关于这个问题，我可以为您提供以下建议...',
      '收到您的反馈，我们会尽快处理。'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * 上传文件
   */
  function uploadFile(file) {
    console.log('上传文件:', file.name);
    // 这里应该实现文件上传逻辑
    addMessage(`[图片] ${file.name}`, 'user');
  }

  /**
   * 触发事件
   */
  function triggerEvent(eventName, data) {
    if (eventListeners[eventName]) {
      eventListeners[eventName].forEach(callback => callback(data));
    }
  }

  /**
   * 事件监听
   */
  function on(eventName, callback) {
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    eventListeners[eventName].push(callback);
  }

  /**
   * 更新配置
   */
  function updateConfig(newConfig) {
    config = { ...config, ...newConfig };
    
    if (isInitialized) {
      const container = document.getElementById('customer-service-widget');
      applyCustomStyles(container);
    }
  }

  /**
   * 设置用户信息
   */
  function setUserInfo(userInfo) {
    config.userId = userInfo.userId || '';
    config.userName = userInfo.userName || '';
    config.userEmail = userInfo.userEmail || '';
  }

  /**
   * 创建新实例
   */
  function createInstance(options) {
    return new CustomerServiceWidget(options);
  }

  // 主 Widget 类
  class CustomerServiceWidget {
    constructor(options) {
      this.config = { ...DEFAULT_CONFIG, ...options };
      this.init();
    }
    
    init() {
      init(this.config);
    }
    
    open() {
      open();
    }
    
    close() {
      close();
    }
    
    sendMessage(message) {
      sendMessage(message);
    }
    
    updateConfig(newConfig) {
      updateConfig(newConfig);
    }
    
    setUserInfo(userInfo) {
      setUserInfo(userInfo);
    }
    
    on(eventName, callback) {
      on(eventName, callback);
    }
  }

  // 暴露到全局
  window.CustomerServiceWidget = {
    init,
    open,
    close,
    sendMessage,
    updateConfig,
    setUserInfo,
    create: createInstance,
    on,
    VERSION
  };

  // 加载样式
  const style = document.createElement('style');
  style.textContent = `
    /* Widget 样式 */
    .cs-widget {
      position: fixed;
      bottom: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    }
    
    .cs-position-right {
      right: 20px;
    }
    
    .cs-position-left {
      left: 20px;
    }
    
    /* 按钮 */
    .cs-widget-button {
      width: var(--cs-button-size, 60px);
      height: var(--cs-button-size, 60px);
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cs-primary-color, #4F46E5) 0%, #6366f1 100%);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .cs-widget-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
    }
    
    .cs-button-icon {
      width: 28px;
      height: 28px;
      color: white;
    }
    
    .cs-button-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: #EF4444;
      color: white;
      border-radius: 50%;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    /* 窗口 */
    .cs-widget-window {
      position: absolute;
      bottom: calc(var(--cs-button-size, 60px) + 20px);
      width: var(--cs-width, 380px);
      height: var(--cs-height, 500px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .cs-position-left .cs-widget-window {
      left: 0;
    }
    
    .cs-position-right .cs-widget-window {
      right: 0;
    }
    
    /* 头部 */
    .cs-widget-header {
      padding: 16px 20px;
      background: var(--cs-header-color, #4F46E5);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .cs-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .cs-header-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    .cs-header-info h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .cs-header-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      opacity: 0.9;
    }
    
    .cs-status-dot {
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
    }
    
    .cs-close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .cs-close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .cs-close-btn svg {
      width: 18px;
      height: 18px;
    }
    
    /* 消息区域 */
    .cs-widget-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .cs-messages-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #F9FAFB;
    }
    
    .cs-welcome-message {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .cs-message {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }
    
    .cs-message-user {
      flex-direction: row-reverse;
    }
    
    .cs-message-avatar {
      width: 32px;
      height: 32px;
      background: #E5E7EB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .cs-message-user .cs-message-avatar {
      background: #4F46E5;
      color: white;
    }
    
    .cs-message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .cs-message-user .cs-message-content {
      background: var(--cs-primary-color, #4F46E5);
      color: white;
    }
    
    .cs-message-content p {
      margin: 0 0 4px 0;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .cs-message-time {
      font-size: 11px;
      opacity: 0.7;
    }
    
    /* 快捷问题 */
    .cs-quick-questions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    
    .cs-quick-question-btn {
      padding: 6px 12px;
      background: #E5E7EB;
      border: none;
      border-radius: 16px;
      font-size: 12px;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .cs-quick-question-btn:hover {
      background: #D1D5DB;
    }
    
    /* 输入区域 */
    .cs-input-area {
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #E5E7EB;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .cs-input-area button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: #6B7280;
      transition: color 0.2s;
    }
    
    .cs-input-area button:hover {
      color: var(--cs-primary-color, #4F46E5);
    }
    
    .cs-input-area svg {
      width: 20px;
      height: 20px;
    }
    
    .cs-message-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #E5E7EB;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .cs-message-input:focus {
      border-color: var(--cs-primary-color, #4F46E5);
    }
    
    .cs-send-btn {
      background: var(--cs-primary-color, #4F46E5) !important;
      color: white !important;
      border-radius: 50%;
      padding: 8px;
    }
    
    .cs-send-btn:hover {
      opacity: 0.9;
    }
    
    /* 主题 */
    .cs-theme-dark .cs-widget-window {
      background: #1F2937;
    }
    
    .cs-theme-dark .cs-messages-container {
      background: #111827;
    }
    
    .cs-theme-dark .cs-message-content {
      background: #374151;
      color: #F9FAFB;
    }
    
    .cs-theme-dark .cs-input-area {
      background: #1F2937;
      border-top-color: #374151;
    }
    
    .cs-theme-dark .cs-message-input {
      background: #374151;
      border-color: #4B5563;
      color: #F9FAFB;
    }
    
    /* 响应式 */
    @media (max-width: 480px) {
      .cs-widget-window {
        width: 100vw !important;
        height: 100vh !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        border-radius: 0;
      }
      
      .cs-position-left .cs-widget-window,
      .cs-position-right .cs-widget-window {
        left: 0 !important;
        right: 0 !important;
      }
    }
  `;
  
  document.head.appendChild(style);

})(window, document);
