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
		// ********************************************* Add this only to sites with no address line 2 *********************************************
		profile['address'] = profile['address'] + ' ' + faker.fake("{{address.secondaryAddress}}");
		// ********************************************* Add this only to sites with no address line 2 *********************************************
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining registration Page'
	});
	console.log(`[${task.taskID}] ` + ' Obtaining registration page');
	task['taskPassword'] = makePassword(15);
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}
	request({
		url: 'https://www.vitkac.com/gb/user/register',
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
			'Sec-Fetch-User': '?1',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'Sec-Fetch-Site': 'none',
			'Sec-Fetch-Mode': 'navigate',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
		}
	}, function callback(error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
		}
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

		$ = cheerio.load(body);
		var csrf_token = $('input[name="sf_guard_user[_csrf_token]"]').attr('value');
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Got raffle token'
		});
		console.log('Got token: ' + csrf_token);
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Awaiting captcha'
		});
		console.log('Now needs captcha');
		return exports.captchaWorker(request, task, profile, csrf_token, true);

		/*request({
			url: 'https://www.oneblockdown.it/index.php',
			method: 'POST',
			headers: {
				'origin': 'https://www.oneblockdown.it',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.112 Safari/537.36',
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'referer': 'https://www.oneblockdown.it/en/login',
				'authority': 'www.oneblockdown.it',
				'x-requested-with': 'XMLHttpRequest'
			},
			formData: {
				'controller': 'auth',
				'action': 'register',
				'extension': 'obd',
				'email': task['taskEmail'],
				'password': task['taskPassword'],
				'firstName': profile['firstName'],
				'lastName': profile['lastName'],
				'birthDate': `${getRandomInt(1982, 2000)}-${getRandomInt(1, 9)}-${getRandomInt(1, 9)}`,
				'sex': 'MALE',
				'privacy[1]': '1',
				'privacy[2]': '1',
				'redirectTo': 'https://www.oneblockdown.it/en/account',
				'version': '112'
			},
			agent: agent
		}, function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				try {
					parsed = JSON.parse(body)
				} catch (e) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Parsing error.'
					});
					console.log(`[${task.taskID}] ` + ' Parsing error');
					console.log(body);
					return;
				}
				if (parsed.success) {
					console.log(parsed);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Account created. Press start again when email confirmed'
					});
					console.log(`[${task.taskID}] ` + ' Account created. Press start when confirmed');
					mainBot.tasksAwaitingConfirm[task['type']][task.taskID] = 'awaiting';
					const confirmedEmailHandler = () => {
						if (mainBot.tasksAwaitingConfirm[task['type']][task['taskID']] != 'confirmed') {
							setTimeout(() => confirmedEmailHandler(), 200);
						} else {
							exports.login(request, task, profile);
							return;
						}
					}
					confirmedEmailHandler();
				} else {
					//parsed.error.reference
					// EMAIL_EXISTS
					if (parsed.error.reference == 'EMAIL_EXISTS') {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Account already exists. Checking DB'
						});
						request({
							url: 'https://codeyellow.io/api/getAccount.php',
							method: 'post',
							formData: {
								'email': task['taskEmail'],
								'token': global.settings.token
							},
						}, function (err, response, body) {
							console.log(body)
							try {
								var parsedAPI = JSON.parse(body);
								// IF CREDENTIALS ARE VALID
								if (parsedAPI.valid == true) {
									console.log("Saved credentials exist.")
									task['taskPassword'] = parsedAPI.password;
									exports.login(request, task, profile);
									return;
								}
								// IF CREDENTIALS ARE NOT VALID
								else {
									console.log("Account already exists.")
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'Account already exists.'
									});
									return;
								}
							} catch (error) {
								console.log('Account already exists.');
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'Account already exists.'
								});
								return;
							}
						});
					} else {
						console.log(`[${task.taskID}] ` + ' Unknown error');
						console.log(body)
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error'
						});
						return;
					}

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
		});*/
	});
}

