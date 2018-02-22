var Calc=require('./Caculator');

var calc=new Calc();
calc.emit('stop');

console.log(Calc.title+'에 이벤트 발생 함');