/*
	Copyright (C) 2019 Code Yellow

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program (license.md).  If not, see <http://www.gnu.org/licenses/>.
*/


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
	
	if (countryFormatter(profile["country"]) == 'noexist') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'B4B doesn\'t ship to your country'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
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

	if (profile['jigProfileAddress'] == true) {
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");

		// ********************************************* Add this only to sites with no address line 2 *********************************************
		//profile['address'] = profile['address'] + ' ' + faker.fake("{{address.secondaryAddress}}");
		// ********************************************* Add this only to sites with no address line 2 *********************************************
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining raffle page'
	});

	//task['variant'] = url below
	request({
		url: task['variant'],
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
			'Sec-Fetch-Mode': 'navigate',
			'Sec-Fetch-User': '?1',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Sec-Fetch-Site': 'none',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		agent: agent
	}, function callback(error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
		}
		if (response.statusCode != 200) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
		}

		$ = cheerio.load(body);
		var token = $('input[name="token"]').val();
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Got raffle page'
		});
		if (token) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle token'
			});
			console.log('Got token: ' + token);
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Awaiting captcha'
			});
			console.log('Now needs captcha');
			return exports.captchaWorker(request, task, profile, token);
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
		}
	});


}


exports.captchaWorker = function (request, task, profile, token) {
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
		mainBot.requestCaptcha('basket4ballers', task, false);
		const capHandler = () => {
			if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
				setTimeout(() => capHandler(), 100);
			} else {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Submitting entry'
				});
				return exports.submitRaffle(request, task, profile, token);
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
					"task": {
						"type": "NoCaptchaTaskProxyless",
						"websiteURL": task['variant'],
						"websiteKey": "6LcpBD0UAAAAALwqETJkSSuQZYcavdDKu1sy_XPN"
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
					return setTimeout(() => exports.captchaWorker(request, task, profile, token), 15000);
				}
				if (body != undefined || body.errorId != undefined && body.errorId == 0) {
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
									return exports.submitRaffle(request, task, profile, token);
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
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'AntiCaptcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, token), 15000);
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
				url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=6LcpBD0UAAAAALwqETJkSSuQZYcavdDKu1sy_XPN&pageurl=' + task['variant'] + '&json=1',
				method: 'GET',
				json: true
			}, function (error, response, body) {
				if (error) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, token), 15000);
				}
				if (body == undefined) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, token), 15000);
				} else if (body.status == 0) {
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
										return exports.submitRaffle(request, task, profile, token);
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

exports.submitRaffle = function (request, task, profile, token) {
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

	if (mainBot.taskCaptchas[task['type']][task['taskID']] == '' || mainBot.taskCaptchas[task['type']][task['taskID']] == undefined) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Needs captcha'
		});
		mainBot.taskCaptchas[task['type']][task['taskID']] = '';
		return exports.captchaWorker(request, task, profile);
	}

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}
	console.log('Submitting data: ' + JSON.stringify({
		'ajax': 'true',
		'token': token,
		'action': 'submitRaffleRegistration',
		'raffleRegistration': '{"lastname":"' + profile['lastName'] + '","firstname":"' + profile['firstName'] + '","email":"' + task['taskEmail'] + '","company":"","address1":"' + profile['address'] + '","address2":"' + profile['aptSuite'] + '","postcode":"' + profile['zipCode'] + '","city":"' + profile['city'] + '","id_country":"' + countryFormatter(profile['country']) + '","id_state":"' + stateFormatter(profile) + '","phone":"' + profile['phoneNumber'] + '","id_attribute_choice":"' + task['taskSizeVariant'] + '","newsletter":"1","age":"1","id_raffle":"1","token":"' + token + '"}',
		'g-recaptcha-response': mainBot.taskCaptchas[task['type']][task['taskID']]
	}))
	request({
		url: 'https://www.basket4ballers.com/modules/b4b_raffle/ajax/?rand=' + new Date().getTime(),
		method: 'POST',
		headers: {
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'same-origin',
			'Origin': 'https://www.basket4ballers.com',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'cache-control': 'no-cache',
			'X-Requested-With': 'XMLHttpRequest',
			'Connection': 'keep-alive',
			'Referer': task['variant']
		},
		formData: {
			'ajax': 'true',
			'token': token,
			'action': 'submitRaffleRegistration',
			'raffleRegistration': '{"lastname":"' + profile['lastName'] + '","firstname":"' + profile['firstName'] + '","email":"' + task['taskEmail'] + '","company":"","address1":"' + profile['address'] + '","address2":"' + profile['aptSuite'] + '","postcode":"' + profile['zipCode'] + '","city":"' + profile['city'] + '","id_country":"' + countryFormatter(profile['country']) + '","id_state":"' + stateFormatter(profile) + '","phone":"' + profile['phoneNumber'] + '","id_attribute_choice":"' + task['taskSizeVariant'] + '","newsletter":"1","age":"1","id_raffle":"1","token":"' + token + '"}',
			'g-recaptcha-response': mainBot.taskCaptchas[task['type']][task['taskID']]
		},
		agent: agent
	}, function callback(error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, token), global.settings.retryDelay);
		}
		if (response.statusCode != 200) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, token), global.settings.retryDelay);
		}
		try {
			var parsed = JSON.parse(body)
		} catch (e) {
			console.log(body);
			console.log(JSON.stringify(profile));
			console.log(JSON.stringify(task));
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, token), global.settings.retryDelay);
		}
		if (parsed.errors && parsed.errors.length) {
			var errors = parsed.errors.join(' ');
			if (body.toLowerCase().indexOf('captcha validation error') > -1) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Cap error. Retrying'
				});
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return exports.captchaWorker(request, task, profile, token);
			} else if (body.toLowerCase().indexOf('registration is already registered with this email') > -1) {
				console.log(body);
				console.log(JSON.stringify(profile));
				console.log(JSON.stringify(task));
				console.log('Email registered');
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Email previously entered'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			} else {
				console.log(body);
				console.log(JSON.stringify(profile));
				console.log(JSON.stringify(task));
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: errors
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			}
		} else {
			console.log(body);
			console.log('Entered');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Entry submitted!'
			});
			console.log(`[${task.taskID}] ` + ' Entry submitted!');
			registerEmail(task);
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			mainBot.taskCaptchas[task['type']][task['taskID']] = '';
			return;
		}
	});
}




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
			return '17';
			break;
		case 'Ireland':
			return '26';
			break;
		case 'Germany':
			return '1';
			break;
		case 'Portugal':
			return '15';
			break;
		case 'Switzerland':
			return '19';
			break;
		case 'France':
			return '8';
			break;
		case 'Spain':
			return '6';
			break;
		case 'Italy':
			return '10';
			break;
		case 'Netherlands':
			return '13';
			break;
		case 'Czech Republic':
			return '16';
			break;
		case 'Australia':
			return '24';
			break;
		case 'Austria':
			return '2';
			break;
		case 'Slovakia':
			return '37';
			break;
		case 'Belgium':
			return '3';
			break;
		case 'Slovenia':
			return '193';
			break;
		case 'Singapore':
			return '25';
			break;
		case 'Malaysia':
			return '136';
			break;
		case 'Hong Kong':
			return '22';
			break;
		case 'China':
			return '5';
			break;
		case 'Japan': 
			return '11';
			break;
		case 'Sweden':
			return '18';
			break;
		case 'Denmark':
			return '20';
			break;
		case 'Finland':
			return '7';
			break;
		case 'Romania':
			return '36';
			break;
		case 'Poland':
			return '14';
			break;
		case 'Hungary':
			return '143';
			break;
		case 'Russia':
			return '177';
			break;
		case 'Luxembourg':
			return '12';
			break;
		default:
			return 'noexist';
			break;
	}
}

