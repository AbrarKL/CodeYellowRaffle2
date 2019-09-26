var tabxn = 1;

$(".tasks, .ccreate").click(function () {
  tabxn = 1;
  tasktab = 1;
  if (tabxn = 1) {
    $(".nav-ground").get(0).style.setProperty("left", "64px");
    $(".nav-item").removeClass("active");
    $(".tasks").addClass("active");
    $(".sec-nav").removeClass("test");
    $(".sec-nav").removeClass("second-nav-hidden");
    
	$(".btab").removeClass("showpage");
	$(".releases-main").addClass("showpage");

	$(".tasks2nav").removeClass("shownav");
	$(".2navtask").addClass("shownav");

	$(".email-tab").get(0).style.setProperty("display", "none");
	$(".addproxy-tab").get(0).style.setProperty("display", "none");
	$(".createmass-tab").get(0).style.setProperty("display", "none");
	$(".accountcon-tab").get(0).style.setProperty("display", "none");
	$(".insta-tab").get(0).style.setProperty("display", "none");	
    window.setTimeout(function(){$(".sec-nav").addClass("test");}, 300);
  }
});

$(".profiles").click(function () {
  tabxn = 2;
  createtabx = 1;
  if (tabxn = 2) {
    $(".nav-ground").get(0).style.setProperty("left", "214px");
    $(".nav-item").removeClass("active")
    $(".profiles").addClass("active")
    $(".sec-nav").removeClass("test")	
	
	$(".btab").removeClass("showpage")
	$(".profile-tab").addClass("showpage")
	
	$(".email-tab").get(0).style.setProperty("display", "none");
	$(".addproxy-tab").get(0).style.setProperty("display", "none");
	$(".createmass-tab").get(0).style.setProperty("display", "none");
	$(".accountcon-tab").get(0).style.setProperty("display", "none");
	$(".insta-tab").get(0).style.setProperty("display", "none");	
	
    window.setTimeout(function(){$(".sec-nav").addClass("second-nav-hidden");}, 300);
  }
});

$(".proxies").click(function () {
  tabxn = 3;
  createtabx = 1;
  if (tabxn = 3) {
    $(".nav-ground").get(0).style.setProperty("left", "364px");
    $(".nav-item").removeClass("active")
    $(".proxies").addClass("active")
	$("#proxiesTab").addClass("active")
    $(".sec-nav").removeClass("test")
    $(".sec-nav").removeClass("second-nav-hidden")
	
	$(".btab").removeClass("showpage")
	$(".proxies-tab").addClass("showpage")
	
	$(".tasks2nav").removeClass("shownav")
	$(".2navproxies").addClass("shownav")
	
	$(".email-tab").get(0).style.setProperty("display", "none");
	$(".addproxy-tab").get(0).style.setProperty("display", "none");
	$(".createmass-tab").get(0).style.setProperty("display", "none");
	$(".accountcon-tab").get(0).style.setProperty("display", "none");
	$(".insta-tab").get(0).style.setProperty("display", "none");	
	
    window.setTimeout(function(){$(".sec-nav").addClass("test");}, 300);
  }
});

$(".settings").click(function () {
  tabxn = 4;
  createtabx = 1; 
  if (tabxn = 4) {
    $(".nav-ground").get(0).style.setProperty("left", "514px");
    $(".nav-item").removeClass("active")
    $(".settings").addClass("active")
    $(".sec-nav").removeClass("test")
	
	$(".btab").removeClass("showpage")
	$(".settings-tab").addClass("showpage")
	
	$(".email-tab").get(0).style.setProperty("display", "none");
	$(".addproxy-tab").get(0).style.setProperty("display", "none");
	$(".createmass-tab").get(0).style.setProperty("display", "none");
	$(".accountcon-tab").get(0).style.setProperty("display", "none");
	$(".insta-tab").get(0).style.setProperty("display", "none");	
	
    window.setTimeout(function(){$(".sec-nav").addClass("second-nav-hidden");}, 300);
  }
  
});

$(".ewmailz").click(function () {
  tabxn = 5;
  if (tabxn = 5) {

	$(".sec-nav").removeClass("test")	

	$(".email-tab").get(0).style.setProperty("display", "block");
	
    window.setTimeout(function(){$(".sec-nav").addClass("second-nav-hidden");}, 300);
  }
});

