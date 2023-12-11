const INSTRUCTION_STATE_FN_ENUM = {
  RESET: 'reset_metrics',
  DOWNLOAD: 'download_metrics',
};

const TRIAL_BLOCK_SEQUENCE = [
  // Practice session: ADDITION.
  {
    instruction_text: `
      TO BEGIN THE PRACTICE SESSION , PRESS GO.
    `,
    expt_args: {
      is_practice: true,
      num_trials: 5,
      condition: 'add',
      interval: 2000,
    },
  },
  // Practice session: SUBTRACTION.
  {
    instruction_text: `
      YOU HAVE COMPLETED THE PRACTICE TRIALS IN THE ADD CONDITION.
      NEXT, YOU WILL DO PRACTICE TRIALS IN THE SUBTRACT CONDITION.
      TO BEGIN THE SUBTRACT CONDITION, PRESS GO.
    `,
    expt_args: {
      is_practice: true,
      num_trials: 5,
      condition: 'sub',
      interval: 2000,
    },
  },
  // Synthetic: Reset Experiment Metrics (to clear practice trials).
  {
    instruction_text: `
      YOU HAVE COMPLETED THE PRACTICE TRIALS IN THE SUBTRACT CONDITION.
      NEXT, YOU WILL BEGIN THE STUDY.
      WHEN YOU ARE READY TO BEGIN THE STUDY, PRESS GO.
    `,
    expt_args: null,
    additional_fn: [INSTRUCTION_STATE_FN_ENUM.RESET],
  },
  // BLOCK 1: 20 ADD (FAST ITI).
  {
    instruction_text: `
      FIRST YOU WILL COMPLETE AN ADD CONDITION.
      THE ADD CONDITION WILL BEGIN WHEN YOU PRESS GO.
    `,
    expt_args: {
      is_practice: false,
      num_trials: 20,
      condition: 'add',
      interval: 2000,
    },
  },
  // BLOCK 2: 20 SUB (FAST ITI).
  {
    instruction_text: `
      YOU HAVE COMPLETED THE FIRST ADD CONDITION.
      THE SUBTRACTION CONDITION WHILL BEGIN WHEN YOU PRESS GO.
    `,
    expt_args: {
      is_practice: false,
      num_trials: 20,
      condition: 'sub',
      interval: 2000,
    },
  },
  // BLOCK 3: 20 SUB (SLOW ITI).
  {
    instruction_text: `
      YOU HAVE COMPLETED THE FIRST SUBTRACT CONDITION.
      A SECOND SUBTRACTION CONDITION WHILL BEGIN WHEN YOU PRESS GO.
      THIS TIME, THERE IS A SLIGHTLY LONGER DELAY BETWEEN TRIALS.
    `,
    expt_args: {
      is_practice: false,
      num_trials: 20,
      condition: 'sub',
      interval: 10000,
    },
  },
  // BLOCK 4: 20 ADD (SLOW ITI).
  {
    instruction_text: `
      YOU HAVE COMPLETED THE SECOND SUBTRACT CONDITION.
      A SECOND ADD CONDITION WHILL BEGIN WHEN YOU PRESS GO.
      THESE TRIALS ALSO HAVE A LONGER DELAY THAN THE FIRST TWO HAD.
    `,
    expt_args: {
      is_practice: false,
      num_trials: 20,
      condition: 'add',
      interval: 10000,
    },
  },
  // Summary page.
  {
    instruction_text: `
      THANK YOU FOR PLAYING. YOU WON {X} DOLLARS.
      PLEASE HIT END TO COMPLETE THE STUDY.
    `,
    expt_args: null,
    additional_fn: [INSTRUCTION_STATE_FN_ENUM.DOWNLOAD],
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
      if (index > TRIAL_BLOCK_SEQUENCE.length) {
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
            default:
              console.log("Warning: function " + fn_enum + " not implemented.");
          }
        });
      }
      console.log("Populate instructions.");
      this.fsm.setInstruction(TRIAL_BLOCK_SEQUENCE[index].instruction_text);
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
    downloadMetrics: function() {
      gui_interface.downloadMetricsHistory();
    },
  };
  return stateObj;
});
