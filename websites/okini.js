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

	if (countryFormatter(profile["country"]) == 'noexist') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'oki-ni may not ship to your country'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Posting raffle info'
	});
	var token = '';
	exports.postRaffleInfo(request, task, profile, token);
}

exports.postRaffleInfo = function (request, task, profile, token) {
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

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Posting raffle information'
	});
	require('request')({
		url: 'https://api.codeyellow.io/instagram/get?type=okini',
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
			url: 'https://email.oki-ni.com/p/4EYZ-87H',
			headers: {
				'authority': 'email.oki-ni.com',
				'cache-control': 'max-age=0',
				'upgrade-insecure-requests': '1',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
				'sec-fetch-user': '?1',
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
				'sec-fetch-site': 'none',
				'sec-fetch-mode': 'navigate',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
			}
		}, function callback(error, response, body) {
			if (!error) {
				if (response.statusCode != 200) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					console.log('New proxy: ' + formatProxy(task['proxy']));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.postRaffleInfo(request, task, profile, token), global.settings.retryDelay);
				}
				$ = cheerio.load(body);
				var respondent = $('input[name="respondent"]').attr('value');
				if (!respondent) {
					try {
						console.log(body)
					} catch (e) {}
					console.log(JSON.stringify(profile));
					console.log(JSON.stringify(task));
					console.log('Unknown error. DM Log unknownerror1okini');
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Unknown error. DM Log'
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					mainBot.taskCaptchas[task['type']][task['taskID']] = '';
					return;
				}
				console.log(respondent);

				request({
					url: 'https://email.oki-ni.com/Response/SurveyLP/8a4eyz7e-ef4bti37?pUrl=https%3A%2F%2Fr1.dotmailer-surveys.com%2F8a4eyz7e-ef4bti37&random=' + Math.random(),
					method: 'POST',
					headers: {
						'authority': 'email.oki-ni.com',
						'accept': 'application/json, text/plain, */*',
						'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
						'origin': 'https://email.oki-ni.com',
						'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36',
						'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
						'sec-fetch-site': 'same-origin',
						'sec-fetch-mode': 'cors',
						'referer': 'https://email.oki-ni.com/p/4EYZ-87H/draw-yeezy-boost-350-v2-yeezreel',
						'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
					},
					body: '22='+task['taskEmail']+'&23='+profile['firstName']+'&24='+profile['lastName']+'&25='+profile['instagram']+'&26=instagram&27=+1201' + getRandomInt(1000001, 9999999) + '&28='+countryFormatter(profile["country"])+'&30='+task['taskSizeVariant']+'&32=1&34=on&defaultSubmitAction=Complete&respondent=' + respondent
					,
					followAllRedirects: true
				}, function callback(error, response, body) {
					if (!error) {
						if (response.statusCode != 200) {
							try {
								console.log(body)
							} catch (e) {}
							console.log(JSON.stringify(profile));
							console.log(JSON.stringify(task));
							console.log('Unknown error. DM Log unknownerror2okini');
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Unknown error. DM Log'
							});
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							mainBot.taskCaptchas[task['type']][task['taskID']] = '';
							return;
						}
						if (body.toLowerCase().indexOf('window.surveycomplete = true') > -1) {
							console.log('entry submitted');
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Entry submitted!'
							});
							console.log(`[${task.taskID}] ` + ' Entry submitted!');
							registerEmail(task);
							mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
							return;
						}
					} else {
						var proxy2 = getRandomProxy();
						task['proxy'] = proxy2;
						console.log('New proxy: ' + formatProxy(task['proxy']));
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.postRaffleInfo(request, task, profile, token), global.settings.retryDelay);
					}
				});
			} else {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				console.log('New proxy: ' + formatProxy(task['proxy']));
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.postRaffleInfo(request, task, profile, token), global.settings.retryDelay);
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



// Needed for country localizations being different per site
function countryFormatter(profileCountry) {
	switch (profileCountry) {
		case 'United Kingdom':
			return '233';
			break;
		case 'United States':
			return '234';
			break;
		case 'Canada':
			return '38';
			break;
		case 'Ireland':
			return '106';
			break;
		case 'Germany':
			return '82';
			break;
		case 'Portugal':
			return '177';
			break;
		case 'Switzerland':
			return '215';
			break;
		case 'France':
			return '75';
			break;
		case 'Spain':
			return '208';
			break;
		case 'Italy':
			return '109';
			break;
		case 'Netherlands':
			return '155';
			break;
		case 'Czech Republic':
			return '57';
			break;
		case 'Australia':
			return '13';
			break;
		case 'Austria':
			return '14';
			break;
		case 'Slovakia':
			return '201';
			break;
		case 'Belgium':
			return '21';
			break;
		case 'Slovenia':
			return '202';
			break;
		case 'Singapore':
			return '200';
			break;
		case 'Malaysia':
			return '133';
			break;
		case 'Hong Kong':
			return '99';
			break;
		case 'China':
			return '44';
			break;
		case 'Japan':
			return '111';
			break;
		case 'Sweden':
			return '214';
			break;
		case 'Denmark':
			return '59';
			break;
		case 'Finland':
			return '74';
			break;
		case 'Romania':
			return '182';
			break;
		case 'Poland':
			return '176';
			break;
		case 'Hungary':
			return '100';
			break;
		case 'Russia':
			return '183';
			break;
		case 'Luxembourg':
			return '128';
			break;
		default:
			return 'noexist';
			break;
	}
}














function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
