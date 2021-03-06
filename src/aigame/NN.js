const math = require("mathjs");
const game = require("../game/game-service");

function zeroes(x, y) {
  let zeroed = [];
  for (let i = 0; i < y; i++) {
    let tempArray = [];
    for (let j = 0; j < x; j++) {
      tempArray.push(0);
    }
    zeroed.push(tempArray);
  }
  return zeroed;
}

function randomizeArray(x, y) {
  let output = zeroes(x, y);
  for (let i = 0; i < y; i++) {
    for (let j = 0; j < x; j++) {
      output[i][j] = Math.random();
    }
  }
  return output;
}

function sigmoid(arr) {
  let newArr = math.clone(arr);
  for (let i = 0; i < newArr._data.length; i++) {
    for (let j = 0; j < newArr._data[0].length; j++) {
      newArr._data[i][j] = 1 / (1 + Math.exp(-arr._data[i][j] / 10));
    }
  }
  return newArr;
}

function sigmoid_derivative(arr) {
  let newArr = math.clone(arr);
  for (let i = 0; i < newArr._data.length; i++) {
    for (let j = 0; j < newArr._data[0].length; j++) {
      newArr._data[i][j] = arr._data[i][j] * (1 - arr._data[i][j]);
    }
  }
  return newArr;
}

function double(arr) {
  for (let i = 0; i < arr._data.length; i++) {
    for (let j = 0; j < arr._data[0].length; j++) {
      arr._data[i][j] *= 2;
    }
  }
  return arr;
}

function times(arr1, arr2) {
  let newArr = math.clone(arr1);
  for (let i = 0; i < newArr._data.length; i++) {
    for (let j = 0; j < newArr._data[0].length; j++) {
      newArr._data[i][j] = arr1._data[i][j] * arr2._data[i][j];
    }
  }
  return newArr;
}

function stringify(board) {
  let string = "";
  for (let i = 0; i < board.length; i++) {
    let line = "\n";
    for (let j = 0; j < board[0].length; j++) {
      line = line + " " + board[i][j].toFixed(2) + ",";
    }
    string = string + line;
  }

  return string;
}

function display(nn) {
  console.log("");

  console.log("SUMMARY: ----------------------------------------------");

  console.log("Input layer:", stringify(nn.input._data));
  //console.log("weights 1:", stringify(nn.weights1._data));
  //console.log("layer1: ", stringify(nn.layer1._data));
  //console.log("weights 2:", stringify(nn.weights2._data));
  console.log("Target output:", stringify(nn.y._data));
  console.log("actual output:", stringify(nn.output._data));

  console.log("Brain Age:", nn.age);
  console.log(
    "END SUMMARY: -----------------------------------------------------------"
  );
  console.log("");
}

function scrubVisibleBoard(board, mask) {
  let newBoard = math.clone(board);
  let width = board._data.length;
  let length = board._data[0].length;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      if (mask[i][j] === 1) {
        if (newBoard._data[i][j] <= 4 || newBoard._data[i][j] === 8) {
          newBoard._data[i][j] = 1;
        }
        if (newBoard._data[i][j] === 7) newBoard._data[i][j] = 0;
      } else newBoard._data[i][j] = 0.5;
    }
  }

  //console.log("visibleBoard: ", newBoard._data);

  return newBoard;
}

function cloneValues(nn, input, expectedOutput) {
  let newNN = new NeuralNetwork(input, expectedOutput);
  newNN.weights1 = nn.weights1;
  newNN.weights2 = nn.weights2;
  newNN.layer1 == nn.layer1;
  newNN.age = nn.age;
  return newNN;
}

function scrubAnswerBoard(board) {
  let newBoard = math.clone(board);
  let width = board._data.length;
  let length = board._data[0].length;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      if (newBoard._data[i][j] <= 4 || newBoard._data[i][j] === 8) {
        newBoard._data[i][j] = 1;
      } else newBoard._data[i][j] = 0;
    }
  }

  //console.log("answerBoard: ", newBoard._data);
  return newBoard;
}

function randomizeMask(board) {
  let mask = math.clone(board);
  let validHit = false;
  let validMiss = false;
  while (validHit === false || validMiss === false) {
    for (let i = 0; i < mask._data.length; i++) {
      for (let j = 0; j < mask._data[0].length; j++) {
        if (Math.random() > 0.95) {
          mask._data[i][j] = 0;
          if (board._data[i][j] === 1) {
            validHit = true;
          } else {
            validMiss = true;
          }
        } else {
          mask._data[i][j] = 1;
        }
      }
    }
  }

  return mask._data;
}

function getMove(nn, mask) {
  let high = 0;
  let IHigh = 0;
  let JHigh = 0;

  for (let i = 0; i < nn.output._data.length; i++) {
    for (let j = 0; j < nn.output._data[0].length; j++) {
      if (mask[i][j] === 0) {
        if (nn.output._data[i][j] > high) {
          high = nn.output._data[i][j];
          IHigh = i;
          JHigh = j;
        }
      }
    }
  }

  if (nn.y._data[IHigh][JHigh] === 1) {
    return [true, high, IHigh, JHigh];
    //console.log("          HIT! :D      ");
  } else {
    return [false, high, IHigh, JHigh];
    //console.log("                   Miss :(                ");
  }

  //console.log("Predicted move: x:", IHigh, "y:", JHigh, "Value:", high);
}

