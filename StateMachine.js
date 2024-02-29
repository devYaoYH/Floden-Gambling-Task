const NUM_PRACTICE_GAMES = 3;
const NUM_EXPT_GAMES = 5;
const SHORT_ITI = 1000;
const LONG_ITI = 2000;

const IMG_FORWARDS_GAME = 'img/FORWARDS.JPG';
const IMG_BACKWARDS_GAME = 'img/BACKWARDS.JPG';
const IMG_CARDS = 'img/CARDS.JPG';
const IMG_UI_CURRENT_SCORE = 'img/UI_CURRENT_SCORE.JPG';
const IMG_UI_TOTAL_SCORE = 'img/UI_TOTAL_SCORE.JPG';

const INSTRUCTION_STATE_FN_ENUM = {
  RESET: 'reset_metrics',
  DOWNLOAD: 'download_metrics',
  UPDATE_SCORE: 'update_score_placeholder_text',
};

const TRIAL_BLOCK_SEQUENCE = [
  // Start screen.
  {
    instruction_text: `
      You will begin by playing the game forward.<br>
      Cards will appear on the screen one at a time.<br>
      Press the "TURN OVER" button to stop the dealer.<br>
      You win if the WIN card is in your hand when you turn them over.<br>
    `,
    expt_args: null,
    additional_fn: [INSTRUCTION_STATE_FN_ENUM.RESET],
    button_text: "PRESS TO CONTINUE",
  },
  {
    instruction_text: `
      We will begin with PRACTICE GAMES.<br>
      First, you’ll play the game FORWARD.<br>
      And then you’ll play it BACKWARD.<br>
    `,
    expt_args: null,
    button_text: "PRESS TO CONTINUE"
  },
  {
    instruction_text: `
      First we will play the game FORWARD.<br>
      One card at a time will appear on the screen until you press "TURN OVER".<br>
      <div class="mdl-typography--text-center"><img src="${IMG_FORWARDS_GAME}" style="height:35vh;"/></div>
      That will stop the dealer and turn over your cards.<br>
    `,
    expt_args: null,
    button_text: "PRESS TO CONTINUE"
  },
  {
    instruction_text: `
      You will win $$ if you have a WIN card at that time.<br><br>
      <div class="mdl-typography--text-center"><img src="${IMG_CARDS}" style="height:40vh;"/></div>
    `,
    expt_args: null,
    button_text: "PRESS TO CONTINUE"
  },
  {
    instruction_text: `
      How much you win depends on how many cards are on the screen when you turn them over.<br>
      The MORE cards you have, the LESS $$ you will win.<br>
      The FEWER cards you have, the MORE $$ you will win.<br>
    `,
    expt_args: null,
    button_text: "PRESS TO CONTINUE"
  },
  {
    instruction_text: `
      In the top left corner, you can see how much $$ you would win if you have a WIN card among the cards currently on the screen.<br>
      <div class="mdl-typography--text-center"><img src="${IMG_UI_CURRENT_SCORE}" style="height:50vh;"/></div>
    `,
    expt_args: null,
    button_text: "PRESS TO CONTINUE"
  },
  {
    instruction_text: `
      In the top right corner, you can see your total winnings now.<br>
      <div class="mdl-typography--text-center"><img src="${IMG_UI_TOTAL_SCORE}" style="height:50vh;"/></div>
    `,
    expt_args: null,
    button_text: "PRESS TO CONTINUE"
  },
  // Practice session: ADDITION.
  {
    instruction_text: `
      You will now practice playing the game FORWARD.<br>
      Press GO to start.<br>
    `,
    expt_args: {
      is_practice: true,
      num_trials: NUM_PRACTICE_GAMES,
      condition: 'add',
      interval: SHORT_ITI,
    },
    button_text: "GO",
  },
  // Practice session: SUBTRACTION.
  {
    instruction_text: `
      Now you will practice playing the game BACKWARDS.<br>
      You will start with five cards.<br>
      <div class="mdl-typography--text-center"><img src="${IMG_BACKWARDS_GAME}" style="height:35vh;"/></div>
      They vanish one at a time until you press "TURN OVER".<br>
    `,
    expt_args: null,
    button_text: "PRESS TO CONTINUE"
  },
  {
    instruction_text: `
      Again, how much you win depends on how many cards are on the screen when you turn them over.<br>
      The MORE cards you have, the LESS $$ you will win.<br>
      The FEWER cards you have, the MORE $$ you will win.<br>
    `,
    expt_args: null,
    button_text: "PRESS TO CONTINUE"
  },
  {
    instruction_text: `
      You will now practice playing the game BACKWARDS.<br>
      Press GO to Start.<br>
    `,
    expt_args: {
      is_practice: true,
      num_trials: NUM_PRACTICE_GAMES,
      condition: 'sub',
      interval: SHORT_ITI,
    },
    button_text: "GO",
  },
  // Synthetic: Reset Experiment Metrics (to clear practice trials).
  {
    instruction_text: `
      You have completed the practice trials.<br>
      You can now begin the experimental trials.<br>
      There will be a total of FOUR sets of games.<br>
    `,
    expt_args: null,
    additional_fn: [INSTRUCTION_STATE_FN_ENUM.RESET],
    button_text: "PRESS TO CONTINUE",
  },
  // BLOCK 1: 20 ADD (FAST ITI).
  {
    instruction_text: `
      First you will play the game FORWARDS.<br>
      Press GO to Start.<br>
    `,
    expt_args: {
      is_practice: false,
      num_trials: NUM_EXPT_GAMES,
      condition: 'add',
      interval: SHORT_ITI,
    },
    button_text: "GO",
  },
  // BLOCK 2: 20 SUB (FAST ITI).
  {
    instruction_text: `
      You have completed the FIRST set of games.<br>
      Next, you will play the game BACKWARDS.<br>
      Now five cards will DISAPPEAR, one at a time.<br>
      Press GO to Start.<br>
    `,
    expt_args: {
      is_practice: false,
      num_trials: NUM_EXPT_GAMES,
      condition: 'sub',
      interval: SHORT_ITI,
    },
    button_text: "GO",
  },
  // BLOCK 3: 20 SUB (SLOW ITI).
  {
    instruction_text: `
      You have completed the SECOND set of games.<br>
      Next, you will again play the game BACKWARDS.<br>
      This time, there is a slightly longer DELAY between attempts.<br>
      Press GO to Start.<br>
    `,
    expt_args: {
      is_practice: false,
      num_trials: NUM_EXPT_GAMES,
      condition: 'sub',
      interval: LONG_ITI,
    },
    button_text: "GO",
  },
  // BLOCK 4: 20 ADD (SLOW ITI).
  {
    instruction_text: `
      You have completed the THIRD set of games.<br>
      Next, you will again plan the game FORWARDS.<br>
      Now five cards will APPEAR, one at a time.<br>
      This time, there will also be a slightly longer DELAY between attempts.<br>
      Press GO to Start.<br>
    `,
    expt_args: {
      is_practice: false,
      num_trials: NUM_EXPT_GAMES,
      condition: 'add',
      interval: LONG_ITI,
    },
    button_text: "GO",
  },
  // Summary page.
  {
    instruction_text: `
      <div class="mdl-typography--text-center">Congratulations: You won <strong>$\${X}</strong>!</div>
    `,
    expt_args: null,
    additional_fn: [INSTRUCTION_STATE_FN_ENUM.DOWNLOAD, INSTRUCTION_STATE_FN_ENUM.UPDATE_SCORE],
    button_text: "PRESS TO END",
  },
];

