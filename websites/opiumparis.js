
var HttpsProxyAgent = require('https-proxy-agent');
var mainBot = require('../index.js')
var cheerio = require('cheerio');
var faker = require('faker');

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

exports.initTask = function (task, profile) {
	if (task['captchaHandler'] == 'manual') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'You must use 2Cap or AntiCap for BSTN'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
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
	var jar = require('cloudscraper').jar()
	var request = require('cloudscraper').defaults({
		jar: jar,
		onCaptcha: function (options, response, body) {
			const captcha = response.captcha;
			console.log(captcha.siteKey);
			if (task['captchaHandler'] == '2captcha') {
				request({
					url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=' + captcha.siteKey + '&pageurl=https://www.opiumparis.com/fr/raffles/1575-10802-air-jordan-1-hi-85-varsity-red.html&json=1&soft_id=2553',
					method: 'GET',
					json: true,
					agent: agent
				}, function (error, response, body) {
					if (error) {
						if (task['proxyType'] != 'noProxy') {
							var proxy2 = getRandomProxy();
							task['proxy'] = proxy2;

							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: '2Captcha Proxy Error. Retrying in 5s'
							});
							return setTimeout(() => exports.initTask(task, profile), 5000);
						} else {
							task['proxy'] = '';
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: '2Captcha Error. Retrying in 15s'
							});
							return setTimeout(() => exports.initTask(task, profile), 15000);
						}
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
									message: 'Checking 2Captcha every 5s (Cloudflare)'
								});
								console.log('Checking for Captcha token (2Captcha Task ID: ' + taskId + ')');
								request({
									url: 'https://2captcha.com/res.php?key=' + global.settings['2capAPIKey'] + '&action=get&id=' + taskId + '&json=1',
									method: 'GET',
									json: true,
									agent: agent
								}, function (error, response, body) {
									if (error) {
										if (task['proxyType'] != 'noProxy') {
											var proxy2 = getRandomProxy();
											task['proxy'] = proxy2;
											agent = new HttpsProxyAgent(formatProxy(task['proxy']));

											mainBot.mainBotWin.send('taskUpdate', {
												id: task.taskID,
												type: task.type,
												message: '2Captcha Proxy error. Retrying in 5s'
											});
											return setTimeout(() => capHandler(), 5000);
										} else {
											task['proxy'] = '';
											agent = new HttpsProxyAgent(formatProxy(task['proxy']));
											mainBot.mainBotWin.send('taskUpdate', {
												id: task.taskID,
												type: task.type,
												message: '2Captcha Proxy error. Retrying in 15s'
											});
											return setTimeout(() => capHandler(), 5000);
										}
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
											mainBot.mainBotWin.send('taskUpdate', {
												id: task.taskID,
												type: task.type,
												message: 'Submitting CloudFlare Captcha'
											});
											console.log('Submitting CloudFlare Captcha');
											captcha.form['g-recaptcha-response'] = body.request;
											captcha.submit();
											return;
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
			} else if (task['captchaHandler'] == 'anticaptcha') {
				request({
					url: 'https://api.anti-captcha.com/createTask',
					method: 'POST',
					body: {
						clientKey: global.settings.antiCapAPIKey,
						"softId": "924",
						"task": {
							"type": "NoCaptchaTaskProxyless",
							"websiteURL": "https://www.opiumparis.com/fr/raffles/1575-10802-air-jordan-1-hi-85-varsity-red.html",
							"websiteKey": captcha.siteKey
						}
					},
					json: true
				}, function (error, response, body) {
					if (error) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'AntiCaptcha error. Retrying in 15s'
						});
						if (task['proxyType'] != 'noProxy') {
							var proxy2 = getRandomProxy();
							task['proxy'] = proxy2;
						} else {
							task['proxy'] = '';
						}
						return setTimeout(() => exports.captchaWorker(request, task, profile), 15000);
					}
					if (body.errorId != undefined && body.errorId == 0) {
						var taskId = body.taskId;
						console.log('Captcha task for Anti-Captcha queued. Task ID: ' + taskId)
						const capHandler = () => {
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Checking AntiCaptcha every 5s (Cloudflare)'
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
							}, function (error, response, body) {
								if (error) {
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'AntiCaptcha error. Retrying in 25s'
									});
									return setTimeout(() => exports.captchaWorker(request, task, profile), 25000);
								}
								if (body == undefined) {
									if (task['proxyType'] != 'noProxy') {
										var proxy2 = getRandomProxy();
										task['proxy'] = proxy2;
									} else {
										task['proxy'] = '';
									}
									return setTimeout(() => capHandler(), 10000);
								}
								if (body.errorId == 0) {
									if (body.status == 'ready') {
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Submitting CloudFlare Captcha'
										});
										captcha.form['g-recaptcha-response'] = body.solution.gRecaptchaResponse;
										captcha.submit();
										return;
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
			}
		}
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
		// ********************************************* Add this only to sites with no address line 2 *********************************************
		profile['address'] = profile['address'] + ' ' + faker.fake("{{address.secondaryAddress}}");
		// ********************************************* Add this only to sites with no address line 2 *********************************************
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	if (profile['phoneNumber'] != null && profile['phoneNumber'].indexOf('-') > -1) {
		profile['phoneNumber'] = profile['phoneNumber'].replaceAll('-', '');
	}
	if (profile['phoneNumber'] != null && profile['phoneNumber'].indexOf('(') > -1) {
		profile['phoneNumber'] = profile['phoneNumber'].replaceAll('(', '');
	}
	if (profile['phoneNumber'] != null && profile['phoneNumber'].indexOf(')') > -1) {
		profile['phoneNumber'] = profile['phoneNumber'].replaceAll(')', '');
	}
	if (profile['phoneNumber'] != null && profile['phoneNumber'].indexOf(' ') > -1) {
		profile['phoneNumber'] = profile['phoneNumber'].replaceAll(' ', '');
	}


	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}


	console.log(`[${task.taskID}] ` + ' Creating account');
	task['taskPassword'] = makePassword(15);
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Creating account'
	});
	task['birthday'] = {
		day: '0' + getRandomInt(1, 9),
		month: '0' + getRandomInt(1, 9),
		year: getRandomInt(1982, 2000)
	};
	request({
		url: 'https://www.opiumparis.com/fr/raffles/1575-10802-air-jordan-1-hi-85-varsity-red.html',
		method: 'POST',
		headers: {
			'authority': 'www.opiumparis.com',
			'cache-control': 'max-age=0',
			'origin': 'https://www.opiumparis.com',
			'upgrade-insecure-requests': '1',
			'content-type': 'application/x-www-form-urlencoded',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-user': '?1',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'sec-fetch-site': 'same-origin',
			'referer': 'https://www.opiumparis.com/fr/raffles/1575-10802-air-jordan-1-hi-85-varsity-red.html',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		body: 'id_customer=&id_gender=1&firstname=' + profile['firstName'] + '&lastname=' + profile['lastName'] + '&email=' + task['taskEmail'] + '&password=' + task['taskPassword'] + '&birthday=' + task['birthday']['year'] + '-' + task['birthday']['month'] + '-' + task['birthday']['day'] + '&newsletter=1&submitCreate=1',
		agent: agent
	}, function callback(error, response, body) {
		if (!error) {
			if (response.statusCode != 200) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
			}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: ''
			});
			$ = cheerio.load(body);

			if ($('input[value="S\'inscrire à la raffle"]').length) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Account created'
				});
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Submitting entry'
				});
				return exports.submitRaffle(request, task, profile)
			} else {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Email registered, or invalid profile setup'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
		}
	});

}


