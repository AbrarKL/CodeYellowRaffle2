var electronInstaller = require('electron-winstaller');
resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release-builds/CodeYellowRaffleV2-win32-ia32',
    outputDirectory: './builds/installer',
    authors: 'CodeYellow.',
    exe: 'CodeYellowRaffleV2.exe',
	version: '0.1.1',
	noMsi: true,
	loadingGif: './assets/installer.gif',
	setupIcon: './assets/icons/win/icon.ico'
  });

resultPromise.then(() => console.log("Created"), (e) => console.log(`No dice: ${e.message}`));
