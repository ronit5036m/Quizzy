const questions = [
  {
    question: "What is React?",
    options: ["Library", "Framework", "Language", "Database"],
    correctAnswer: "Library",
    time: 5,
  },
  {
    question: "Which company developed JavaScript?",
    options: ["Microsoft", "Google", "Netscape", "Apple"],
    correctAnswer: "Netscape",
    time: 5,
  },
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "Hyperlinks Text Marking Language",
      "High Text Machine Language",
      "None of these",
    ],
    correctAnswer: "Hyper Text Markup Language",
    time: 5,
  },
  {
    question: "Which of the following is not a programming language?",
    options: ["Python", "TypeScript", "HTML", "C++"],
    correctAnswer: "HTML",
    time: 5,
  },
  {
    question: "What is Node.js?",
    options: [
      "A database",
      "A runtime environment",
      "A programming language",
      "An editor",
    ],
    correctAnswer: "A runtime environment",
    time: 5,
  },
];

let currentQuestionIndex = 0;
let handlers = {}; // Store callbacks here

const socket = {
  on: (event, cb) => {
    handlers[event] = cb; // Save the callback

    // Initial Trigger: If it's the first question, send it
    if (event === "newQuestion" && currentQuestionIndex === 0) {
      setTimeout(() => {
        cb(questions[currentQuestionIndex]);
      }, 500);
    }
  },

  emit: (event, data) => {
    console.log("EMIT:", event, data);

    if (event === "submitAnswer") {
      // 1. Send the result back immediately
      setTimeout(() => {
        if (handlers["answerResult"]) {
          handlers["answerResult"]({
            correctAnswer: questions[currentQuestionIndex].correctAnswer,
          });
        }
      }, 500);
    }

    if (event === "readyForNextQuestion") {
      // 2. Move to next index
      currentQuestionIndex++;

      // 3. Trigger the "newQuestion" callback with next data
      setTimeout(() => {
        if (currentQuestionIndex < questions.length) {
          if (handlers["newQuestion"]) {
            handlers["newQuestion"](questions[currentQuestionIndex]);
          }
        } else {
          console.log("No more questions! Quiz complete.");
          // Emit quiz completion with mock leaderboard
          if (handlers["quiz_complete"]) {
            // Mock leaderboard data
            const mockLeaderboard = [
              { id: 1, name: "You", score: 4, accuracy: 80 },
              { id: 2, name: "Player 2", score: 3, accuracy: 60 },
              { id: 3, name: "Player 3", score: 5, accuracy: 100 },
              { id: 4, name: "Player 4", score: 2, accuracy: 40 },
            ].sort((a, b) => b.score - a.score); // Sort by score descending
            
            handlers["quiz_complete"]({
              leaderboard: mockLeaderboard,
              totalQuestions: questions.length,
              userScore: 4, // Mock user score
            });
          }
        }
      }, 3000);
    }
  },

  off: (event) => {
    delete handlers[event];
    console.log(`Socket listener ${event} removed`);
  },
};

export default socket;
