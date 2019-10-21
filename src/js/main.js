const electron = require('electron');
const {
	ipcRenderer
} = electron;
// Main Variables
var settings = require('electron').remote.getGlobal('settings');
var profiles = require('electron').remote.getGlobal('profiles');
var emails = require('electron').remote.getGlobal('emails');
var tasks = [];
var oneClickTasks = [];
var proxies = require('electron').remote.getGlobal('proxies');
var releases = require('electron').remote.getGlobal('releases');
var updateRequired = require('electron').remote.getGlobal('updateRequired');
var selectedQuickTaskRelease;
var emailsForTasks = {};
$('#softVersion').html(require('electron').remote.getGlobal('currentVersion'));
if (updateRequired == true) {
	$('#updateButton').css("display", "block");
}
$('#user').html(require('electron').remote.getGlobal('user'));
$('#entries').html(require('electron').remote.getGlobal('entries'));
// End Main Variables

// Loads saved proxies
loadProxies(proxies, false);

// Loads saved emails
loadEmails(emails);

$('#webhookUrl').val(require('electron').remote.getGlobal('settings').discordWebhook);
//$('#capAPIKey').val(require('electron').remote.getGlobal('settings').capAPIKey);
$('#antiCapAPIKey').val(require('electron').remote.getGlobal('settings').antiCapAPIKey);
$('#2capAPIKey').val(require('electron').remote.getGlobal('settings')['2capAPIKey']);


// Load saved sting settings in inputs
if (require('electron').remote.getGlobal('settings').stingSize != null) {
	$('#stingSize').val(require('electron').remote.getGlobal('settings').stingSize);
}
if (require('electron').remote.getGlobal('settings').stingQuantity != null) {
	$('#stingQuantity').val(require('electron').remote.getGlobal('settings').stingQuantity);
}
if (require('electron').remote.getGlobal('settings').stingCaptcha != null) {
	$('#stingCaptcha').val(require('electron').remote.getGlobal('settings').stingCaptcha);
}
if (require('electron').remote.getGlobal('settings').stingIG != null) {
	$('#stingIG').val(require('electron').remote.getGlobal('settings').stingIG);
}
if (require('electron').remote.getGlobal('settings').stingProxytype != null) {
	$('#stingProxytype').val(require('electron').remote.getGlobal('settings').stingProxytype);
}
if (require('electron').remote.getGlobal('settings').stingCatchall != null) {
	$('#stingCatchall').val(require('electron').remote.getGlobal('settings').stingCatchall);
}



// Load saved entry settings in inputs
if (require('electron').remote.getGlobal('settings').entryMode != null) {
	$('#entryMode').val(require('electron').remote.getGlobal('settings').entryMode);
}
if (require('electron').remote.getGlobal('settings').entryDelay != null) {
	$('#entryDelay').val(require('electron').remote.getGlobal('settings').entryDelay);
}
if (require('electron').remote.getGlobal('settings').idleTime != null) {
	$('#idleTime').val(require('electron').remote.getGlobal('settings').idleTime);
}
if (require('electron').remote.getGlobal('settings').minimumDelay != null) {
	$('#minimumDelay').val(require('electron').remote.getGlobal('settings').minimumDelay);
}
if (require('electron').remote.getGlobal('settings').stingProxytype != null) {
	$('#stingProxytype').val(require('electron').remote.getGlobal('settings').stingProxytype);
}
if (require('electron').remote.getGlobal('settings').maximumDelay != null) {
	$('#maximumDelay').val(require('electron').remote.getGlobal('settings').maximumDelay);
}
// RE ADD BOTH BELOW LINES WHEN ALEX ADDS SETTINGS
settingsRetryDelay.value = require('electron').remote.getGlobal('settings').retryDelay;
//amountr.value = require('electron').remote.getGlobal('settings').retryDelay;

if (require('electron').remote.getGlobal('instagrams') != null) {
	$('#igsToSave').val(require('electron').remote.getGlobal('instagrams'));
}
// Loads all releases in the quick task area

loadReleases();




ipcRenderer.on('profilesImported', function (event, data) {
	console.log(data);
	profiles = data;
	ipcRenderer.send('saveProfiles', profiles);
	var profileKeys = Object.keys(data);
	for (var i = 0; i < profileKeys.length; i++) {
		var keyName = profileKeys[i];
		if ($('#profileList option[value="' + keyName + '"]').length < 1) {
			$('#profileList').append($('<option>', {
				value: keyName,
				text: keyName
			}));
			$('#taskProfile').append($('<option>', {
				value: keyName,
				text: keyName
			}));
			$('#taskProfile2').append($('<option>', {
				value: keyName,
				text: keyName
			}));
			$('#taskProfile3').append($('<option>', {
				value: keyName,
				text: keyName
			}));
			$('#taskProfile4').append($('<option>', {
				value: keyName,
				text: keyName
			}));
			$('#taskProfile5').append($('<option>', {
				value: keyName,
				text: keyName
			}));
			$('#stingProfiles').append($('<option>', {
				value: keyName,
				text: keyName
			}));
		}
	}
});

document.getElementById('importProfiles').onchange = function () {
	ipcRenderer.send('importProfiles', this.files[this.files.length - 1]['path'])
	importProfiles.value = '';
};

document.getElementById('exportProfiles').onchange = function () {
	ipcRenderer.send('exportProfiles', this.files[this.files.length - 1]['path'])
	exportProfiles.value = '';
};


//If update available and update icon clicked
$('.openPage').click(function () {
	ipcRenderer.send('openPage', $(this).data('page'));
});

// To view guides
$('#guidesButton').click(function () {
	ipcRenderer.send('openGuides');
});


// Close bot
$('#closeM').click(function () {
	ipcRenderer.send('closeM');
});

// Minimize bot
$("#minimizeM").click(function () {
	ipcRenderer.send('minimizeM');
});

// Main notification's from bot
ipcRenderer.on('notify', function (event, data) {
	Materialize.toast(data.message, data.length, "rounded");
});

// Settings tab
// Save retry delay
$('#saveRetryDelay').click(function () {
	ipcRenderer.send('saveRetryDelay', settingsRetryDelay.value)
});

