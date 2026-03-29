# 智能客服 Widget 嵌入版本

这是一个可嵌入到任何网站的智能客服 Widget 组件。

## 特性

- ✅ 零依赖，纯 JavaScript
- ✅ 即插即用，一行代码集成
- ✅ 自定义样式和配置
- ✅ 响应式设计
- ✅ 支持移动端
- ✅ 支持深色/浅色主题
- ✅ 支持多种语言

## 快速开始

### 1. 引入 Widget

将以下代码添加到您的网站 `</head>` 标签前：

```html
<script src="https://your-domain.com/widget.js"></script>
```

### 2. 初始化 Widget

在 `</body>` 标签前添加：

```html
<script>
  CustomerServiceWidget.init({
    apiKey: 'your-api-key',
    theme: 'light',
    position: 'right',
    primaryColor: '#4F46E5',
    welcomeMessage: '您好！有什么可以帮助您的？'
  });
</script>
```

### 3. 完成！

刷新页面，您会在右下角看到客服按钮。

## 配置选项

```javascript
CustomerServiceWidget.init({
  // API 配置
  apiKey: 'your-api-key',              // 必需：API Key
  apiEndpoint: 'https://api.example.com', // API 端点（默认使用内置）

  // 外观配置
  theme: 'light',                      // 主题：'light' | 'dark'
  position: 'right',                   // 位置：'left' | 'right'
  primaryColor: '#4F46E5',             // 主色调
  headerColor: '#4F46E5',              // 头部颜色
  headerText: '智能客服',              // 头部文字
  
  // 尺寸配置
  width: '380px',                      // 宽度
  height: '500px',                     // 高度
  buttonSize: '60px',                  // 按钮大小
  
  // 欢迎消息
  welcomeMessage: '您好！有什么可以帮助您的？',
  welcomeAvatar: '🤖',                  // 欢迎头像
  
  // 快捷问题
  quickQuestions: [
    '如何申请退款？',
    '订单什么时候发货？',
    '联系人工客服'
  ],
  
  // 功能开关
  enableFileUpload: true,             // 启用文件上传
  enableVoiceInput: true,             // 启用语音输入
  enableEmoji: true,                  // 启用表情
  enableScreenshot: true,             // 启用截屏
  
  // 语言
  language: 'zh-CN',                  // 语言：'zh-CN' | 'en-US'
  
  // 自动打开
  autoOpen: false,                     // 自动打开聊天
  delayOpen: 0,                        // 延迟打开（毫秒）
  
  // 用户信息
  userId: '',                         // 用户 ID（可选）
  userName: '',                       // 用户名称（可选）
  userEmail: '',                      // 用户邮箱（可选）
  
  // 自定义样式
  customStyles: {
    '--widget-border-radius': '12px',
    '--widget-box-shadow': '0 8px 24px rgba(0,0,0,0.12)'
  },
  
  // 事件回调
  onOpen: function() {
    console.log('聊天窗口已打开');
  },
  onClose: function() {
    console.log('聊天窗口已关闭');
  },
  onMessage: function(message) {
    console.log('收到消息:', message);
  },
  onError: function(error) {
    console.error('发生错误:', error);
  }
});
```

## 高级用法

### 动态配置

```javascript
// 更新配置
CustomerServiceWidget.updateConfig({
  welcomeMessage: '您好！',
  primaryColor: '#10B981'
});

// 设置用户信息
CustomerServiceWidget.setUserInfo({
  userId: 'user_123',
  userName: '张三',
  userEmail: 'zhangsan@example.com'
});

// 发送消息
CustomerServiceWidget.sendMessage('我想咨询一个问题');

// 打开/关闭
CustomerServiceWidget.open();
CustomerServiceWidget.close();
```

### 自定义事件

```javascript
// 监听消息发送
CustomerServiceWidget.on('message:sent', function(data) {
  console.log('用户发送消息:', data.message);
});

// 监听消息接收
CustomerServiceWidget.on('message:received', function(data) {
  console.log('收到客服回复:', data.message);
});

// 监听会话状态
CustomerServiceWidget.on('session:created', function(data) {
  console.log('会话创建:', data.sessionId);
});
```

### 多实例支持

```javascript
// 创建多个实例
const widget1 = CustomerServiceWidget.create({
  apiKey: 'api-key-1',
  position: 'left'
});

const widget2 = CustomerServiceWidget.create({
  apiKey: 'api-key-2',
  position: 'right'
});
```

## 自定义样式

### CSS 变量