$(".aproxz").click(function () {
  tabxn = 6;
  if (tabxn = 6) {

	$(".sec-nav").removeClass("test")	

	$(".addproxy-tab").get(0).style.setProperty("display", "block");
	
    window.setTimeout(function(){$(".sec-nav").addClass("second-nav-hidden");}, 300);
  }
});

$(".cmasstz").click(function () {
  tabxn = 7;
  if (tabxn = 7) {

	$(".sec-nav").removeClass("test")	

	$(".createmass-tab").get(0).style.setProperty("display", "block");
	
    window.setTimeout(function(){$(".sec-nav").addClass("second-nav-hidden");}, 300);
  }
});

$(".accounz").click(function () {
  tabxn = 8;
  if (tabxn = 8) {

	$(".sec-nav").removeClass("test")	

	$(".accountcon-tab").get(0).style.setProperty("display", "block");
	
    window.setTimeout(function(){$(".sec-nav").addClass("second-nav-hidden");}, 300);
  }
});

$(".instaz").click(function () {
  tabxn = 9;
  if (tabxn = 9) {

	$(".sec-nav").removeClass("test")	

	$(".insta-tab").get(0).style.setProperty("display", "block");
	
    window.setTimeout(function(){$(".sec-nav").addClass("second-nav-hidden");}, 300);
  }
});

var tasktab = 1;

$(".releases").click(function () {
  tasktab = 1;
  if (tasktab = 1) {
    $(".sec-navt").removeClass("second-active")
    $(".releases").addClass("second-active")
    $(".releases-main").get(0).style.setProperty("left", "-0%");
	$(".xboxhotty").get(0).style.setProperty("display", "none");
  }
});

$(".massentry").click(function () {
  tasktab = 2;
  if (tasktab = 2) {
    $(".sec-navt").removeClass("second-active")
    $(".massentry").addClass("second-active")
    $(".releases-main").get(0).style.setProperty("left", "-100%");
	$(".xboxhotty").get(0).style.setProperty("display", "inline-block");
  }
});


$(".bot-title").click(function () {
	$(".myaccountx").click();
	$(".myaccountx").addClass("setactive")
	
	console.log("testt");
});

$(".addprofile2").click(function () {
    $(".profileaddrow2").get(0).style.setProperty("display", "block");
	$(".addprofile2").get(0).style.setProperty("display", "none");
	$(".multiprofilerow").get(0).style.setProperty("display", "none");
	
	$(".addprofile3").get(0).style.setProperty("display", "block")
});

$(".addprofile3").click(function () {
    $(".profileaddrow3").get(0).style.setProperty("display", "block");
	$(".addprofile3").get(0).style.setProperty("display", "none");
	$(".multiprofilerow").get(0).style.setProperty("display", "none");
	
	$(".addprofile2").get(0).style.setProperty("display", "none");
	$(".addprofile4").get(0).style.setProperty("display", "block")
	
});

$(".addprofile4").click(function () {
    $(".profileaddrow4").get(0).style.setProperty("display", "block");
	$(".addprofile4").get(0).style.setProperty("display", "none");
	$(".multiprofilerow").get(0).style.setProperty("display", "none");

	$(".addprofile3").get(0).style.setProperty("display", "none");
	$(".addprofile5").get(0).style.setProperty("display", "block")
});

$(".addprofile5").click(function () {
    $(".profileaddrow5").get(0).style.setProperty("display", "block");
	$(".addprofile5").get(0).style.setProperty("display", "none");
});



$(".delpro2").click(function () {
    $(".profileaddrow2").get(0).style.setProperty("display", "none");

	$(".addprofile2").get(0).style.setProperty("display", "none");
	$(".addprofile3").get(0).style.setProperty("display", "none");
	$(".addprofile4").get(0).style.setProperty("display", "none");
	$(".addprofile5").get(0).style.setProperty("display", "none");
	
	$(".addprofile2").get(0).style.setProperty("display", "block");
});

$(".delpro3").click(function () {
    $(".profileaddrow3").get(0).style.setProperty("display", "none");

	$(".addprofile2").get(0).style.setProperty("display", "none");
	$(".addprofile3").get(0).style.setProperty("display", "none");
	$(".addprofile4").get(0).style.setProperty("display", "none");
	$(".addprofile5").get(0).style.setProperty("display", "none");

	$(".addprofile3").get(0).style.setProperty("display", "block");
});

$(".delpro4").click(function () {
    $(".profileaddrow4").get(0).style.setProperty("display", "none");

	$(".addprofile2").get(0).style.setProperty("display", "none");
	$(".addprofile3").get(0).style.setProperty("display", "none");
	$(".addprofile4").get(0).style.setProperty("display", "none");
	$(".addprofile5").get(0).style.setProperty("display", "none");
	
	$(".addprofile4").get(0).style.setProperty("display", "block");
});