// Save webhook
$('#saveWebhook').click(function () {
	ipcRenderer.send('saveWebhook', $('#webhookUrl').val())
});

// Save sting settings
$('#saveStingSettings').click(function () {
	ipcRenderer.send('saveStingSettings', {
		stingProfiles: $('#stingProfiles').val(),
		stingSize: $('#stingSize').val(),
		stingQuantity: $('#stingQuantity').val(),
		stingCaptcha: $('#stingCaptcha').val(),
		stingIG: $('#stingIG').val(),
		stingProxytype: $('#stingProxytype').val(),
		stingCatchall: $('#stingCatchall').val()
	})
});

// Save entry settings
$('#saveEntrySettings').click(function () {
	ipcRenderer.send('saveEntrySettings', {
		entryMode: $('#entryMode').val(),
		entryDelay: $('#entryDelay').val(),
		idleTime: $('#idleTime').val(),
		minimumDelay: $('#minimumDelay').val(),
		maximumDelay: $('#maximumDelay').val()
	})
});
$('#entryMode').on('change', function () {
	var type = $(this).val();
	if (type == 'manual') {
		$('#entryDelay').prop('disabled', true)
		$('#idleTime').prop('disabled', true)
		$('#minimumDelay').prop('disabled', true)
		$('#maximumDelay').prop('disabled', true)
	} else if (type == 'delayed') {
		$('#entryDelay').prop('disabled', false)
		$('#idleTime').prop('disabled', true)
		$('#minimumDelay').prop('disabled', true)
		$('#maximumDelay').prop('disabled', true)
	} else if (type == 'idle') {
		$('#entryDelay').prop('disabled', true)
		$('#idleTime').prop('disabled', false)
		$('#minimumDelay').prop('disabled', true)
		$('#maximumDelay').prop('disabled', true)
	} else if (type == 'human') {
		$('#entryDelay').prop('disabled', true)
		$('#idleTime').prop('disabled', true)
		$('#minimumDelay').prop('disabled', false)
		$('#maximumDelay').prop('disabled', false)
	}
});

// Save Captcha solving API key
/*$('#saveCapAPIKey').click(function () {
	ipcRenderer.send('saveCapAPIKey', $('#capAPIKey').val())
});*/
$('#saveAntiCapAPIKey').click(function () {
	ipcRenderer.send('saveAntiCapAPIKey', $('#antiCapAPIKey').val())
})
$('#save2capAPIKey').click(function () {
	ipcRenderer.send('save2capAPIKey', $('#2capAPIKey').val())
})

// Opens captcha harvester
$('.openHarvester').click(function () {
	ipcRenderer.send('openHarvester')
});

// Deactivate copy
$('#deactivateButton').click(function () {
	ipcRenderer.send('deactivate')
});








// Important tasks bit

// Update tasks
ipcRenderer.on('taskUpdate', function (event, data) {
	if (data.message.toLowerCase().indexOf('entry submitted') >= 0 || data.message.toLowerCase().indexOf('check email') >= 0 || data.message.toLowerCase().indexOf('check email!') >= 0 || data.message.toLowerCase().indexOf('entry submitted!') >= 0) {
		$('#entries').html(parseInt($('#entries').html()) + 1)
	}
	$(`#taskResult${data.id}`).html(data.message.toLowerCase())
});

$("body").on("click", ".startTaskMass", function () {
	var task = tasks[$(this).attr('id') - 1];
	ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
});

$("#startAllTasks").click(function () {
	var entryMode = require('electron').remote.getGlobal('settings').entryMode;
	if (entryMode == 'delayed') {
		var delay = 0;
		var delayIncrease = parseInt(require('electron').remote.getGlobal('settings').entryDelay) * 1000;
		$.each($(".startTaskMass"), function (i) {
			var taskId = $(this).attr('id');
			if ($('#taskResult' + taskId).html().toLowerCase() == 'idle') {
				var task = tasks[$(this).attr('id') - 1];
				if (i == 0) {
					ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
				} else {
					delay = delay + delayIncrease;
					if (delay >= 60000) {
						$(`#taskResult${taskId}`).html('Starting task in ' + parseFloat((delay / 1000) / 60).toFixed(2).toString().replace('.', ':') + ' m');
					} else {
						$(`#taskResult${taskId}`).html('Starting task in ' + delay / 1000 + 's');
					}
					setTimeout(function () {
						ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
					}, delay);
				}
			}
		});
	} else if (entryMode == 'idle') {
		var taskLength = $('#tasks tr').length - 1;
		var minutes = require('electron').remote.getGlobal('settings').idleTime;
		var delay = 0;
		var delayIncrease = parseInt(((minutes * 60) * 1000) / taskLength);
		$.each($(".startTaskMass"), function (i) {
			var taskId = $(this).attr('id');
			if ($('#taskResult' + taskId).html().toLowerCase() == 'idle') {
				var task = tasks[$(this).attr('id') - 1];
				if (i == 0) {
					ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
				} else {
					delay = delay + delayIncrease;
					if (delay >= 60000) {
						$(`#taskResult${taskId}`).html('Starting task in ' + parseFloat((delay / 1000) / 60).toFixed(2).toString().replace('.', ':') + ' m');
					} else {
						$(`#taskResult${taskId}`).html('Starting task in ' + delay / 1000 + 's');
					}
					setTimeout(function () {
						ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
					}, delay);
				}
			}
		});

	} else if (entryMode == 'human') {
		console.log('human');
		var delay = 0;
		$.each($(".startTaskMass"), function (i) {
			var delayIncrease = (Math.floor(Math.random() * (parseInt(require('electron').remote.getGlobal('settings').maximumDelay) - parseInt(require('electron').remote.getGlobal('settings').minimumDelay) + 1)) + parseInt(require('electron').remote.getGlobal('settings').minimumDelay)) * 1000;
			var taskId = $(this).attr('id');
			if ($('#taskResult' + taskId).html().toLowerCase() == 'idle') {
				var task = tasks[$(this).attr('id') - 1];
				if (i == 0) {
					ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
				} else {
					delay = delay + delayIncrease;
					if (delay >= 60000) {
						$(`#taskResult${taskId}`).html('Starting task in ' + parseFloat((delay / 1000) / 60).toFixed(2).toString().replace('.', ':') + ' m');
					} else {
						$(`#taskResult${taskId}`).html('Starting task in ' + delay / 1000 + 's');
					}
					setTimeout(function () {
						ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
					}, delay);
				}
			}
		});
	} else {
		$.each($(".startTaskMass"), function () {
			var task = tasks[$(this).attr('id') - 1];
			ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
		});
	}
	/*var delay = 0;
	var delayIncrease = 1000;
	$.each($(".startTaskMass"), function (i) {
		var taskId = $(this).attr('id');
		var task = tasks[$(this).attr('id') - 1];
		//console.log(delay)
		$(`#taskResult${taskId}`).html('Starting task in ' + delay + 'ms');
		delay = delay + delayIncrease;
		setTimeout(function () {
			ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
		}, delay);
	});*/
});

