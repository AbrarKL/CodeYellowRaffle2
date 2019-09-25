$("#sizesket, .randomSize").on("click", ".savaliable", function () {
	
		$(".sizeinput").empty();
		$(".allthemsizes").empty();
		$(".size-select").removeClass("wegoagain");
		
		var size4 = 0;
		var size45 = 0;
		var size5 = 0;
		var size55 = 0;
		var size6 = 0;
		var size65 = 0;
		var size7 = 0;
		var size75 = 0;
		var size8 = 0;
		var size85 = 0;
		var size9 = 0;
		var size95 = 0;
		var size10 = 0;
		var size105 = 0;
		var size11 = 0;
		var size115 = 0;
		var size12 = 0;
		var size125 = 0;
		var size13 = 0;
		var size135 = 0;
		var size14 = 0;


		if($('#s4').is(":checked"))
			{
				 size4 = 1;
				 $(".sizeinput").append("4, ");
				 $('.ss4').addClass("wegoagain");
			} else {
				 size4 = 0;
			}
			
		if($('#s45').is(":checked"))
			{
				 size45 = 1;
				 $(".sizeinput").append("4.5, ");
				 $('.ss45').addClass("wegoagain");
			} else {
				 size45 = 0;
			}
			
		if($('#s5').is(":checked"))
			{
				 size5 = 1;
				 $(".sizeinput").append("5, ");
				 $('.ss5').addClass("wegoagain");
			} else {
				 size5 = 0;
			}
			
		if($('#s55').is(":checked"))
			{
				 size55 = 1;
				 $(".sizeinput").append("5.5, ");
				 $('.ss55').addClass("wegoagain");
			} else {
				 size55 = 0;
			}
			
		if($('#s6').is(":checked"))
			{
				 size6 = 1;
				 $(".sizeinput").append("6, ");
				 $('.ss6').addClass("wegoagain");
			} else {
				 size6 = 0;
			}
			
		if($('#s65').is(":checked"))
			{
				 size65 = 1;
				 $(".sizeinput").append("6.5, ");
				 $('.ss65').addClass("wegoagain");
			} else {
				 size65 = 0;
			}
			
		if($('#s7').is(":checked"))
			{
				 size7 = 1;
				 $(".sizeinput").append("7, ");
				 $('.ss7').addClass("wegoagain");
			} else {
				 size7 = 0;
			}
			
		if($('#s75').is(":checked"))
			{
				 size75 = 1;
				 $(".sizeinput").append("7.5, ");
				 $('.ss75').addClass("wegoagain");
			} else {
				 size75 = 0;
			}
			
		if($('#s8').is(":checked"))
			{
				 size8 = 1;
				 $(".sizeinput").append("8, ");
				 $('.ss8').addClass("wegoagain");
			} else {
				 size8 = 0;
			}
			
		if($('#s85').is(":checked"))
			{
				 size85 = 1;
				 $(".sizeinput").append("8.5, ");
				 $('.ss85').addClass("wegoagain");
			} else {
				 size85 = 0;
			}
			
		if($('#s9').is(":checked"))
			{
				 size9 = 1;
				 $(".sizeinput").append("9, ");
				 $('.ss9').addClass("wegoagain");
			} else {
				 size9 = 0;
			}
			
		if($('#s95').is(":checked"))
			{
				 size95 = 1;
				 $(".sizeinput").append("9.5, ");
				 $('.ss95').addClass("wegoagain");
			} else {
				 size95 = 0;
			}	
			
		if($('#s10').is(":checked"))
			{
				 size10 = 1;
				 $(".sizeinput").append("10, ");
				 $('.ss10').addClass("wegoagain");
			} else {
				 size10 = 0;
			}
			
		if($('#s105').is(":checked"))
			{
				 size105 = 1;
				 $(".sizeinput").append("10.5, ");
				 $('.ss105').addClass("wegoagain");
			} else {
				 size105 = 0;
			}	
			
		if($('#s11').is(":checked"))
			{
				 size11 = 1;
				 $(".sizeinput").append("11, ");
				 $('.ss11').addClass("wegoagain");
			} else {
				 size11 = 0;
			}	
			
		if($('#s115').is(":checked"))
			{
				 size115 = 1;
				 $(".sizeinput").append("11.5, ");
				 $('.ss115').addClass("wegoagain");
			} else {
				 size115 = 0;
			}	
			
		if($('#s12').is(":checked"))
			{
				 size12 = 1;
				 $(".sizeinput").append("12, ");
				 $('.ss12').addClass("wegoagain");
			} else {
				 size12 = 0;
			}	
			
		if($('#s125').is(":checked"))
			{
				 size125 = 1;
				 $(".sizeinput").append("12.5, ");
				 $('.ss125').addClass("wegoagain");
			} else {
				 size125 = 0;
			}	
			
		if($('#s13').is(":checked"))
			{
				 size13 = 1;
				 $(".sizeinput").append("13, ");
				 $('.ss13').addClass("wegoagain");
			} else {
				 size13 = 0;
			}	
			
		if($('#s135').is(":checked"))
			{
				 size135 = 1;
				 $(".sizeinput").append("13.5, ");
				 $('.ss135').addClass("wegoagain");
			} else {
				 size135 = 0;
			}		
			
		if($('#s14').is(":checked"))
			{
				 size14 = 1;
				 $(".sizeinput").append("14, ");
				 $('.ss14').addClass("wegoagain");
			} else {
				 size14 = 0;
			}				





			
		if($('#nosize').is(":checked"))
			{
				 $(".sizeinput").append("no size, ");
				 $('.noSize').addClass("wegoagain");
			} else {
			}	

		if($('#selectWin').is(":checked"))
			{
				 $(".sizeinput").append("select on win, ");
				 $('.onWin').addClass("wegoagain");
			} else {
			}	

			
			


		if(size4 == 1 || size45 == 1 || size5 == 1 || size55 == 1 || size6 == 1 || size65 == 1 || size7 == 1 || size75 == 1 || size8 == 1 || size85 == 1 || size9 == 1 || size95 == 1 || size10 == 1 || size105 == 1 || size11 == 1 || size115 == 1 || size12 == 1 || size125 == 1 || size13 == 1 || size135 == 1 || size14 == 1)
			{

			} else {
				$(".sizeinput").append("Select sizes");
			}
			
		if($('.sizeclock input[type="checkbox"]').is(":checked"))
			{
				$(".rekop").css("display", "block");
			} else {
				$(".rekop").css("display", "none");
			}
	
});


 $('#selectAll').click( function () {

			$('.savaliable input[type="checkbox"]').prop('checked', this.checked);
			$('#s6').click();
			$('#s6').click();

			$('#s8').click();
			$('#s8').click();
	
			$('#s10').click();
			$('#s10').click();
			
  });
  
 $("#selectAll").click(function () {
		if($('#selectAll').is(":checked"))
			{
				 $('.selectAll').addClass("wegoagain");
			} else {
				 $('.selectAll').removeClass("wegoagain");
			}	
 });

 $("#selectWin").click(function () {
		if($('#selectWin').is(":checked"))
			{
				 $('.selectWin').addClass("wegoagain");
			} else {
				 $('.selectWin').removeClass("wegoagain");
			}	
 });
 $("#nosize").click(function () {
		if($('#nosize').is(":checked"))
			{
				 $('.nosize').addClass("wegoagain");
			} else {
				 $('.nosize').removeClass("wegoagain");
			}	
 });
 $("#randomSize").click(function () {
		if($('#randomSize').is(":checked"))
			{
				 $('.randomSize').addClass("wegoagain");
			} else {
				 $('.randomSize').removeClass("wegoagain");
			}	
 });

