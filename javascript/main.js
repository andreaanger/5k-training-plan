import WorkoutSession from "./workoutPlan.js";

/***************
 **     UI    **
 ***************/
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
  const week1Start = new Date(2026, 1, 16); // months are 0-indexed (Feb = 1)
  const currentDate = new Date();
  // Difference in days between currentDate and week1Start
  const diffInMs = currentDate - week1Start;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffInDays / 7) + 1;
}

let workoutSession = new WorkoutSession(getCurrentPlanWeekNumber(), 1);
workoutSession.logCurrentWorkoutPlan();
