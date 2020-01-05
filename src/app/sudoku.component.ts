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
    this.matrixHistory.push(JSON.parse(JSON.stringify(this.matrix)));
    this.listHistory.push(JSON.parse(JSON.stringify(this.list)));
    cell.numbers = [];
  }

  undo() {
    var m = this.matrixHistory.pop();
    var l = this.listHistory.pop();
    this.matrix = m;
    this.list = l;
  }

  ngOnInit() {
    this.initEmptyMatrix();
    console.log(this.matrix);
    console.log(this.list);
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