$("body").on("click", ".deleteTask", function () {
	var task = tasks[$(this).attr('id') - 1];
	tasks[$(this).attr('id') - 1] = {};
	ipcRenderer.send('deleteTask', task);
	if (task['taskTypeOfEmail'] != 'catchall') {
		emailsForTasks[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] = false;
	}
	$(this).parent().parent().remove();
	$('#tasksInList').html($('#tasks tr').length - 1)
});

$("#deleteAllTasks").click(function () {
	$.each($(".deleteTask"), function () {
		var task = tasks[$(this).attr('id') - 1];
		tasks[$(this).attr('id') - 1] = {};
		ipcRenderer.send('deleteTask', task);
		if (task['taskTypeOfEmail'] != 'catchall') {
			emailsForTasks[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] = false;
		}
		$(this).parent().parent().remove();
		$('#tasksInList').html($('#tasks tr').length - 1)
	});
});

$("#deleteAllSubmittedTasks").click(function () {
	$.each($(".deleteTask"), function () {
		var task = tasks[$(this).attr('id') - 1];
		//check if taskresult is 'idle' when starting delayed
		if ($('#taskResult' + $(this).attr('id')).html().toLowerCase().indexOf('submitted') >= 0 || $('#taskResult' + $(this).attr('id')).html().toLowerCase().indexOf('check email') >= 0) {
			tasks[$(this).attr('id') - 1] = {};
			ipcRenderer.send('deleteTask', task);
			if (task['taskTypeOfEmail'] != 'catchall') {
				emailsForTasks[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] = false;
			}
			$(this).parent().parent().remove();
			$('#tasksInList').html($('#tasks tr').length - 1)
		}
	});
});













// Proxies


$("#saveProxies").click(function () {
	ipcRenderer.send('saveProxies', proxies.join('\n'))
});

$("#saveIGlist").click(function () {
	ipcRenderer.send('saveIGlist', $('#igsToSave').val())
});

$("#addProxies").click(function () {
	var proxiesToAdd = $('#proxiesToAdd').val().split('\n')
	// just make it click it i think
	$('#proxiesTab').click()
	$('#proxiesTab').attr('class', 'nav-item active')
	loadProxies(proxiesToAdd, true);
	$('#proxiesToAdd').val('');
});

ipcRenderer.on('proxyUpdate', function (event, data) {
	$(`#proxyResult${data.id}`).html(data.message)
});

$("#checkAllProxies").click(function () {
	$.each($(".proxyInput"), function () {
		var proxyToTest = $(this).attr('id')
		var proxyID = $(this).data('uid');
		if (proxyToTest != undefined) {
			ipcRenderer.send('testProxy', {
				proxy: proxyToTest,
				id: proxyID
			})
		}
	});
});

$("body").on("click", ".testProxy", function () {
	var proxyToTest = $(this).parent().parent().attr('id');
	var proxyID = $(this).attr('id');
	ipcRenderer.send('testProxy', {
		proxy: proxyToTest,
		id: proxyID
	})
});

$("body").on("click", ".deleteProxy", function () {
	var index = proxies.indexOf($(this).parent().parent().data('ip'));
	$(this).parent().parent().remove();
	if (index > -1) {
		proxies.splice(index, 1);
	}
});

$("#deleteAllProxies").click(function () {
	$.each($(".deleteProxy"), function () {
		$(this).click()
	});
});

$("#removeFailed").click(function () {
	$.each($(".proxyInput"), function () {
		var uid = $(this).data('uid');
		if(uid != null)
		{
			var failed = $('#proxyResult' + uid).html().toLowerCase() == 'failed' ? true : false;
			if (failed) {
				var index = proxies.indexOf($(this).data('ip'));
				console.log($(this).data('ip'));
				if (index > -1) {
					proxies.splice(index, 1);
				}
				$(this).remove()
			}
		}
	});
});




function loadProxies(proxiesToAdd, addToArray) {
	for (var i = 0; i < proxiesToAdd.length; i++) {
		proxyFormat = '';
		var proxy = proxiesToAdd[i].split(':');
		var proxyIP = proxy[0];
		var randProxyID = proxyIP.replace(/\./g, "") + ((Math.random() * 1000000) + 1).toFixed().toString();
		var proxyPort = proxy[1];
		if (proxy.length == 2) {
			proxyFormat = `http://${proxyIP}:${proxyPort}`;
		} else {
			proxyFormat = `http://${proxy[2]}:${proxy[3]}@${proxyIP}:${proxyPort}`;
		}
		if (proxyIP != undefined && proxyPort != undefined) {
			$("tbody#proxies").append(
				`
				<tr class="proxyInput" id="${proxyFormat}" data-uid="${randProxyID}" data-ip="${proxiesToAdd[i]}">
				  <td class="leftsidetable"><div class="proxie-butt proxgo"><i class="fas fa-bolt"></i></div></td>
                  <td>${proxyIP}</td>
                  <td>${proxyPort}</td>
				  <td id="proxyResult${randProxyID}">result</td>
                  <td class="rightsidetable">
                     <button class="action-butt deleteProxy"><i class="fa fa-trash" aria-hidden="true"></i>
                     </button>
                     <button class="action-butt testProxy" id="${randProxyID}"><i class="fa fa-play" aria-hidden="true"></i>
                     </button>
                  </td>
               </tr>`);
			if (addToArray) {
				proxies.push(proxiesToAdd[i]);
			}
		} else {}
	}
}











