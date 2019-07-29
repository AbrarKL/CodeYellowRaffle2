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
    $(".sec-nav").removeClass("test")
    $(".sec-nav").removeClass("second-nav-hidden")
	
	$(".btab").removeClass("showpage")
	$(".proxies-tab").addClass("showpage")
	
	$(".tasks2nav").removeClass("shownav")
	$(".2navproxies").addClass("shownav")
	
	$(".email-tab").get(0).style.setProperty("display", "none");
	$(".addproxy-tab").get(0).style.setProperty("display", "none");
	$(".createmass-tab").get(0).style.setProperty("display", "none");
	
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

var tasktab = 1;

$(".releases").click(function () {
  tasktab = 1;
  if (tasktab = 1) {
    $(".sec-navt").removeClass("second-active")
    $(".releases").addClass("second-active")
    $(".releases-main").get(0).style.setProperty("left", "-0%");
  }
});

$(".massentry").click(function () {
  tasktab = 2;
  if (tasktab = 2) {
    $(".sec-navt").removeClass("second-active")
    $(".massentry").addClass("second-active")
    $(".releases-main").get(0).style.setProperty("left", "-100%");
  }
});


$(".bot-title").click(function () {
	$(".myaccountx").click();
	$(".myaccountx").addClass("setactive")
	
	console.log("testt");
});


$(window).click(function(e) {
    $(".bot-title").removeClass("setactive")
});



function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabbard");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("settingnav");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" setactive", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " setactive";
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultGOGO").click();