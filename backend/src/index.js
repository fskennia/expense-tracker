import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { description, amount } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Analyze this expense: "${description}" with amount $${amount}. Provide category and tips.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ analysis: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