// Needed for State localizations being different per site
function stateFormatter(profile) {
	if (profile['country'] == 'France') {
		if (profile['stateProvince'] == 'Corsica') {
			return '314';
		} else {
			return '313';
		}
	} else if (profile['country'] == 'Italy') {
		switch (profile['stateProvince']) {
			case "AG":
				return "123";
				break;
			case "AL":
				return "124";
				break;
			case "AN":
				return "125";
				break;
			case "AO":
				return "126";
				break;
			case "AR":
				return "127";
				break;
			case "AP":
				return "128";
				break;
			case "AT":
				return "129";
				break;
			case "AV":
				return "130";
				break;
			case "Bari":
				return "131";
				break;
			case "BT":
				return "132";
				break;
			case "BL":
				return "133";
				break;
			case "BN":
				return "134";
				break;
			case "BG":
				return "135";
				break;
			case "BI":
				return "136";
				break;
			case "Bologna":
				return "137";
				break;
			case "BZ":
				return "138";
				break;
			case "BS":
				return "139";
				break;
			case "BR":
				return "140";
				break;
			case "Cagliari":
				return "141";
				break;
			case "CL":
				return "142";
				break;
			case "CB":
				return "143";
				break;
			case "CE":
				return "145";
				break;
			case "Catania":
				return "146";
				break;
			case "CZ":
				return "147";
				break;
			case "CH":
				return "148";
				break;
			case "CO":
				return "149";
				break;
			case "CS":
				return "150";
				break;
			case "CR":
				return "151";
				break;
			case "KR":
				return "152";
				break;
			case "CN":
				return "153";
				break;
			case "EN":
				return "154";
				break;
			case "FM":
				return "155";
				break;
			case "FE":
				return "156";
				break;
			case "Firenze":
				return "157";
				break;
			case "FG":
				return "158";
				break;
			case "FC":
				return "159";
				break;
			case "FR":
				return "160";
				break;
			case "Genova":
				return "161";
				break;
			case "GO":
				return "162";
				break;
			case "GR":
				return "163";
				break;
			case "IM":
				return "164";
				break;
			case "IS":
				return "165";
				break;
			case "AQ":
				return "166";
				break;
			case "SP":
				return "167";
				break;
			case "LT":
				return "168";
				break;
			case "LE":
				return "169";
				break;
			case "LC":
				return "170";
				break;
			case "LI":
				return "171";
				break;
			case "LO":
				return "172";
				break;
			case "LU":
				return "173";
				break;
			case "MC":
				return "174";
				break;
			case "MN":
				return "175";
				break;
			case "MS":
				return "176";
				break;
			case "MT":
				return "177";
				break;
			case "ME":
				return "179";
				break;
			case "MIL":
				return "180";
				break;
			case "MOD":
				return "181";
				break;
			case "MEB":
				return "182";
				break;
			case "Napoli":
				return "183";
				break;
			case "NO":
				return "184";
				break;
			case "NU":
				return "185";
				break;
			case "Olbia":
				return "187";
				break;
			case "OR":
				return "188";
				break;
			case "PD":
				return "189";
				break;
			case "Palermo":
				return "190";
				break;
			case "PR":
				return "191";
				break;
			case "PV":
				return "192";
				break;
			case "PG":
				return "193";
				break;
			case "PU":
				return "194";
				break;
			case "PE":
				return "195";
				break;
			case "PC":
				return "196";
				break;
			case "PI":
				return "197";
				break;
			case "PT":
				return "198";
				break;
			case "PN":
				return "199";
				break;
			case "PZ":
				return "200";
				break;
			case "PO":
				return "201";
				break;
			case "RG":
				return "202";
				break;
			case "RA":
				return "203";
				break;
			case "REC":
				return "204";
				break;
			case "RE":
				return "205";
				break;
			case "Rieti":
				return "206";
				break;
			case "RN":
				return "207";
				break;
			case "Roma":
				return "208";
				break;
			case "RO":
				return "209";
				break;
			case "SA":
				return "210";
				break;
			case "SS":
				return "211";
				break;
			case "SV":
				return "212";
				break;
			case "SI":
				return "213";
				break;
			case "SR":
				return "214";
				break;
			case "SO":
				return "215";
				break;
			case "TA":
				return "216";
				break;
			case "TE":
				return "217";
				break;
			case "TR":
				return "218";
				break;
			case "TOR":
				return "219";
				break;
			case "TP":
				return "220";
				break;
			case "TN":
				return "221";
				break;
			case "TV":
				return "222";
				break;
			case "TS":
				return "223";
				break;
			case "UD":
				return "224";
				break;
			case "VA":
				return "225";
				break;
			case "Venezia":
				return "226";
				break;
			case "VB":
				return "227";
				break;
			case "VC":
				return "228";
				break;
			case "VR":
				return "229";
				break;
			case "VV":
				return "230";
				break;
			case "VI":
				return "231";
				break;
			case "VT":
				return "232";
				break;
			default:
				return "208";
				break;
		}
	} else if (profile['country'] == 'Japan') {
		switch (profile['stateProvince']) {
			case "Aichi":
				return "266";
				break;
			case "Akita":
				return "267";
				break;
			case "Aomori":
				return "268";
				break;
			case "Chiba":
				return "269";
				break;
			case "Ehime":
				return "270";
				break;
			case "Fukui":
				return "271";
				break;
			case "Fukuoka":
				return "272";
				break;
			case "Fukushima":
				return "273";
				break;
			case "Gifu":
				return "274";
				break;
			case "Gunma":
				return "275";
				break;
			case "Hiroshima":
				return "276";
				break;
			case "Hokkaido":
				return "277";
				break;
			case "Hyogo":
				return "278";
				break;
			case "Ibaraki":
				return "279";
				break;
			case "Ishikawa":
				return "280";
				break;
			case "Iwate":
				return "281";
				break;
			case "Kagawa":
				return "282";
				break;
			case "Kagoshima":
				return "283";
				break;
			case "Kanagawa":
				return "284";
				break;
			case "Kochi":
				return "285";
				break;
			case "Kumamoto":
				return "286";
				break;
			case "Kyoto":
				return "287";
				break;
			case "Mie":
				return "288";
				break;
			case "Miyagi":
				return "289";
				break;
			case "Miyazaki":
				return "290";
				break;
			case "Nagano":
				return "291";
				break;
			case "Nagasaki":
				return "292";
				break;
			case "Nara":
				return "293";
				break;
			case "Niigata":
				return "294";
				break;
			case "Oita":
				return "295";
				break;
			case "Okayama":
				return "296";
				break;
			case "Okinawa":
				return "297";
				break;
			case "Osaka":
				return "298";
				break;
			case "Saga":
				return "299";
				break;
			case "Saitama":
				return "300";
				break;
			case "Shiga":
				return "301";
				break;
			case "Shimane":
				return "302";
				break;
			case "Shizuoka":
				return "303";
				break;
			case "Tochigi":
				return "304";
				break;
			case "Tokushima":
				return "305";
				break;
			case "Tokyo":
				return "306";
				break;
			case "Tottori":
				return "307";
				break;
			case "Toyama":
				return "308";
				break;
			case "Wakayama":
				return "309";
				break;
			case "Yamagata":
				return "310";
				break;
			case "Yamaguchi":
				return "311";
				break;
			case "Yamanashi":
				return "312";
				break;
			default:
				return "306";
				break;
		}
	} else {
		return '';
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