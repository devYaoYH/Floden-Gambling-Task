const FLODEN_TASK_SCORE = [0, 40, 30, 20, 15, 8];
const FLODEN_TASK_NUM_CARDS = 5;
const FLODEN_TASK_SHOW_CARD_INTERVAL = 2000; // 2s interval between adding/subtracting cards.
const FLODEN_TASK_METRICS = ["condition", "decision_latency", "success", "score"];

function getTimestampNow(){
  return window.performance.now();
}

const TaskMetrics = (function() {
  metricsObj = {
    id: "metric_prorotype",
    name: "Metric",
    description: "Stores a value and a function to compute it",
    value: null,
    compute: function() {},
    toString: function() {
      print_string = `Metric: ${this.name}\nDescription: ${this.description}\nValue: ${this.value}`;
      return print_string;
    },
    toJson: function() {
      json_string = `{"id": "${this.id}", "name": "${this.name}", "description": "${this.description}", "value": "${this.value}"}`;
      return JSON.parse(json_string);
    },
  };
  return metricsObj;
});

const LatencyMetric = (function(init_timestamp) {
  return {
    ...TaskMetrics(),
    id: "decision_latency",
    name: "Decision Latency",
    description: "Trial decision latency in milliseconds. This is the amount of time the subject took to decide to press the 'Turn over' button on the current trial.",
    compute: function() {
      this.value = getTimestampNow() - init_timestamp;
    },
  };
});

const CorrectnessMetric = (function(task_obj) {
  return {
    ...TaskMetrics(),
    id: "success",
    name: "Success",
    description: "Boolean variable that tracks whether the winning card was within the shown cards.",
    compute: function() {
      winning_card_shown = false
      // Loop through task cards to find if winning card is shown.
      task_obj.card_array.forEach((card) => {
        if (card.winning && card.shown) {
          winning_card_shown = true
        }
      });
      this.value = winning_card_shown;
    },
  };
});

const ScoreMetric = (function(task_obj) {
  return {
    ...TaskMetrics(),
    id: "score",
    name: "Score",
    description: "Total numeric score accumulated from this trial.",
    compute: function() {
      num_revealed = 0
      winning_card_shown = false
      for (let i=0;i<FLODEN_TASK_NUM_CARDS;i++) {
        if (task_obj.card_array[i].shown) {
          num_revealed += 1
          if (task_obj.card_array[i].winning) {
            winning_card_shown = true
          }
        }
      }
      if (winning_card_shown !== true) {
        this.value = 0;
      }
      else {
        this.value = FLODEN_TASK_SCORE[num_revealed];
      }
    },
  };
});

const ConditionMetric = (function(is_add_condition) {
  return {
    ...TaskMetrics(),
    id: "condition",
    name: "Experiment Condition",
    description: "Experimental condition for this trial, ADD or SUB. ADD adds cards while SUB removes cards.",
    compute: function() {
      if (is_add_condition) {
        this.value = "ADD";
      }
      else {
        this.value = "SUB";
      }
    },
  };
});

const FlodenCard = (function(element_id) {
  cardObj = {
    element: null,
    shown: false,
    winning: false,
    hideCard: function() {
      this.shown = false;
      this.element.style.opacity = "0";
      this.element.style.filter  = 'alpha(opacity=0)';
    },
    showCard: function() {
      this.shown = true;
      this.element.style.opacity = "1";
      this.element.style.filter  = 'alpha(opacity=100)';
    },
    // Reveal the card state (win or empty) given a card
    // index [0-4].
    revealCard: function() {
      if (this.shown === true) {
        if (this.winning === true) {
          this.element.style.backgroundImage = "";
          this.element.style.backgroundColor = "#FF3333";
        }
        else {
          this.element.style.backgroundImage = "";
          this.element.style.backgroundColor = "#333333";
        }
      }
    },
  };
  
  // Initialization
  cardObj.element = document.getElementById(element_id);
  cardObj.element.style.backgroundImage = "url(img/more-leaves-on-green.png)";
  cardObj.hideCard();

  return cardObj;
});