// Tasks

$("#createTaskButton").click(function () {
	var taskSiteSelect = $('#taskSiteSelect').val();
	var taskSizeSelect = $('#taskSizeSelect').html();
	var taskProfile = $('#taskProfile').val();
	var profilesToChoose = [];
	profilesToChoose.push(taskProfile);
	if ($('.profileaddrow2').css('display') == 'block') {
		profilesToChoose.push($('#taskProfile2').val());
	}
	if ($('.profileaddrow3').css('display') == 'block') {
		profilesToChoose.push($('#taskProfile3').val());
	}
	if ($('.profileaddrow4').css('display') == 'block') {
		profilesToChoose.push($('#taskProfile4').val());
	}
	if ($('.profileaddrow5').css('display') == 'block') {
		profilesToChoose.push($('#taskProfile5').val());
	}
	console.log('Enabled profiles: ' + profilesToChoose)
	var taskSpecificProxy = $('#taskSpecificProxy').val();
	var taskQuantity = parseInt($('#taskQuantity').val());
	var taskEmail = $('#taskEmail').val();
	var taskTypeOfEmail = $('#taskTypeOfEmail').val();
	var taskTypeOfProxy = $('#taskTypeOfProxy').val();
	var captchaHandler = $('#captchaHandler').val();

	if (taskQuantity > Object.keys(emails).length && taskTypeOfEmail == 'saved') {
		Materialize.toast("You only have " + Object.keys(emails).length + " emails saved, but want " + taskQuantity + " tasks", 3500, "rounded");
		return;
	}
	var proxyUsed = '';
	if (selectedQuickTaskRelease != undefined) {
		if (taskSiteSelect != 'default') {
			if (taskSizeSelect != 'default') {
				if (taskQuantity >= 1) {
					if (validateEmail(taskEmail) != false || taskTypeOfEmail != 'newEmail') {
						for (var i = 0; i < taskQuantity; i++) {
							taskProfile = profilesToChoose[Math.floor(Math.random() * profilesToChoose.length)]
							if (taskProfile == 'all profiles') {
								taskProfile = Object.keys(profiles)[Math.floor(Math.random() * Object.keys(profiles).length)];
								if (taskProfile == 'Example Profile') {
									taskProfile = Object.keys(profiles)[Math.floor(Math.random() * Object.keys(profiles).length)];
									if (taskProfile == 'Example Profile') {
										taskProfile = Object.keys(profiles)[Math.floor(Math.random() * Object.keys(profiles).length)];
										if (taskProfile == 'Example Profile') {
											taskProfile = Object.keys(profiles)[Math.floor(Math.random() * Object.keys(profiles).length)];
											if (taskProfile == 'Example Profile') {
												taskProfile = Object.keys(profiles)[Math.floor(Math.random() * Object.keys(profiles).length)];
												if (taskProfile == 'Example Profile') {
													taskProfile = Object.keys(profiles)[Math.floor(Math.random() * Object.keys(profiles).length)];
												}
											}
										}
									}
								}
							}
							// These 2 lines below are new
							var sizesToChoose = taskSizeSelect.split(',');
							sizesToChoose.pop();
							var taskSizeSelect2 = sizesToChoose[Math.floor(Math.random() * sizesToChoose.length)].trimLeft().trimRight()
							var taskSizeVariant = selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect][taskSizeSelect2];
							if (taskSizeVariant == undefined) {
								Materialize.toast("Task size variant does not exist.", 3500, "rounded");
								return;
							}
							if (createTask(taskSiteSelect, taskSizeSelect2, taskProfile, taskSpecificProxy, taskQuantity, taskEmail, taskTypeOfEmail, proxyUsed, taskTypeOfProxy, taskSizeVariant, captchaHandler, $('#checklistnigga').val()) == true) {
								return;
							}

						}

						$('#defaultOpen').click()
						$('#defaultOpen').attr('class', 'nav-item active')
						selectedQuickTaskRelease = undefined;
						$('.selectQuick').html('SELECT')
						$('#taskSiteSelect').val('default')
						$('#taskSizeSelect').val('default')
						$('.taskSiteOption').prop('disabled', true);
						$('.taskSizeOptionMass').prop('disabled', true);
						$('.massentry').click()
					} else {
						Materialize.toast("Please input a valid Email", 2000, "rounded");
					}
				} else {
					Materialize.toast("Please input a valid Quantity", 2000, "rounded");
				}
			} else {
				Materialize.toast("Please select a Size", 2000, "rounded");
			}
		} else {
			Materialize.toast("Please select a Site", 2000, "rounded");
		}
	} else {
		Materialize.toast("Please select a Release", 2000, "rounded");

	}
});