```css
:root {
  /* 基础颜色 */
  --cs-primary-color: #4F46E5;
  --cs-header-color: #4F46E5;
  --cs-background: #ffffff;
  --cs-text-color: #1F2937;
  
  /* 消息颜色 */
  --cs-user-message-bg: #4F46E5;
  --cs-user-message-text: #ffffff;
  --cs-assistant-message-bg: #F3F4F6;
  --cs-assistant-message-text: #1F2937;
  
  /* 尺寸 */
  --cs-width: 380px;
  --cs-height: 500px;
  --cs-button-size: 60px;
  
  /* 圆角 */
  --cs-border-radius: 12px;
  --cs-button-border-radius: 50%;
  
  /* 阴影 */
  --cs-box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  --cs-button-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

### 深色主题

```javascript
CustomerServiceWidget.init({
  theme: 'dark',
  customStyles: {
    '--cs-background': '#1F2937',
    '--cs-text-color': '#F9FAFB',
    '--cs-assistant-message-bg': '#374151',
    '--cs-assistant-message-text': '#F9FAFB'
  }
});
```

## 响应式配置

```javascript
CustomerServiceWidget.init({
  // 移动端配置
  mobile: {
    width: '100%',
    height: '100vh',
    position: 'fixed',
    buttonSize: '50px'
  },
  
  // 平板配置
  tablet: {
    width: '400px',
    height: '600px',
    breakpoint: 768
  },
  
  // 桌面配置
  desktop: {
    width: '380px',
    height: '500px',
    breakpoint: 1024
  }
});
```

## CDN 使用

### JSDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/customer-service-widget@latest/dist/widget.min.js"></script>
```

### unpkg

```html
<script src="https://unpkg.com/customer-service-widget@latest/dist/widget.min.js"></script>
```

## 框架集成

### React

```jsx
import { useEffect, useRef } from 'react';

function CustomerServiceWidget() {
  const widgetRef = useRef(null);
  
  useEffect(() => {
    // 动态加载 Widget
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/customer-service-widget@latest/dist/widget.min.js';
    script.onload = () => {
      window.CustomerServiceWidget.init({
        apiKey: process.env.REACT_APP_API_KEY,
        theme: 'light'
      });
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  return null;
}
```

### Vue

```vue
<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/customer-service-widget@latest/dist/widget.min.js';
    script.onload = () => {
      window.CustomerServiceWidget.init({
        apiKey: process.env.VUE_APP_API_KEY,
        theme: 'light'
      });
    };
    document.body.appendChild(script);
  },
  
  beforeUnmount() {
    document.body.removeChild(script);
  }
}
</script>
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-customer-service',
  template: ''
})
export class CustomerServiceComponent implements OnInit, OnDestroy {
  private scriptElement: HTMLScriptElement;
  
  ngOnInit() {
    this.scriptElement = document.createElement('script');
    this.scriptElement.src = 'https://cdn.jsdelivr.net/npm/customer-service-widget@latest/dist/widget.min.js';
    this.scriptElement.onload = () => {
      (window as any).CustomerServiceWidget.init({
        apiKey: 'your-api-key',
        theme: 'light'
      });
    };
    document.body.appendChild(this.scriptElement);
  }
  
  ngOnDestroy() {
    if (this.scriptElement) {
      document.body.removeChild(this.scriptElement);
    }
  }
}
```

## WordPress 插件

安装插件后，在设置页面配置 API Key 即可。

## 性能优化

1. **懒加载**
   ```javascript
   CustomerServiceWidget.init({
     lazyLoad: true,  // 点击按钮后才加载
     preloadDelay: 2000  // 预加载延迟（毫秒）
   });
   ```

2. **缓存**
   ```javascript
   CustomerServiceWidget.init({
     cache: {
       enabled: true,
       duration: 3600000  // 缓存时长（毫秒）
     }
   });
   ```

3. **离线支持**
   ```javascript
   CustomerServiceWidget.init({
     offlineMode: true,
     offlineMessage: '网络已断开，请检查连接'
   });
   ```

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 安全性

1. 使用 HTTPS 协议
2. API Key 不要暴露在客户端
3. 启用 CSP（内容安全策略）
4. 验证所有用户输入

## 故障排除

### Widget 不显示
- 检查 API Key 是否正确
- 检查浏览器控制台是否有错误
- 确认没有 CSS 冲突

### 消息发送失败
- 检查 API 端点是否可访问
- 检查网络连接
- 查看 API 日志

### 样式问题
- 检查自定义 CSS 是否冲突
- 使用浏览器开发者工具检查
- 尝试清除缓存

## 技术支持

如有问题，请联系技术支持或查看完整文档。
