// 扩展全局 Window 类型
declare global {
  interface Window {
    AndroidBridge?: {
      postMessage: (message: string) => void;
    };

    webkit?: {
      messageHandlers?: {
        postMessage?: {
          postMessage: (message: string) => void;
        };
      };
    };
  }
}

// 定义消息与回调类型
type Callback = (data: any) => void;

interface Message {
  method: string;
  data?: any;
  callbackId?: string;
}

export class WebViewJavascriptBridge {
  private callbacks: Record<string, Callback> = {};
  private enableLog: boolean;

  constructor(enableLog = false) {
    this.enableLog = enableLog;
    this.detectDevice();
  }

  /**
   * 调用 Native 方法
   */
  callNative(method: string, data: any = {}, callback?: Callback) {
    const callbackId = callback ? `cb_${Date.now()}_${Math.random()}` : undefined;

    if (callback && callbackId) {
      this.callbacks[callbackId] = callback;
    }

    const message: Message = { method, data, callbackId };
    const messageStr = JSON.stringify(message);

    if (this.enableLog) {
      console.log('[Bridge] 调用 Native:', message);
    }

    if (window.AndroidBridge?.postMessage) {
      window.AndroidBridge.postMessage(messageStr); // Android
    } else if (window.webkit?.messageHandlers?.postMessage) {
      window.webkit.messageHandlers.postMessage.postMessage(messageStr); // iOS
    } else {
      console.warn('未检测到 Native 环境');
    }
  }

  /**
   * 注册 Web 方法供 Native 调用
   */
  registerWebHandler(method: string, callback: Callback) {
    window[method] = (data: any, callbackId?: string) => {
      if (this.enableLog) {
        console.log(`[Bridge] Native 调用 Web 方法: ${method}`, data);
      }

      callback(data);

      if (callbackId && this.callbacks[callbackId]) {
        this.callbacks[callbackId](data);
        delete this.callbacks[callbackId];
      }
    };
  }

  /**
   * 检测设备信息
   */
  private detectDevice() {
    const ua = navigator.userAgent;
    let device = '未知设备';

    if (/Android/i.test(ua)) {
      device = 'Android 设备';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      device = 'iOS 设备';
    } else if (/Windows/i.test(ua)) {
      device = 'Windows 设备';
    } else if (/Mac/i.test(ua)) {
      device = 'Mac 设备';
    }

    if (this.enableLog) {
      console.log(`[Bridge] 当前设备: ${device}`);
    }
  }
}

export const bridge = new WebViewJavascriptBridge(true);