function createTask(taskSiteSelect, taskSizeSelect, taskProfile, taskSpecificProxy, taskQuantity, taskEmail, taskTypeOfEmail, proxyUsed, taskTypeOfProxy, taskSizeVariant, captchaHandler, IGHandler) {
	if (taskTypeOfEmail == 'saved') {
		var emailKeys = Object.keys(emails);
		taskEmail = emailKeys[Math.floor(Math.random() * emailKeys.length)];
		if (taskEmail == '') {
			Materialize.toast("You have no saved emails. Please save some emails, or enter a new one", 2000, "rounded");
			return true;
		}
	} else if (taskTypeOfEmail == 'newEmail') {
		taskEmail = taskEmail;
	} else if (taskTypeOfEmail == 'catchall') {
		if (validateEmail('test@' + taskEmail) != false) {
			taskEmail = taskEmail;
		} else {
			Materialize.toast("Please input a valid catchall like example.com", 2000, "rounded");
			return true;
		}
	} else {
		Materialize.toast("Please select an email type", 2000, "rounded");
		return true;
	}
	var taskID = tasks.length + 1;
	var proxy = '';
	if (taskTypeOfProxy != 'noProxy' && taskTypeOfProxy != 'default') {
		if (taskSpecificProxy == '') {
			if (taskTypeOfProxy == 'savedProxies') {
				proxy = proxies[Math.floor(Math.random() * proxies.length)];
				if (proxy == undefined) {
					proxy = '';
				}
			}
		} else {
			if (taskTypeOfProxy == 'specificProxy') {
				proxy = taskSpecificProxy;
			} else {
				proxy = '';
			}
		}
	}
	if (proxy != '') {
		proxyUsed = '<div class="proxie-butt proxgo"><i class="fas fa-bolt"></i></div>'
	}
	if (taskTypeOfEmail != 'catchall') {
		var variantName = taskSiteSelect + '_' + selectedQuickTaskRelease['filterID'];
		if (emailsForTasks[taskEmail] != undefined) {
			if (emailsForTasks[taskEmail][variantName] == true) {
				//console.log("Email already used");
				createTask(taskSiteSelect, taskSizeSelect, taskProfile, taskSpecificProxy, taskQuantity, taskEmail, taskTypeOfEmail, proxyUsed, taskTypeOfProxy, taskSizeVariant, captchaHandler)
				return;
			}
		}
		emailsForTasks[taskEmail] = {};
		emailsForTasks[taskEmail][variantName] = true;
	}
	if (taskSiteSelect == 'shinzoparis') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			shinzoparis: selectedQuickTaskRelease['shinzoparis'],
			igHandler: IGHandler
		});
	} 
	else if (taskSiteSelect == 'bstn') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			bstn: selectedQuickTaskRelease['bstn'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'nakedcph') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			nakedcph: selectedQuickTaskRelease['nakedcph'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'footshop') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			footshop: selectedQuickTaskRelease['footshop'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'ymeuniverse') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			ymeuniverse: selectedQuickTaskRelease['ymeuniverse'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'dsml') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			dsml: selectedQuickTaskRelease['dsml'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'dsmny') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			dsmny: selectedQuickTaskRelease['dsmny'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'dsms') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			dsms: selectedQuickTaskRelease['dsms'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'dsmla') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			dsmla: selectedQuickTaskRelease['dsmla'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'oneblockdown') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			oneblockdown: selectedQuickTaskRelease['oneblockdown'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'backdoor') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			backdoor: selectedQuickTaskRelease['backdoor'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'dtlr') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			dtlr: selectedQuickTaskRelease['dtlr'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'supplystore') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			supplystore: selectedQuickTaskRelease['supplystore'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'bdgastore') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			bdgastore: selectedQuickTaskRelease['bdgastore'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'fearofgod') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			fearofgod: selectedQuickTaskRelease['fearofgod'],
			igHandler: IGHandler
		});
	} else if (taskSiteSelect == 'joyce') {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			hkidnumber: $('#hkIDNUMBER4').val(),
			igHandler: IGHandler
		});
	} else {
		tasks.push({
			taskID: taskID,
			proxyType: taskTypeOfProxy,
			captchaHandler: captchaHandler,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			igHandler: IGHandler
		});
	}

	$("tbody#tasks").append(
		`
		<tr>
			<td class="leftsidetable">${proxyUsed}</td>
			<td>${taskID}</td>
			<td>${taskSiteSelect.toLowerCase()}</td>
			<td>${taskProfile.toLowerCase()}</td>
			<td>${taskEmail.toLowerCase()}</td>
			<td id="taskResult${taskID}">idle</td>
			<td class="rightsidetable">
				<button class="action-butt deleteTask" id="${taskID}"><i class="fa fa-trash" aria-hidden="true"></i>
				</button>
				<button class="action-butt startTaskMass" id="${taskID}"><i class="fa fa-play" aria-hidden="true"></i>
				</button>
			</td>
		</tr>
		`);
	$('#tasksInList').html($('#tasks tr').length - 1)
}















// Profiles

// Loads each profile for default
var profileKeys = Object.keys(profiles);
for (var i = 0; i < profileKeys.length; i++) {
	var keyName = profileKeys[i];
	$('#profileList').append($('<option>', {
		value: keyName,
		text: keyName
	}));
	$('#taskProfile').append($('<option>', {
		value: keyName,
		text: keyName
	}));
	$('#taskProfile2').append($('<option>', {
		value: keyName,
		text: keyName
	}));
	$('#taskProfile3').append($('<option>', {
		value: keyName,
		text: keyName
	}));
	$('#taskProfile4').append($('<option>', {
		value: keyName,
		text: keyName
	}));
	$('#taskProfile5').append($('<option>', {
		value: keyName,
		text: keyName
	}));
	$('#stingProfiles').append($('<option>', {
		value: keyName,
		text: keyName
	}));
}
if (require('electron').remote.getGlobal('settings').stingProfiles != null) {
	$('#stingProfiles').val(require('electron').remote.getGlobal('settings').stingProfiles);
}
$('#profileSelected').html($('#profileList option:first-child').val().slice(0, 8))

// Changes entry mode settings tab input so the disabled inputs get enabled
$('#entryMode').change();

$('#profileList').on('change', function () {
	$('#profileSelected').html(this.value.slice(0, 8))
});

$("#newProfile").click(function () {
	var profileName = $('#newProfileName').val();
	if (profiles[profileName] == null) {
		if (profileName != '') {
			$('#profileList').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			$('#taskProfile').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			$('#taskProfile2').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			$('#taskProfile3').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			$('#taskProfile4').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			$('#taskProfile5').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			$('#stingProfiles').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			profiles[profileName] = {
				"firstName": "",
				"lastName": "",
				"address": "",
				"aptSuite": "",
				"zipCode": "",
				"city": "",
				"country": "Country",
				"stateProvince": "default",
				"phoneNumber": "",
				"cardType": "default",
				"cardNumber": "",
				"expiryMonth": "MM",
				"expiryYear": "YY",
				"CVV": "",
				"jigProfileFirstName": false,
				"jigProfileLastName": false,
				"jigProfileFirstNameLetter": false,
				"jigProfileLastNameLetter": false,
				"jigProfileAddress": false,
				"jigProfilePhoneNumber": false
			};
			$('#profileList').val(profileName);
			Materialize.toast("Profile '" + profileName + "' Created!", 2000, "rounded");
			//loadProfile(profileName, false);
		} else {
			Materialize.toast("Please enter a profile name", 2000, "rounded");
		}
	} else {
		Materialize.toast("Profile '" + profileName + "' Already Exists!", 2000, "rounded");
	}
});

