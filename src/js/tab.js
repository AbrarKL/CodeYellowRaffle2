/* function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("nav-item");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
 
// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click(); */

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

var tabx = 1;

$("#defaultOpen").click(function () {
  tabx = 1;
  createtabx = 1;
  if (tabx = 1) {}
});

$("#profilesTab").click(function () {
  tabx = 2;
  createtabx = 1;
  if (tabx = 2) {}
});

$("#proxiesTab").click(function () {
  tabx = 3;
  createtabx = 1;
  if (tabx = 3) {}
});

$("#settingsTab").click(function () {
  tabx = 4;
  createtabx = 1;
  if (tabx = 4) {}
});

$("#creattask").click(function () {
  tabx = 5;
  createtabx = 1;
  if (tabx = 5) {}
});

$("#addprox").click(function () {
  tabx = 5;
  if (tabx = 5) {}
});

$("#autoenter").click(function () {
  tabx = 6;
  if (tabx = 6) {}
});

$("#eeconfig").click(function () {
  tabx = 7;
  if (tabx = 7) {}
});

$("#addMails").click(function () {
  tabx = 1;
  if (tabx = 1) {}
});

$('.customCheckbx').change(function () {
  if ($(this).is(':checked')) {
    $(".under-line").get(0).style.setProperty("transition", "0s");
    $(".tasks").get(0).style.setProperty("transition", "0s");
  } else {
    $(".under-line").get(0).style.setProperty("transition", ".5s");
    $(".tasks").get(0).style.setProperty("transition", ".5s");
  }
});





var createtabx = 1;


$(".plus1").click(function () {
  if (createtabx == 1) {
    if (selectedQuickTaskRelease == undefined) {
      Materialize.toast("Please select a Release", 2000, "rounded");
      return;
    }
  } else if (createtabx == 2) {
    var taskProfile = $('#taskProfile').val();
    if ($('.profileaddrow2').css('display') == 'block') {
      if ($('#taskProfile2').val() == 'Example Profile') {
        Materialize.toast("You cannot create a task with the example profile", 2000, "rounded");
        return;
      }
    }
    if ($('.profileaddrow3').css('display') == 'block') {
      if ($('#taskProfile3').val() == 'Example Profile') {
        Materialize.toast("You cannot create a task with the example profile", 2000, "rounded");
        return;
      }
    }
    if ($('.profileaddrow4').css('display') == 'block') {
      if ($('#taskProfile4').val() == 'Example Profile') {
        Materialize.toast("You cannot create a task with the example profile", 2000, "rounded");
        return;
      }
    }
    if ($('.profileaddrow5').css('display') == 'block') {
      if ($('#taskProfile5').val() == 'Example Profile') {
        Materialize.toast("You cannot create a task with the example profile", 2000, "rounded");
        return;
      }
    }
    if (taskProfile == 'Example Profile') {
      Materialize.toast("You cannot create a task with the example profile", 2000, "rounded");
      return;
    }
  } else if (createtabx == 3) {
    var taskSiteSelect = $('#taskSiteSelect').val();

    if (taskSiteSelect == 'default') {
      Materialize.toast("Please select a site.", 3500, "rounded");
      return;
    }
    var taskProfile = $('#taskProfile').val();
    if ($('.profileaddrow2').css('display') == 'block') {
      if (taskSiteSelect == 'footshop' && profiles[$('#taskProfile2').val()]['country'] == 'China') {
        Materialize.toast("The site you have selected does not ship to China.", 3500, "rounded");
        return;
      }

      if (taskSiteSelect == 'supplystore' && profiles[$('#taskProfile2').val()]['country'] != 'Australia') {
        Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
        return;
      }
    }
    if ($('.profileaddrow3').css('display') == 'block') {
      if (taskSiteSelect == 'footshop' && profiles[$('#taskProfile3').val()]['country'] == 'China') {
        Materialize.toast("The site you have selected does not ship to China.", 3500, "rounded");
        return;
      }

      if (taskSiteSelect == 'supplystore' && profiles[$('#taskProfile3').val()]['country'] != 'Australia') {
        Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
        return;
      }
    }
    if ($('.profileaddrow4').css('display') == 'block') {
      if (taskSiteSelect == 'footshop' && profiles[$('#taskProfile4').val()]['country'] == 'China') {
        Materialize.toast("The site you have selected does not ship to China.", 3500, "rounded");
        return;
      }

      if (taskSiteSelect == 'supplystore' && profiles[$('#taskProfile4').val()]['country'] != 'Australia') {
        Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
        return;
      }
    }
    if ($('.profileaddrow5').css('display') == 'block') {
      if (taskSiteSelect == 'footshop' && profiles[$('#taskProfile5').val()]['country'] == 'China') {
        Materialize.toast("The site you have selected does not ship to China.", 3500, "rounded");
        return;
      }

      if (taskSiteSelect == 'supplystore' && profiles[$('#taskProfile5').val()]['country'] != 'Australia') {
        Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
        return;
      }
    }
    if (taskSiteSelect == 'footshop' && profiles[taskProfile]['country'] == 'China') {
      Materialize.toast("The site you have selected does not ship to China.", 3500, "rounded");
      return;
    }

    if (taskSiteSelect == 'supplystore' && profiles[taskProfile]['country'] != 'Australia') {
      Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
      return;
    }

    if ($('#captchaHandler').val() != 'manual') {
      if (settings['2capAPIKey'] == '' || settings['2capAPIKey'] == undefined || settings['antiCapAPIKey'] == '' || settings['antiCapAPIKey'] == undefined) {
        Materialize.toast("You must enter an API key in the settings tab.", 4500, "rounded");
        return;
      }
    }

    if (taskSizeSelect == 'default') {
      Materialize.toast("Please select a Size", 2000, "rounded");
      return;
    }
  } else if (createtabx == 4) {
    var taskTypeOfEmail = $('#taskTypeOfEmail').val();
    var taskTypeOfProxy = $('#taskTypeOfProxy').val();
    var taskEmail = $('#taskEmail').val();

    if (taskTypeOfEmail == 'default') {
      Materialize.toast("Please select an email type.", 3500, "rounded");
      return;
    }

    if (taskTypeOfEmail == 'newEmail') {
      if (validateEmail(taskEmail) == false) {
        Materialize.toast("Please input a valid Email", 2000, "rounded");
        return;
      }
    }

    if (taskTypeOfEmail == 'catchall') {
      if (validateEmail('test@' + taskEmail) == false) {
        Materialize.toast("Please input a valid catchall like example.com", 2000, "rounded");
        return;
      }
    }

    if (taskTypeOfProxy == 'default') {
      Materialize.toast("Please select proxies type.", 3500, "rounded");
      return;
    }
  }
  createtabx++;
//  console.log(createtabx);
});

