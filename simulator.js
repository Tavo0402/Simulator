let questions = [];
let examTitle = "";
let currentQuestion = 0;
let answers = {};
let showAnswers = {};
let sidebarOpen = true;

document.addEventListener("DOMContentLoaded", function () {
  fetch("./questions.json")
    .then((response) => response.json())
    .then((json) => {
      examTitle = json.title;
      questions = json.questions;
      document.querySelector(".header h1").textContent = examTitle;
      buildSidebar();
      displayQuestion();
    });
});

function buildSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.classList.add("question-item");
    if (index === currentQuestion) {
      div.classList.add("active");
    }
    div.textContent = `Q${index + 1}`;
    div.onclick = () => goToQuestion(index);
    sidebar.appendChild(div);
  });
}

function displayQuestion() {
  const q = questions[currentQuestion];

  document.getElementById("questionTitle").textContent = q.question;

  document.getElementById("answerStatus").innerHTML = "";

  const optionsContainer = document.getElementById("optionsContainer");
  optionsContainer.innerHTML = "";

  q.options.forEach((opt, i) => {
    const label = document.createElement("label");
    label.classList.add("option");

    const isSelected = answers[currentQuestion]?.includes(i.toString());
    if (isSelected) {
      label.classList.add("selected");
    }

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = `q${currentQuestion}`;
    input.value = i;
    input.checked = isSelected;
    input.onchange = (e) => {
      if (!answers[currentQuestion]) {
        answers[currentQuestion] = [];
      }
      if (e.target.checked) {
        answers[currentQuestion].push(i.toString());
      } else {
        answers[currentQuestion] = answers[currentQuestion].filter(
          (x) => x !== i.toString(),
        );
      }
      updateSidebar();
      updateOptionUI();
      validateCurrentAnswer();
    };

    const optText = document.createElement("span");
    optText.textContent = opt;

    label.appendChild(input);
    label.appendChild(optText);
    optionsContainer.appendChild(label);
  });

  updateExplanation();

  document.getElementById("counter").textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;

  document.getElementById("prevBtn").disabled = currentQuestion === 0;
  document.getElementById("nextBtn").disabled =
    currentQuestion === questions.length - 1;

  buildSidebar();
}

function updateOptionUI() {
  const q = questions[currentQuestion];
  const options = document.querySelectorAll(".option");
  const isShowingAnswers = showAnswers[currentQuestion];

  options.forEach((opt, i) => {
    const isSelected = answers[currentQuestion]?.includes(i.toString());
    const isCorrect = q.correct.includes(i);

    opt.classList.remove("selected", "correct", "incorrect");

    if (isShowingAnswers) {
      if (isCorrect) {
        opt.classList.add("correct");
      } else if (isSelected && !isCorrect) {
        opt.classList.add("incorrect");
      }
    } else if (isSelected) {
      opt.classList.add("selected");
    }
  });
}

function updateExplanation() {
  const explanationDiv = document.getElementById("explanation");
  const correctAnswersDiv = document.getElementById("correctAnswers");
  const q = questions[currentQuestion];
  if (showAnswers[currentQuestion]) {
    correctAnswersDiv.textContent =
      "Correct Answer(s): " + q.correct.map((i) => q.options[i]).join(", ");
    explanationDiv.textContent = questions[currentQuestion].explanation;
    explanationDiv.classList.add("show");
  } else {
    explanationDiv.classList.remove("show");
  }
}

function updateSidebar() {
  const items = document.querySelectorAll(".question-item");
  items.forEach((item, index) => {
    if (index === currentQuestion) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function goToQuestion(index) {
  currentQuestion = index;
  displayQuestion();
}

function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    clearSelection();
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.classList.remove("show");
    displayQuestion();
  }
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    clearSelection();
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.classList.remove("show");
    displayQuestion();
  }
}

function saveQuestion() {
  alert("Question saved! (Feature not fully implemented)");
}

function showAnswer() {
  showAnswers[currentQuestion] = !showAnswers[currentQuestion];
  updateExplanation();
  updateOptionUI();
}

function clearSelection() {
  answers[currentQuestion] = [];
  showAnswers[currentQuestion] = false;
  document
    .querySelectorAll(`input[name="q${currentQuestion}"]`)
    .forEach((input) => {
      input.checked = false;
    });
  document.getElementById("correctAnswers").textContent = "";
  document.getElementById("explanation").classList.remove("show");
  document.getElementById("answerStatus").innerHTML = "";
  updateOptionUI();
}

function submitQuiz() {
  let score = 0;

  questions.forEach((q, index) => {
    const selected = answers[index] || [];
    const correct = q.correct.map((i) => i.toString());

    if (JSON.stringify(selected.sort()) === JSON.stringify(correct.sort())) {
      score++;
    }
  });

  const resultContainer = document.getElementById("resultContainer");
  const resultScore = document.getElementById("resultScore");
  resultScore.textContent = `Your Score: ${score} / ${questions.length}`;
  resultContainer.classList.add("show");

  resultContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  currentQuestion = 0;
  displayQuestion();
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById("sidebar");
  const contentWrapper = document.querySelector(".content-wrapper");

  if (sidebarOpen) {
    sidebar.classList.remove("collapsed");
    contentWrapper.classList.remove("sidebar-collapsed");
  } else {
    sidebar.classList.add("collapsed");
    contentWrapper.classList.add("sidebar-collapsed");
  }
}

function validateCurrentAnswer() {
  const q = questions[currentQuestion];
  const selected = answers[currentQuestion] || [];
  const correct = q.correct.map((i) => i.toString());
  const statusDiv = document.getElementById("answerStatus");

  if (selected.length === 0) {
    statusDiv.innerHTML = "";
    return;
  }

  const isCorrect =
    JSON.stringify(selected.sort()) === JSON.stringify(correct.sort());

  if (isCorrect) {
    statusDiv.innerHTML =
      '<div class="status-badge correct-badge">✓ Correct</div>';
  } else {
    statusDiv.innerHTML =
      '<div class="status-badge incorrect-badge">✕ Incorrect</div>';
  }
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let yPosition = 20;

  doc.setFontSize(20);
  doc.setTextColor(108, 92, 231);
  doc.text("GitHub Copilot Practice Exam", 20, yPosition);
  yPosition += 15;

  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;

  questions.forEach((q, index) => {
    const selected = answers[index] || [];
    const correct = q.correct.map((i) => i.toString());
    const isCorrect =
      JSON.stringify(selected.sort()) === JSON.stringify(correct.sort());

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    const questionLines = doc.splitTextToSize(q.question, 170);
    doc.text(questionLines, 20, yPosition);
    yPosition += questionLines.length * 5 + 5;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.setFont(undefined, "normal");
    q.options.forEach((opt, optIndex) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const isSelected = selected.includes(optIndex.toString());
      const isCorrectOption = correct.includes(optIndex.toString());

      if (isCorrectOption) {
        doc.setFillColor(255, 255, 0);
        doc.rect(29, yPosition - 3, 132, 5, "F");
      }

      const optionLines = doc.splitTextToSize(opt, 160);
      doc.setTextColor(51, 51, 51);
      doc.text(optionLines, 30, yPosition);
      yPosition += optionLines.length * 4 + 2;
    });

    yPosition += 5;
  });

  doc.save("GitHub-Copilot-Exam-Report.pdf");
}
