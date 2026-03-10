import WorkoutSession from "./workoutPlan.js";
const TESTING_MODE = false; // set to true to run test workout plan
let workoutSession;

function main() {
  console.log("Welcome to the 5K Training App!");
  if (TESTING_MODE) {
    console.log("Setting up TEST workout plan...");
    setupTestWorkout();
  } else {
    workoutSession = new WorkoutSession(getCurrentPlanWeekNumber(), 1);
  }
}

function setupTestWorkout() {
  workoutSession = new WorkoutSession(23, 17); // TEST WORKOUT PLAN
  workoutSession.warmUpDuration = 10;
  workoutSession.coolDownDuration = 10;
  workoutSession.workoutSession = workoutSession.createWorkoutPlan();
  workoutSession.logCurrentWorkoutPlan();
}

/***************
 **     UI    **
 ***************/

/*** NAVIGATION ***/
document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-target");
    navigateTo(target);
  });
});

export function navigateTo(screenId) {
  const container = document.getElementById("app-container");
  container.setAttribute("data-current-screen", screenId);
}

/*** START ***/
document.getElementById("home-start-btn").addEventListener("click", function () {
  startWorkoutPlan(workoutSession);
});

/******************
 **    WORKOUT   **
 ******************/

export function convertSecondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes == 0 ? `:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

function pad(num) {
  return num.toString().padStart(2, "0");
}

function getCurrentPlanWeekNumber() {
  console.log("calculating current plan week number...");
  /*
    NOTE: default is hard coded to my current week in the plan
    In a site with multiple users this would be determined by 
    the current users start date
  */
  const week1Start = new Date(2026, 1, 23); // months are 0-indexed (ex: Feb = 1)
  const currentDate = new Date();
  // Difference in days between currentDate and week1Start
  const diffInMs = currentDate - week1Start;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffInDays / 7) + 1;
}

/**************************
 **    COUNTDOWN TIMER   **
 **************************/

async function startWorkoutPlan(workout) {
  console.log(
    `Starting workout:\n WEEK: ${workout.weekNumber}\n Number: ${workout.workoutNumber}\n Warmup: ${convertSecondsToMinutes(workout.warmUpDuration)}\n Cooldown: ${convertSecondsToMinutes(workout.coolDownDuration)}`,
  );
  // Run each step in order; wait for the current timer to finish before starting the next.
  for (const step of workout.workoutSession) {
    await startWorkoutTimerCountdown(step.name, step.duration);
  }
  workoutComplete();
}

function startWorkoutTimerCountdown(actionName, duration) {
  return new Promise((resolve) => {
    const targetTime = Date.now() + duration * 1000;
    const timerCountdownElement = document.getElementById("workout-timer");
    document.getElementById("workout-action").textContent = actionName;
    console.log(`Starting ${actionName} for ${convertSecondsToMinutes(duration)}...`);

    const countdownInterval = setInterval(() => {
      const remainingTime = Math.max(0, targetTime - Date.now());
      timerCountdownElement.textContent = convertSecondsToMinutes(Math.ceil(remainingTime / 1000));
      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        console.log(`${actionName} complete!`);
        resolve();
      }
    }, 1000);
  });
}

function workoutComplete() {
  console.log("Workout complete! Great job!");
  document.getElementById("workout-action").textContent = "DONE";
  document.getElementById("workout-timer").style.display = "none";
}

main();
