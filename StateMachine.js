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

const InitState = (function(fsm) {
  state = {
    ...State(fsm),
    name: "Init State",
    next: function() {
      return ExperimentState(this.fsm, true, 5, 'add', 2000);
    },
    execute: function() {
      console.log("Populate instructions.");
      this.fsm.dispInstruction();
    },
  };
  return state;
});

const ExperimentState = (function(fsm, is_practice, num_trials, condition, interval) {
  state = {
    ...State(fsm),
    num_trials: num_trials,
    condition: condition,
    interval: interval,
    name: "Experiment State",
    next: function() {
      return InitState(this.fsm);
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

const StateMachine = (function(floden_task, panel) {
  stateObj = {
    floden_task: floden_task,
    state: State(null),
    advanceState: function() {
      this.state = this.state.next();
      this.state.execute();
    },
    resetState: function() {
      this.state = InitState(this);
      this.state.execute();
    },
    dispExperiment: function() {
      panel.moveToExperiment();
    },
    dispInstruction: function() {
      panel.moveToInstruction();
    },
  };
  return stateObj;
});
