import WorkoutSession from "./workoutPlan.js";
const TESTING_MODE = false; // set to true to run test workout plan
let workoutSession;
const actionTransitionBeep = new Audio("audio/195927__oneiroidstate__beep-1000-hz-length-of-1-frame-to-24-framesec-code-film.wav");

function configureAudioForMixing() {
  // Safari/iOS can mix app audio with other audio when using an "ambient" session.
  if ("audioSession" in navigator && navigator.audioSession) {
    try {
      navigator.audioSession.type = "ambient";
    } catch (error) {
      console.warn("Audio session type could not be set:", error);
    }
  }
}

function main() {
  configureAudioForMixing();

  if (TESTING_MODE) {
    console.log("Setting up TEST workout plan...");
    setupTestWorkout();
  } else {
    workoutSession = new WorkoutSession(getCurrentPlanWeekNumber(), 1);
  }

  // Update UI with current workout plan details
  updateWeekNumberSettingsUI(workoutSession.weekNumber);
}

function updateWeekNumberSettingsUI(weekNumber) {
  let homeWeekNumberElement = document.getElementById("home-week-number");
  let settingsWeekButton = document.getElementById(`settings-week${weekNumber}-btn`);
  if (weekNumber <= 9 && weekNumber >= 1) {
    homeWeekNumberElement.textContent = `WEEK ${workoutSession.weekNumber}`;
    settingsWeekButton.classList.add("week-num-selected");
  } else {
    homeWeekNumberElement.textContent = `TEST WEEK`;
  }
}

function setupTestWorkout() {
  workoutSession = new WorkoutSession(23, 17, 10, 10); // TEST WORKOUT PLAN
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
  if (screenId === "settings") {
    syncSettingsUIWithCurrentWorkout();
  }
}

/*** HOME - WORKOUT NUMBER SELECTION ***/
document.querySelectorAll(".workout-num-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".workout-num-selected").forEach((btn) => btn.classList.remove("workout-num-selected"));
    button.classList.add("workout-num-selected");
    // Update workout session with new week number and regenerate workout session with new setting
    workoutSession.workoutNumber = parseInt(button.textContent);
    workoutSession.workoutSession = workoutSession.createWorkoutPlan();
  });
});

/*** HOME - VIEW WORKOUT SESSION ***/
document.getElementById("home-workout-view-workout-btn").addEventListener("click", function () {
  // Update workout session details on workout session screen
  const detailsElement = document.getElementById("workout-session-details");
  detailsElement.innerHTML = `
  <h3 id="workout-session-plan">WEEK ${workoutSession.weekNumber} - WORKOUT ${workoutSession.workoutNumber}</h3>
  <table id="workout-session-table">
  <tr><th>action</th><th>duration</th></tr>
  ${workoutSession.workoutSession.map((step) => `<tr><td>${step.name}</td><td>${convertSecondsToMinutes(step.duration)}</td></tr>`).join("")}
  </table>
  `;
});

/*** HOME - START ***/
document.getElementById("home-start-btn").addEventListener("click", function () {
  this.disabled = true;
  startWorkoutPlan(workoutSession);
});

/*** SETTINGS - DEFAULT VALUES ON NAV TO ***/
function syncSettingsUIWithCurrentWorkout() {
  document.getElementById("settings-warmup-slider").value = workoutSession.warmUpDuration / 15;
  document.getElementById("settings-cooldown-slider").value = workoutSession.coolDownDuration / 15;
  document.getElementById("settings-warmup-duration-label").textContent = convertSecondsToMinutes(workoutSession.warmUpDuration);
  document.getElementById("settings-cooldown-duration-label").textContent = convertSecondsToMinutes(workoutSession.coolDownDuration);
  document.querySelectorAll(".settings-week-num-btn").forEach((button) => {
    button.classList.remove("week-num-selected");
    if (parseInt(button.textContent) === workoutSession.weekNumber) {
      button.classList.add("week-num-selected");
    }
  });
}

/*** SETTINGS - DURATION SLIDERS ***/
document.querySelectorAll(".settings-duration-slider").forEach((slider) => {
  slider.addEventListener("input", () => {
    // Update the label next to the slider with the current value
    let duration = parseInt(slider.value);
    let labelName = slider.id === "settings-warmup-slider" ? "settings-warmup-duration-label" : "settings-cooldown-duration-label";
    //each slider step represents 15 seconds, so multiply by 15 to get total seconds, then convert to minutes:seconds format
    document.getElementById(labelName).textContent = convertSecondsToMinutes(duration * 15);
  });
});

/*** SETTINGS - WEEK NUMBER SELECTION ***/
document.querySelectorAll(".settings-week-num-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Update selected button
    document.querySelectorAll(".week-num-selected").forEach((btn) => btn.classList.remove("week-num-selected"));
    button.classList.add("week-num-selected");
  });
});

