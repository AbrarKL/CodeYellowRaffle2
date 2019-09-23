$(".savaliable").click(function() {
	
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
				 $(".sizeinput").append("size: 4, ");
				 $('#size4').addClass("wegoagain");
			} else {
				 size4 = 0;
			}
			
		if($('#s45').is(":checked"))
			{
				 size45 = 1;
				 $(".sizeinput").append("size: 4.5, ");
				 $('#size45').addClass("wegoagain");
			} else {
				 size45 = 0;
			}
			
		if($('#s5').is(":checked"))
			{
				 size5 = 1;
				 $(".sizeinput").append("size: 5, ");
				 $('#size5').addClass("wegoagain");
			} else {
				 size5 = 0;
			}
			
		if($('#s55').is(":checked"))
			{
				 size55 = 1;
				 $(".sizeinput").append("size: 5.5, ");
				 $('#size55').addClass("wegoagain");
			} else {
				 size55 = 0;
			}
			
		if($('#s6').is(":checked"))
			{
				 size6 = 1;
				 $(".sizeinput").append("size: 6, ");
				 $('#size6').addClass("wegoagain");
			} else {
				 size6 = 0;
			}
			
		if($('#s65').is(":checked"))
			{
				 size65 = 1;
				 $(".sizeinput").append("size: 6.5, ");
				 $('#size65').addClass("wegoagain");
			} else {
				 size65 = 0;
			}
			
		if($('#s7').is(":checked"))
			{
				 size7 = 1;
				 $(".sizeinput").append("size: 7, ");
				 $('#size7').addClass("wegoagain");
			} else {
				 size7 = 0;
			}
			
		if($('#s75').is(":checked"))
			{
				 size75 = 1;
				 $(".sizeinput").append("size: 7.5, ");
				 $('#size75').addClass("wegoagain");
			} else {
				 size75 = 0;
			}
			
		if($('#s8').is(":checked"))
			{
				 size8 = 1;
				 $(".sizeinput").append("size: 8, ");
				 $('#size8').addClass("wegoagain");
			} else {
				 size8 = 0;
			}
			
		if($('#s85').is(":checked"))
			{
				 size85 = 1;
				 $(".sizeinput").append("size: 8.5, ");
				 $('#size85').addClass("wegoagain");
			} else {
				 size85 = 0;
			}
			
		if($('#s9').is(":checked"))
			{
				 size9 = 1;
				 $(".sizeinput").append("size: 9, ");
				 $('#size9').addClass("wegoagain");
			} else {
				 size9 = 0;
			}
			
		if($('#s95').is(":checked"))
			{
				 size95 = 1;
				 $(".sizeinput").append("size: 9.5, ");
				 $('#size95').addClass("wegoagain");
			} else {
				 size95 = 0;
			}	
			
		if($('#s10').is(":checked"))
			{
				 size10 = 1;
				 $(".sizeinput").append("size: 10, ");
				 $('#size10').addClass("wegoagain");
			} else {
				 size10 = 0;
			}
			
		if($('#s105').is(":checked"))
			{
				 size105 = 1;
				 $(".sizeinput").append("size: 10.5, ");
				 $('#size105').addClass("wegoagain");
			} else {
				 size105 = 0;
			}	
			
		if($('#s11').is(":checked"))
			{
				 size11 = 1;
				 $(".sizeinput").append("size: 11, ");
				 $('#size11').addClass("wegoagain");
			} else {
				 size11 = 0;
			}	
			
		if($('#s115').is(":checked"))
			{
				 size115 = 1;
				 $(".sizeinput").append("size: 11.5, ");
				 $('#size115').addClass("wegoagain");
			} else {
				 size115 = 0;
			}	
			
		if($('#s12').is(":checked"))
			{
				 size12 = 1;
				 $(".sizeinput").append("size: 12, ");
				 $('#size12').addClass("wegoagain");
			} else {
				 size12 = 0;
			}	
			
		if($('#s125').is(":checked"))
			{
				 size125 = 1;
				 $(".sizeinput").append("size: 12.5, ");
				 $('#size125').addClass("wegoagain");
			} else {
				 size125 = 0;
			}	
			
		if($('#s13').is(":checked"))
			{
				 size13 = 1;
				 $(".sizeinput").append("size: 13, ");
				 $('#size13').addClass("wegoagain");
			} else {
				 size13 = 0;
			}	
			
		if($('#s135').is(":checked"))
			{
				 size135 = 1;
				 $(".sizeinput").append("size: 13.5, ");
				 $('#size135').addClass("wegoagain");
			} else {
				 size135 = 0;
			}		
			
		if($('#s14').is(":checked"))
			{
				 size14 = 1;
				 $(".sizeinput").append("size: 14, ");
				 $('#size14').addClass("wegoagain");
			} else {
				 size14 = 0;
			}	

		if(size4 == 1 || size45 == 1 || size5 == 1 || size55 == 1 || size6 == 1 || size65 == 1 || size7 == 1 || size75 == 1 || size8 == 1 || size85 == 1 || size9 == 1 || size95 == 1 || size10 == 1 || size105 == 1 || size11 == 1 || size115 == 1 || size12 == 1 || size125 == 1 || size13 == 1 || size135 == 1 || size14 == 1)
			{

			} else {
				$(".sizeinput").append("Select sizes");
			}
			
//		if($('#allsize').is(":checked"))
//			{
//				$("#s4, #s45, #s5, #s55, #s6, #s65, #s7, #s75, #s8, #s85, #s9, #s95, #s10, #s105, #s11, #s115, #s12, #s125, #s13, #s135, #s14").prop('checked', true);
//			} else {
//				$("#s4, #s45, #s5, #s55, #s6, #s65, #s7, #s75, #s8, #s85, #s9, #s95, #s10, #s105, #s11, #s115, #s12, #s125, #s13, #s135, #s14").prop('checked', false);
//			}
		
});


  $('.size-select .allthemsizes').click( function () {
    $('.size-select input[type="checkbox"]').prop('checked', this.checked)
  })


