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
	var jar = require('cloudscraper').jar()
	var request = require('cloudscraper').defaults({
		jar: jar,
		onCaptcha
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
		message: 'Getting registration page (5S)'
	});
	request({
		url: 'https://www.nakedcph.com/auth/view?op=register',
		headers: {
			'authority': 'www.nakedcph.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-user': '?1',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'sec-fetch-site': 'none',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
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
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		if (response.statusCode != 200) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		$ = cheerio.load(body);
		var csrftoken = $('input[name="_AntiCsrfToken"]').attr('value');
		if (!csrftoken) {
			console.log(body);
			console.log(JSON.stringify(task));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Unknown Error. DM Log'
			});
			return;
		}
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Checking account'
		});
		console.log('Checking account');
		request({
			url: 'https://www.nakedcph.com/auth/iscustomer',
			method: 'POST',
			headers: {
				'sec-fetch-mode': 'cors',
				'origin': 'https://www.nakedcph.com',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'x-anticsrftoken': csrftoken,
				'x-requested-with': 'XMLHttpRequest',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'accept': 'application/json, text/javascript, */*; q=0.01',
				'referer': 'https://www.nakedcph.com/auth/view?op=register',
				'authority': 'www.nakedcph.com',
				'sec-fetch-site': 'same-origin'
			},
			body: 'email=' + task['taskEmail'],
			agent: agent
		}, function callback(error, response, body) {
			console.log(body);
			if (error) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				console.log('New proxy: ' + formatProxy(task['proxy']));
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			}
			if (response.statusCode != 200) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				console.log('New proxy: ' + formatProxy(task['proxy']));
				try {
					console.log(body)
				} catch (e) {}
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			} else {
				try {
					var parsed = JSON.parse(body);
				} catch (e) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					try {
						console.log(body)
					} catch (e) {}
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
				}
				if (parsed["Response"] == true) {
					console.log("Account already exists.")
					console.log('For email: ' + task['taskEmail'])
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Account already exists.'
					});
					return;

				} else {
					console.log('Now needs captcha');
					return exports.captchaWorker(request, task, profile, csrftoken);
					///////////////////////////////////////////////////return exports.createAccount(request, task, profile, csrftoken);
				}
			}
		});
	});
}


exports.captchaWorker = function (request, task, profile, csrftoken) {
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
		mainBot.requestCaptcha('nakedcph', task, false);
		const capHandler = () => {
			if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
				setTimeout(() => capHandler(), 100);
			} else {
				return exports.createAccount(request, task, profile, csrftoken);
			}
		}
		capHandler();
	} else {
		if (global.settings.capAPIKey == '' || global.settings.capAPIKey == undefined) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Captcha API Key not set. Check settings.'
			});
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			mainBot.taskCaptchas[task['type']][task['taskID']] = '';
			return;
		}
		agent = new HttpsProxyAgent(formatProxy(task['proxy']));
		if (task['captchaHandler'] == 'anticaptcha') {
			request({
				url: 'https://api.anti-captcha.com/createTask',
				method: 'POST',
				body: {
					clientKey: global.settings.capAPIKey,
					"task": {
						"type": "NoCaptchaTaskProxyless",
						"websiteURL": 'https://www.nakedcph.com/auth/view?op=register',
						"websiteKey": "6LeNqBUUAAAAAFbhC-CS22rwzkZjr_g4vMmqD_qo"
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
					return setTimeout(() => exports.captchaWorker(request, task, profile, csrftoken), 15000);
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
								clientKey: global.settings.capAPIKey,
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
										message: 'Creating account'
									});
									return exports.createAccount(request, task, profile, csrftoken);
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
			request({
				url: 'https://2captcha.com/in.php?key=' + global.settings.capAPIKey + '&method=userrecaptcha&googlekey=6LeNqBUUAAAAAFbhC-CS22rwzkZjr_g4vMmqD_qo&pageurl=https://www.nakedcph.com/auth/view?op=register&json=1',
				method: 'GET',
				json: true
			}, function (error, response, body) {
				if (error) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, csrftoken), 15000);
				}
				if(body == undefined)
				{
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 12s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, csrftoken), 12000);
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
								url: 'https://2captcha.com/res.php?key=' + global.settings.capAPIKey + '&action=get&id=' + taskId + '&json=1',
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
											message: 'Creating account'
										});
										return exports.createAccount(request, task, profile, csrftoken);
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

exports.createAccount = function (request, task, profile, csrftoken) {
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
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Creating account'
	});

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}


	request({
		url: 'https://www.nakedcph.com/auth/submit',
		method: 'POST',
		headers: {
			'sec-fetch-mode': 'cors',
			'origin': 'https://www.nakedcph.com',
			'accept-encoding': 'gzip, deflate, br',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'x-anticsrftoken': csrftoken,
			'x-requested-with': 'XMLHttpRequest',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'accept': 'application/json, text/javascript, */*; q=0.01',
			'referer': 'https://www.nakedcph.com/auth/view?op=register',
			'authority': 'www.nakedcph.com',
			'sec-fetch-site': 'same-origin'
		},
		body: '_AntiCsrfToken=' + csrftoken + '&firstName=' + profile['firstName'] + '&email=' + task['taskEmail'] + '&password=khawaja9&g-recaptcha-response=' + mainBot.taskCaptchas[task['type']][task['taskID']] + '&action=register',
		followAllRedirects: true,
		agent: agent
	}, function callback(error, response, body) {
		//{"Response":null,"StatusCode":500,"Status":"ReCaptchaFailed"}
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Proxy error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.createAccount(request, task, profile, csrftoken), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		if (response.statusCode != 200) {
			if (response.statusCode == 500) {
				try {
					var parsed = JSON.parse(body);
				} catch (e) {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					try {
						console.log(body)
					} catch (e) {}
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.createAccount(request, task, profile, csrftoken), global.settings.retryDelay);
				}
				if (parsed["Status"] == "ReCaptchaFailed") {
					return setTimeout(() => exports.captchaWorker(request, task, profile, csrftoken), 15000);
				}
			}
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			try {
				console.log(body)
			} catch (e) {}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.createAccount(request, task, profile, csrftoken), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		try {
			var parsed = JSON.parse(body);
		} catch (e) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			try {
				console.log(body)
			} catch (e) {}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.createAccount(request, task, profile, csrftoken), global.settings.retryDelay);
		}
		if (parsed["Response"]["Success"] == true) {
			console.log('successful registration');
			return exports.getRafflePage(request, task, profile);
		} else {
			console.log(body);
			console.log(response.statusCode);
			console.log(response.request.href);
		}
	});
}

