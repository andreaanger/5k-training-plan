import { convertSecondsToMinutes } from "./main.js";

export default class WorkoutSession {
  constructor(weekNumber, workoutNumer) {
    this.weekNumber = weekNumber;
    this.workoutNumber = workoutNumer;
    this.warmUpDuration = 5 * 60;
    this.coolDownDuration = 5 * 60;
    this.workoutSession = this.createWorkoutPlan();
  }

  createWorkoutPlan() {
    console.log(
      `Creating workout for week: ${this.weekNumber}, workout: ${this.workoutNumber}`,
    );
    let sessionOutline = Object.hasOwn(
      WORKOUT_PLAN_OUTLINE,
      `${this.weekNumber}-${this.workoutNumber}`,
    )
      ? WORKOUT_PLAN_OUTLINE[`${this.weekNumber}-${this.workoutNumber}`]
      : WORKOUT_PLAN_OUTLINE[`${this.weekNumber}`];
    return generateWorkoutSession(
      sessionOutline,
      this.warmUpDuration,
      this.coolDownDuration,
    );
  }

  //TODO: this will eventually be displayed in the UI
  logCurrentWorkoutPlan() {
    this.workoutSession.forEach((step) =>
      console.log(`${step.name}\t\t${convertSecondsToMinutes(step.duration)}`),
    );
  }
}

/*
    The workout plan varies each week and contains repetitions of actions.
    This outlines all of the actions for the workouts and their reps.
    See https://c25k.com/c25k_plan/ for plan details
*/
const WORKOUT_PLAN_OUTLINE = {
  1: [
    {
      reps: 6,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 60,
        },
        {
          activity: "WALK",
          durationSeconds: 90,
        },
      ],
    },
  ],
  2: [
    {
      reps: 6,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 90,
        },
        {
          activity: "WALK",
          durationSeconds: 2 * 60,
        },
      ],
    },
  ],
  3: [
    {
      reps: 2,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 90,
        },
        {
          activity: "WALK",
          durationSeconds: 90,
        },
        {
          activity: "// JOG",
          durationSeconds: 3 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 3 * 60,
        },
      ],
    },
  ],
  4: [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 3 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 90,
        },
        {
          activity: "// JOG",
          durationSeconds: 5 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 2.5 * 60,
        },
        {
          activity: "// JOG",
          durationSeconds: 3 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 90,
        },
        {
          activity: "// JOG",
          durationSeconds: 5 * 60,
        },
      ],
    },
  ],
  "5-1": [
    {
      reps: 2,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 5 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 3 * 60,
        },
      ],
    },
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 5 * 60,
        },
      ],
    },
  ],
  "5-2": [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 8 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 5 * 60,
        },
        {
          activity: "// JOG",
          durationSeconds: 8 * 60,
        },
      ],
    },
  ],
  "5-3": [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 20 * 60,
        },
      ],
    },
  ],
  "6-1": [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 5 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 3 * 60,
        },
        {
          activity: "// JOG",
          durationSeconds: 8 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 3 * 60,
        },
        {
          activity: "// JOG",
          durationSeconds: 5 * 60,
        },
      ],
    },
  ],
  "6-2": [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 10 * 60,
        },
        {
          activity: "WALK",
          durationSeconds: 3 * 60,
        },
        {
          activity: "// JOG",
          durationSeconds: 10 * 60,
        },
      ],
    },
  ],
  "6-3": [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 25 * 60,
        },
      ],
    },
  ],
  7: [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 25 * 60,
        },
      ],
    },
  ],
  8: [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 28 * 60,
        },
      ],
    },
  ],
  9: [
    {
      reps: 1,
      actions: [
        {
          activity: "// JOG",
          durationSeconds: 30 * 60,
        },
      ],
    },
  ],
};

function generateWorkoutSession(
  sessionOutline,
  warmUpDuration,
  coolDownDuration,
) {
  let result = [];
  // add warm up
  result.push({ name: "WARM UP", duration: warmUpDuration });
  // loop through outline to generate each step of the workout session
  let actions, totalReps;
  for (let sequence in sessionOutline) {
    totalReps = sessionOutline[sequence].reps;
    for (let i = 0; i < totalReps; i++) {
      actions = sessionOutline[sequence].actions;
      actions.forEach((action) => {
        result.push({
          name: action.activity,
          duration: action.durationSeconds,
        });
      });
    }
  }
  // add cooldown
  result.push({ name: "COOL DOWN", duration: coolDownDuration });
  return result;
}
