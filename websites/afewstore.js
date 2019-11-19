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
	if(profile['stateProvince'] == '')
	{
		profile['stateProvince'] = 'none';
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

	if (countryFormatter(profile["country"]) == 'noexist') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'afew may not ship to your country'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}

	console.log('needs captcha');
	return exports.captchaWorker(request, task, profile);
}

exports.captchaWorker = function (request, task, profile) {
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	if (task['captchaHandler'] == 'manual') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Awaiting captcha'
		});
		console.log(`[${task.taskID}] ` + ' Awaiting captcha');
		mainBot.requestCaptcha('afewstore', task, false);
		const capHandler = () => {
			if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
				setTimeout(() => capHandler(), 100);
			} else {
				exports.submitRaffle(request, task, profile);
				return;
			}
		}
		capHandler();
	} else {
		agent = new HttpsProxyAgent(formatProxy(task['proxy']));
		if (task['captchaHandler'] == 'anticaptcha') {
			if (global.settings.antiCapAPIKey == '' || global.settings.antiCapAPIKey == undefined) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Captcha API Key not set. Check settings.'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			}
			request({
				url: 'https://api.anti-captcha.com/createTask',
				method: 'POST',
				body: {
					clientKey: global.settings.antiCapAPIKey,
					"softId": "924",
					"task": {
						"type": "NoCaptchaTaskProxyless",
						"websiteURL": "https://mailchi.mp/afew-store/mim54y8lty",
						"websiteKey": "6Lexz1YUAAAAAJZknL3EkeY_xBlIKGKGfGwFHhjK"
					}
				},
				json: true,
				agent: agent
			}, function (error, response, body) {
				if (error) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'AntiCaptcha error. Retrying in 15s'
					});
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					return setTimeout(() => exports.captchaWorker(request, task, profile), 15000);
				}
				if (body.errorId != undefined && body.errorId == 0) {
					var taskId = body.taskId;
					console.log('Captcha task for Anti-Captcha queued. Task ID: ' + taskId)
					const capHandler = () => {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Checking AntiCaptcha every 5s'
						});
						console.log('Checking for Captcha token (Anti-Captcha Task ID: ' + taskId + ')');
						request({
							url: 'https://api.anti-captcha.com/getTaskResult',
							method: 'POST',
							body: {
								clientKey: global.settings.antiCapAPIKey,
								taskId: taskId
							},
							json: true,
							agent: agent
						}, function (error, response, body) {
							if (error) {
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'AntiCaptcha error'
								});
								mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
								mainBot.taskCaptchas[task['type']][task['taskID']] = '';
							}
							if (body == undefined) {
								var proxy2 = getRandomProxy();
								task['proxy'] = proxy2;
								return setTimeout(() => capHandler(), 10000);
							}
							if (body.errorId == 0) {
								if (body.status == 'ready') {
									console.log(JSON.stringify(body));
									mainBot.taskCaptchas[task['type']][task['taskID']] = body.solution.gRecaptchaResponse;
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'Submitting entry'
									});
									console.log('submitting');
									return exports.submitRaffle(request, task, profile);
								} else {
									return setTimeout(() => capHandler(), 5000);
								}
							} else {
								console.log(JSON.stringify(body));
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: antiCaptchaErrorFormatter(body.errorCode)
								});
								mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
								mainBot.taskCaptchas[task['type']][task['taskID']] = '';
								return;
							}
						});
					}
					capHandler();
				} else {
					console.log(JSON.stringify(body));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: antiCaptchaErrorFormatter(body.errorCode)
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					mainBot.taskCaptchas[task['type']][task['taskID']] = '';
					return;
				}
			});
		} else if (task['captchaHandler'] == '2captcha') {
			if (global.settings['2capAPIKey'] == '' || global.settings['2capAPIKey'] == undefined) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Captcha API Key not set. Check settings.'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			}
			request({
				url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=6Lexz1YUAAAAAJZknL3EkeY_xBlIKGKGfGwFHhjK&pageurl=https://mailchi.mp/afew-store/mim54y8lty&json=1&soft_id=2553',
				method: 'GET',
				json: true
			}, function (error, response, body) {
				if (error) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile), 15000);
				}
				if (body.status == 0) {
					console.log(JSON.stringify(body));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: twoCaptchaCreateErrorFormatter(body.request)
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					mainBot.taskCaptchas[task['type']][task['taskID']] = '';
					return;
				} else {
					if (body.status == 1) {
						var taskId = body.request;
						console.log('Captcha task for 2Captcha queued. Task ID: ' + taskId)
						const capHandler = () => {
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Checking 2Captcha every 5s'
							});
							console.log('Checking for Captcha token (2Captcha Task ID: ' + taskId + ')');
							request({
								url: 'https://2captcha.com/res.php?key=' + global.settings['2capAPIKey'] + '&action=get&id=' + taskId + '&json=1',
								method: 'GET',
								json: true
							}, function (error, response, body) {
								if (error) {
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: '2Captcha error'
									});
									mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
									mainBot.taskCaptchas[task['type']][task['taskID']] = '';
								}
								if (body == undefined) {
									return setTimeout(() => capHandler(), 10000);
								} else if (body.status == 0) {
									if (body.request == 'CAPCHA_NOT_READY') {
										return setTimeout(() => capHandler(), 5000);
									} else {
										console.log(JSON.stringify(body));
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: twoCaptchaResponseErrorFormatter(body.request)
										});
										mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
										mainBot.taskCaptchas[task['type']][task['taskID']] = '';
										return;
									}
								} else {
									if (body.status == 1) {
										console.log(JSON.stringify(body));
										mainBot.taskCaptchas[task['type']][task['taskID']] = body.request;
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Submitting entry'
										});
										console.log('submitting');
										return exports.submitRaffle(request, task, profile);
									} else {
										if (body.request == 'CAPCHA_NOT_READY') {
											return setTimeout(() => capHandler(), 5000);
										} else {
											console.log(JSON.stringify(body));
											mainBot.mainBotWin.send('taskUpdate', {
												id: task.taskID,
												type: task.type,
												message: twoCaptchaResponseErrorFormatter(body.request)
											});
											mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
											mainBot.taskCaptchas[task['type']][task['taskID']] = '';
											return;
										}
									}
								}
							});
						}
						capHandler();
					} else {
						console.log(JSON.stringify(body));
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: twoCaptchaCreateErrorFormatter(body.errorCode)
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						mainBot.taskCaptchas[task['type']][task['taskID']] = '';
						return;
					}
				}
			});
		}
	}

}


