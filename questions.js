import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔐 Supabase config
const supabase = createClient(
  'https://eebahakxzjorpwtpbnop.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlYmFoYWt4empvcnB3dHBibm9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTQ0MzYsImV4cCI6MjA3NzY5MDQzNn0.cLKe1RkhkM6pTA3MnkCSB7_UGMaq4dWRx6aDuAIMdFg'
)

// ✅ Ajout de question
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault()

  const language = document.getElementById('language').value
  const level = document.getElementById('level').value
  const question = document.getElementById('question').value
  const options = [
    document.getElementById('opt0').value,
    document.getElementById('opt1').value,
    document.getElementById('opt2').value,
    document.getElementById('opt3').value
  ]
  const correct = parseInt(document.getElementById('correct').value)
  const explanation = document.getElementById('explanation').value
  const project = document.getElementById('project').value

  const { error } = await supabase.from('questions').insert([{
    language,
    level,
    question,
    options,
    correct,
    explanation,
    project
  }])

  if (error) {
    alert('❌ Erreur : ' + error.message)
  } else {
    alert('✅ Question ajoutée avec succès !')
    e.target.reset()
    loadQuestions() // recharge après ajout
  }
})

// ✅ Chargement des questions
async function loadQuestions() {
  const { data, error } = await supabase.from('questions').select('*')
  if (error) return console.error('Erreur Supabase :', error.message)

  renderQuestions(data)
  renderTable(data)
}

// ✅ Affichage en cartes stylées
function renderQuestions(data) {
  const container = document.getElementById('questions-list')
  if (!container) return
  container.innerHTML = ''

  data.forEach((q, index) => {
    const card = document.createElement('div')
    card.className = 'question-card'
    card.setAttribute('data-langage', q.language)
    card.setAttribute('data-niveau', q.level)

    card.innerHTML = `
      <div class="meta">Langage : <strong>${q.language}</strong> | Niveau : <strong>${q.level}</strong></div>
      <h3>Q${index + 1} : ${q.question}</h3>
      <button class="toggle-btn" onclick="toggleOptions(this)">👁️ Afficher/Masquer les options</button>
      <div class="options" style="display:none;">
        ${q.options.map((opt, i) => `<div>${i === q.correct ? '✅' : '🔸'} ${opt}</div>`).join('')}
        <p><strong>Explication :</strong> ${q.explanation}</p>
        <p><strong>Projet :</strong> ${q.project}</p>
      </div>
    `
    container.appendChild(card)
  })
}

// ✅ Affichage en tableau
function renderTable(data) {
  const table = document.getElementById('questions-table')
  if (!table) return
  table.innerHTML = ''

  data.forEach(q => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${q.language}</td>
      <td>${q.level}</td>
      <td>${q.question}</td>
      <td>${q.options[q.correct]}</td>
    `
    table.appendChild(row)
  })
}

// ✅ Toggle options
window.toggleOptions = function(btn) {
  const options = btn.nextElementSibling
  options.style.display = options.style.display === 'none' ? 'block' : 'none'
}

// ✅ Filtrage dynamique
document.getElementById('filter-langage')?.addEventListener('change', applyFilters)
document.getElementById('filter-niveau')?.addEventListener('change', applyFilters)
document.getElementById('filter-questions')?.addEventListener('input', applyFilters)

function applyFilters() {
  const lang = document.getElementById('filter-langage')?.value || ''
  const niv = document.getElementById('filter-niveau')?.value || ''
  const term = document.getElementById('filter-questions')?.value.toLowerCase() || ''

  document.querySelectorAll('.question-card').forEach(card => {
    const matchLang = !lang || card.getAttribute('data-langage') === lang
    const matchNiv = !niv || card.getAttribute('data-niveau') === niv
    const matchTerm = !term || card.textContent.toLowerCase().includes(term)
    card.style.display = matchLang && matchNiv && matchTerm ? 'block' : 'none'
  })

  document.querySelectorAll('#questions-table tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term) ? 'table-row' : 'none'
  })
}

// ✅ Initialisation
loadQuestions()

async function trackAdClick(type) {
  await supabase.from('ad_clicks').insert([{ ad_type: type }])
  console.log('✅ Clic pub enregistré :', type)
}