//$('.selectAll').change(function() { 
//		if($('#selectWin').is(":checked"))
//			{
//				 $('.selectWin').addClass("wegoagain");
//			} else {
//				 $('.selectWin').removeClass("wegoagain");
//			}		
//			
//		if($('#randomSize').is(":checked"))
//			{
//				 $('.randomSize').addClass("wegoagain");
//			} else {
//				 $('.randomSize').removeClass("wegoagain");
//			}	
//});

  
//$("#selectAll").change(function(){
//    var status = $(this).is(":checked") ? true : false;
//    $(".savaliable").prop("checked",status);
//	if (status == true) {
//		$('.savaliable input[type="checkbox"]').not(this).prop('checked', this.checked);
//	}
//	console.log(status);
//});
  

//$("#okaybet").click(function (e) {
//  $('.savaliable input[type="checkbox"]').not(this).prop('checked', this.checked);
//});

$(".sizeinput").click(function() {
		$(".sizedropcontainer").toggleClass("hideyourkidshideyourwife");
});

$(".buttonbar, skelto").click(function() {
		$(".sizedropcontainer").removeClass("hideyourkidshideyourwife");
});

$(document).click(function() {
    $(".sizedropcontainer").removeClass("hideyourkidshideyourwife");
});

$(".sizesket, .kojey").click(function(event) {
    $(".sizedropcontainer").addClass("hideyourkidshideyourwife");
    event.stopPropagation();
});


