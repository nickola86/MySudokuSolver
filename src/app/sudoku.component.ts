import { Component, OnInit, NgZone } from "@angular/core";

const autoSolve = true;

@Component({
  selector: "sudoku",
  templateUrl: "./sudoku.component.html",
  styleUrls: ["./sudoku.component.css"]
})
export class Sudoku implements OnInit {
  title = "Sudoku Solver";
  matrix = [];
  matrixHistory = [];

  constructor(zone: NgZone){}

  lock(){
    let list = this.matrixToList();
    let sublist = list.filter(e=>e.numbers.length==0);
    sublist.forEach(e=>e.fixed=true);
  }

  solve(){
    let list = this.matrixToList();
    let sublist = list.filter(e=>e.numbers.length==1);
    if(sublist.length>0){
      console.log("Solve 1, list: ", list);
      console.log(sublist);
      sublist.forEach(e=>{
        e.value=e.numbers.pop();
        this.cellChange(e);
      });
      if(autoSolve) this.solve();
    }else{
      list = list.filter(e=> e.numbers.length>0);
      list = list.sort( (a,b) => a.numbers.length - b.numbers.length);
      console.log("Solve 2, list: ", list);
      try{
        list.forEach(e => {
          console.log("Foreach: ", e);
          e.numbers.forEach(n => {
            let r = 0;
            let c = 0;
            let exist = false;

            //Cerco sulla stessa riga
            r = e.r-1;
            for(c = 0; c<9 && !exist; c++){
              if(this.matrix[r][c].numbers.length > 0){
                exist = this.matrix[r][c].numbers.indexOf(n) >= 0;
              }
            }

            //Cerco sulla stessa colonna
            c = e.c-1;
            for(r = 0; r<9 && !exist; r++){
              if(this.matrix[r][c].numbers.length > 0){
                exist = this.matrix[r][c].numbers.indexOf(n) >= 0;
              }
            }

            //Cerco nello stesso blocco
            let br = Math.floor((e.r-1)/3);
            let bc = Math.floor((e.c-1)/3);
            for(r=0; r<=2;r++){
              for(c=0; c<=2; c++){
                if(this.matrix[br*3+r][bc*3+c].numbers.length > 0){
                  exist = this.matrix[br*3+r][bc*3+c].numbers.indexOf(n) >= 0;
                }
              }
            }
            
            if(!exist){
              e.value=n;
              this.cellChange(e);
              if(autoSolve) this.solve();
              //Condizione di stop del ForEach
              throw {};
            }

          });
        });
      }catch(e){}
    }

  }

  matrixToList(){
    let list = [];
    for(let r=0; r<=8;r++)
      for(let c=0; c<=8; c++)
        list.push(this.matrix[r][c]);
    return list;
  }

  cellChange(cell) {
    this.setMatrix(cell);
    this.saveMatrix(cell);
    this.updateNumbers(cell);
  }

  saveMatrix(cell){
    let m = JSON.parse(JSON.stringify(this.matrix));
    m[cell.r-1][cell.c-1].value=undefined;
    this.matrixHistory.push(m);
  }
  setMatrix(cell){
    if(cell.value){
      this.matrix[cell.r-1][cell.c-1].value = cell.value;
      this.matrix[cell.r-1][cell.c-1].numbers = [];
    }
    if(cell.fixed){
      this.matrix[cell.r-1][cell.c-1].fixed = cell.fixed;
    }
  }

  updateNumbers(cell) {
    cell.numbers = [];
    this.removeValueFromRow(cell);
    this.removeValueFromCol(cell);
    this.removeValueFromBlock(cell);
  }

  removeValueFromRow(cell) {
    let v = cell.value;
    let r = cell.r - 1;
    for (let c = 0; c < 9; c++) {
      let numbers = this.matrix[r][c].numbers;
      if(numbers.indexOf(v)>=0) numbers.splice(numbers.indexOf(v), 1);
    }
  }
  removeValueFromCol(cell) {
    let v = cell.value;
    let c = cell.c - 1;
    for (let r = 0; r < 9; r++) {
      let numbers = this.matrix[r][c].numbers;
      if(numbers.indexOf(v)>=0) numbers.splice(numbers.indexOf(v), 1);
    }
  }
  removeValueFromBlock(cell) {
    let br = Math.floor((cell.r-1)/3);
    let bc = Math.floor((cell.c-1)/3);
    for(let r=1; r<=3;r++)
      for(let c=1; c<=3; c++)
        this.removeValueFromCell(cell.value, br*3+r,bc*3+c);
  }
  removeValueFromCell(v,r,c){
    let numbers = this.matrix[r-1][c-1].numbers;
    if(numbers.indexOf(v)>=0) numbers.splice(numbers.indexOf(v), 1);
  }

  undo() {
    var m = this.matrixHistory.pop();
    this.matrix = m;
  }

  ngOnInit() {
    this.initEmptyMatrix();
    this.mockSchema();
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
      }
    }
    this.matrixHistory.push(JSON.parse(JSON.stringify(this.matrix)));
  }


  mockSchema(){    
    this.cellChange({r:1,c:8,value:6,fixed:true});
    this.cellChange({r:1,c:9,value:4,fixed:true});
    this.cellChange({r:2,c:2,value:2,fixed:true});
    this.cellChange({r:2,c:3,value:9,fixed:true});
    this.cellChange({r:2,c:4,value:8,fixed:true});
    this.cellChange({r:2,c:5,value:3,fixed:true});
    this.cellChange({r:3,c:1,value:5,fixed:true});
    this.cellChange({r:3,c:9,value:3,fixed:true});
    this.cellChange({r:4,c:1,value:1,fixed:true});
    this.cellChange({r:4,c:2,value:7,fixed:true});
    this.cellChange({r:4,c:3,value:5,fixed:true});
    this.cellChange({r:4,c:4,value:9,fixed:true});
    this.cellChange({r:4,c:5,value:4,fixed:true});
    this.cellChange({r:4,c:6,value:2,fixed:true});
    this.cellChange({r:5,c:1,value:9,fixed:true});
    this.cellChange({r:5,c:3,value:8,fixed:true});
    this.cellChange({r:5,c:7,value:5,fixed:true});
    this.cellChange({r:5,c:9,value:2,fixed:true});
    this.cellChange({r:6,c:4,value:5,fixed:true});
    this.cellChange({r:6,c:5,value:8,fixed:true});
    this.cellChange({r:6,c:6,value:3,fixed:true});
    this.cellChange({r:6,c:7,value:1,fixed:true});
    this.cellChange({r:6,c:8,value:9,fixed:true});
    this.cellChange({r:6,c:9,value:7,fixed:true});
    this.cellChange({r:7,c:1,value:6,fixed:true});
    this.cellChange({r:7,c:9,value:9,fixed:true});
    this.cellChange({r:8,c:5,value:7,fixed:true});
    this.cellChange({r:8,c:6,value:5,fixed:true});
    this.cellChange({r:8,c:7,value:6,fixed:true});
    this.cellChange({r:8,c:8,value:2,fixed:true});
    this.cellChange({r:9,c:1,value:3,fixed:true});
    this.cellChange({r:9,c:2,value:1,fixed:true});
  }
}
