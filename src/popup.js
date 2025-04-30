document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const domainInput = document.getElementById('domain');
  const languageInput = document.getElementById('language');
  const addRuleButton = document.getElementById('addRule');
  const cancelEditButton = document.getElementById('cancelEdit');
  const rulesList = document.getElementById('rulesList');
  
  // 编辑模式状态
  let isEditMode = false;
  let editIndex = -1;

  // 加载现有规则
  loadRules();

  // 添加/更新规则按钮点击事件
  addRuleButton.addEventListener('click', function() {
    const domain = domainInput.value.trim();
    const language = languageInput.value.trim();
    
    if (!domain || !language) {
      alert('域名和语言设置不能为空');
      return;
    }
    
    if (isEditMode) {
      // 更新现有规则
      updateRule(editIndex, domain, language);
      // 退出编辑模式
      exitEditMode();
    } else {
      // 保存新规则
      saveRule(domain, language);
    }
    
    // 清空输入框
    domainInput.value = '';
    languageInput.value = '';
  });
  
  // 取消编辑按钮点击事件
  cancelEditButton.addEventListener('click', function() {
    exitEditMode();
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
        // 确保规则有 enabled 属性，如果没有默认为 true
        if (rule.enabled === undefined) {
          rule.enabled = true;
        }

        const ruleElement = document.createElement('div');
        ruleElement.className = 'rule-item';
        ruleElement.innerHTML = `
          <div class="rule-content">
            <div class="rule-domain">${rule.domain}</div>
            <div class="rule-language">${rule.language}</div>
          </div>
          <div class="rule-actions">
            <label class="switch rule-switch">
              <input type="checkbox" class="rule-toggle" data-index="${index}" ${rule.enabled ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <button class="edit-rule" data-index="${index}">编辑</button>
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
      
      // 为每个编辑按钮添加事件监听
      document.querySelectorAll('.edit-rule').forEach(function(button) {
        button.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          enterEditMode(index);
        });
      });
      
      // 为每个规则启用/禁用开关添加事件监听
      document.querySelectorAll('.rule-toggle').forEach(function(toggle) {
        toggle.addEventListener('change', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const enabled = this.checked;
          toggleRule(index, enabled);
        });
      });
    });
  }

  // 切换规则启用/禁用状态
  function toggleRule(index, enabled) {
    chrome.storage.local.get('languageRules', function(data) {
      const rules = data.languageRules || [];
      
      if (index >= 0 && index < rules.length) {
        // 更新规则启用状态
        rules[index].enabled = enabled;
        
        // 保存到存储
        chrome.storage.local.set({ languageRules: rules }, function() {
          // 更新后台规则
          updateRules(rules);
        });
      }
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
        // 添加新规则，默认启用
        rules.push({ domain, language, enabled: true });
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

  // 进入编辑模式
  function enterEditMode(index) {
    chrome.storage.local.get('languageRules', function(data) {
      const rules = data.languageRules || [];
      if (index >= 0 && index < rules.length) {
        const rule = rules[index];
        
        // 填充输入框
        domainInput.value = rule.domain;
        languageInput.value = rule.language;
        
        // 更新UI状态
        addRuleButton.textContent = '更新规则';
        cancelEditButton.style.display = 'inline-block';
        
        // 设置编辑状态
        isEditMode = true;
        editIndex = index;
      }
    });
  }
  
  // 退出编辑模式
  function exitEditMode() {
    // 清空输入框
    domainInput.value = '';
    languageInput.value = '';
    
    // 恢复UI状态
    addRuleButton.textContent = '添加规则';
    cancelEditButton.style.display = 'none';
    
    // 重置编辑状态
    isEditMode = false;
    editIndex = -1;
  }
  
  // 更新规则
  function updateRule(index, domain, language) {
    chrome.storage.local.get('languageRules', function(data) {
      const rules = data.languageRules || [];
      
      if (index >= 0 && index < rules.length) {
        // 保留当前规则的启用状态
        const enabled = rules[index].enabled !== undefined ? rules[index].enabled : true;
        
        // 更新规则，保留启用状态
        rules[index] = { domain, language, enabled };
        
        // 保存到存储
        chrome.storage.local.set({ languageRules: rules }, function() {
          // 更新规则列表显示
          loadRules();
          // 更新后台规则
          updateRules(rules);
        });
      }
    });
  }

  // 更新后台规则
  function updateRules(rules) {
    // 发送消息到后台脚本更新规则
    chrome.runtime.sendMessage({ 
      action: 'updateRules', 
      rules: rules
    });
  }
});