// Saves the current profile selected
$("#saveProfile").click(function () {
	var profileName = $('#profileList option:selected').attr('value');
	var stateProvince = $('#stateProvince').val();
	if (stateProvince == '' || stateProvince == 'none' || stateProvince == 'default') {
		stateProvince = '';
	}
	if (profileName != 'Example Profile') {
		profiles[profileName] = {
			"firstName": $('#firstName').val(),
			"lastName": $('#lastName').val(),
			"address": $('#address').val(),
			"aptSuite": $('#aptSuite').val(),
			"zipCode": $('#zipCode').val(),
			"city": $('#city').val(),
			"country": $('#country').val(),
			"stateProvince": stateProvince,
			"phoneNumber": $('#phoneNumber').val(),
			"cardType": $('#cardType').val(),
			"cardNumber": $('#cardNumber').val(),
			"expiryMonth": $('#expiryMonth').val(),
			"expiryYear": $('#expiryYear').val(),
			"CVV": $('#CVV').val(),
			"jigProfileFirstName": $('#jigProfileFirstName').is(':checked'),
			"jigProfileLastName": $('#jigProfileLastName').is(':checked'),
			"jigProfileFirstNameLetter": $('#jigProfileFirstNameLetter').is(':checked'),
			"jigProfileLastNameLetter": $('#jigProfileLastNameLetter').is(':checked'),
			"jigProfileAddress": $('#jigProfileAddress').is(':checked'),
			"jigProfilePhoneNumber": $('#jigProfilePhoneNumber').is(':checked')
		};
		ipcRenderer.send('saveProfiles', profiles);
		Materialize.toast("Profile '" + profileName + "' Saved!", 2000, "rounded");
	} else {
		Materialize.toast("You can't Modify the Example Profile!", 2000, "rounded");
	}
});

// Deletes the current profile selected
$("#deleteProfile").click(function () {
	var profileName = $('#profileList option:selected').attr('value');
	// Makes sure its not the example profile
	if (profileName != 'Example Profile') {
		profiles[profileName] = undefined;
		delete profiles[profileName];
		ipcRenderer.send('saveProfiles', profiles);
		Materialize.toast("Profile '" + profileName + "' Deleted!", 2000, "rounded");
		$('#profileList').val('Example Profile');
		$('#profileList option[value="' + profileName + '"]').remove()
		$('#taskProfile option[value="' + profileName + '"]').remove()
		$('#taskProfile2 option[value="' + profileName + '"]').remove()
		$('#taskProfile3 option[value="' + profileName + '"]').remove()
		$('#taskProfile4 option[value="' + profileName + '"]').remove()
		$('#taskProfile5 option[value="' + profileName + '"]').remove()
		$('#stingProfiles option[value="' + profileName + '"]').remove()
	} else {
		Materialize.toast("You can't modify the Example Profile!", 2000, "rounded");
	}
});


// Function when you click load on a profile page profile
$("#loadProfile").click(function () {
	var profileName = $('#profileList option:selected').attr('value');
	loadProfile(profileName, true);
});

// Function to load profiles
function loadProfile(profileName, notify) {
	var profile = profiles[profileName];
	var keys = Object.keys(profile)
	for (var i = 0; i < keys.length; i++) {
		var value = profile[keys[i]];
		if (keys[i] == 'jigProfileFirstName' || keys[i] == 'jigProfileLastName' || keys[i] == 'jigProfileFirstNameLetter' || keys[i] == 'jigProfileLastNameLetter' || keys[i] == 'jigProfileAddress' || keys[i] == 'jigProfilePhoneNumber') {
			if (value == true) {
				document.getElementById(keys[i]).checked = true;
			} else {
				document.getElementById(keys[i]).checked = false;
			}
		} else {
			$('#' + keys[i]).val(value);
		}
	}
	$('#country').change()
	if (notify) {
		Materialize.toast("Profile '" + profileName + "' loaded!", 2000, "rounded");
	}
}















// Releases section on create task

function loadReleases() {
	var taskID = 0;
	if(releases.filter(function(vendor){ return vendor.closed === true }).length == releases.length)
	{
		$('.noraffletext').html('there are currently no raffles open')
		$('.noraffleslol').css('display', 'block')
	}
	if(releases == undefined || releases.length == 0)
	{
		$('.noraffletext').html('please reopen the bot to view releases')
		$('.noraffleslol').css('display', 'block')
	}
	for (var i = 0; i < releases.length; i++) {
		var release = releases[i];
		var sitesSupported = release['sites_supported'];
		var sitesSupportedKeys = Object.keys(sitesSupported);
		var filterID = release['filterID'];
		var selectButton = release['closed'] == undefined ? `<div class="price-it-up selectQuick" id="${i}" style="margin-top: 20px;">SELECT</div>` : `<div class="price-it-up" style="margin-top: 20px;font-weight: 600;">RELEASED</div>`;
		$(".shoe-container.releases").append(`
		<div style="height: 340px;width: 230px;margin-top: 20px;" class="release-item">
			<div style="font-size: 19px;" class="raff-t"><div style="width: 220px;" class="release-title">${release['name'].toLowerCase()}</div></div>
			<div style="width: 230px;" class="raffle-im"><img class="raffle-item" src="${release['image']}"></div>
			<div class="feature"><div class="fcon"><i class="fas fa-clock"></i></div>${release['date'].toLowerCase()}</div>
			<a target="_blank">${selectButton}</a>	
		</div>
		
		`);
		if (releases[i]['closed'] != true) {
			$(".release-container").append(`
					<div class="release-item">
						<div class="release-title">${release['name'].toLowerCase()}</div>
						<img class="release-image" src="${release['image']}">
						<div class="release-button" id="${i}">sting mode</div>
						<div class="release-date">ends on ${release['date'].toLowerCase()}</div>
					</div>`);
			taskID += 1;
		}

	}
}

