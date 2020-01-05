import { Component, OnInit } from "@angular/core";

@Component({
  selector: "sudoku",
  templateUrl: "./sudoku.component.html",
  styleUrls: ["./sudoku.component.css"]
})
export class Sudoku implements OnInit {
  title = "Sudoku Solver";
  matrix = [];
  list = [];
  matrixHistory = [];
  listHistory = [];

  cellChange(cell) {
    console.log("Current Matrix: ", this.matrix);
    this.matrixHistory.push(JSON.parse(JSON.stringify(this.matrix)));
    this.listHistory.push(JSON.parse(JSON.stringify(this.list)));
    this.updateNumbers(cell);
  }

  updateNumbers(cell) {
    this.removeValueFromRow(cell);
    this.removeValueFromCol(cell);
    this.removeValueFromBlock(cell);
    cell.numbers = [];
  }

  removeValueFromRow(cell) {
    console.log("cell", cell);
    console.log("cell.value", cell.value);
    console.log("cell.r", cell.r);
    console.log("cell.c", cell.c);
    let v = cell.value;
    let r = cell.r - 1;
    for (let c = 0; c < 9; c++) {
      let numbers = this.matrix[r][c].numbers;
      numbers = numbers.splice(numbers.indexOf(v), 1);
    }
  }
  removeValueFromCol(cell) {
    let v = cell.value;
    let c = cell.c - 1;
    for (let r = 0; r < 9; r++) {
      let numbers = this.matrix[r][c].numbers;
      numbers.splice(numbers.indexOf(v), 1);
    }
  }
  removeValueFromBlock(cell) {}

  undo() {
    var m = this.matrixHistory.pop();
    var l = this.listHistory.pop();
    this.matrix = m;
    this.list = l;
  }

  ngOnInit() {
    this.initEmptyMatrix();
  }

  initEmptyMatrix() {
    for (let i = 0; i < 9; i++) {
      this.matrix[i] = [];
      for (let j = 0; j < 9; j++) {
        let cell = {
          r: i + 1,
          c: j + 1,
          value: undefined,
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        };
        this.matrix[i][j] = cell;
        this.list.push(cell);
      }
    }
    this.matrixHistory.push(JSON.parse(JSON.stringify(this.matrix)));
    this.listHistory.push(JSON.parse(JSON.stringify(this.list)));
  }
}