exports.captchaWorker = function (request, task, profile, csrf_token, register) {
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
		mainBot.requestCaptcha('vitkac', task, false);
		const capHandler = () => {
			if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
				setTimeout(() => capHandler(), 100);
			} else {
				if (register) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'registering account'
					});
					return exports.register(request, task, profile, csrf_token);
				} else {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Submitting entry'
					});
					return exports.submitRaffle(request, task, profile, csrf_token);
				}
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
						"websiteURL": "https://www.vitkac.com/gb/user/register",
						"websiteKey": "6LfBVakUAAAAAArEAiLiOFpR0iUMo0kvIUvFy7i4"
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
					return setTimeout(() => exports.captchaWorker(request, task, profile, csrf_token, register), 15000);
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
									if (register) {
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'registering account'
										});
										return exports.register(request, task, profile, csrf_token);
									} else {
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Submitting entry'
										});
										return exports.submitRaffle(request, task, profile, csrf_token);
									}
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
					return setTimeout(() => exports.captchaWorker(request, task, profile, csrf_token, register), 15000);
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
				url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=6LfBVakUAAAAAArEAiLiOFpR0iUMo0kvIUvFy7i4&pageurl=https://www.vitkac.com/gb/user/register&invisible=1&json=1&soft_id=2553',
				method: 'GET',
				json: true
			}, function (error, response, body) {
				if (error) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, csrf_token, register), 15000);
				}
				if (body == undefined) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: '2Captcha error. Retrying in 15s'
					});
					return setTimeout(() => exports.captchaWorker(request, task, profile, csrf_token, register), 15000);
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
										if (twoCaptchaResponseErrorFormatter(body.request) == "Captcha was unsolvable") {
											mainBot.mainBotWin.send('taskUpdate', {
												id: task.taskID,
												type: task.type,
												message: 'Unsolvable. Retrying'
											});
											var proxy2 = getRandomProxy();
											task['proxy'] = proxy2;
											return setTimeout(() => exports.captchaWorker(request, task, profile, csrf_token, register), 1500);
										} else {
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
								} else {
									if (body.status == 1) {
										console.log(JSON.stringify(body));
										mainBot.taskCaptchas[task['type']][task['taskID']] = body.request;
										if (register) {
											mainBot.mainBotWin.send('taskUpdate', {
												id: task.taskID,
												type: task.type,
												message: 'registering account'
											});
											return exports.register(request, task, profile, csrf_token);
										} else {
											mainBot.mainBotWin.send('taskUpdate', {
												id: task.taskID,
												type: task.type,
												message: 'Submitting entry'
											});
											return exports.submitRaffle(request, task, profile, csrf_token);
										}
									} else {
										if (body.request == 'CAPCHA_NOT_READY') {
											return setTimeout(() => capHandler(), 5000);
										} else {
											console.log(JSON.stringify(body));
											if (twoCaptchaResponseErrorFormatter(body.request) == "Captcha was unsolvable") {
												mainBot.mainBotWin.send('taskUpdate', {
													id: task.taskID,
													type: task.type,
													message: 'Unsolvable. Retrying'
												});
												var proxy2 = getRandomProxy();
												task['proxy'] = proxy2;
												return setTimeout(() => exports.captchaWorker(request, task, profile, csrf_token, register), 1500);
											} else {
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


exports.register = function (request, task, profile, csrf_token) {
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
		url: 'https://www.vitkac.com/gb/user/register',
		method: 'POST',
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Origin': 'https://www.vitkac.com',
			'Upgrade-Insecure-Requests': '1',
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
			'Sec-Fetch-User': '?1',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-Fetch-Mode': 'navigate',
			'Referer': 'https://www.vitkac.com/guard/register',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		body: 'sf_guard_user%5Bid%5D=&sf_guard_user%5B_csrf_token%5D=' + csrf_token + '&sf_guard_user%5Bfirst_name%5D=' + profile['firstName'] + '&sf_guard_user%5Blast_name%5D=' + profile['lastName'] + '&sf_guard_user%5Bemail_address%5D=' + task['taskEmail'] + '&sf_guard_user%5Bsex_id%5D=1&sf_guard_user%5Bpassword%5D=' + task['taskPassword'] + '&sf_guard_user%5Bpassword_again%5D=' + task['taskPassword'] + '&sf_guard_user%5Bnewsletter_confirm%5D=on&sf_guard_user%5Brules_confirm%5D=on&sf_guard_user%5Bdiscount_rules%5D=on&sf_guard_user%5Bre%5D=' + mainBot.taskCaptchas[task['type']][task['taskID']]
	}, function callback(error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
		}
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
		if (body.toLowerCase().indexOf('you have been successfully registered') > -1) {
			mainBot.taskCaptchas[task['type']][task['taskID']] = '';
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Account created. Press start again when email confirmed'
			});
			console.log(`[${task.taskID}] ` + ' Account created. Press start when confirmed');
			mainBot.tasksAwaitingConfirm[task['type']][task.taskID] = 'awaiting';
			const confirmedEmailHandler = () => {
				if (mainBot.tasksAwaitingConfirm[task['type']][task['taskID']] != 'confirmed') {
					setTimeout(() => confirmedEmailHandler(), 200);
				} else {
					exports.login(request, task, profile, csrf_token);
					return;
				}
			}
			confirmedEmailHandler();
		}
		else
		{
			console.log(body);
		}
	});
	/*
		request({
			url: 'https://www.oneblockdown.it/index.php',
			method: 'POST',
			headers: {
				'origin': 'https://www.oneblockdown.it',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.112 Safari/537.36',
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'referer': 'https://www.oneblockdown.it/en/login',
				'authority': 'www.oneblockdown.it',
				'x-requested-with': 'XMLHttpRequest'
			},
			formData: {
				'controller': 'auth',
				'action': 'register',
				'extension': 'obd',
				'email': task['taskEmail'],
				'password': task['taskPassword'],
				'firstName': profile['firstName'],
				'lastName': profile['lastName'],
				'birthDate': `${getRandomInt(1982, 2000)}-${getRandomInt(1, 9)}-${getRandomInt(1, 9)}`,
				'sex': 'MALE',
				'privacy[1]': '1',
				'privacy[2]': '1',
				'redirectTo': 'https://www.oneblockdown.it/en/account',
				'version': '112'
			},
			agent: agent
		}, function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				try {
					parsed = JSON.parse(body)
				} catch (e) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Parsing error.'
					});
					console.log(`[${task.taskID}] ` + ' Parsing error');
					console.log(body);
					return;
				}
				if (parsed.success) {
					console.log(parsed);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Account created. Press start again when email confirmed'
					});
					console.log(`[${task.taskID}] ` + ' Account created. Press start when confirmed');
					mainBot.tasksAwaitingConfirm[task['type']][task.taskID] = 'awaiting';
					const confirmedEmailHandler = () => {
						if (mainBot.tasksAwaitingConfirm[task['type']][task['taskID']] != 'confirmed') {
							setTimeout(() => confirmedEmailHandler(), 200);
						} else {
							exports.login(request, task, profile);
							return;
						}
					}
					confirmedEmailHandler();
				} else {
					//parsed.error.reference
					// EMAIL_EXISTS
					if (parsed.error.reference == 'EMAIL_EXISTS') {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Account already exists. Checking DB'
						});
						request({
							url: 'https://codeyellow.io/api/getAccount.php',
							method: 'post',
							formData: {
								'email': task['taskEmail'],
								'token': global.settings.token
							},
						}, function (err, response, body) {
							console.log(body)
							try {
								var parsedAPI = JSON.parse(body);
								// IF CREDENTIALS ARE VALID
								if (parsedAPI.valid == true) {
									console.log("Saved credentials exist.")
									task['taskPassword'] = parsedAPI.password;
									exports.login(request, task, profile);
									return;
								}
								// IF CREDENTIALS ARE NOT VALID
								else {
									console.log("Account already exists.")
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'Account already exists.'
									});
									return;
								}
							} catch (error) {
								console.log('Account already exists.');
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'Account already exists.'
								});
								return;
							}
						});
					} else {
						console.log(`[${task.taskID}] ` + ' Unknown error');
						console.log(body)
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error'
						});
						return;
					}

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
		});*/
}