function getRandoMove(nn, mask) {
  let high = 0;
  let IHigh = 0;
  let JHigh = 0;

  for (let i = 0; i < nn.output._data.length; i++) {
    for (let j = 0; j < nn.output._data[0].length; j++) {
      if (mask[i][j] === 0) {
        high = nn.output._data[i][j];
        IHigh = i;
        JHigh = j;
      }
    }
  }

  if (nn.y._data[IHigh][JHigh] === 1) {
    return [true, high, IHigh, JHigh];
    //console.log("          HIT! :D      ");
  } else {
    return [false, high, IHigh, JHigh];
    //console.log("                   Miss :(                ");
  }
}

class NeuralNetwork {
  constructor(x, y) {
    this.input = x;
    this.xwidth = x._data.length;
    this.xlength = x._data[0].length;
    this.ylength = y._data.length;
    this.ywidth = y._data[0].length;
    this.weights1 = math.matrix(randomizeArray(this.xwidth, this.xlength));
    this.weights2 = math.matrix(randomizeArray(this.ywidth, this.ylength));
    this.y = y;
    this.output = math.matrix(zeroes(this.ywidth, this.ylength));
    this.age = 0;
  }

  feedforward() {
    this.layer1 = sigmoid(math.multiply(this.input, this.weights1));
    this.output = sigmoid(math.multiply(this.layer1, this.weights2));
  }

  train() {
    this.feedforward();
    this.backprop();
    this.age += 1;
  }

  backprop() {
    // # application of the chain rule to find derivative of the loss function with respect to weights2 and weights1
    let loss = double(math.subtract(this.y, this.output));
    let d_weights2 = math.multiply(
      math.transpose(this.layer1),
      times(loss, sigmoid_derivative(this.output))
    );

    let d_weights1 = math.multiply(
      math.transpose(this.input),
      times(
        math.multiply(
          times(loss, sigmoid_derivative(this.output)),
          math.transpose(this.weights2)
        ),
        sigmoid_derivative(this.layer1)
      )
    );
    // # update the weights with the derivative (slope) of the loss function
    this.weights1 = math.add(this.weights1, d_weights1);
    this.weights2 = math.add(this.weights2, d_weights2);
  }
}

function main() {
  let mask = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];

  let board = math.matrix(game.generateBoard());
  let input = scrubVisibleBoard(board, mask);
  let output = scrubAnswerBoard(board);

  let brain = new NeuralNetwork(input, output);

  brain.feedforward();

  //console.log("NN initialized:");
  display(brain);

  let zeroHits = 0;
  let newBHits = 0;
  let zeroCon = 0;
  let newBCon = 0;
  let randoCon = 0;
  let randoHits = 0;

  for (let runs = 0; runs < 1001; runs++) {
    for (let epoch = 0; epoch < 1001; epoch++) {
      brain = new NeuralNetwork(input, output);
      for (let loop = 0; loop < 1001; loop++) {
        board = math.matrix(game.generateBoard());
        output = scrubAnswerBoard(board);
        mask = randomizeMask(output);
        input = scrubVisibleBoard(board, mask);
        brain.input = input;
        brain.y = output;

        //if (loop % 2 === 0) {
        if (loop === 1) {
          randoData = getRandoMove(brain, mask);
          if (randoData[0]) {
            randoHits += 1;
          }
          randoCon += randoData[1];
        }

        if (loop === 0) {
          brain.train();
          brain.feedforward();
          data = getMove(brain, mask);
          if (data[0]) {
            zeroHits += 1;
          }
          zeroCon += data[1];
        }
        //}
        brain.train();
      }

      console.log(
        "Run:",
        runs,
        "Epoch",
        epoch,
        "Zero:",
        zeroHits,
        (100 * (zeroHits / (runs * 1001 + epoch + 1))).toFixed(3),
        "%",
        "Rando:",
        randoHits,
        (100 * (randoHits / (runs * 1001 + epoch + 1))).toFixed(3),
        "%",
        "NewB:",
        newBHits,
        (100 * (newBHits / (runs * 1001 + epoch + 1))).toFixed(3),
        "%",
        "zdiff",
        (
          100 * (newBHits / (runs * 1001 + epoch + 1)) -
          100 * (zeroHits / (runs * 1001 + epoch + 1))
        ).toFixed(3),
        "rDiff",
        (
          100 * (newBHits / (runs * 1001 + epoch + 1)) -
          100 * (randoHits / (runs * 1001 + epoch + 1))
        ).toFixed(3),
        "zCon:",
        (zeroCon / (runs * 1001 + epoch + 1)).toFixed(3),
        "rCon:",
        (randoCon / (runs * 1001 + epoch + 1)).toFixed(3),
        "nCon:",
        (newBCon / (runs * 1001 + epoch + 1)).toFixed(3),
        "iteration:",
        runs * 1001 + epoch + 1,
        "Age:",
        brain.age
      );

      //console.log("****************NEWBRAIN*****************");
      let newBoard = math.matrix(game.generateBoard());
      let answerBoard = scrubAnswerBoard(newBoard);
      let newMask = randomizeMask(answerBoard);
      let visibleBoard = scrubVisibleBoard(newBoard, newMask);
      let newBrain = cloneValues(brain, visibleBoard, answerBoard);
      newBrain.feedforward();
      data = getMove(newBrain, newMask);
      if (epoch % 100 === 0 && false) {
        display(newBrain);
        console.log(
          "Predicted move: x:",
          data[2],
          "y:",
          data[3],
          "Value:",
          data[1],
          "hit:",
          data[0]
        );
      }
      //display(newBrain);
      if (data[0]) {
        newBHits += 1;
      }
      newBCon += data[1];
      newBrain.backprop();
    }
  }
}

main();