const State = (function(fsm) {
  state = {
    name: "stateName",
    fsm: fsm,
    next: function() {
      console.log("return next state object.");
    },
    execute: function() {
      console.log("execute actions for current state.");
    },
  };
  return state;
});

const InitState = (function(fsm, index) {
  state = {
    ...State(fsm),
    name: "Init State",
    next: function() {
      if (index >= TRIAL_BLOCK_SEQUENCE.length) {
        // Loop back to start of session.
        return InitState(this.fsm, 0);
      }
      var expt_args = TRIAL_BLOCK_SEQUENCE[index].expt_args;
      if (expt_args === null) {
        return InitState(this.fsm, index+1);
      }
      else {
        return ExperimentState(this.fsm,
                               index+1,
                               expt_args.is_practice,
                               expt_args.num_trials,
                               expt_args.condition,
                               expt_args.interval);
      }
    },
    execute: function() {
      if (index >= TRIAL_BLOCK_SEQUENCE.length) {
        this.fsm.dispInstruction();
        return;
      }

      console.log("Populate instructions.");
      this.fsm.setInstruction(TRIAL_BLOCK_SEQUENCE[index].instruction_text);
      this.fsm.setButtonText(TRIAL_BLOCK_SEQUENCE[index].button_text);

      var additional_fn = TRIAL_BLOCK_SEQUENCE[index].additional_fn;
      console.log(`Executing additional functions: ${additional_fn}`);
      if (additional_fn !== undefined) {
        additional_fn.forEach((fn_enum) => {
          switch (fn_enum) {
            case INSTRUCTION_STATE_FN_ENUM.RESET:
              this.fsm.resetMetrics();
              break;
            case INSTRUCTION_STATE_FN_ENUM.DOWNLOAD:
              this.fsm.downloadMetrics();
              break;
            case INSTRUCTION_STATE_FN_ENUM.UPDATE_SCORE:
              this.fsm.updateScorePlaceholderText();
              break;
            default:
              console.log("Warning: function " + fn_enum + " not implemented.");
          }
        });
      }

      this.fsm.dispInstruction();
    },
  };
  return state;
});

