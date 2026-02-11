const express = require('express');
const mongoose = require('mongoose');
const { OpenAI } = require('openai');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

mongoose.connect('mongodb://admin:mongo67!@mongo:27017/chatdb?authSource=admin', { useNewUrlParser: true, useUnifiedTopology: true });

const MessageSchema = new mongoose.Schema({
  userMessage: String,
  botResponse: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    });
    const botResponse = completion.choices[0].message.content;

    const newMessage = new Message({ userMessage: message, botResponse });
    await newMessage.save();

    res.json({ response: botResponse });
  } catch (error) {
    res.status(500).json({ error: 'Error processing request' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
