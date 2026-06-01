import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { description, amount } = req.body;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this expense: "${description}" with amount $${amount}. Provide category, if it's necessary, and tips to save money. Keep response short and in JSON format with fields: category, necessary (boolean), and tips.`
      }]
    });

    const analysis = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-invoice', upload.single('invoice'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const base64 = req.file.buffer.toString('base64');

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 }
          },
          {
            type: 'text',
            text: `Analise esta fatura/extrato e extraia todos os itens de despesa. Retorne SOMENTE um objeto JSON válido, sem texto adicional, sem markdown, sem comentários. Formato exato:
{"total":0.00,"currency":"BRL","items":[{"description":"nome do item","amount":0.00,"category":"Alimentação","necessary":true}],"summary":{"by_category":{"Alimentação":0.00},"necessary_total":0.00,"unnecessary_total":0.00}}

Categorias permitidas: Alimentação, Transporte, Lazer, Saúde, Moradia, Educação, Assinaturas, Outros.
IMPORTANTE: Retorne apenas o JSON, nada mais.`
          }
        ]
      }]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    // Extract JSON block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) throw new Error('Resposta inválida da IA');
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      // Try to fix common issues: trailing commas, unquoted values
      const fixed = jsonStr.replace(/,\s*([}\]])/g, '$1');
      result = JSON.parse(fixed);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