$(".min1").click(function () {
  createtabx -= 1;
//  console.log(createtabx);
});

$(".craterv2").click(function () {
  createtabx = 1;
});


$(".min1, .plus1, .refro").click(function () {
  if (createtabx == 1) {
    $(".sneaksel").get(0).style.setProperty("display", "block");
    $(".details1").get(0).style.setProperty("display", "none");
    $(".details2").get(0).style.setProperty("display", "none");
    $(".details3").get(0).style.setProperty("display", "none");
    $(".details4").get(0).style.setProperty("display", "none");
  } else if (createtabx == 2) {
    $(".sneaksel").get(0).style.setProperty("display", "none");
    $(".details1").get(0).style.setProperty("display", "block");
    $(".details2").get(0).style.setProperty("display", "none");
    $(".details3").get(0).style.setProperty("display", "none");
    $(".details4").get(0).style.setProperty("display", "none");
  } else if (createtabx == 3) {
    $(".sneaksel").get(0).style.setProperty("display", "none");
    $(".details1").get(0).style.setProperty("display", "none");
    $(".details2").get(0).style.setProperty("display", "block");
    $(".details3").get(0).style.setProperty("display", "none");
    $(".details4").get(0).style.setProperty("display", "none");
  } else if (createtabx == 4) {
    $(".sneaksel").get(0).style.setProperty("display", "none");
    $(".details1").get(0).style.setProperty("display", "none");
    $(".details2").get(0).style.setProperty("display", "none");
    $(".details3").get(0).style.setProperty("display", "block");
    $(".details4").get(0).style.setProperty("display", "none");
  } else if (createtabx == 5) {
    $(".sneaksel").get(0).style.setProperty("display", "none");
    $(".details1").get(0).style.setProperty("display", "none");
    $(".details2").get(0).style.setProperty("display", "none");
    $(".details3").get(0).style.setProperty("display", "none");
    $(".details4").get(0).style.setProperty("display", "block");
  }
});



var profiletabx = 1;

$(".editprofile").click(function () {
  profiletabx = 2;
});

$(".createprofile").click(function () {
  profiletabx = 0;
});

$(".pcancel, .refro").click(function () {
  profiletabx = 1;
});


$(".pmin1").click(function () {
  profiletabx -= 1;
});

$(".pnext1").click(function () {
  profiletabx++;
});

$(".pnext2").click(function () {
  profiletabx = 2;
});

