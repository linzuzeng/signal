var nums=0;
for (var i=0;i<captured.length;i++)
{
 
 if (Math.floor(mulitply1(captured[i],captured[i-1]).like*100)<40){
  nums++;
  console.log(i.toString()+"   "+Math.floor(mulitply1(captured[i],captured[i-1]).like*100)+"  ???");

 }
else
console.log(i.toString()+"   "+Math.floor(mulitply1(captured[i],captured[i-1]).like*100));
}

console.log("NUMS:"+nums.toString());

var new_instrument = [];
	var new_num=0;
target=[0,1,2,3,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,40,41,42,43,44,45,46,47,48,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,70,74,75,76,77,78,79,80,81,82,83,84,85]


target.forEach(function(n){
	new_instrument[new_num++]=captured[n];
	
}
)
captured=new_instrument;
result.html(JSON.stringify(new_instrument));
console.log(new_num);
for (var i=0;i<captured.length;i++)
{var tot=0
 for (var b=0;b<captured.length;b++)
	tot+=Math.floor(mulitply1(captured[i],captured[b]).like*100)
  console.log(i.toString()+"   "+(tot-100).toString());
}
