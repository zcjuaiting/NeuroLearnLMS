const questionPool = [
    { question: "1 + 2 = ?", options: ["3", "4", "5"], correct: "3" },
    { question: "5 + 3 = ?", options: ["7", "8", "9"], correct: "8" },
    { question: "2 + 4 = ?", options: ["5", "6", "7"], correct: "6" },
    { question: "6 + 6 = ?", options: ["11", "12", "13"], correct: "12" },
    { question: "7 + 4 = ?", options: ["10", "11", "12"], correct: "11" },
    { question: "3 + 9 = ?", options: ["12", "14", "11"], correct: "12" },
    { question: "8 + 5 = ?", options: ["12", "13", "15"], correct: "13" }
];

let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let canAnswer = true;

const questionTextEl = document.querySelector('.question-text');
const optionButtons = document.querySelectorAll('.option-button');
const scoreTextSpan = document.querySelector('.score-text span');
const streakTextSpan = document.querySelector('.score-text br').nextSibling;

function loadQuestion() {
    canAnswer = true;
    const currentData = questionPool[currentQuestionIndex];

    questionTextEl.textContent = currentData.question;

    optionButtons.forEach((button, index) => {
        button.className = 'option-button';
        const optionTextEl = button.querySelector('.option-text');
        optionTextEl.textContent = currentData.options[index];
    });
}

function handleAnswerSelection(event) {
    if (!canAnswer) return;
    
    const clickedButton = event.currentTarget;
    const chosenAnswer = clickedButton.querySelector('.option-text').textContent;
    const correctAnswer = questionPool[currentQuestionIndex].correct;

    canAnswer = false;

    if (chosenAnswer === correctAnswer) {
        clickedButton.classList.add('correct');
        score += 20;
        streak += 1;
    } else {
        clickedButton.classList.add('wrong');
        streak = 0;

        optionButtons.forEach(button => {
            if (button.querySelector('.option-text').textContent === correctAnswer) {
                button.classList.add('correct');
            }
        });
    }

    updateScoreboardDisplay();

    setTimeout(() => {
        advanceToNextQuestion();
    }, 1500);
}

function updateScoreboardDisplay() {
    scoreTextSpan.textContent = score;
    if(streakTextSpan) {
        streakTextSpan.textContent = ` Streak: ${streak} 🔥`;
    }
}

function advanceToNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= questionPool.length) {
        console.log("🎯 Lesson completed! Sending score to Supabase...");
        
        saveAssessmentToDatabase();
        
        currentQuestionIndex = 0;
        
        alert(`Great job completing the quiz! Your score: ${score} points.`);
    }
    
    loadQuestion();
}

async function saveAssessmentToDatabase() {
    console.log("Saving final results to database...");
    
    const { data, error } = await supabase
        .from('assessment')
        .insert([
            {
                learner_profile_id: 1,
                lesson_id: 1,          
                score: score,          
                feedback: score >= 100 ? "Excellent mastery!" : "Keep practicing!"
            }
        ]);

    if (error) {
        console.error("Failed to post assessment metrics:", error.message);
    } else {
        console.log("Quiz scores synchronized successfully with Supabase.");
    }
}

optionButtons.forEach(button => {
    button.addEventListener('click', handleAnswerSelection);
});

loadQuestion();

optionButtons.forEach(button => {
    button.addEventListener('click', handleAnswerSelection);
});

window.addEventListener('DOMContentLoaded', () => {
    loadQuestion();
    updateScoreboardDisplay();
});
