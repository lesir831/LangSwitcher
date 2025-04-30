// 规则ID计数器，用于创建唯一的规则ID
let ruleIdCounter = 1;

// 初始化扩展
chrome.runtime.onInstalled.addListener(() => {
  // 初始化规则集
  initializeRules();
});

// 接收来自弹出界面的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateRules') {
    // 更新规则
    updateDynamicRules(message.rules);
  }
});

// 初始化规则
function initializeRules() {
  // 从存储中获取已保存的规则
  chrome.storage.local.get('languageRules', (data) => {
    const rules = data.languageRules || [];
    // 更新动态规则
    updateDynamicRules(rules);
  });
}

// 更新动态规则
async function updateDynamicRules(languageRules) {
  try {
    // 清除现有的所有规则
    await clearAllRules();
    
    // 如果没有规则，就提前返回
    if (!languageRules || languageRules.length === 0) {
      return;
    }
    
    // 过滤出启用的规则
    const enabledRules = languageRules.filter(rule => rule.enabled !== false);
    
    if (enabledRules.length === 0) {
      return;
    }
    
    // 准备新规则，只应用启用的规则
    const newRules = enabledRules.map((rule, index) => {
      return createRule(rule.domain, rule.language, index + 1);
    });
    
    // 添加新规则
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: newRules
    });
    
    console.log('动态规则已更新:', newRules);
  } catch (error) {
    console.error('更新规则时出错:', error);
  }
}

// 清除所有规则
async function clearAllRules() {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: await getExistingRuleIds()
    });
    console.log('所有规则已清除');
  } catch (error) {
    console.error('清除规则时出错:', error);
  }
}

// 获取现有规则ID
async function getExistingRuleIds() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  return rules.map(rule => rule.id);
}

// 创建规则
function createRule(domain, language, id) {
  // 处理通配符域名，例如将 *.example.com 转换为正则表达式
  let condition;
  if (domain.startsWith('*.')) {
    // 通配符域名，匹配所有子域名
    const baseDomain = domain.substring(2);
    condition = {
      urlFilter: `||${baseDomain}`,
      resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other']
    };
  } else {
    // 特定域名
    condition = {
      domains: [domain],
      resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other']
    };
  }
  
  // 创建规则对象
  return {
    id: id,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [
        {
          header: 'Accept-Language',
          operation: 'set',
          value: language
        }
      ]
    },
    condition: condition
  };
}
