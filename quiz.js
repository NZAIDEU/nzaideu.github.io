// quiz.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔐 Remplace par tes vraies infos Supabase
const supabase = createClient('https://eebahakxzjorpwtpbnop.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlYmFoYWt4empvcnB3dHBibm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ0MzYsImV4cCI6MjA3NzY5MDQzNn0.cLKe1RkhkM6pTA3MnkCSB7_UGMaq4dWRx6aDuAIMdFg')

const questionText = document.getElementById('question-text')
const optionsList = document.getElementById('options-list')
const explanationBox = document.getElementById('explanation-box')
const explanationText = document.getElementById('explanation-text')
const nextBtn = document.getElementById('next-btn')
const timerDisplay = document.getElementById('timer')

let questions = []
let currentIndex = 0
let timerInterval = null
let timeLeft = 5

function startTimer(correct, explanation) {
  timeLeft = 5
  timerDisplay.textContent = `⏱️ Temps restant : ${timeLeft}s`

  timerInterval = setInterval(() => {
    timeLeft--
    timerDisplay.textContent = `⏱️ Temps restant : ${timeLeft}s`
    if (timeLeft <= 0) {
      clearInterval(timerInterval)
      handleAnswer(null, correct, explanation)
    }
  }, 1000)
}

async function loadQuestions() {
  const language = document.getElementById('langue-actuelle').textContent.trim()
  const level = document.getElementById('niveau-actuel').textContent.trim()

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('language', language)
    .eq('level', level)

  if (error) {
    questionText.textContent = '❌ Erreur Supabase : ' + error.message
    optionsList.innerHTML = ''
    return
  }

  if (!data || data.length === 0) {
    questionText.textContent = '❌ Aucune question trouvée.'
    optionsList.innerHTML = ''
    return
  }

  questions = data
  currentIndex = 0
  showQuestion()
}

function showQuestion() {
  const q = questions[currentIndex]
  questionText.textContent = q.question
  explanationBox.style.display = 'none'
  optionsList.innerHTML = ''
  clearInterval(timerInterval)

  q.options.forEach((opt, i) => {
    const li = document.createElement('li')
    li.textContent = opt
    li.addEventListener('click', () => {
      clearInterval(timerInterval)
      handleAnswer(i, q.correct, q.explanation)
    })
    optionsList.appendChild(li)
  })

  startTimer(q.correct, q.explanation)
}

function handleAnswer(selected, correct, explanation) {
  const items = optionsList.querySelectorAll('li')
  items.forEach((li, i) => {
    li.style.background = i === correct ? '#c8e6c9' : (i === selected ? '#ffcdd2' : '#eee')
    li.style.pointerEvents = 'none'
  })

  explanationText.textContent = explanation
  explanationBox.style.display = 'block'
}

nextBtn.addEventListener('click', () => {
  currentIndex++
  if (currentIndex < questions.length) {
    showQuestion()
  } else {
    questionText.textContent = '🎉 Quiz terminé !'
    optionsList.innerHTML = ''
    explanationBox.style.display = 'none'
    timerDisplay.textContent = ''
  }
})

loadQuestions()

async function trackAdClick(type) {
  await supabase.from('ad_clicks').insert([{ ad_type: type }])
  console.log('✅ Clic pub enregistré :', type)
}
