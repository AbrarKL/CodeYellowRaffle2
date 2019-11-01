

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
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}
	var jar = require('cloudscraper').jar()
	var request = require('cloudscraper').defaults({
		jar: jar,
		onCaptcha: function (options, response, body) {
			const captcha = response.captcha;
			console.log(captcha.siteKey);
			if (task['captchaHandler'] == '2captcha') {
				request({
					url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=' + captcha.siteKey + '&pageurl=' + task["variant"] + '&json=1&soft_id=2553',
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
							"websiteURL": task["variant"],
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
		//profile['address'] = profile['address'] + ' ' + faker.fake("{{address.secondaryAddress}}");
		// ********************************************* Add this only to sites with no address line 2 *********************************************
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	if (countryFormatter(profile["country"]) == 'noexist') {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'BSTN doesn\'t ship to your country'
		});
		console.log(`[${task.taskID}] ` + JSON.stringify(profile));
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
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






	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Getting registration page'
	});
	console.log(`[${task.taskID}] ` + ' Getting registration page');
	request({
		url: task['variant'],
		method: 'POST',
		headers: {
			'authority': 'raffle.bstn.com',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		agent: agent
	}, function callback(error, response, body) {
		console.log(error);
		if (!error) {
			if (response.statusCode == 200) {
				console.log('Now needs captcha');
				return exports.captchaWorker(request, task, profile);
			} else {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Proxy banned'
				});
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				console.log(`[${task.taskID}] ` + JSON.stringify(task));
				return;
			}
		} else {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
		}
	});
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
		mainBot.requestCaptcha('bstn', task, false);
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
						"websiteURL": task["variant"],
						"websiteKey": "6LeZJZEUAAAAAPLuYfMYiMOF7X7tKMz45xfEIXaZ"
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
							message: 'Checking AntiCaptcha every 5s (Entry)'
						});
						console.log('Checking for Captcha token (Anti-Captcha Task ID: ' + taskId + ')');
						request({
							url: 'https://api.anti-captcha.com/getTaskResult',
							method: 'POST',
							body: {
								clientKey: global.settings.antiCapAPIKey,
								taskId: taskId
							},
							json: true
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
				url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=6LeZJZEUAAAAAPLuYfMYiMOF7X7tKMz45xfEIXaZ&pageurl=' + task["variant"] + '&json=1&soft_id=2553',
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
								message: 'Checking 2Captcha every 5s (Entry)'
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
										mainBot.taskCaptchas[task['type']][task['taskID']] = body.request;
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Submitting entry'
										});
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

	require('request')({
		url: 'https://api.codeyellow.io/instagram/get?type=bstn',
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
			if(task['igHandler'] == 'mylist')
			{
				var ig = getRandomIG();
				if(ig == '' || ig == undefined)
				{	
					profile['instagram'] = parsedAPI.instagram;
				}
				else
				{
					profile['instagram'] = getRandomIG();
				}
			}
			else
			{
				profile['instagram'] = parsedAPI.instagram;
			}
		}
		console.log('Instagram used: ' + profile['instagram'])
		request({
			url: 'https://raffle.bstn.com/api/register',
			method: 'POST',
			headers: {
				'origin': 'https://raffle.bstn.com',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
				'content-type': 'application/json;charset=UTF-8',
				'accept': 'application/json, text/plain, */*',
				'referer': task['variant'],
				'authority': 'raffle.bstn.com',
			},
			json: true,
			body: {
				"additional": {
					"instagram": profile['instagram']
				},
				"title": "male",
				"email": task['taskEmail'],
				"firstName": profile['firstName'],
				"lastName": profile['lastName'],
				"street": profile['address'],
				"streetno": profile['address'],
				"address2": profile['aptSuite'],
				"zip": profile['zipCode'],
				"city": profile['city'],
				"country": countryFormatter(profile["country"]),
				"acceptedPrivacy": true,
				"newsletter": true,
				"recaptchaToken": mainBot.taskCaptchas[task['type']][task['taskID']],
				"raffle": {
					"raffleId": task['bstn']['raffleId'],
					"parentIndex": 0,
					"option": task['taskSizeVariant']
				},
				"issuerId": "raffle.bstn.com"
			},
			agent: agent
		}, function callback(error, response, body) {
			if (!error) {
				if (response.statusCode == 200 || response.statusCode == 201) {
					if (body == null || body == undefined) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error. DM log'
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
					if (body['message'] == 'success') {
						console.log(JSON.stringify({
							"additional": {
								"instagram": profile['instagram']
							},
							"title": "male",
							"email": task['taskEmail'],
							"firstName": profile['firstName'],
							"lastName": profile['lastName'],
							"street": profile['address'],
							"streetno": profile['address'],
							"address2": profile['aptSuite'],
							"zip": profile['zipCode'],
							"city": profile['city'],
							"country": countryFormatter(profile["country"]),
							"acceptedPrivacy": true,
							"newsletter": true,
							"recaptchaToken": mainBot.taskCaptchas[task['type']][task['taskID']],
							"raffle": {
								"raffleId": task['bstn']['raffleId'],
								"parentIndex": 0,
								"option": task['taskSizeVariant']
							},
							"issuerId": "raffle.bstn.com"
						}));
						console.log(body);
						mainBot.taskCaptchas[task['type']][task['taskID']] = '';
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Check Email!'
						});
						console.log(`[${task.taskID}] ` + ' Entry submitted (Check Email)!');
						registerEmail(task);
						mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
						return;
					}
				} else {
					if (body['message'] == 'Forbidden: Forbidden: no Robots allowed') {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Cap error. Retrying'
						});
						mainBot.taskCaptchas[task['type']][task['taskID']] = '';
						return exports.captchaWorker(request, task, profile);
					} else if (body['message'] == 'Forbidden: Please type in every required field') {
						console.log('Not every profile field saved');
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Please save every field!'
						});
					} else {
						console.log(body);
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: body['message']
						});
						console.log(`[${task.taskID}] ` + JSON.stringify(profile));
						console.log(`[${task.taskID}] ` + JSON.stringify(task));
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
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
				return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
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


