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
          console.log("No more questions!");
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