$(document).ready(function() {
    $(".selecttexter").append("Select sizes");
	$(".sizedropcontainer").css("display", "none");
});

$(window).click(function(e) {
    if($(".ss4").hasClass("sizedisabled"))
	{
		$("#s4").prop("disabled", true)
	} else {
		$("#s4").prop("disabled", false)

	}
	
	if($(".ss45").hasClass("sizedisabled"))
	{
		$("#s45").prop("disabled", true)
	} else {
		$("#s45").prop("disabled", false)

	}
	
	if($(".ss5").hasClass("sizedisabled"))
	{
		$("#s5").prop("disabled", true)
	} else {
		$("#s5").prop("disabled", false)

	}
	
	if($(".ss55").hasClass("sizedisabled"))
	{
		$("#s55").prop("disabled", true)
	} else {
		$("#s55").prop("disabled", false)

	}
	
	if($(".ss6").hasClass("sizedisabled"))
	{
		$("#s6").prop("disabled", true)
	} else {
		$("#s6").prop("disabled", false)

	}
	
	if($(".ss65").hasClass("sizedisabled"))
	{
		$("#s65").prop("disabled", true)
	} else {
		$("#s65").prop("disabled", false)

	}
	
	if($(".ss7").hasClass("sizedisabled"))
	{
		$("#s7").prop("disabled", true)
	} else {
		$("#s7").prop("disabled", false)

	}
	
	if($(".ss75").hasClass("sizedisabled"))
	{
		$("#s75").prop("disabled", true)
	} else {
		$("#s75").prop("disabled", false)

	}
	
	if($(".ss8").hasClass("sizedisabled"))
	{
		$("#s8").prop("disabled", true)
	} else {
		$("#s8").prop("disabled", false)

	}
	if($(".ss85").hasClass("sizedisabled"))
	{
		$("#s85").prop("disabled", true)
	} else {
		$("#s85").prop("disabled", false)

	}
	
	if($(".ss9").hasClass("sizedisabled"))
	{
		$("#s9").prop("disabled", true)
	} else {
		$("#s9").prop("disabled", false)

	}
	
	if($(".ss95").hasClass("sizedisabled"))
	{
		$("#s95").prop("disabled", true)
	} else {
		$("#s95").prop("disabled", false)

	}
	
	if($(".ss10").hasClass("sizedisabled"))
	{
		$("#s10").prop("disabled", true)
	} else {
		$("#s10").prop("disabled", false)

	}
	
	if($(".ss105").hasClass("sizedisabled"))
	{
		$("#s105").prop("disabled", true)
	} else {
		$("#s105").prop("disabled", false)

	}
	
	if($(".ss11").hasClass("sizedisabled"))
	{
		$("#s11").prop("disabled", true)
	} else {
		$("#s11").prop("disabled", false)

	}
	
	if($(".ss115").hasClass("sizedisabled"))
	{
		$("#s115").prop("disabled", true)
	} else {
		$("#s115").prop("disabled", false)

	}
	
	if($(".ss12").hasClass("sizedisabled"))
	{
		$("#s12").prop("disabled", true)
	} else {
		$("#s12").prop("disabled", false)

	}
	
	if($(".ss125").hasClass("sizedisabled"))
	{
		$("#s125").prop("disabled", true)
	} else {
		$("#s125").prop("disabled", false)

	}
	
	if($(".ss13").hasClass("sizedisabled"))
	{
		$("#s13").prop("disabled", true)
	} else {
		$("#s13").prop("disabled", false)

	}
	
	if($(".ss135").hasClass("sizedisabled"))
	{
		$("#s135").prop("disabled", true)
	} else {
		$("#s135").prop("disabled", false)

	}

	if($(".ss14").hasClass("sizedisabled"))
	{
		$("#s14").prop("disabled", true)
	} else {
		$("#s14").prop("disabled", false)

	}	
	


	
	if($(".noSize").hasClass("sizedisabled"))
	{
		$("#nosize").prop("disabled", true)
	} else {
		$("#nosize").prop("disabled", false)

	}	
	
	if($(".onWin").hasClass("sizedisabled"))
	{
		$("#selectWin").prop("disabled", true)
	} else {
		$("#selectWin").prop("disabled", false)

	}	
	
	if($(".selectAll").hasClass("plusdisabled"))
	{
		$("#selectAll").prop("disabled", true)
	} else {
		$("#selectAll").prop("disabled", false)

	}

});



