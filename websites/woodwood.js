

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
			message: 'WoodWood doesn\'t ship to your country'
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
        message: 'Obtaining raffle page'
    });
    if (profile['firstName'] == '' || profile['firstName'] == undefined || profile['firstName'] == null) {
        mainBot.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            type: task.type,
            message: 'WoodWood requires a first name'
        });
        console.log(`[${task.taskID}] ` + JSON.stringify(profile));
        mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
        return;
    }

    if (profile['lastName'] == '' || profile['lastName'] == undefined || profile['lastName'] == null) {
        mainBot.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            type: task.type,
            message: 'WoodWood requires a last name'
        });
        console.log(`[${task.taskID}] ` + JSON.stringify(profile));
        mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
        return;
    }

    if (profile['phoneNumber'] == '' || profile['phoneNumber'] == undefined || profile['phoneNumber'] == null) {
        mainBot.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            type: task.type,
            message: 'WoodWood requires a number (we reccomend to jig)'
        });
        console.log(`[${task.taskID}] ` + JSON.stringify(profile));
        mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
        return;
    }
    profile['phoneNumber'] = profile['phoneNumber'].replaceAll('-', '');
    request({
        url: task['variant'],
        headers: {
            'authority': 'woodwood.us4.list-manage.com',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
        },
        agent: agent
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
                return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
            }
            mainBot.mainBotWin.send('taskUpdate', {
                id: task.taskID,
                type: task.type,
                message: 'Got raffle page'
            });
            console.log(`[${task.taskID}] ` + ' Got raffle page');
            $ = cheerio.load(body);
            var token = $('input[name="ht"]').attr('value');
            if (!token) {
                mainBot.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    type: task.type,
                    message: 'Error getting raffle token. Retrying in ' + global.settings.retryDelay / 1000 + 's'
                });
                console.log(`[${task.taskID}] ` + ' Error getting raffle token. Retrying');
                return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
            }
            mainBot.mainBotWin.send('taskUpdate', {
                id: task.taskID,
                type: task.type,
                message: 'Got raffle token'
            });
            console.log(`[${task.taskID}] ` + ' Got raffle token: ' + token);
            exports.postRaffleInfo(request, task, profile, token);
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

    request({
        url: 'https://woodwood.us4.list-manage.com/subscribe/post',
        method: 'POST',
        headers: {
            'authority': 'woodwood.us4.list-manage.com',
            'cache-control': 'max-age=0',
            'upgrade-insecure-requests': '1',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'referer': task['variant'],
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
        },
        formData: {
            'u': task['variant'].split('?u=')[1].split('&')[0],
            'id': task['variant'].split('&id=')[1],
            'b_name': '',
            'b_email': '',
            'b_comment': '',
            'MERGE0': task['taskEmail'],
            'MERGE1': profile['firstName'],
            'MERGE2': profile['lastName'],
            'MERGE3': profile['city'],
            'MERGE5': countryFormatter(profile['country']),
            'MERGE4': profile['phoneNumber'],
            'MERGE6': task['taskSizeVariant'],
            'MERGE7': 'woodwood.com',
            'gdpr[717]:': 'Y',
            'submit': 'Subscribe',
            'ht': token,
            'mc_signupsource': 'hosted'
        },
        agent: agent
    }, function callback(error, response, body) {
        //change below line to be separate
        if (!error) {
            if (response.statusCode != 200 && response.request.href != 'https://woodwood.us4.list-manage.com/subscribe/post') {
                console.log(JSON.stringify(profile));
                console.log(JSON.stringify(task));
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
            mainBot.mainBotWin.send('taskUpdate', {
                id: task.taskID,
                type: task.type,
                message: 'Got captcha'
            });
            console.log(`[${task.taskID}] ` + ' Got captcha page');
            $ = cheerio.load(body);
            var mf = $('input[name="mf"]').attr('value');
            if (!mf) {
                var error2 = $('.errorText').html();
                if (error2) {
                    if (error2 == 'This email address looks fake or invalid. Please enter a real email address.') {
                        console.log(`[${task.taskID}] ` + ' Email too suspicious');
                        mainBot.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            type: task.type,
                            message: 'Email too suspicious'
                        });
                        return;
                    } else if (error2.toLowerCase().indexOf('too many subscribe attempts for this email address') > -1) {
                        console.log(`[${task.taskID}] ` + ' Rate limited (use more proxies)');
                        mainBot.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            type: task.type,
                            message: 'Rate limited (use more proxies)'
                        });
                        mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
                        return;
                    } else {
                        mainBot.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            type: task.type,
                            message: error2
                        });
                        console.log(body);
                        console.log(JSON.stringify(profile));
                        console.log(JSON.stringify(task));
                        console.log(`[${task.taskID}] ` + ' Error: ' + error2)
                        console.log(`[${task.taskID}] ` + ' Error: ' + error2)
                        mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
                        return;
                    }
                } else {
                    mainBot.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        type: task.type,
                        message: 'Error getting 2nd raffle token. Retrying in ' + global.settings.retryDelay / 1000 + 's'
                    });
                    console.log(`[${task.taskID}] ` + ' Error getting raffle token. Retrying');
                    return setTimeout(() => exports.initTask(task, profile), global.settings.retryDelay);
                }
            }
            console.log(`[${task.taskID}] ` + ' Got 2nd raffle token: ' + mf);
            console.log('Now needs captcha');
            return exports.captchaWorker(request, task, profile, token, mf);
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
}