function onCaptcha2(options, response, body, task) {
	//const captcha = response.captcha;
	//console.log(captcha.siteKey);
	/*mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Awaiting captcha'
	});
	mainBot.requestCaptcha('bstn_cf', task, false);
	const capHandler = () => {
		if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
			setTimeout(() => capHandler(), 100);
		} else {
			console.log('Got captcha');
		}
	}
	capHandler();
	//captcha.form['g-recaptcha-response'] = 'test';
	//captcha.submit();
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
			return 'GB';
			break;
		case 'United States':
			return 'US';
			break;
		case 'Canada':
			return 'CA';
			break;
		case 'Ireland':
			return 'IE';
			break;
		case 'Germany':
			return 'DE';
			break;
		case 'Portugal':
			return 'PT';
			break;
		case 'Switzerland':
			return 'CH';
			break;
		case 'France':
			return 'FR';
			break;
		case 'Spain':
			return 'ES';
			break;
		case 'Italy':
			return 'IT';
			break;
		case 'Netherlands':
			return 'NL';
			break;
		case 'Czech Republic':
			return 'CZ';
			break;
		case 'Australia':
			return 'AU';
			break;
		case 'Austria':
			return 'AT';
			break;
		case 'Slovakia':
			return 'SK';
			break;
		case 'Belgium':
			return 'BE';
			break;
		case 'Slovenia':
			return 'SI';
			break;
		case 'Singapore':
			return 'SG';
			break;
		case 'Malaysia':
			return 'MY';
			break;
		case 'Hong Kong':
			return 'HK';
			break;
		case 'China':
			return 'CN';
			break;
		case 'Japan':
			return 'JP';
			break;
		case 'Sweden':
			return 'SE';
			break;
		case 'Denmark':
			return 'DK';
			break;
		case 'Finland':
			return 'FI';
			break;
		case 'Romania':
			return 'RO';
			break;
		case 'Poland':
			return 'PL';
			break;
		case 'Hungary':
			return 'HU';
			break;
		case 'Russia':
			return 'RU';
			break;
		case 'Luxembourg':
			return 'LU';
			break;
		default:
			return 'noexist';
			break;
	}
}





//stockItemId = size
/* code to extract sizes from https://www.oneblockdown.it/en/footwear-sneakers/nike/men-unisex/nike-mars-yard-overshoe/12339
var sizeList = '';
for(var i = 0; i < preloadedStock.length; i++)
{
	var size = preloadedStock[i]['variant'];
	size = parseFloat(size.match(/[\d\.]+/));
	var stockItemId = preloadedStock[i]['stockItemId'];
	sizeList = sizeList + `'${size}' => '${stockItemId}',`;
}*/


















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
String.prototype.replaceAll = function (str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}