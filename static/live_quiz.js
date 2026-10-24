// Questions come from the API; previously fetched questions are reused.
let total = 0;
const cache = {};
let busy = false;
let questionReady = false;

// ======================================================
// APPLICATION STATE
// ======================================================
let currentQuestion = 0;
const userAnswers = [];

// ======================================================
// SAVE AN ANSWER
// ======================================================
function saveAnswer(choiceIndex) {
  // Store a zero-based choice index, including 0 (the first choice).
  if (!busy && questionReady) userAnswers[currentQuestion] = choiceIndex;
}

// ======================================================
// NAVIGATION
// ======================================================
function goNext() {
  if (busy || total === 0) return;
  if (currentQuestion < total - 1) {
    currentQuestion++;
    renderQuestion();
  }
}

function goPrevious() {
  if (busy || total === 0) return;
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

function goFirst() {
  if (busy || total === 0) return;
  currentQuestion = 0;
  renderQuestion();
}
function goLast() {
  if (busy || total === 0) return;
  currentQuestion = total - 1;
  renderQuestion();
}

// ======================================================
// CALCULATE SCORE
// ======================================================
async function calculateScore() {
  let score = 0;
  for (let i = 0; i < total; i++) {
    // Unanswered entries are undefined and do not match any correct index.
    const q = await getQuestion(i);
    if (userAnswers[i] === q.answer) {
      score++;
    }
  }
  return score;
}

// ======================================================
// CALCULATE PERCENTAGE
// ======================================================
function calculatePercentage(score) {
  return Math.round((score / total) * 100);
}

// ======================================================
// PERFORMANCE MESSAGE
// ======================================================
function getPerformanceMessage(percentage) {
  // Check from highest to lowest so the boundaries are unambiguous.
  if (percentage >= 80) return "Excellent";
  if (percentage >= 60) return "Good";
  if (percentage >= 50) return "Pass";
  return "Needs improvement";
}

// ======================================================
// BUILD CORRECTION
// ======================================================
async function buildCorrection() {
  let correction = "";

  for (let i = 0; i < total; i++) {
    const q = await getQuestion(i);
    const selectedAnswer = userAnswers[i];
    // Do not use a truthiness check: index 0 is a valid answer.
    const userAnswer = selectedAnswer === undefined
      ? "Not answered"
      : q.choices[selectedAnswer];
    const result = selectedAnswer === q.answer ? "Correct" : "Incorrect";

    correction += `Question ${i + 1}: ${q.question}\n`;
    correction += `Your answer: ${userAnswer}\n`;
    correction += `Correct answer: ${q.choices[q.answer]}\n`;
    correction += `Result: ${result}\n`;
    correction += `Explanation: ${q.explanation}\n\n`;
  }

  return correction;
}

// ======================================================
// PROVIDED INTERFACE CODE
//
// DOM manipulation and events will be studied later.
// ======================================================

// ======================================================
// SUBMIT QUIZ
// ======================================================
async function submitQuiz() {
  if (busy || total === 0 || !questionReady) return;
  setBusy(true);
  clearError();
  try {
    const score = await calculateScore();
    const percentage = calculatePercentage(score);
    const message = getPerformanceMessage(percentage);
    const correction = await buildCorrection();
    showResults(score, percentage, message, correction);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

async function renderQuestion() {
  questionReady = false;
  setBusy(true);
  clearError();
  // Remove the old choices while waiting so they cannot answer a new question.
  document.getElementById("choices").innerHTML = "";
  document.getElementById("questionText").textContent = "";
  document.getElementById("progress").textContent =
    `Question ${currentQuestion + 1} of ${total}`;
  try {
  const q = await getQuestion(currentQuestion);

  // --------------------------------------------------
  // QUESTION NUMBER
  // --------------------------------------------------
  document.getElementById("progress").textContent =
    `Question ${currentQuestion + 1} of ${total}`;

  // --------------------------------------------------
  // QUESTION
  // --------------------------------------------------
  document.getElementById("questionText").textContent = q.question;

  // --------------------------------------------------
  // CHOICES
  // --------------------------------------------------
  const choicesContainer = document.getElementById("choices");
  choicesContainer.innerHTML = "";
  for (let i = 0; i < q.choices.length; i++) {
    const label = document.createElement("label");
    label.className = "choice";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.value = i;
    // Restore an answer previously selected
    // by the user.
    if (userAnswers[currentQuestion] === i) {
      radio.checked = true;
    }
    // When the user selects this answer,
    // save its index.
    radio.onclick = function () {
      saveAnswer(i);
    };
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + q.choices[i]));
    choicesContainer.appendChild(label);
  }

  questionReady = true;
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

// ======================================================
// DISPLAY RESULTS
// ======================================================
function showResults(score, percentage, message, correction) {
  document.getElementById("quizPanel").style.display = "none";
  document.getElementById("resultsPanel").style.display = "block";
  document.getElementById("scoreText").textContent =
    `Score: ${score} / ${total}`;
  document.getElementById("percentageText").textContent =
    `Percentage: ${percentage}%`;
  document.getElementById("performanceText").textContent = message;
  document.getElementById("correction").textContent = correction;
}

function restartQuiz() {
  if (busy || total === 0) return;
  // Clear the previous answers.
  userAnswers.fill(undefined);
  currentQuestion = 0;

  // Hide results and show the questions again.
  document.getElementById("resultsPanel").style.display = "none";
  document.getElementById("quizPanel").style.display = "block";

  // Display Question 1 with no answer selected.
  renderQuestion();
}
// ======================================================
// START APPLICATION
// ======================================================
init();

// Fetch errors propagate to renderQuestion or submitQuiz, which display them.
async function getQuestion(index) {
  if (Object.prototype.hasOwnProperty.call(cache, index)) return cache[index];
  const response = await fetch(`/api/question/${index}`);
  if (!response.ok) throw new Error(`Cannot load question ${index + 1} (HTTP ${response.status}).`);
  const question = await response.json();
  cache[index] = question;
  return question;
}

function clearError() {
  document.getElementById("error").hidden = true;
  document.getElementById("error").textContent = "";
  document.getElementById("retryBtn").hidden = true;
}

function showError(error) {
  document.getElementById("error").textContent =
    `${error.message} Check your connection and try again.`;
  document.getElementById("error").hidden = false;
  document.getElementById("retryBtn").hidden = false;
}

function setBusy(value) {
  busy = value;
  document.getElementById("loading").hidden = !value;
  const unavailable = busy || total === 0;
  document.getElementById("firstBtn").disabled = unavailable || currentQuestion === 0;
  document.getElementById("previousBtn").disabled = unavailable || currentQuestion === 0;
  document.getElementById("nextBtn").disabled = unavailable || currentQuestion === total - 1;
  document.getElementById("lastBtn").disabled = unavailable || currentQuestion === total - 1;
  document.querySelector('#quizPanel button.submit').disabled = unavailable || !questionReady;
  document.getElementById("retryBtn").disabled = busy;
  document.querySelectorAll('#choices input').forEach(input => { input.disabled = busy; });
}

function retryQuiz() {
  if (busy) return;
  if (total === 0) init();
  else renderQuestion();
}

async function init() {
  setBusy(true);
  clearError();
  try {
    const response = await fetch("/api/questions/count");
    if (!response.ok) throw new Error(`Cannot load question count (HTTP ${response.status}).`);
    const data = await response.json();
    if (!Number.isInteger(data.count) || data.count < 0) throw new Error("Invalid question count.");
    if (data.count === 0) throw new Error("No questions available. The database needs to be seeded.");
    total = data.count;
    userAnswers.length = total;
    document.getElementById("questionCount").textContent = `${total} questions`;
    await renderQuestion();
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}
