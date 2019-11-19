var HttpsProxyAgent = require('https-proxy-agent');
var mainBot = require('../index.js')
var faker = require('faker');
var cheerio = require('cheerio');

function formatProxy(proxy) {
	if (proxy == '') {
		return '';
	}
	try {
		var sProxy = proxy.split(':');
	} catch (e) {
		return '';
	}
	var proxyHost = sProxy[0] + ":" + sProxy[1];
	if (sProxy.length == 2) {
		sProxy = "http://" + proxyHost;
		return (sProxy);
	} else {
		var proxyAuth = sProxy[2] + ":" + sProxy[3];
		sProxy = "http://" + proxyAuth.trimLeft().trimRight().toString() + "@" + proxyHost;
		return (sProxy);
	}
}

function getRandomProxy() {
	var proxies = global.proxies;
	if (proxies[0] != '') {
		var proxy = proxies[Math.floor(Math.random() * proxies.length)];
		return proxy;
	} else {
		return '';
	}
}
function getRandomIG() {
	var igs = global.instagrams.split('\n');
	if (igs[0] != '') {
		var ig = igs[Math.floor(Math.random() * igs.length)];
		return ig;
	} else {
		return '';
	}
}

exports.initTask = function (task, profile) {
	if (shouldStop(task) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});

	if (profile['jigProfileFirstName'] == true) {
		profile['firstName'] = faker.fake("{{name.firstName}}");
	}
	if (profile['jigProfileLastName'] == true) {
		profile['lastName'] = faker.fake("{{name.lastName}}");
	}

	if (profile['jigProfileFirstNameLetter'] == true) {
		if (Math.random() >= 0.5) {
			profile['firstName'] = profile['firstName'] + String.fromCharCode(97 + Math.floor(Math.random() * 26));
		} else {
			profile['firstName'] = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + profile['firstName'];
		}
	}
	if (profile['jigProfileLastNameLetter'] == true) {
		if (Math.random() >= 0.5) {
			profile['lastName'] = profile['lastName'] + String.fromCharCode(97 + Math.floor(Math.random() * 26));
		} else {
			profile['lastName'] = String.fromCharCode(97 + Math.floor(Math.random() * 26)) + profile['lastName'];
		}
	}

	if (task['taskTypeOfEmail'] == 'catchall') {
		if (task['catchallJigged'] == false || task['catchallJigged'] == undefined) {
			var pickEmail = Math.floor(Math.random() * 7) + 1;
			if (pickEmail == 1) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				var email = profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 2) {
				var rand = Math.floor(Math.random() * 9000) + 1000; // For Email
				var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 3) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 4) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				var email = profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 5) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				var email = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else if (pickEmail == 6) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				var email = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			} else {
				var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + "@" + task['taskEmail'];
				task['taskEmail'] = email;
				task['catchallJigged'] = true;
			}
		}
	}

	if (task['taskEmail'] != null && task['taskEmail'].indexOf("'") > -1) {
		task['taskEmail'] = task['taskEmail'].replaceAll("'", '');
	}
	if (task['taskEmail'] != null && task['taskEmail'].indexOf(' ') > -1) {
		task['taskEmail'] = task['taskEmail'].replaceAll(' ', '');
	}

	if (profile['jigProfileAddress'] == true) {
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	if (profile['firstName'] == null || profile['firstName'] == undefined || profile['firstName'] == '') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Please save a first name'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	if (profile['lastName'] == null || profile['lastName'] == undefined || profile['lastName'] == '') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Please save a last name'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	
	if (profile['phoneNumber'] == null || profile['phoneNumber'] == undefined || profile['phoneNumber'] == '') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Please save a number'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Submitting entry'
	});

	require('request')({
		url: 'https://api.codeyellow.io/instagram/get?type=maha',
		method: 'get'
	}, function (err, response, body) {
		try {
			var parsedAPI = JSON.parse(body);
		} catch (e) {
			var pickIG = Math.floor(Math.random() * 7) + 1;
			if (pickIG == 1) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				profile['instagram'] = profile['firstName'].toLowerCase() + rand;
			} else if (pickIG == 2) {
				var rand = Math.floor(Math.random() * 9000) + 1000; // For Email
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand;
			} else if (pickIG == 3) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand;
			} else if (pickIG == 4) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				profile['instagram'] = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand;
			} else if (pickIG == 5) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				profile['instagram'] = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand;
			} else {
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase();
			}
		}
		if (parsedAPI == undefined || parsedAPI.valid != true) {
			var pickIG = Math.floor(Math.random() * 7) + 1;
			if (pickIG == 1) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				profile['instagram'] = profile['firstName'].toLowerCase() + rand;
			} else if (pickIG == 2) {
				var rand = Math.floor(Math.random() * 9000) + 1000; // For Email
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand;
			} else if (pickIG == 3) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand;
			} else if (pickIG == 4) {
				var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982;
				profile['instagram'] = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand;
			} else if (pickIG == 5) {
				var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
				profile['instagram'] = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand;
			} else {
				profile['instagram'] = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase();
			}
		} else {
			if (task['igHandler'] == 'mylist') {
				var ig = getRandomIG();
				if (ig == '' || ig == undefined) {
					profile['instagram'] = parsedAPI.instagram;
				} else {
					profile['instagram'] = getRandomIG();
				}
			} else {
				profile['instagram'] = parsedAPI.instagram;
			}
		}
		console.log('Instagram used: ' + profile['instagram'])
		request({
			url: 'https://apps.shopmonkey.nl/maha/raffle/raffle.php',
			method: 'POST',
			headers: {
				'Connection': 'keep-alive',
				'Accept': '*/*',
				'Origin': 'https://shop.maha-amsterdam.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'Sec-Fetch-Site': 'cross-site',
				'Sec-Fetch-Mode': 'cors',
				'Referer': 'https://shop.maha-amsterdam.com/us/nike-air-force-1-07-para-noise-black.html',
				'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
			},
			body: 'product=Nike+Air+Force+1+\'07+Para-Noise+Black&productImage=https%3A%2F%2Fcdn.webshopapp.com%2Fshops%2F171311%2Ffiles%2F310039021%2F112x132x1%2Fimage.jpg&productId=104438143&dontfill=&firstname=' + profile['firstName'] + '&lastname=' + profile['lastName'] + '&phone=' + profile['phoneNumber'] + '&shoeSize=' + task['taskSizeVariant'] + '&email=' + task['taskEmail'] + '&country=' + profile['country'] + '&instagram='+profile['instagram']+'&shipping=shipping&keepMePosted=on',
			agent: agent
		}, function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				if (body.toLowerCase().indexOf('raffle-succes-message') > -1) {
					console.log('Entered');
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'entry submitted!'
					});
					console.log(`[${task.taskID}] ` + ' Entry submitted!');
					registerEmail(task);
					mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				} else {
					try {
						console.log(body);
					} catch (e) {

					}
					console.log(`[${task.taskID}] ` + JSON.stringify(task));
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'make sure your profile is complete'
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				}
			} else {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			}
		});
	});
}


// Check if task should stop, for example if deleted
function shouldStop(task) {
	if (mainBot.taskStatuses[task['type']][task['taskID']] == 'stop') {
		mainBot.taskStatuses[task['type']][task['taskID']] = 'idle';
		return true;
	} else if (mainBot.taskStatuses[task['type']][task['taskID']] == 'delete') {
		mainBot.taskStatuses[task['type']][task['taskID']] = '';
		return true;
	} else {
		return false;
	}
}

// Checks if this email was already entered into a raffle
function checkEmail(task) {
	if (task['taskTypeOfEmail'] == 'saved') {
		if (global.emails[task['taskEmail']] == undefined) {
			return false;
		}
		if (global.emails[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] == true && task['type'] == 'mass') {
			return true;
		} else {
			return false;
		}
	}
}
// Saves email in emails.json to show email was entered 
function registerEmail(task) {
	if (task['taskTypeOfEmail'] == 'saved') {
		if (global.emails[task['taskEmail']] == undefined) {
			return;
		}
		var variantName = task['taskSiteSelect'] + '_' + task['filterID'];
		global.emails[task['taskEmail']][variantName] = true;
		mainBot.saveEmails(global.emails);
	}
}