$(".sizeinput").click(function() {
		$(".sizedropcontainer").toggleClass("hideyourkidshideyourwife");
});

$(".buttonbar, skelto").click(function() {
		$(".sizedropcontainer").removeClass("hideyourkidshideyourwife");
});


//$(document).click(function(e) {
//    if (($(e.target).closest("#sizesket").attr("id") != "sizesket") &&
//        $(e.target).closest(".sizeinput").attr("id") != "sizeinput") {
//			$(".sizedropcontainer").css("display", "none");
//    }
//});


$(document).ready(function() {
    $(".selecttexter").append("Select sizes");
	$(".sizedropcontainer").css("display", "none");
});

$(window).click(function(e) {
    if($("#size4").hasClass("sizedisabled"))
	{
		$("#s4").prop("disabled", true)
	} else {
		$("#s4").prop("disabled", false)

	}
	
	if($("#size45").hasClass("sizedisabled"))
	{
		$("#s45").prop("disabled", true)
	} else {
		$("#s45").prop("disabled", false)

	}
	
	if($("#size5").hasClass("sizedisabled"))
	{
		$("#s5").prop("disabled", true)
	} else {
		$("#s5").prop("disabled", false)

	}
	
	if($("#size55").hasClass("sizedisabled"))
	{
		$("#s55").prop("disabled", true)
	} else {
		$("#s55").prop("disabled", false)

	}
	
	if($("#size6").hasClass("sizedisabled"))
	{
		$("#s6").prop("disabled", true)
	} else {
		$("#s6").prop("disabled", false)

	}
	
	if($("#size65").hasClass("sizedisabled"))
	{
		$("#s65").prop("disabled", true)
	} else {
		$("#s65").prop("disabled", false)

	}
	
	if($("#size7").hasClass("sizedisabled"))
	{
		$("#s7").prop("disabled", true)
	} else {
		$("#s7").prop("disabled", false)

	}
	
	if($("#size75").hasClass("sizedisabled"))
	{
		$("#s75").prop("disabled", true)
	} else {
		$("#s75").prop("disabled", false)

	}
	
	if($("#size8").hasClass("sizedisabled"))
	{
		$("#s8").prop("disabled", true)
	} else {
		$("#s8").prop("disabled", false)

	}
	if($("#size85").hasClass("sizedisabled"))
	{
		$("#s85").prop("disabled", true)
	} else {
		$("#s85").prop("disabled", false)

	}
	
	if($("#size9").hasClass("sizedisabled"))
	{
		$("#s9").prop("disabled", true)
	} else {
		$("#s9").prop("disabled", false)

	}
	
	if($("#size95").hasClass("sizedisabled"))
	{
		$("#s95").prop("disabled", true)
	} else {
		$("#s95").prop("disabled", false)

	}
	
	if($("#size10").hasClass("sizedisabled"))
	{
		$("#s10").prop("disabled", true)
	} else {
		$("#s10").prop("disabled", false)

	}
	
	if($("#size105").hasClass("sizedisabled"))
	{
		$("#s105").prop("disabled", true)
	} else {
		$("#s105").prop("disabled", false)

	}
	
	if($("#size11").hasClass("sizedisabled"))
	{
		$("#s11").prop("disabled", true)
	} else {
		$("#s11").prop("disabled", false)

	}
	
	if($("#size115").hasClass("sizedisabled"))
	{
		$("#s115").prop("disabled", true)
	} else {
		$("#s115").prop("disabled", false)

	}
	
	if($("#size12").hasClass("sizedisabled"))
	{
		$("#s12").prop("disabled", true)
	} else {
		$("#s12").prop("disabled", false)

	}
	
	if($("#size125").hasClass("sizedisabled"))
	{
		$("#s125").prop("disabled", true)
	} else {
		$("#s125").prop("disabled", false)

	}
	
	if($("#size13").hasClass("sizedisabled"))
	{
		$("#s13").prop("disabled", true)
	} else {
		$("#s13").prop("disabled", false)

	}
	
	if($("#size135").hasClass("sizedisabled"))
	{
		$("#s135").prop("disabled", true)
	} else {
		$("#s135").prop("disabled", false)

	}
	
	if($("#size14").hasClass("sizedisabled"))
	{
		$("#s14").prop("disabled", true)
	} else {
		$("#s14").prop("disabled", false)

	}
});