exports.captchaWorker = function (request, task, profile, token, mf) {
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
        mainBot.requestCaptcha('woodwood', task, false);
        const capHandler = () => {
            if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
                setTimeout(() => capHandler(), 100);
            } else {
                exports.submitRaffle(request, task, profile, token, mf);
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
                        "websiteURL": task["variant"],
                        "websiteKey": "6LcN9xoUAAAAAHqSkoJixPbUldBoHojA_GCp6Ims"
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
                    return setTimeout(() => exports.captchaWorker(request, task, profile, token, mf), 15000);
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
                                    return exports.submitRaffle(request, task, profile, token, mf);
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
                url: 'https://2captcha.com/in.php?key=' + global.settings['2capAPIKey'] + '&method=userrecaptcha&googlekey=6LcN9xoUAAAAAHqSkoJixPbUldBoHojA_GCp6Ims&pageurl=' + task["variant"] + '&json=1&soft_id=2553',
                method: 'GET',
                json: true
            }, function (error, response, body) {
                if (error) {
                    mainBot.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        type: task.type,
                        message: '2Captcha error. Retrying in 15s'
                    });
                    return setTimeout(() => exports.captchaWorker(request, task, profile, token, mf), 15000);
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
                                        return exports.submitRaffle(request, task, profile, token, mf);
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




exports.submitRaffle = function (request, task, profile, token, mf) {
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
    request({
        url: 'https://woodwood.us4.list-manage.com/subscribe/confirm-captcha',
        method: 'POST',
        headers: {
            'authority': 'woodwood.us4.list-manage.com',
            'cache-control': 'max-age=0',
            'origin': 'https://woodwood.us4.list-manage.com',
            'upgrade-insecure-requests': '1',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'referer': 'https://woodwood.us4.list-manage.com/subscribe/post',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
        },
        formData: {
            'u': task['variant'].split('?u=')[1].split('&')[0],
            'id': task['variant'].split('&id=')[1],
            'mf': mf,
            'g-recaptcha-response': mainBot.taskCaptchas[task['type']][task['taskID']],
            'recaptcha_response_field': 'manual_challenge'
        },
        agent: agent
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
                return setTimeout(() => exports.submitRaffle(request, task, profile, token, mf), global.settings.retryDelay);
            }
            $ = cheerio.load(body);
            var error2 = $('.errorText').html();
            if (error2) {
                if (error2 == 'Captcha failed. Please try again.') {
                    mainBot.taskCaptchas[task['type']][task['taskID']] = '';
                    mainBot.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        type: task.type,
                        message: 'Captcha error! Retrying'
                    });
                    console.log(`[${task.taskID}] ` + ' Captcha error! Retrying');
                    return setTimeout(() => exports.captchaWorker(request, task, profile, token, mf), global.settings.retryDelay);
                } else {
                    mainBot.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        type: task.type,
                        message: error2
                    });
                    console.log(body);
                    console.log(JSON.stringify(profile));
                    console.log(JSON.stringify(task));
                    console.log(`[${task.taskID}] ` + ' Error: ' + error2)
                    mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
                    mainBot.taskCaptchas[task['type']][task['taskID']] = '';
                    return;
                }
            } else {
                var header = $('#templateBody h2').html();
                if (header.toLowerCase().indexOf('almost finished...') !== -1) {
                    mainBot.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        type: task.type,
                        message: 'entry submitted!'
                    });
                    console.log(`[${task.taskID}] ` + ' Entry submitted!');
                    registerEmail(task);
                    mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '', task, profile);
                    return;
                } else {
                    mainBot.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        type: task.type,
                        message: 'Unknown Error! DM Log'
                    });
                    console.log(body);
                    console.log(JSON.stringify(profile));
                    console.log(JSON.stringify(task));
                    console.log(`[${task.taskID}] ` + ' Unknown Error!');
                    mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
                    mainBot.taskCaptchas[task['type']][task['taskID']] = '';
                    return;
                }
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
            return setTimeout(() => exports.submitRaffle(request, task, profile, token, mf), global.settings.retryDelay);
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
			return 'Russia';
			break;
		case 'Luxembourg':
			return 'Luxembourg';
			break;
		default:
			return 'noexist';
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



String.prototype.replaceAll = function (str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}