exports.submitRaffle = function (request, task, profile) {
	console.log('submitraffle called');
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
	if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
		// NEEDS CAPTCHA AGAIN
		return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
	}

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	require('request')({
		url: 'https://api.codeyellow.io/instagram/get?type=afewstore',
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
			url: 'https://mc.us5.list-manage.com/signup-form/subscribe?u=936d4960278d1960e43d58d0d&id=0034c3e1f0&EMAIL=' + task['taskEmail'] + '&FNAME=' + profile['firstName'] + '&LNAME=' + profile['lastName'] + '&STREET=' + profile['address'] + 'd&ZIP=' + profile['zipCode'] + '&STATE=' + profile['stateProvince'] + '&CITY=' + profile['city'] + '&INSTAGRAM=' + profile['instagram'] + '&SIZES=' + task['taskSizeSelect'] + '&COUNTRY=' + countryFormatter(profile["country"]) + '&b_936d4960278d1960e43d58d0d_149123=&g-recaptcha-response=' + mainBot.taskCaptchas[task['type']][task['taskID']] + '&gdpr%5B179%5D=on&c=dojo_request_script_callbacks.dojo_request_script2',
			headers: {
				'authority': 'mc.us5.list-manage.com',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
				'accept': '*/*',
				'sec-fetch-site': 'cross-site',
				'sec-fetch-mode': 'no-cors',
				'referer': 'https://mailchi.mp/afew-store/mim54y8lty',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
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
						message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
				}
				if (!body) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'error. retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
				}
				if (body.toLowerCase().indexOf('almost finished') > -1) {
					console.log('Entered');
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'check email!'
					});
					console.log(`[${task.taskID}] ` + ' Entry submitted!');
					registerEmail(task);
					mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				} else if (body.toLowerCase().indexOf('has too many recent signup requests') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Already entered!'
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}  else if (body.toLowerCase().indexOf('too many subscribe attempts for this email address.') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'too many attempts! use proxies or try later'
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}  else if (body.toLowerCase().indexOf('captcha is invalid. please try again') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'cap error. retrying'
					});
					mainBot.taskCaptchas[task['type']][task['taskID']] = '';
					return exports.captchaWorker(request, task, profile);
				} else if (body.toLowerCase().indexOf('please enter a value') > -1) {
					console.log(`[${task.taskID}] ` + JSON.stringify(task));
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Make sure every field has a value saved'
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				} else {
					try {
						console.log(body);
					} catch (e) {

					}
					console.log(`[${task.taskID}] ` + JSON.stringify(task));
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					console.log('unknownafewerror');
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'unknown error. dm log'
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
			} else {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				console.log('New proxy: ' + formatProxy(task['proxy']));
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
			}
		});
	});
}

