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
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
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
      model: 'claude-3-5-sonnet-20241022',
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
      model: 'claude-3-5-sonnet-20241022',
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
            text: `Analise esta fatura/extrato e extraia todos os itens de despesa. Para cada item, forneça: descrição, valor (número), categoria (ex: Alimentação, Transporte, Lazer, Saúde, Moradia, Educação, Assinaturas, Outros), e se é necessário (boolean). Retorne SOMENTE um JSON válido com o seguinte formato:
{
  "total": número,
  "currency": "BRL",
  "items": [
    { "description": "string", "amount": número, "category": "string", "necessary": boolean }
  ],
  "summary": {
    "by_category": { "categoria": valor_total },
    "necessary_total": número,
    "unnecessary_total": número
  }
}`
          }
        ]
      }]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta inválida da IA');
    const result = JSON.parse(jsonMatch[0]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