exports.getRafflePage = function (request, task, profile) {
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
			return setTimeout(() => exports.getRafflePage(request, task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		if (response.statusCode != 200) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			try {
				console.log(body)
			} catch (e) {}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.getRafflePage(request, task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Got raffle page'
		});
		console.log('Got raffle page');
		request({
			url: task['nakedcph']['raffleToken'],
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Referer': task['variant'],
				'Origin': 'https://nakedcph.typeform.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
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
				return setTimeout(() => exports.getRafflePage(request, task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			}
			if (response.statusCode != 200) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				console.log('New proxy: ' + formatProxy(task['proxy']));
				try {
					console.log(body)
				} catch (e) {}
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.getRafflePage(request, task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			}
			try {
				var parsed = JSON.parse(body);
			} catch (e) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				try {
					console.log(body)
				} catch (e) {}
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.getRafflePage(request, task, profile), global.settings.retryDelay);
			}
			var raffleToken = parsed['token'];
			var landedAt = parsed['landed_at'];
			if (!raffleToken || !landedAt) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error obtaining token. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.getRafflePage(request, task, profile), global.settings.retryDelay);
			}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle token'
			});
			console.log('Raffle Token: ' + raffleToken);
			console.log('Landed at: ' + landedAt);
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle token'
			});
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Submitting entry in ' + task['nakedcph']['submit_delay'] / 1000 + 's to decrease automation detection'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), task['nakedcph']['submit_delay']);
		});
	});

}

exports.submitRaffle = function (request, task, profile, raffleToken, landedAt) {
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
	var form = JSON.parse(`{"${task['nakedcph']['firstName']}": "${profile['firstName']}","${task['nakedcph']['lastName']}": "${profile['lastName']}","${task['nakedcph']['email']}": "${task['taskEmail']}","${task['nakedcph']['country']}": "${countryFormatter(profile['country'])}","form[token]": "${raffleToken}","form[landed_at]": "${landedAt}","form[language]": "en"}`);

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	var postData = '{"signature":"' + raffleToken + '","form_id":"' + task['nakedcph']['formID'] + '","landed_at":' + landedAt + ',"answers":[{"field":{"id":"' + task['nakedcph']['firstName'] + '","type":"short_text"},"type":"text","text":"' + profile['firstName'] + '"},{"field":{"id":"' + task['nakedcph']['lastName'] + '","type":"short_text"},"type":"text","text":"' + profile['lastName'] + '"},{"field":{"id":"' + task['nakedcph']['email'] + '","type":"email"},"type":"email","email":"' + task['taskEmail'] + '"},{"field":{"id":"' + task['nakedcph']['country'] + '","type":"dropdown"},"type":"text","text":"United Kingdom"}]}';

	console.log(postData);
	request({
		url: 'https://nakedcph.typeform.com/app/form/submit/UW3nMz',
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Referer': 'https://nakedcph.typeform.com/to/UW3nMz?typeform-embed=embed-widget&typeform-embed-id=s6ptf',
			'Origin': 'https://nakedcph.typeform.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
			'Sec-Fetch-Mode': 'cors',
			'Content-Type': 'application/json; charset=UTF-8'
		},
		body: postData,
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
			return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		if (response.statusCode != 200) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			try {
				console.log(body)
			} catch (e) {}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		try {
			parsed = JSON.parse(body);
		} catch (e) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			try {
				console.log(body)
			} catch (e) {}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		var message = parsed['message'];
		if (message == 'success') {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Entry submitted!'
			});
			registerEmail(task);
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '');
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		} else {
			console.log(body);
			console.log(JSON.stringify(profile));
			console.log(JSON.stringify(task));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Unknown error. DM Log!'
			});
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

function onCaptcha(options, response, body) {
	const captcha = response.captcha;
	console.log(captcha.siteKey);
	captcha.form['g-recaptcha-response'] = 'test';
	captcha.submit();
	// solveReCAPTCHA is a method that you should come up with and pass it href and sitekey, in return it will return you a reponse
	/* solveReCAPTCHA(response.request.uri.href, captcha.siteKey, (error, gRes) => {
	   // eslint-disable-next-line no-void
	   if (error) return void captcha.submit(error);
	   captcha.form['g-recaptcha-response'] = gRes;
	   captcha.submit();
	 });*/
}


// Needed for country localizations being different per site
function countryFormatter(profileCountry) {
	switch (profileCountry) {
		case 'United Kingdom':
			return 'United Kingdom';
			break;
		case 'United States':
			return 'United States of America';
			break;
		case 'Canada':
			return 'Canada';
			break;
		case 'North Ireland':
			return 'Ireland';
			break;
		case 'Ireland':
			return 'Ireland';
			break;
		case 'Germany':
			return 'Germany';
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
	}
}