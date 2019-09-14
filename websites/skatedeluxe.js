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
		if (Math.random() >= 0.5)
		{
			profile['firstName'] = profile['firstName'] + String.fromCharCode(97+Math.floor(Math.random() * 26));
		}
		else
		{
			profile['firstName'] = String.fromCharCode(97+Math.floor(Math.random() * 26)) + profile['firstName'];
		}
	}
	if (profile['jigProfileLastNameLetter'] == true) {
		if (Math.random() >= 0.5)
		{
			profile['lastName'] = profile['lastName'] + String.fromCharCode(97+Math.floor(Math.random() * 26));
		}
		else
		{
			profile['lastName'] = String.fromCharCode(97+Math.floor(Math.random() * 26)) + profile['lastName'];
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
		mainBot.requestCaptcha('skatedeluxe', task, false);
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
					"task": {
						"type": "NoCaptchaTaskProxyless",
						"websiteURL": task["variant"],
						"websiteKey": "6LfKcSUUAAAAAKPsnPBeTOSxPfNB_8gXgf7mxeJS"
					}
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
					return;
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
				url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=6LfKcSUUAAAAAKPsnPBeTOSxPfNB_8gXgf7mxeJS&pageurl=' + task["variant"] + '&json=1',
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
					return;
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
								if (body.status == 0) {
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
	if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
		// NEEDS CAPTCHA AGAIN
		return setTimeout(() => exports.captchaWorker(request, task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
	}


	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Submitting raffle'
	});

	request({
		url: task['variant'] + '?',
		method: 'POST',
		headers: {
			'Origin': 'https://www.skatedeluxe.com',
			'Upgrade-Insecure-Requests': '1',
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Referer': task['variant'],
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		formData: {
			'action': 'process',
			'firstname': profile['firstName'],
			'lastname': profile['lastName'],
			'dob': `${getRandomInt(1982, 2000)}-0${getRandomInt(1, 9)}-0${getRandomInt(1, 9)}`,
			'email': task['taskEmail'],
			'shoe_size_select': task['taskSizeSelect'],
			'g-recaptcha-response': mainBot.taskCaptchas[task['type']][task['taskID']]
		}
	}, function callback(error, response, body) {
		if (!error) {
			if (response.statusCode == 200) {
				if (body.toLowerCase().indexOf('thank you for your participation') > -1) {
					mainBot.taskCaptchas[task['type']][task['taskID']] = '';
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Entry submitted!'
					});
					console.log(`[${task.taskID}] ` + ' Entry submitted!');
					registerEmail(task);
					mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '');
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
				else if (body.toLowerCase().indexOf('please enter your first name') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Missing first name'
					});
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
				else if (body.toLowerCase().indexOf('please enter your last name') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Missing last name'
					});
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
				else if (body.toLowerCase().indexOf('the given e-mail address is not correct') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Invalid email'
					});
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					console.log(task);
					return;
				}
				else if (body.toLowerCase().indexOf('please choose a shoe size') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Invalid shoe size'
					});
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
				else if (body.toLowerCase().indexOf('you did not enter an e-mail address') > -1) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'please enter an email'
					});
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
				else
				{
					console.log(body);
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
				
			}
			 else {
				var proxy2 = getRandomProxy();
				task['proxy'] = proxy2;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.submitRaffle(request, task, profile), global.settings.retryDelay);
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
	/*

		request({
			url: task['backdoor']['submitURL'],
			method: 'POST',
			formData: postInputs,
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
			console.log(`[${task.taskID}]  ` + body)
			try {
				body = JSON.parse(body);
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
			console.log(body);
			if (body['status'] == 'mail_sent') {
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Entry submitted!'
				});
				console.log(`[${task.taskID}] ` + ' Entry submitted!');
				registerEmail(task);
				mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '');
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			} else if (body['status'] == 'validation_failed') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'One or more fields are not filled'
				});
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			} else if (body['status'] == 'spam') {
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Captcha error! Retrying'
				});
				console.log(`[${task.taskID}] ` + ' Captcha error! Retrying');
				return setTimeout(() => exports.captchaWorker(request, task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			} else {
				console.log(`[${task.taskID}] ` + JSON.stringify(task));
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				console.log(body);
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. DM Log'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
			}*/
	/*if (body.error == true) {
			console.log(`[${task.taskID}] ` + ' ERROR: ' + body.msg);
			if (body.msg == 'Error Captcha!') {
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Captcha error! Retrying'
				});
				console.log(`[${task.taskID}] ` + ' Captcha error! Retrying');
				return setTimeout(() => exports.captchaWorker(request, task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			} else if (body.msg == 'You can register only once per raffle!') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Already entered!'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			} else if (body.msg == 'Invalid shoes size!') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Size error. Contact the devs'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			} else if (body.msg == 'Required fields are empty!') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Please enter every address detail'
				});
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
		} else {
			mainBot.taskCaptchas[task['type']][task['taskID']]
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Entry submitted!'
			});
			console.log(`[${task.taskID}] ` + ' Entry submitted!');
			registerEmail(task);
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '');
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		}
	});
		*/
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
			return 'United Kingdom';
			break;
		case 'United States':
			return 'United States of America';
			break;
		case 'Canada':
			return 'Canada';
			break;
		case 'North Ireland':
			return 'North Ireland';
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
		case 'Poland':
			return 'Poland';
			break;
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





// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}