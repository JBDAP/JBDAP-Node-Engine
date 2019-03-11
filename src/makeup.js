/**
 * 对原生 js 的丰富
 */

String.prototype.replaceAll = function(s1,s2){ 
    return this.replace(new RegExp(s1,"gm"),s2);
}
String.prototype.removeBlank = function(){ 
    return this.replaceAll(' ','');
}
String.prototype.removeEOL = function(){ 
    return this.replaceAll(EOL,'');
}
String.prototype.fillZeroTo = function(n){
    var str = '';
    if (this.length < n) for (var i=1; i<=(n-this.length); i++) str += '0';
    return str + this;
}

Date.prototype.addMinutes = function(number){
    return new Date(this.getTime() + 60*1000*number)
}
Date.prototype.addHours = function(number){
    return new Date(this.getTime() + 60*60*1000*number)
}
Date.prototype.addDays = function(number){
    return new Date(this.getTime() + 24*60*60*1000*number)
}
Date.prototype.dateString = function(){
    return this.getFullYear() + '-' + (this.getMonth() + 1).toString().fillZeroTo(2) + '-' + this.getDate().toString().fillZeroTo(2); 
}
Date.prototype.timeString = function(){
    return this.getFullYear() + '-' + (this.getMonth() + 1).toString().fillZeroTo(2) + '-' + this.getDate().toString().fillZeroTo(2) + ' ' + this.getHours().toString().fillZeroTo(2) + ':' + this.getMinutes().toString().fillZeroTo(2) + ':' + this.getSeconds().toString().fillZeroTo(2); 
}

Number.randomBetween = function(Min,Max){
    var Range = Max - Min
    var Rand = Math.random()
    var num = Min + Math.round(Rand * Range)
    return num
}