exports.login = function (request, task, profile, csrf_token) {
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
		url: 'https://www.vitkac.com/guard/register',
		method: 'POST',
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Origin': 'https://www.vitkac.com',
			'Upgrade-Insecure-Requests': '1',
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
			'Sec-Fetch-User': '?1',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-Fetch-Mode': 'navigate',
			'Referer': 'https://www.vitkac.com/guard/register',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		body: 'signin%5Busername%5D=' + task['taskEmail'] + '&signin%5Bpassword%5D=' + task['taskPassword'] + '&signin%5Bremember%5D=on',
		followAllRedirects: true
	}, function callback(error, response, body) {
		if (error) {
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
			message: 'logging in'
		});
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
		if (body.toLowerCase().indexOf('sorry, your login and password do not match. please try again.') > -1) {
			mainBot.tasksAwaitingConfirm[task['type']][task['taskID']] = 'awaiting';
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Please confirm your email and press start again'
			});
			console.log(`[${task.taskID}] ` + ' Confirm and start again');
			const confirmedEmailHandler = () => {
				if (mainBot.tasksAwaitingConfirm[task['type']][task['taskID']] != 'confirmed') {
					setTimeout(() => confirmedEmailHandler(), 200);
				} else {
					exports.login(request, task, profile);
					return;
				}
			}
			confirmedEmailHandler();
		} else {
			if (response.request.href == 'https://www.vitkac.com/gb') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Logged in'
				});
				console.log(`[${task.taskID}] ` + ' Logged in');
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Awaiting captcha'
				});
				console.log('Now needs captcha');
				return exports.captchaWorker(request, task, profile, csrf_token, false);
			}
		}
	});
}