/*** SETTINGS - SAVE BUTTON ***/
document.getElementById("settings-save-btn").addEventListener("click", () => {
  workoutSession.weekNumber = parseInt(document.querySelector(".week-num-selected").textContent);
  workoutSession.warmUpDuration = parseInt(document.getElementById("settings-warmup-slider").value) * 15; // convert slider steps to seconds
  workoutSession.coolDownDuration = parseInt(document.getElementById("settings-cooldown-slider").value) * 15; // convert slider steps to seconds
  // Update week number on home screen as well
  document.getElementById("home-week-number").textContent = `WEEK ${workoutSession.weekNumber}`;
  // regenerate workout session with new settings
  workoutSession.workoutSession = workoutSession.createWorkoutPlan();
  //Navigate to home screen after saving settings
  navigateTo("home");
  console.log("Settings saved");
});

/*** ACTION SCREEN ***/
function displayCurrentActionFullScreen(actionName) {
  // display new action
  navigateTo("action");
  document.body.style.backgroundColor = "#E0FF4F";
  document.getElementById("action-title").textContent = actionName;
  //play new action sound effect
  playActionTransitionBeep();
  // After 2 seconds, transition back to workout screen to show next action and timer
  let timeOutID = setTimeout(() => {
    // display workout screen again
    document.body.style.backgroundColor = "#001214";
    clearTimeout(timeOutID);
    navigateTo("workout");
  }, 2000); // Waits for 2000 milliseconds (2 seconds)
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
  /*
    NOTE: default is hard coded to my current week in the plan
    In a site with multiple users this would be determined by 
    the current users start date
  */
  const week1Start = new Date(2026, 2, 9); // months are 0-indexed (ex: Feb = 1)
  const currentDate = new Date();
  // Difference in days between currentDate and week1Start
  const diffInMs = currentDate - week1Start;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  let weekNumber = Math.floor(diffInDays / 7) + 1;
  if (weekNumber > 9) {
    console.log("Week number is out of plan range, defaulting to week 1");
    weekNumber = 1;
  }
  return weekNumber;
}

/**************************
 **    COUNTDOWN TIMER   **
 **************************/

async function startWorkoutPlan(workout) {
  console.log(
    `Starting workout:\n WEEK: ${workout.weekNumber}\n Number: ${workout.workoutNumber}\n Warmup: ${convertSecondsToMinutes(workout.warmUpDuration)}\n Cooldown: ${convertSecondsToMinutes(workout.coolDownDuration)}`,
  );
  // save the current time at start of the workout session to calculate accurate end times for each step, rather than relying on setTimeout which can drift over time
  let targetTime = Date.now();
  // Run each step in order; wait for the current timer to finish before starting the next.
  for (const step of workout.workoutSession) {
    displayCurrentActionFullScreen(step.name);
    targetTime = targetTime + step.duration * 1000;
    await startWorkoutTimerCountdown(step.name, step.duration, targetTime);
  }
  workoutComplete();
}

function startWorkoutTimerCountdown(actionName, duration, targetTime) {
  return new Promise((resolve) => {
    // Timer UI
    const timerCountdownElement = document.getElementById("workout-timer");
    const timerRingProgressElement = document.getElementById("workout-timer-ring-progress");
    const ringRadius = 52;
    const ringCircumference = 2 * Math.PI * ringRadius;
    document.getElementById("workout-action").textContent = actionName;
    console.log(`Starting ${actionName} for ${convertSecondsToMinutes(duration)}...`);

    timerCountdownElement.style.display = "grid";
    timerRingProgressElement.style.display = "block";
    timerRingProgressElement.style.strokeDasharray = `${ringCircumference}`;
    timerRingProgressElement.style.strokeDashoffset = "0";

    // Timer logic
    let completed = false;
    let countdownInterval;
    let completionTimeout;

    const complete = () => {
      if (completed) return;
      completed = true;
      clearInterval(countdownInterval);
      clearTimeout(completionTimeout);
      timerCountdownElement.textContent = convertSecondsToMinutes(0);
      timerRingProgressElement.style.strokeDashoffset = `${ringCircumference}`;
      console.log(`${actionName} complete!`);
      resolve();
    };

    // Use setInterval only for display updates — imprecision here is fine.
    countdownInterval = setInterval(() => {
      const remainingTime = Math.max(0, targetTime - Date.now());
      const progress = remainingTime / (duration * 1000);
      timerCountdownElement.textContent = convertSecondsToMinutes(Math.ceil(remainingTime / 1000));
      timerRingProgressElement.style.strokeDashoffset = `${ringCircumference * (1 - progress)}`;
      if (remainingTime <= 0) {
        complete();
      }
    }, 500);

    // Use a single setTimeout for step completion so drift doesn't accumulate across steps.
    const completionDelay = Math.max(0, targetTime - Date.now());
    completionTimeout = setTimeout(() => {
      complete();
    }, completionDelay);
  });
}

function workoutComplete() {
  document.getElementById("workout-action").textContent = "DONE";
  document.getElementById("workout-timer-ring").style.display = "none";
}

function playActionTransitionBeep() {
  try {
    configureAudioForMixing();
    actionTransitionBeep.currentTime = 0;
    const playResult = actionTransitionBeep.play();
    if (playResult && typeof playResult.then === "function") {
      playResult.catch((error) => {
        console.error("Failed to play action sound effect:", error);
      });
    }
  } catch (error) {
    console.error("Error while starting action sound effect playback:", error);
  }
}

main();