$('#taskTypeOfEmail').on('change', function () {
	var selectedVal = $('#taskTypeOfEmail').val();
	if (selectedVal == 'newEmail' || selectedVal == 'catchall') {
		$('#taskEmail').prop('disabled', false)
	} else {
		$('#taskEmail').prop('disabled', true)
	}
});

$('#taskTypeOfProxy').on('change', function () {
	var selectedVal = $('#taskTypeOfProxy').val();
	if (selectedVal == 'specificProxy') {
		$('#taskSpecificProxy').prop('disabled', false)
	} else {
		$('#taskSpecificProxy').prop('disabled', true)
	}
});
$('#oneClickFilter').on('change', function () {
	var selectedVal = $('#oneClickFilter').val();
	if (selectedVal != 'default') {
		$.each($(".release-item"), function () {
			var filter = $(this).data('filter')
			if (filter == selectedVal) {
				$(this).css('display', 'inline-block')
			} else {
				$(this).css('display', 'none')
			}
		});
	} else {
		$.each($(".release-item"), function () {
			$(this).css('display', 'inline-block')
		});
	}
});

$(".release-item").on('click', '.release-button', function () {
	var releaseID = $(this).attr('id');
	selectedQuickTaskRelease = releases[releaseID];
	var sites = Object.keys(releases[releaseID]['sites_supported']);
	for (var i = 0; i < sites.length; i++) {
		var taskSiteSelect = sites[i];
		if(selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect] == undefined)
		{
			taskSizeSelect = 'random';
		}
		console.log('creating '+taskQuantity+' tasks for ' + taskSiteSelect)
		var taskSizeSelect = require('electron').remote.getGlobal('settings').stingSize;
		var taskProfile = require('electron').remote.getGlobal('settings').stingProfiles;
		var taskSpecificProxy = '';
		//TEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMP
		var taskQuantity = require('electron').remote.getGlobal('settings').stingQuantity; //TEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMP
		//TEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMPTEMP
		var taskEmail = require('electron').remote.getGlobal('settings').stingCatchall;
		var taskTypeOfEmail = 'catchall';
		var taskTypeOfProxy = require('electron').remote.getGlobal('settings').stingProxytype;
		var captchaHandler = require('electron').remote.getGlobal('settings').stingCaptcha;
		var igHandler = require('electron').remote.getGlobal('settings')['stingIG'];
		if (taskSiteSelect == 'footpatroluk' && profiles[taskProfile]['country'] != 'United Kingdom') {
			Materialize.toast("The site you have selected is for UK profile only.", 3500, "rounded");
			return;
		}
		if (taskSiteSelect == 'footshop' && profiles[taskProfile]['country'] == 'China') {
			Materialize.toast("The site you have selected does not ship to China.", 3500, "rounded");
			return;
		}
		if (taskSiteSelect == 'supplystore' && profiles[taskProfile]['country'] != 'Australia') {
			Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
			return;
		}
		if (profiles[taskProfile]['address'] == '') {
			Materialize.toast("Profile does not have a saved address. Are you sure you clicked save?", 3500, "rounded");
			return;
		}
		if (taskQuantity > Object.keys(emails).length && taskTypeOfEmail == 'saved') {
			Materialize.toast("You only have " + Object.keys(emails).length + " emails saved, but want " + taskQuantity + " tasks", 3500, "rounded");
			return;
		}
		if (taskProfile == 'Example Profile') {
			Materialize.toast("You cannot create a task with the example profile", 2000, "rounded");
			return;
		}
		var proxyUsed = '';
		if (selectedQuickTaskRelease != undefined) {
			if (taskSiteSelect != 'default') {
				if (taskSizeSelect != 'default') {
					if (taskQuantity >= 1) {
						if (validateEmail(taskEmail) != false || taskTypeOfEmail != 'newEmail') {
							for (var x = 0; x < taskQuantity; x++) {
								if (taskSizeSelect == 'random') {
									tempTaskSize = Object.keys(selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect])[Math.floor(Math.random() * Object.keys(selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect]).length)];
									var taskSizeVariant = selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect][tempTaskSize];
									if (taskSizeVariant == undefined) {
										Materialize.toast("Task size variant does not exist.", 3500, "rounded");
										return;
									}
									if (createTask(taskSiteSelect, tempTaskSize, taskProfile, taskSpecificProxy, taskQuantity, taskEmail, taskTypeOfEmail, proxyUsed, taskTypeOfProxy, taskSizeVariant, captchaHandler, igHandler) == true) {
										return;
									}
								} else {
									if (selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect][taskSizeSelect] == undefined) {
										var sizesonly = Object.keys(selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect])
										taskSizeSelect = sizesonly[Math.floor(Math.random() * sizesonly.length)].trimLeft().trimRight()
									}
									var taskSizeVariant = selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect][taskSizeSelect];
									if (taskSizeVariant == undefined) {
										Materialize.toast("Task size variant does not exist.", 3500, "rounded");
										return;
									}
									if (createTask(taskSiteSelect, taskSizeSelect, taskProfile, taskSpecificProxy, taskQuantity, taskEmail, taskTypeOfEmail, proxyUsed, taskTypeOfProxy, taskSizeVariant, captchaHandler, igHandler) == true) {
										return;
									}
								}

							}

						} else {
							Materialize.toast("Please input a valid Email", 2000, "rounded");
						}
					} else {
						Materialize.toast("Please input a valid Quantity", 2000, "rounded");
					}
				} else {
					Materialize.toast("Please select a Size", 2000, "rounded");
				}
			} else {
				Materialize.toast("Please select a Site", 2000, "rounded");
			}
		} else {
			Materialize.toast("Please select a Release", 2000, "rounded");

		}
		if (i == sites.length - 1) {

			$('.massentry').click()
			selectedQuickTaskRelease = undefined;
		}
	}
});