exports.submitRaffle = function (request, task, profile, csrf_token) {
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
	console.log(`[${task.taskID}] ` + 'Submitting entry');
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Submitting entry'
	});
	console.log(`[${task.taskID}] ` + JSON.stringify(task));
	console.log(`[${task.taskID}] ` + JSON.stringify(profile));
	// Captcha bypass = fake value in response
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	request({
		url: 'https://www.vitkac.com/yeezy/subscribe',
		method: 'POST',
		headers: {
			'Connection': 'keep-alive',
			'Accept': '*/*',
			'Origin': 'https://www.vitkac.com',
			'X-Requested-With': 'XMLHttpRequest',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-Fetch-Mode': 'cors',
			'Referer': 'https://www.vitkac.com/gb/multi/off-white-x-nike-dunk-low',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		body: 'is_online=1&is_offline=0&shoe_size=9&questionaire_id=237&re=' + mainBot.taskCaptchas[task['type']][task['taskID']]
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
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
				return setTimeout(() => exports.submitRaffle(request, task, profile, csrf_token), global.settings.retryDelay);
			}
			if (parsed.result == 'ok' && parsed.msg == 'We have been subscribed successfuly') {
				console.log('Entered');
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Entry submitted!'
				});
				console.log(`[${task.taskID}] ` + ' Entry submitted!');
				registerEmail(task);
				mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '');
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			} else if (parsed.result == 'error' && body.toLowerCase().indexOf('zapisany w losowaniu') > -1) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Email previously entered'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return;
			} else if (body.toLowerCase().indexOf('must prove you are human') > -1 || body.toLowerCase().indexOf('invalid captcha') > -1) {
				if (task['captchaHandler'] != 'manual') {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Captcha API error. Retrying'
					});
				}
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				return exports.captchaWorker(request, task, profile, false);
			} else {
				try
				{
					console.log(body)
				}
				catch (e)
				{

				}
				console.log(`[${task.taskID}] ` + JSON.stringify(task));
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. DM Log'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
			}
		}
	});
	/*	request({
			url: 'https://www.oneblockdown.it/index.php',
			method: 'POST',
			headers: {
				'origin': 'https://www.oneblockdown.it',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'referer': task['variant'],
				'authority': 'www.oneblockdown.it',
				'x-requested-with': 'XMLHttpRequest'
			},
			formData: {
				'extension': 'raffle',
				'controller': 'raffles',
				'action': 'subscribe',
				'response': '03AOLTBLTA6oaXtl3pUpnzYqYDPv8yguApR3yjXbjepgtQGvQPEoU3X_7y-_UY4hzrALZZGVD7zAXHLDmH3eQtyI-_B1wpk3OXTmA8QejJ5QpeUsiodh0XkSh2XZ6jErkSOfZIOrF2oykLmGMCRUQZPoeiBQV0Isv6Xp_yVeTqJDu6dSF0YZtf3VmKmT_uHF-PzGwOT4Sqwo44dsWcnHQ-SQdl6vrC3Wk2CiZelQCnuRg-xnHAKt3Zn9Vvq9IRyqlSgmjD-hL08eV3VCRC8rr-w28BjINB3u5oKWCXa6YOk-ki2o8uuNEuJxWFKDKbWQH-xBDgpQKTt89w',
				'userId': userId,
				'stockItemId': task['taskSizeVariant'],
				'itemId': task['oneblockdown']['itemId'],
				'raffleId': task['oneblockdown']['raffleId'],
				'inStore': '',
				'addressId': 'n',
				'address[countryId]': countryFormatter(profile['country']),
				'address[first_name]': profile['firstName'],
				'address[last_name]': profile['lastName'],
				'address[street_address]': profile['address'],
				'address[zipcode]': profile['zipCode'],
				'address[cityName]': profile['city'],
				'address[phone_number]': profile['phoneNumber'],
				'address[statecode]': profile['stateProvince'],
				'version': '112'
			},
			agent: agent
		}, function callback(error, response, body) {
			console.log(JSON.stringify({
				'extension': 'raffle',
				'controller': 'raffles',
				'action': 'subscribe',
				'response': '03AOLTBLTA6oaXtl3pUpnzYqYDPv8yguApR3yjXbjepgtQGvQPEoU3X_7y-_UY4hzrALZZGVD7zAXHLDmH3eQtyI-_B1wpk3OXTmA8QejJ5QpeUsiodh0XkSh2XZ6jErkSOfZIOrF2oykLmGMCRUQZPoeiBQV0Isv6Xp_yVeTqJDu6dSF0YZtf3VmKmT_uHF-PzGwOT4Sqwo44dsWcnHQ-SQdl6vrC3Wk2CiZelQCnuRg-xnHAKt3Zn9Vvq9IRyqlSgmjD-hL08eV3VCRC8rr-w28BjINB3u5oKWCXa6YOk-ki2o8uuNEuJxWFKDKbWQH-xBDgpQKTt89w',
				'userId': userId,
				'stockItemId': task['taskSizeVariant'],
				'itemId': task['oneblockdown']['itemId'],
				'raffleId': task['oneblockdown']['raffleId'],
				'inStore': '',
				'addressId': 'n',
				'address[countryId]': countryFormatter(profile['country']),
				'address[first_name]': profile['firstName'],
				'address[last_name]': profile['lastName'],
				'address[street_address]': profile['address'],
				'address[zipcode]': profile['zipCode'],
				'address[cityName]': profile['city'],
				'address[phone_number]': profile['phoneNumber'],
				'address[statecode]': profile['stateProvince'],
				'version': '112'
			}));
			console.log(body)
			console.log(`[${task.taskID}]` + response.statusCode);
			if (error) {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.submitRaffle(request, task, profile, csrf_token), global.settings.retryDelay);
			}
			try {
				parsed = JSON.parse(body)
			} catch (e) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Parsing error.'
				});
				return;
			}
			if (parsed.success) {
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
				if (parsed['error']['message'] == 'INVALID_ADDRESS') {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Invalid address.'
					});
					return;
				} else if (parsed.error.message == "You are already subscribed to this raffle") {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Already entered!'
					});
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				} else {
					console.log(body);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Unknown error.'
					});
					return;
				}
			}
		});*/
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