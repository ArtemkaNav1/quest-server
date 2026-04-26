const express = require('express');
const path = require('path');
const app = express();

// Хранилище статуса квестов
let questState = {
  current: 0,        // 0,1,2,3
  completed: false
};

// Вопросы и ответы (ПОМЕНЯЙ НА СВОИ!)
const questMessages = [
  { text: "🔐 ВВЕДИТЕ СЕКРЕТНЫЙ КОД:", answer: "21region" },
  { text: "🎂 СКОЛЬКО ЛЕТ ИМЕНИННИКУ?", answer: "30" },
  { text: "👥 Какая машина сейчас у тебя?", answer: "mazda6" },
  { text: "📅 КАКОЙ СЕГОДНЯ ГОД?", answer: "2026" }
];

app.use(express.json());
app.use(express.static('public'));

// ESP8266 будет спрашивать здесь статус
app.get('/status', (req, res) => {
  res.json({
    quest: questState.current,
    completed: questState.completed
  });
});

// Телефон будет отправлять ответы сюда
app.post('/submit', (req, res) => {
  const { answer } = req.body;
  const currentIndex = questState.current;
  
  if (currentIndex < questMessages.length) {
    const correct = questMessages[currentIndex].answer;
    
    // Сравниваем без учёта регистра и лишних пробелов
    if (answer.toString().toLowerCase().trim() === correct.toString().toLowerCase().trim()) {
      questState.current++;
      console.log(`✅ Квест ${currentIndex + 1} пройден!`);
      
      if (questState.current >= questMessages.length) {
        questState.completed = true;
        console.log("🎉 ВСЕ КВЕСТЫ ПРОЙДЕНЫ! ОТКРЫВАЕМ ПОДАРОК!");
      }
      
      res.json({ 
        success: true, 
        nextQuest: questState.current, 
        completed: questState.completed 
      });
    } else {
      res.json({ success: false, message: "Неверно, попробуй ещё!" });
    }
  } else {
    res.json({ success: false, message: "Квесты уже завершены!" });
  }
});

// ========== НОВЫЙ ОБРАБОТЧИК ДЛЯ СБРОСА КВЕСТА ==========
app.post('/reset', (req, res) => {
  questState = {
    current: 0,
    completed: false
  };
  console.log("🔄 КВЕСТ СБРОШЕН!");
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
