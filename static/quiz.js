// ======================================================
// QUESTIONS
// ======================================================
const questions = [
  {
    "question": "Which JavaScript operator tests strict equality?",
    "choices": [
      "=",
      "==",
      "===",
      "!="
    ],
    "answer": 2,
    "explanation": "The === operator compares both value and type without type conversion."
  },
  {
    "question": "Which keyword declares a block-scoped variable that can be reassigned?",
    "choices": [
      "var",
      "let",
      "const",
      "static"
    ],
    "answer": 1,
    "explanation": "let declares a block-scoped variable whose value can later change."
  },
  {
    "question": "What is the index of the first element in a JavaScript array?",
    "choices": [
      "0",
      "1",
      "-1",
      "The array length"
    ],
    "answer": 0,
    "explanation": "JavaScript arrays use zero-based indexing: the first element is at index 0."
  },
  {
    "question": "Which property gives the number of elements in an array?",
    "choices": [
      "size",
      "count",
      "length",
      "total"
    ],
    "answer": 2,
    "explanation": "The length property gives the length of an array, for example questions.length."
  },
  {
    "question": "What does Math.round(66.67) return?",
    "choices": [
      "66",
      "66.7",
      "67",
      "70"
    ],
    "answer": 2,
    "explanation": "Math.round returns the nearest integer, so 66.67 becomes 67."
  },
  {
    "question": "How do you access the explanation property of an object named question?",
    "choices": [
      "question[explanation]",
      "question.explanation",
      "question->explanation",
      "explanation.question"
    ],
    "answer": 1,
    "explanation": "Dot notation accesses a named object property: question.explanation."
  },
  {
    "question": "What does a function use to send a value back to its caller?",
    "choices": [
      "return",
      "break",
      "continue",
      "print"
    ],
    "answer": 0,
    "explanation": "return ends the function and passes the specified value back to its caller."
  },
  {
    "question": "What does new Array(5) create?",
    "choices": [
      "An array containing the number 5",
      "An array with five empty slots",
      "Five objects",
      "An array of five zeros"
    ],
    "answer": 1,
    "explanation": "new Array(5) creates an array of length 5 with empty slots; reading one gives undefined."
  },
  {
    "question": "Which condition checks that currentQuestion is before the last question?",
    "choices": [
      "currentQuestion <= questions.length",
      "currentQuestion > 0",
      "currentQuestion < questions.length - 1",
      "currentQuestion === questions.length"
    ],
    "answer": 2,
    "explanation": "The final index is questions.length - 1; moving next is allowed only below that index."
  },
  {
    "question": "Can a const array have its elements updated?",
    "choices": [
      "Yes",
      "No"
    ],
    "answer": 0,
    "explanation": "const prevents assigning a different array to the variable; its existing elements can still be updated."
  }
];

// ======================================================
// APPLICATION STATE
// ======================================================
let currentQuestion = 0;
const userAnswers = new Array(questions.length);

// ======================================================
// SAVE AN ANSWER
// ======================================================
function saveAnswer(choiceIndex) {
  // Store a zero-based choice index, including 0 (the first choice).
  userAnswers[currentQuestion] = choiceIndex;
}

// ======================================================
// NAVIGATION
// ======================================================
function goNext() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
}

function goPrevious() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

function goFirst() {
  currentQuestion = 0;
  renderQuestion();
}
function goLast() {
  currentQuestion = questions.length - 1;
  renderQuestion();
}

// ======================================================
// CALCULATE SCORE
// ======================================================
function calculateScore() {
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    // Unanswered entries are undefined and do not match any correct index.
    if (userAnswers[i] === questions[i].answer) {
      score++;
    }
  }
  return score;
}

// ======================================================
// CALCULATE PERCENTAGE
// ======================================================
function calculatePercentage(score) {
  return Math.round((score / questions.length) * 100);
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
function buildCorrection() {
  let correction = "";

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
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
function submitQuiz() {
  const score = calculateScore();
  const percentage = calculatePercentage(score);
  const message = getPerformanceMessage(percentage);
  const correction = buildCorrection();
  showResults(score, percentage, message, correction);
}

function renderQuestion() {
  const q = questions[currentQuestion];

  // --------------------------------------------------
  // QUESTION NUMBER
  // --------------------------------------------------
  document.getElementById("progress").textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

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

  // --------------------------------------------------
  // NAVIGATION BUTTONS
  // --------------------------------------------------
  document.getElementById("firstBtn").disabled = currentQuestion === 0;
  document.getElementById("previousBtn").disabled = currentQuestion === 0;
  document.getElementById("nextBtn").disabled =
    currentQuestion === questions.length - 1;
  document.getElementById("lastBtn").disabled =
    currentQuestion === questions.length - 1;
}

// ======================================================
// DISPLAY RESULTS
// ======================================================
function showResults(score, percentage, message, correction) {
  document.getElementById("quizPanel").style.display = "none";
  document.getElementById("resultsPanel").style.display = "block";
  document.getElementById("scoreText").textContent =
    `Score: ${score} / ${questions.length}`;
  document.getElementById("percentageText").textContent =
    `Percentage: ${percentage}%`;
  document.getElementById("performanceText").textContent = message;
  document.getElementById("correction").textContent = correction;
}

function restartQuiz() {
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
renderQuestion();