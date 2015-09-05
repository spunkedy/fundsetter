var lastValue = 0;
function doPoll(){
  $.get( "/progress/getProgress", function( data ) {
    if(lastValue != data.totalContributions){
      $("#goal-meter-1").goalMeter({
    		goalAmount: 100,
        progressAmount: data.totalContributions
      });
      lastValue = data.value;
    }
    console.log("data returned");
    console.log(data);
    setTimeout(doPoll,70000);
  });
}
doPoll();




$(document).ready(function(){
	"use strict";

	// Example using a formatter function
	$("#goal-meter-1").goalMeter({
		formatter: function(number) {
			return number + "%";
		}
	});


});