$(".createbumbutton, .refro, .pcancel, .createprofile, .editprofile, .pnext2, .pnext1, .pmin1").click(function () {
  if (profiletabx == 1) {
    $(".proDetails").get(0).style.setProperty("display", "block");
    $(".proDetails1").get(0).style.setProperty("display", "none");
    $(".proDetails2").get(0).style.setProperty("display", "none");
    $(".proDetails3").get(0).style.setProperty("display", "none");
    $(".proDetails4").get(0).style.setProperty("display", "none");
    $(".proDetails5").get(0).style.setProperty("display", "none");
  } else if (profiletabx == 2) {
    $(".proDetails").get(0).style.setProperty("display", "none");
    $(".proDetails1").get(0).style.setProperty("display", "block");
    $(".proDetails2").get(0).style.setProperty("display", "none");
    $(".proDetails3").get(0).style.setProperty("display", "none");
    $(".proDetails4").get(0).style.setProperty("display", "none");
    $(".proDetails5").get(0).style.setProperty("display", "none");
  } else if (profiletabx == 3) {
    $(".proDetails").get(0).style.setProperty("display", "none");
    $(".proDetails1").get(0).style.setProperty("display", "none");
    $(".proDetails2").get(0).style.setProperty("display", "block");
    $(".proDetails3").get(0).style.setProperty("display", "none");
    $(".proDetails4").get(0).style.setProperty("display", "none");
    $(".proDetails5").get(0).style.setProperty("display", "none");
  } else if (profiletabx == 4) {
    $(".proDetails").get(0).style.setProperty("display", "none");
    $(".proDetails1").get(0).style.setProperty("display", "none");
    $(".proDetails2").get(0).style.setProperty("display", "none");
    $(".proDetails3").get(0).style.setProperty("display", "block");
    $(".proDetails4").get(0).style.setProperty("display", "none");
    $(".proDetails5").get(0).style.setProperty("display", "none");
  } else if (profiletabx == 5) {
    $(".proDetails").get(0).style.setProperty("display", "none");
    $(".proDetails1").get(0).style.setProperty("display", "none");
    $(".proDetails2").get(0).style.setProperty("display", "none");
    $(".proDetails3").get(0).style.setProperty("display", "none");
    $(".proDetails4").get(0).style.setProperty("display", "block");
    $(".proDetails5").get(0).style.setProperty("display", "none");
  } else if (profiletabx == 0) {
    $(".proDetails").get(0).style.setProperty("display", "none");
    $(".proDetails1").get(0).style.setProperty("display", "none");
    $(".proDetails2").get(0).style.setProperty("display", "none");
    $(".proDetails3").get(0).style.setProperty("display", "none");
    $(".proDetails4").get(0).style.setProperty("display", "none");
    $(".proDetails5").get(0).style.setProperty("display", "block");
  }
});









$(".ccreate").click(function () {
  tabx = 1;
  createtabx = 1;
//  console.log(createtabx);

  if (createtabx == 1) {
    $(".details1").get(0).style.setProperty("display", "none");
    $(".sneaksel").get(0).style.setProperty("display", "block");
  } else if (createtabx == 2) {
    $(".details1").get(0).style.setProperty("display", "block");
    $(".sneaksel").get(0).style.setProperty("display", "none");
  }

  if (tabx = 1) {}
});

$(".massenter").click(function () {
  $("#massenter").css("display", "block");
  $("#autoenterx").css("display", "none");
});

$(".singleenter").click(function () {
  $("#massenter").css("display", "none");
  $("#autoenterx").css("display", "block");
});

$(document).on("click", function () {

  var proxy_count = $('.proxbod').find('tr').length - 1;

  $("#proxycount").text("" + proxy_count + "");

});


var slider = document.getElementById("gmailLimit");
var output = document.getElementById("gmailLimitShow");
output.innerHTML = slider.value;

slider.oninput = function () {
  output.innerHTML = this.value;
}

var slider2 = document.getElementById("catchallLimit");
var output2 = document.getElementById("catchallLimitShow");
output2.innerHTML = slider2.value;

slider2.oninput = function () {
  output2.innerHTML = this.value;
}

var slider3 = document.getElementById("proxyQuantity");
var output3 = document.getElementById("proxyscrapeShow");
output3.innerHTML = slider3.value;

slider3.oninput = function () {
  output3.innerHTML = this.value;
}

var slider4 = document.getElementById("genAmount");
var output4 = document.getElementById("genAmountShow");
output4.innerHTML = slider4.value;

slider4.oninput = function () {
  output4.innerHTML = this.value;
}