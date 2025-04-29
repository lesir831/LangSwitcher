document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const domainInput = document.getElementById('domain');
  const languageInput = document.getElementById('language');
  const addRuleButton = document.getElementById('addRule');
  const rulesList = document.getElementById('rulesList');

  // 加载现有规则
  loadRules();

  // 添加规则按钮点击事件
  addRuleButton.addEventListener('click', function() {
    const domain = domainInput.value.trim();
    const language = languageInput.value.trim();
    
    if (!domain || !language) {
      alert('域名和语言设置不能为空');
      return;
    }
    
    // 保存新规则
    saveRule(domain, language);
    
    // 清空输入框
    domainInput.value = '';
    languageInput.value = '';
  });

  // 加载规则列表
  function loadRules() {
    chrome.storage.local.get('languageRules', function(data) {
      const rules = data.languageRules || [];
      
      if (rules.length === 0) {
        rulesList.innerHTML = '<div class="no-rules">暂无规则，请添加一条规则</div>';
        return;
      }
      
      // 清空当前列表
      rulesList.innerHTML = '';
      
      // 添加每条规则到列表
      rules.forEach(function(rule, index) {
        const ruleElement = document.createElement('div');
        ruleElement.className = 'rule-item';
        ruleElement.innerHTML = `
          <div class="rule-content">
            <div class="rule-domain">${rule.domain}</div>
            <div class="rule-language">${rule.language}</div>
          </div>
          <div class="rule-actions">
            <button class="delete-rule" data-index="${index}">删除</button>
          </div>
        `;
        rulesList.appendChild(ruleElement);
      });
      
      // 为每个删除按钮添加事件监听
      document.querySelectorAll('.delete-rule').forEach(function(button) {
        button.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          deleteRule(index);
        });
      });
    });
  }

  // 保存规则
  function saveRule(domain, language) {
    chrome.storage.local.get('languageRules', function(data) {
      const rules = data.languageRules || [];
      
      // 检查是否已存在相同域名的规则
      const existingRuleIndex = rules.findIndex(rule => rule.domain === domain);
      
      if (existingRuleIndex !== -1) {
        // 更新现有规则
        rules[existingRuleIndex].language = language;
      } else {
        // 添加新规则
        rules.push({ domain, language });
      }
      
      // 保存到存储
      chrome.storage.local.set({ languageRules: rules }, function() {
        // 更新规则列表显示
        loadRules();
        // 更新后台规则
        updateRules(rules);
      });
    });
  }

  // 删除规则
  function deleteRule(index) {
    chrome.storage.local.get('languageRules', function(data) {
      const rules = data.languageRules || [];
      
      // 删除指定索引的规则
      rules.splice(index, 1);
      
      // 保存到存储
      chrome.storage.local.set({ languageRules: rules }, function() {
        // 更新规则列表显示
        loadRules();
        // 更新后台规则
        updateRules(rules);
      });
    });
  }

  // 更新后台规则
  function updateRules(rules) {
    // 发送消息到后台脚本更新规则
    chrome.runtime.sendMessage({ action: 'updateRules', rules: rules });
  }
});