$(".delpro5").click(function () {
    $(".profileaddrow5").get(0).style.setProperty("display", "none");

	$(".addprofile2").get(0).style.setProperty("display", "none");
	$(".addprofile3").get(0).style.setProperty("display", "none");
	$(".addprofile4").get(0).style.setProperty("display", "none");
	$(".addprofile5").get(0).style.setProperty("display", "none");
	
	$(".addprofile5").get(0).style.setProperty("display", "block");
});



	profilerow2 = 0;
	profilerow3 = 0;
	profilerow4 = 0;
	profilerow5 = 0;

	profilerowadd2 = 0;	
	profilerowadd5 = 0;

$(window).click(function(e) {
	if ($('.addprofile2')[0].style.display != 'none') {
		profilerowadd2 = 1;
//		console.log('add profile 2 is visible');
	}

	if ($('.addprofile5')[0].style.display != 'none') {
		profilerowadd5 = 1;
//		console.log('add profile 5 is visible');
	}	
	
	if ($('.profileaddrow2')[0].style.display != 'none') {
		profilerow2 = 1;
//		console.log('i Have 2 and it is = to ' + profilerow2);
	}
	else {
		profilerow2 = 0;
//		console.log('i dont Have 2 and it is = to ' + profilerow2);
	}	
	
	if ($('.profileaddrow3')[0].style.display != 'none') {
		profilerow3 = 1;
//		console.log('i Have 3 and it is = to ' + profilerow3);
	}
	else {
		profilerow3 = 0;
//		console.log('i dont Have 3 and it is = to ' + profilerow3);
	}	
	
	if ($('.profileaddrow4')[0].style.display != 'none') {
		profilerow4 = 1;
//		console.log('i Have 4 and it is = to ' + profilerow4);
	}
	else {
		profilerow4 = 0;
//		console.log('i dont Have 4 and it is = to ' + profilerow4);
	}
	
	if ($('.profileaddrow5')[0].style.display != 'none') {
		profilerow5 = 1;
//		console.log('i Have 5 and it is = to ' + profilerow5);
	}
	else {
		profilerow5 = 0;
//		console.log('i dont Have 5 and it is = to ' + profilerow5);
	}
	
	if (profilerow5 == 0 && profilerow2 == 0 && profilerow3 == 0 && profilerow4 == 0) {
		$(".profileaddrow5").get(0).style.setProperty("display", "none");

		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");
	
		$(".addprofile2").get(0).style.setProperty("display", "block");
	}
	
		if (profilerow5 == 0 && profilerow2 == 0 && profilerow3 == 0 && profilerow4 == 1) {
		$(".profileaddrow5").get(0).style.setProperty("display", "none");

		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");
	
		$(".addprofile2").get(0).style.setProperty("display", "block");
	}
	
		if (profilerow5 == 0 && profilerow2 == 0 && profilerow3 == 1 && profilerow4 == 1) {
		$(".profileaddrow5").get(0).style.setProperty("display", "none");

		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");
	
		$(".addprofile2").get(0).style.setProperty("display", "block");
	}
	
		if (profilerow5 == 0 && profilerow2 == 1 && profilerow3 == 1 && profilerow4 == 1) {
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "block");
	}
	
		if (profilerow5 == 0 && profilerow2 == 1 && profilerow3 == 0 && profilerow4 == 0) {
		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");
	
		$(".addprofile3").get(0).style.setProperty("display", "block");
	}
	
		if (profilerow5 == 0 && profilerow2 == 0 && profilerow3 == 1 && profilerow4 == 0) {
		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");
	
		$(".addprofile2").get(0).style.setProperty("display", "block");
	}
	
		if (profilerow5 == 0 && profilerow2 == 1 && profilerow3 == 1 && profilerow4 == 0) {
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "block");
	}	
	
		if (profilerow5 == 0 && profilerow2 == 1 && profilerow3 == 1 && profilerow4 == 1) {
		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");

		$(".addprofile3").get(0).style.setProperty("display", "none");	
		$(".addprofile5").get(0).style.setProperty("display", "block");
	}
	
		if (profilerow5 == 0 && profilerow2 == 1 && profilerow3 == 1 && profilerow4 == 0 && profilerowadd5 == 1) {
		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");

		$(".addprofile5").get(0).style.setProperty("display", "none");	
		$(".addprofile4").get(0).style.setProperty("display", "block");
	}
	
		if (profilerow5 == 1 && profilerow2 == 1 && profilerow3 == 1 && profilerow4 == 1 && profilerowadd5 == 1) {
		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");
	}
	
		if (profilerow5 == 0 && profilerow2 == 1 && profilerow3 == 0 && profilerow4 == 1) {
		$(".addprofile2").get(0).style.setProperty("display", "none");
		$(".addprofile3").get(0).style.setProperty("display", "none");
		$(".addprofile4").get(0).style.setProperty("display", "none");
		$(".addprofile5").get(0).style.setProperty("display", "none");

		$(".addprofile3").get(0).style.setProperty("display", "block");
	}
});