const FlodenTask = (function(is_addition_task) {

  // Helper function to return a copy of fresh card states.
  function initCardArray() {
    floden_card_array = [null, null, null, null, null];
    for (let i=0;i<FLODEN_TASK_NUM_CARDS;i++) {
      floden_card_array[i] = FlodenCard(`floden-card-${i}`);
    }
    return floden_card_array;
  }

  // TODO: This function will need to account for the win-card
  // distribution over 1/5, and 2/3/4 positions as described
  // in the paper.
  function getRandomWinCardIdx() {
    // Currently, it's a uniform distribution.
    return Math.floor(Math.random() * FLODEN_TASK_NUM_CARDS);
  }

  // ADD condition
  function addCard(task_obj, num_shown) {
    console.log(`Showing card: ${num_shown}`);
    if (num_shown == FLODEN_TASK_NUM_CARDS) {
      return;
    }
    task_obj.card_array[num_shown].showCard();
    task_obj.pending_timeouts.push(
        setTimeout(() => addCard(task_obj, num_shown+1), FLODEN_TASK_SHOW_CARD_INTERVAL));
  }

  // SUBTRACT condition
  function subtractCard(task_obj, num_shown) {
    console.log(`Hiding card: ${num_shown-1}`);
    if (num_shown == 0) {
      return;
    }
    task_obj.card_array[num_shown-1].hideCard();
    task_obj.pending_timeouts.push(
        setTimeout(() => subtractCard(task_obj, num_shown-1), FLODEN_TASK_SHOW_CARD_INTERVAL));
  }

  taskObj = {
    card_array: [],
    metrics_array: [],
    pending_timeouts: [],
    is_add_condition: is_addition_task,
    has_started: false,
    // Resets variables in preparation for the next trial.
    reset: function() {
      console.log("Resetting trial...");
      this.pending_timeouts.forEach((timeout_id) => clearTimeout(timeout_id));
      this.pending_timeouts = [];
      this.has_started = false;
      this.metrics_array = [];
      this.card_array = initCardArray();
      this.card_array[getRandomWinCardIdx()].winning = true;
      if (this.is_add_condition === false) {
        this.card_array.forEach((card) => card.showCard());
      }
    },
    // Start task after adding metrics.
    start: function() {
      if (this.has_started === true) {
        console.log("Error: reset current trial first.");
        return;
      }
      console.log("Starting trial...");
      this.metrics_array.push(LatencyMetric(getTimestampNow()));
      this.metrics_array.push(CorrectnessMetric(this));
      this.metrics_array.push(ScoreMetric(this));
      this.metrics_array.push(ConditionMetric(this.is_add_condition));
      this.has_started = true;
      this.pending_timeouts.push(
          setTimeout(() => {
            if (this.is_add_condition === true) {
              addCard(this, 0);
            }
            else {
              subtractCard(this, FLODEN_TASK_NUM_CARDS);
            }
          }, FLODEN_TASK_SHOW_CARD_INTERVAL));
    },
    // Callback for task completion after user action.
    end: function() {
      if (this.has_started === false) {
        console.log("Error: current trial has not yet started.");
        return;
      }
      console.log("Ending trial...");
      this.pending_timeouts.forEach((timeout_id) => clearTimeout(timeout_id));
      // Reveal all shown cards.
      this.card_array.forEach((card) => card.revealCard());
      // Computes all metrics.
      this.metrics_array.forEach((metric) => metric.compute());
    },
    // Prints metrics for the current trial of task.
    printMetrics: function() {
      if (this.metrics_array.length > 0) {
        this.metrics_array.forEach((metric) => console.log(metric.toString()));
      }
    },
    // Get metric by id.
    getMetricById: function(metric_id) {
      return this.metrics_array.filter((metric) => metric.id === metric_id)?.[0];
    },
  };
  return taskObj;
});
