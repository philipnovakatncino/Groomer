let timeTotal, timeLeft, ticketsLeft, timePerTicket, timerInstance;

function startMeeting() {
	const tickets = +getInputValue('tickets');
	const timeInMinutes = +getInputValue('time');
	timeTotal = timeInMinutes * MINUTES_TO_MILLISECONDS;
	timeLeft = timeTotal;
	ticketsLeft = tickets;
	setTicketsLeft();
	recalculateTime();
	setView('timer-view');
	setTimerDisplay();
	startTimer();
}

function recalculateTime() {
	if (ticketsLeft > 0) {
		timePerTicket = timeLeft / ticketsLeft;
		setTimePerTicket();
		setTicketsLeft();
		ticketsLeft--;
	} else {
		endMeeting();
	}
}

function endMeeting() {
	stopTimer();
	setView('end-view');
}

function startOver() {
	setView('start-view');
}

function tick() {
	timeLeft -= ONE_SECOND;
	setTimerDisplay();
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

function setTimerDisplay() {
	document.getElementById('timer').innerText = getDisplayTime(timeLeft);
}

function setTimePerTicket() {
	document.getElementById('time-per-ticket').innerText =
		'Time per ticket: ' + getDisplayTime(timePerTicket);
}

function setTicketsLeft() {
	document.getElementById('tickets-left').innerText = ticketsLeft + ' tickets left.';
}

function getInputValue(inputId) {
	return document.getElementById(inputId).value;
}

function getDisplayTime(timestamp) {
	const date = normalizeDate(timestamp);
	return (date.getHours() > 0 ? (date.getHours() + ':') : '') +
		normalizeNumber(date.getMinutes()) + ':' +
		normalizeNumber(date.getSeconds());
}

function normalizeDate(timestamp) {
	const date = new Date(timestamp);
	date.setTime(date.getTime() + date.getTimezoneOffset() * MINUTES_TO_MILLISECONDS);
	return date;
}

function normalizeNumber(number) {
	if (number < 10) {
		return '0' + number;
	}
	return number;
}

document.getElementById('start-button').onclick = startMeeting;
document.getElementById('next-ticket').onclick = recalculateTime;
document.getElementById('start-over').onclick = startOver;

const ONE_SECOND = 1000;
const MINUTES_TO_MILLISECONDS = 60 * 1000;
const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;