exports.submitRaffle = function (request, task, profile) {
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
	console.log(`[${task.taskID}] ` + 'Getting raffle page');
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Getting raffle page'
	});

	console.log(`[${task.taskID}] ` + JSON.stringify(task));
	console.log(`[${task.taskID}] ` + JSON.stringify(profile));
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	request({
		url: 'https://www.opiumparis.com/fr/raffles/1575-10802-air-jordan-1-hi-85-varsity-red.html',
		method: 'POST',
		headers: {
			'sec-fetch-mode': 'cors',
			'origin': 'https://www.opiumparis.com',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'x-requested-with': 'XMLHttpRequest',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'accept': 'application/json, text/javascript, */*; q=0.01',
			'referer': 'https://www.opiumparis.com/fr/raffles/1575-10802-air-jordan-1-hi-85-varsity-red.html',
			'authority': 'www.opiumparis.com',
			'sec-fetch-site': 'same-origin'
		},
		body: 'lastname=' + profile['lastName'] + '&firstname=' + profile['firstName'] + '&birthday=' + task['birthday']['year'] + '-' + task['birthday']['month'] + '-' + task['birthday']['day'] + '&size='+task['taskSizeVariant']+'&email=' + task['taskEmail'] + '&phone=' + profile['phoneNumber'] + '&cgv=1&action=Raffle',
		agent: agent
	}, function callback(error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
		}
		if (response.statusCode != 200) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
		}
		try {
			var parsed = JSON.parse(body);
		} catch (e) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
		}

		if (parsed['error'] == false) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Entry submitted!'
			});
			registerEmail(task);
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', task['taskPassword'], task, profile);
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		} else {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: parsed['message']
			});
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		}

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


String.prototype.replaceAll = function (str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}






// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}


function makePassword(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
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
			return '2captcha balance 0';
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