$(".shoe-container.releases").on('click', '.selectQuick', function () {
	$('.selectQuick').html('SELECT')
	$('#taskSiteSelect').val('default')
	$('#taskSizeSelect').val('default')
	$('.taskSiteOption').prop('disabled', true);
	$('.taskSizeOptionMass').prop('disabled', true);
	var id = $(this).attr('id');
	var release = releases[id];
	var sitesAvailable = Object.keys(releases[id]['sites_supported']);
	for (var i = 0; i < sitesAvailable.length; i++) {
		var variant = releases[id]['sites_supported'][sitesAvailable[i]];
		if (variant != 'closed') {
			$('.taskSiteOption[value="' + sitesAvailable[i] + '"').prop('disabled', false);
		}
	}

	$(this).html('SELECTED')
	selectedQuickTaskRelease = release;
});

$('#taskSiteSelect').on('change', function () {
	//$('.size-select').removeClass('savaliable').removeClass('sizedisabled')
	//$('.taskSizeOptionMass').prop('disabled', true);
	if ($('#taskSiteSelect').val() != 'default') {
		$('.selectAll').removeClass('plusdisabled').addClass('plusavaliable');
	} else {
		$('.selectAll').removeClass('plusavaliable').addClass('plusdisabled');
	}
	$('.size-select.sizeNumber').removeClass('savaliable').removeClass('sizedisabled');
	$('.size-select.sizeNumber').addClass('sizedisabled');
	var sizesAvailable = Object.keys(selectedQuickTaskRelease['sizes_supported_' + this.value]).sort(function (a, b) {
		return a - b
	});
	for (var i = 0; i < sizesAvailable.length; i++) {
		$('.size-select.sizeNumber[value="' + sizesAvailable[i] + '"').addClass('savaliable').removeClass('sizedisabled');
	}
});



$("#saveEmailList").click(function () {
	var emailsToSave = $('#emailsToSave').val().split('\n')
	emails = {};
	if (emailsToSave.length == 1 && emailsToSave[0] == '') {
		emails = {};
		loadEmails({});
		ipcRenderer.send('saveEmails', emails)
		$('#defaultOpen').click()
		return;
	}
	var error = false;
	var error2 = false;
	$('#defaultOpen').click()
	for (var i = 0; i < emailsToSave.length; i++) {
		var email = emailsToSave[i];
		if (validateEmail(email) != false) {
			if (emails[email] == undefined) {
				emails[email] = {};
			} else {
				if (email != '') {
					error2 = true;
				}
			}
		} else {
			if (email != '') {
				error = true;
			}
		}
	}
	loadEmails(emails);
	ipcRenderer.send('saveEmails', emails)
	if (error2) {
		Materialize.toast("Some of your emails are already saved and therefore have not been saved.", 2000, "rounded");
		return;
	}

	if (error) {
		Materialize.toast("Some of your emails are not valid and therefore have not been saved.", 2000, "rounded");
	} else {
		Materialize.toast("Saving and updating emails.", 2000, "rounded");
	}
});

// Generate gmail dot trick emails
$('#generateGmails').click(function () {
	var gmail = $('#gmailJigInput').val();
	if (gmail == '') {
		Materialize.toast("Please enter a gmail email address.", 2000, "rounded");
	} else {
		var email = gmail;
		var emailsRequired = $('#gmailLimit').val();
		var emailsGenerated = 0;
		let username = email.split('@')[0];
		var username_length = username.length;
		var combinations = Math.pow(2, username_length - 1);
		for (i = 0; i < combinations; i++) {
			var bin = decbin(i, username_length - 1);
			var full_email = "";
			for (j = 0; j < (username_length - 1); j++) {
				full_email += username[j];
				if (bin[j] == 1) {
					full_email += ".";
				}
			}
			full_email += username[j] + "@gmail.com";
			if (emailsGenerated < emailsRequired) {
				$('#emailsToSave').val($('#emailsToSave').val() + full_email + '\n')
				emailsGenerated += 1;
			} else {
				return;
			}
		}
	}
});

// Generate catchall emails
$('#generateCatchalls').click(function () {
	var catchall = $('#catchallJigInput').val();
	var emailsRequired = $('#catchallLimit').val();
	if (catchall == '') {
		Materialize.toast("Please enter a catchall domain.", 2000, "rounded");
	} else {
		if (catchall.includes('@')) {
			for (var i = 0; i < emailsRequired; i++) {
				var full_email = randomString(Math.floor(Math.random() * (22 - 8) + 8)) + catchall;
				$('#emailsToSave').val($('#emailsToSave').val() + full_email + '\n')
			}
		} else {
			for (var i = 0; i < emailsRequired; i++) {
				var full_email = randomString(Math.floor(Math.random() * (22 - 8) + 8)) + '@' + catchall;
				$('#emailsToSave').val($('#emailsToSave').val() + full_email + '\n')
			}
		}
	}
});


function loadEmails(emailsToAdd) {
	$('#emailsToSave').val('')
	emailsToAdd = Object.keys(emailsToAdd);
	for (var i = 0; i < emailsToAdd.length; i++) {
		$('#emailsToSave').val($('#emailsToSave').val() + emailsToAdd[i] + '\n')
	}
}



// Email validation
function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}







// Used for gmail jig
function decbin(dec, length) {
	var out = "";
	while (length--)
		out += (dec >> length) & 1;
	return out;
}

// Used for catchall jig
var randomString = function (len, bits) {
	bits = bits || 36;
	var outStr = "",
		newStr;
	while (outStr.length < len) {
		newStr = Math.random().toString(bits).slice(2);
		outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
	}
	return outStr.toUpperCase();
};

$('#country').on('change', function () {
	var country = $(this).val();
	if (country == 'United States') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".USProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'United Kingdom') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".UKProfileState"), function () {
			$(this).css('display', 'block')
		});
	}  else if (country == 'Canada') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".CAProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Hong Kong') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".HKProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Italy') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".ITProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Belgium') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".BGProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Australia') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".AUSProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Austria') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".AUSTProfileState"), function () {
			$(this).css('display', 'block')
		});
	}  else if (country == 'Germany') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".DEProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Slovenia') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".SIProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'France') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".FRProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Netherlands') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".NLProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'China') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".CNProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Sweden') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".SWEProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Japan') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".JPProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Malaysia') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".MYProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Spain') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".ESProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'China') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".HKProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'China') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".CNProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Japan') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".JPProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Portugal') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".PTProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Russia') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".RUProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
	}
});