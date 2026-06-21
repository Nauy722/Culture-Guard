// server.js
const express = require('express');
const axios = require('axios');
const path = require('path'); // 引入路径模块
const app = express();

app.use(express.json());

// ===== 1. 托管你的 HTML 页面（关键！） =====
// 告诉 Express 把 public 文件夹里的所有文件（包括 index.html）直接暴露给浏览器
app.use(express.static(path.join(__dirname, 'public')));

// ===== 2. 处理扣子 API 转发 =====
app.post('/api/coze', async (req, res) => {
  const { country, scenario } = req.body;
  // 从 Railway 的环境变量中读取 Token（后面会说怎么设）
  const COZE_API_KEY = process.env.COZE_API_KEY; 
  const WORKFLOW_ID = '7652706881686077474';

  if (!COZE_API_KEY) {
    return res.status(500).json({ reply: '服务器缺少 API Token' });
  }

  try {
    const response = await axios.post('https://api.coze.cn/v3/workflow/run', {
      workflow_id: WORKFLOW_ID,
      parameters: { country, scenario },
      user_id: 'web_user_001'
    }, {
      headers: { 
        'Authorization': `Bearer ${COZE_API_KEY}`, 
        'Content-Type': 'application/json' 
      }
    });

    // 根据扣子工作流返回的实际字段提取
    const advice = response.data?.data?.output || '扣子未返回有效结果';
    res.json({ reply: advice });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: '服务端调用失败，请检查日志。' });
  }
});

// ===== 3. 启动服务 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务已启动，监听端口 ${PORT}`);
});