const ExperimentState = (function(fsm, index, is_practice, num_trials, condition, interval) {
  state = {
    ...State(fsm),
    num_trials: num_trials,
    condition: condition,
    interval: interval,
    name: "Experiment State",
    next: function() {
      return InitState(this.fsm, index);
    },
    execute: function() {
      console.log(this);
      if (this.num_trials > 0) {
        this.fsm.dispExperiment();
        if (condition === 'add') {
          this.fsm.floden_task.is_add_condition = true;
        }
        else {
          this.fsm.floden_task.is_add_condition = false;
        }
        this.fsm.floden_task.is_practice = is_practice;
        this.fsm.floden_task.modifyInterval(this.interval);
        this.fsm.floden_task.reset();
        this.fsm.floden_task.setEndCallback(this);
        this.fsm.floden_task.start();
      }
      else {
        this.fsm.advanceState();
      }
      this.num_trials -= 1;
    },
  };
  return state;
});

const StateMachine = (function(floden_task, gui_interface) {
  stateObj = {
    floden_task: floden_task,
    state: State(null),
    advanceState: function() {
      this.state = this.state.next();
      this.state.execute();
    },
    resetState: function() {
      this.state = InitState(this, 0);
      this.state.execute();
    },
    dispExperiment: function() {
      gui_interface.moveToExperiment();
    },
    dispInstruction: function() {
      gui_interface.moveToInstruction();
    },
    resetMetrics: function() {
      gui_interface.resetMetricsHistory();
    },
    setInstruction: function(text) {
      gui_interface.setInstructions(text);
    },
    setButtonText: function(text) {
      gui_interface.setButtonText(text);
    },
    downloadMetrics: function() {
      gui_interface.downloadMetricsHistory();
    },
    updateScorePlaceholderText: function() {
      gui_interface.updateScorePlaceholderText();
    }
  };
  return stateObj;
});
