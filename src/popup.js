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
        ruleElement.setAttribute('data-index', index);
        ruleElement.innerHTML = `
          <div class="rule-content">
            <div class="rule-domain">${rule.domain}</div>
            <div class="rule-language">${rule.language}</div>
          </div>
          <div class="rule-actions">
            <button class="edit-rule" data-index="${index}">修改</button>
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
      
      // 为每个修改按钮添加事件监听
      document.querySelectorAll('.edit-rule').forEach(function(button) {
        button.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          toggleEditMode(index);
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

  // 切换规则为编辑模式
  function toggleEditMode(index) {
    chrome.storage.local.get('languageRules', function(data) {
      const rules = data.languageRules || [];
      const rule = rules[index];
      
      // 获取规则元素
      const ruleElement = document.querySelector(`.rule-item[data-index="${index}"]`);
      
      // 将规则内容替换为编辑表单
      ruleElement.innerHTML = `
        <div class="rule-edit-form">
          <div class="form-group">
            <input type="text" class="edit-domain" value="${rule.domain}" placeholder="域名">
          </div>
          <div class="form-group">
            <input type="text" class="edit-language" value="${rule.language}" placeholder="Accept-Language 值">
          </div>
        </div>
        <div class="rule-edit-actions">
          <button class="save-edit" data-index="${index}">保存</button>
          <button class="cancel-edit" data-index="${index}">取消</button>
        </div>
      `;
      
      // 为保存按钮添加事件监听
      ruleElement.querySelector('.save-edit').addEventListener('click', function() {
        const newDomain = ruleElement.querySelector('.edit-domain').value.trim();
        const newLanguage = ruleElement.querySelector('.edit-language').value.trim();
        saveEdit(index, newDomain, newLanguage);
      });
      
      // 为取消按钮添加事件监听
      ruleElement.querySelector('.cancel-edit').addEventListener('click', function() {
        cancelEdit();
      });
    });
  }
  
  // 保存编辑后的规则
  function saveEdit(index, domain, language) {
    if (!domain || !language) {
      alert('域名和语言设置不能为空');
      return;
    }
    
    chrome.storage.local.get('languageRules', function(data) {
      const rules = data.languageRules || [];
      
      // 检查是否与其他规则域名冲突（除了当前编辑的规则）
      const conflictIndex = rules.findIndex((rule, i) => i !== index && rule.domain === domain);
      if (conflictIndex !== -1) {
        alert(`域名 "${domain}" 已存在，请使用其他域名`);
        return;
      }
      
      // 更新规则
      rules[index] = { domain, language };
      
      // 保存到存储
      chrome.storage.local.set({ languageRules: rules }, function() {
        // 更新规则列表显示
        loadRules();
        // 更新后台规则
        updateRules(rules);
      });
    });
  }
  
  // 取消编辑
  function cancelEdit() {
    // 重新加载规则列表，恢复原始状态
    loadRules();
  }
});
