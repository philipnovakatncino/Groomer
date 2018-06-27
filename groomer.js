let timeStart, timeEnd, timeLeft, timeLeftCurrentTicket, ticketsLeft, timePerTicket, timerInstance;

function startMeeting() {
	const tickets = +getInputValue('tickets');
	const timeInMinutes = +getInputValue('time');
	const timeTotal = timeInMinutes * MINUTES_TO_MILLISECONDS;
	timeStart = Date.now();
	timeEnd = timeStart + timeTotal;
	timeLeft = timeTotal;
	ticketsLeft = tickets;
	loadIntoLocalStorage();
	refreshView();
}

function refreshView() {
	recalculateTimePerTicket();
	refreshTimerDisplay();
	setView('timer-view');
	startTimer();
}

function nextTicket() {
	ticketsLeft--;
	if (ticketsLeft > 0) {
		recalculateTimePerTicket();
		loadIntoLocalStorage();
	} else {
		endMeeting();
	}
}

function recalculateTimeLeft() {
	timeLeft = timeEnd - Date.now();
}

function recalculateTimePerTicket() {
	timePerTicket = timeLeft / ticketsLeft;
	timeLeftCurrentTicket = timePerTicket;
	refreshTimePerTicket();
	refreshTicketsLeft();
	refreshTimerDisplay();
}

function endMeeting() {
	stopTimer();
	setView('end-view');
	clearLocaleStorage();
}

function startOver() {
	setView('start-view');
}

function tick() {
	timeLeft -= ONE_SECOND;
	timeLeftCurrentTicket -= ONE_SECOND;
	refreshTimerDisplay();
}

function startTimer() {
	timerInstance = setInterval(tick, ONE_SECOND);
}

function stopTimer() {
	if (timerInstance) {
		clearInterval(timerInstance);
	}
}

function setView(view) {
	document.querySelectorAll('.view-page').forEach(function(page) {
		page.classList.add(view == page.id ? 'slds-show' : 'slds-hide');
		page.classList.remove(view == page.id ? 'slds-hide' : 'slds-show');
	});
}

function refreshTimerDisplay() {
	document.getElementById('timer').innerText = getDisplayTime(timeLeftCurrentTicket);
}

function refreshTimePerTicket() {
	document.getElementById('time-per-ticket').innerText = getDisplayTime(timePerTicket);
}

function refreshTicketsLeft() {
	document.getElementById('tickets-left').innerText = ticketsLeft;
}

function getInputValue(inputId) {
	return document.getElementById(inputId).value;
}

function getDisplayTime(timestamp) {
	const date = normalizeDate(timestamp);
	const time = (date.getHours() > 0 ? (date.getHours() + ':') : '') +
		normalizeNumber(date.getMinutes()) + ':' +
		normalizeNumber(date.getSeconds());
	return timestamp <= -ONE_SECOND ? '-' + time : time;
}

function normalizeDate(timestamp) {
	const date = new Date(Math.abs(timestamp));
	date.setTime(date.getTime() + date.getTimezoneOffset() * MINUTES_TO_MILLISECONDS);
	return date;
}

function normalizeNumber(number) {
	if (number < 10) {
		return '0' + number;
	}
	return number;
}

function detectStorage() {
	chrome.storage.local.get('state', function(result) {
		if (!result.state) {
			startOver();
		} else {
			loadFromLocalStorage(result.state);
			recalculateTimeLeft();
			refreshView();
		}
	});
}

function loadFromLocalStorage(state) {
	timeStart = state.timeStart;
	timeEnd = state.timeEnd;
	ticketsLeft = state.ticketsLeft;
}

function loadIntoLocalStorage() {
	const state = {
		timeStart: timeStart,
		timeEnd: timeEnd,
		ticketsLeft: ticketsLeft
	};
	chrome.storage.local.set({state: state}, function() {
		console.log('Set state:', state);
	});
}

function clearLocaleStorage() {
	chrome.storage.local.set({state: null}, function() {
		console.log('State cleared');
	});
}

document.getElementById('start-button').onclick = startMeeting;
document.getElementById('next-ticket').onclick = nextTicket;
document.getElementById('stop-button').onclick = endMeeting;
document.getElementById('start-over').onclick = startOver;

const ONE_SECOND = 1000;
const MINUTES_TO_MILLISECONDS = 60 * 1000;
const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

detectStorage();