// Needed for country localizations being different per site
function countryFormatter(profileCountry) {
	switch (profileCountry) {
		case 'United Kingdom':
			return 'Great Britain';
			break;
		case 'United States':
			return 'United States';
			break;
		case 'Canada':
			return 'Canada';
			break;
		case 'Ireland':
			return 'Ireland';
			break;
		case 'Germany':
			return 'Germany';
			break;
		case 'Portugal':
			return 'Portugal';
			break;
		case 'Switzerland':
			return 'Switzerland';
			break;
		case 'France':
			return 'France';
			break;
		case 'Spain':
			return 'Spain';
			break;
		case 'Italy':
			return 'Italy';
			break;
		case 'Netherlands':
			return 'Netherlands';
			break;
		case 'Czech Republic':
			return 'Czech Republic';
			break;
		case 'Australia':
			return 'Australia';
			break;
		case 'Austria':
			return 'Austria';
			break;
		case 'Slovakia':
			return 'Slovakia';
			break;
		case 'Belgium':
			return 'Belgium';
			break;
		case 'Slovenia':
			return 'Slovenia';
			break;
		case 'Singapore':
			return 'Singapore';
			break;
		case 'Malaysia':
			return 'Malaysia';
			break;
		case 'Hong Kong':
			return 'Hong Kong';
			break;
		case 'China':
			return 'China';
			break;
		case 'Japan':
			return 'Japan';
			break;
		case 'Sweden':
			return 'Sweden';
			break;
		case 'Denmark':
			return 'Denmark';
			break;
		case 'Finland':
			return 'Finland';
			break;
		case 'Romania':
			return 'Romania';
			break;
		case 'Poland':
			return 'Poland';
			break;
		case 'Hungary':
			return 'Hungary';
			break;
		case 'Russia':
			return 'Russian Federation';
			break;
		case 'Luxembourg':
			return 'Luxembourg';
			break;
		default:
			return 'noexist';
			break;
	}
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














function antiCaptchaErrorFormatter(message) {
	switch (message) {
		case 'ERROR_ZERO_BALANCE':
			return 'AntiCaptcha balance 0';
			break;
		case 'ERROR_KEY_DOES_NOT_EXIST':
			return 'Captcha API Key invalid. Check settings';
			break;
		case 'ERROR_NO_SLOT_AVAILABLE':
			return 'No AntiCaptcha workers available';
			break;
		case 'ERROR_RECAPTCHA_INVALID_SITEKEY':
			return 'Invalid SiteKey. DM Devs';
			break;
		case 'ERROR_RECAPTCHA_INVALID_DOMAIN':
			return 'Invalid website. DM Devs';
			break;
		default:
			return 'AntiCaptcha error. DM Log';
			break;
	}
}

function twoCaptchaCreateErrorFormatter(message) {
	switch (message) {
		case 'ERROR_ZERO_BALANCE':
			return 'AntiCaptcha balance 0';
			break;
		case 'ERROR_WRONG_USER_KEY':
			return 'Captcha API Key invalid. Check settings';
			break;
		case 'ERROR_KEY_DOES_NOT_EXIST':
			return 'Captcha API Key invalid. Check settings';
			break;
		case 'ERROR_NO_SLOT_AVAILABLE':
			return 'No 2Captcha workers available';
			break;
		case 'ERROR_BAD_TOKEN_OR_PAGEURL':
			return 'Invalid token or url. DM Devs';
			break;
		case 'ERROR_PAGEURL':
			return 'Invalid website. DM Devs';
			break;
		default:
			return '2Captcha error. DM Log';
			break;
	}
}

function twoCaptchaResponseErrorFormatter(message) {
	switch (message) {
		case 'ERROR_CAPTCHA_UNSOLVABLE':
			return 'Captcha was unsolvable';
			break;
		case 'ERROR_WRONG_USER_KEY':
			return 'Captcha API Key invalid. Check settings';
			break;
		case 'ERROR_KEY_DOES_NOT_EXIST':
			return 'Captcha API Key invalid. Check settings';
			break;
		default:
			return '2Captcha error. DM Log';
			break;
	}
}