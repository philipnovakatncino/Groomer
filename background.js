const checkTime = () => {
	chrome.storage.local.get('state', result => {
		if (result.state) {
			const timeLeft = calculateTimeLeft(result.state);
			if (timeLeft < -WARNING_LIMIT) {
				setBadge('!');
			} else if (timeLeft <= WARNING_LIMIT) {
				setBadge(timeLeft.toString());
			}
		}
	});
};

const calculateTimeLeft = ({ timeEnd, timePerTicket, ticketsLeft }) => {
	return Math.floor(
		(timeEnd - Date.now() - timePerTicket * (ticketsLeft - 1)) / ONE_SECOND
	);
};

const setBadge = timeLeftInSeconds => {
	chrome.browserAction.setBadgeText({ text: timeLeftInSeconds });
};

const clearBadge = () => {
	chrome.browserAction.setBadgeText({ text: '' });
};

let interval;
const startInterval = () => {
	interval = setInterval(checkTime, ONE_SECOND);
};

const stopInterval = () => {
	clearInterval(interval);
};

chrome.runtime.onMessage.addListener(message => {
	switch (message) {
		case 'start-meeting':
			startInterval();
			break;
		case 'end-meeting':
			stopInterval();
		case 'next-ticket':
			clearBadge();
			break;
	}
});

const ONE_SECOND = 1000;
const WARNING_LIMIT = 30;
chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