$("#gummybear").click(function () {
	$("#shegotalotofcake").click();
	$(".myaccountx").addClass("setactive").
	console.log("do this working or noz?");
});




//	profiletag = 0;
	
//$(".multiprofilerowtext").click(function () {
//		profiletag++;
//	$(".extrapofilesboys").append("<div class='create-row'> <div data-toggle='tooltip' data-placement='top' title='Task profile "+ profiletag +"!' class='inputicon'><i class='fa fa-user' aria-hidden='true'></i></div><select class='createinput' id='taskProfile"+ profiletag +"'><option class='profileremovce' value='remove'> remove profile </option></select></div>");
//
//		console.log(profiletag);
//	console.log('testt');
//});

//$(window).click(function(e) {
//    $(".bot-title").removeClass("setactive")
//	  if (profiletag >= 4) {
//			$(".multiprofilerowtext").get(0).style.setProperty("display", "none");
//		}
//});

$( document ).ready(function() {
	$("#taskSizeSelect").change(function () {
		if ($(this).val()=="range")
	   {
		   $(".sickemboys").get(0).style.setProperty("display", "block")
	   } else {
		   $(".sickemboys").get(0).style.setProperty("display", "none")
	   }
	});
});


$( document ).ready(function() {
	$("#taskSiteSelect").change(function () {
		if ($(this).val()=="bstn")
	   {
		   $("#checklistnigga").removeAttr('disabled');
	   } else {
		   $("#checklistnigga").attr('disabled','disabled');
	   }
	});
});


$( document ).ready(function() {
	$("#taskTypeOfEmail").change(function () {
		if ($(this).val()=="catchall")
	   {
		   $("#taskEmail").attr("placeholder", "catchall.com");
	   } else {
		   $("#taskEmail").attr("placeholder", "Email Address");
	   }
	});
});

$( document ).ready(function() {
	$("#checklistnigga").change(function () {
		if ($(this).val()=="catchall")
	   {
		   $("#instaName").removeAttr('disabled');
	   } else {
		   $("#instaName").attr('disabled','disabled');
	   }
	});
});


$('.proxCover').click(function() {

if($('#usapb').is(':checked'))
{
  $('#usap').addClass('prox-sel');
} else {
  $('#usap').removeClass('prox-sel');
}

if($('#ukpb').is(':checked'))
{
  $('#ukp').addClass('prox-sel');
} else {
  $('#ukp').removeClass('prox-sel');
}

if($('#depb').is(':checked'))
{
  $('#dep').addClass('prox-sel');
} else {
  $('#dep').removeClass('prox-sel');
}

if($('#espb').is(':checked'))
{
  $('#esp').addClass('prox-sel');
} else {
  $('#esp').removeClass('prox-sel');
}

if($('#frpb').is(':checked'))
{
  $('#frp').addClass('prox-sel');
} else {
  $('#frp').removeClass('prox-sel');
}

if($('#rupb').is(':checked'))
{
  $('#rup').addClass('prox-sel');
} else {
  $('#rup').removeClass('prox-sel');
}

if($('#chinapb').is(':checked'))
{
  $('#chinap').addClass('prox-sel');
} else {
  $('#chinap').removeClass('prox-sel');
}

if($('#aupb').is(':checked'))
{
  $('#aup').addClass('prox-sel');
} else {
  $('#aup').removeClass('prox-sel');
}
});





function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName('tabbard');
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = 'none';
  }
  tablinks = document.getElementsByClassName('settingnav');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' setactive', '');
  }
  document.getElementById(cityName).style.display = 'block';
  evt.currentTarget.className += ' setactive';
}

// Get the element with id='defaultOpen' and click on it
document.getElementById('defaultGOGO').click();

