const notifier = require('node-notifier');

class AlarmServiceDriverNode {
	constructor(options) {
		// Note: appName is required to get the notification to work. It must be the same as the appId defined in package.json
		// https://github.com/mikaelbr/node-notifier/issues/144#issuecomment-319324058
		this.appName_ = options.appName;
		this.notifications_ = {};
	}

	hasPersistentNotifications() {
		return false;
	}

	notificationIsSet(id) {
		return id in this.notifications_;
	}

	async clearNotification(id) {
		if (!this.notificationIsSet(id)) return;
		clearTimeout(this.notifications_[id].timeoutId);
		delete this.notifications_[id];
	}

	async scheduleNotification(notification, note_id) {

		const log = require('electron-log');
		const uuid = note_id.slice(0, 8) + '-' + note_id.slice(8, 12) + '-' + note_id.slice(12, 16) + '-' + note_id.slice(16, 20) + '-' + note_id.slice(20);

		const now = Date.now();
		const interval = notification.date.getTime() - now;
		if (interval < 0) return;
		
		if (isNaN(interval)) {
			throw new Error('Trying to create a notification from an invalid object: ' + JSON.stringify(notification));
		}

		log.info("Scheduling for " + uuid);

		const timeoutId = setTimeout(() => {

			const open = require('open');

			if ('body' in notification) {
				notifier.notify({
					title: notification.title,
					message: notification.body,
					sound: true,
					wait: true
				}, function () {
					log.info("Opening joplin://" + uuid);
					open("joplin://" + uuid);
				});
			} else {
				notifier.notify({
					title: notification.title,
					sound: true,
					wait: true
				}, function () {
					log.info("Opening joplin://" + uuid);
					open("joplin://" + uuid);
				});
			}

			this.clearNotification(notification.id);
		}, interval);

		this.notifications_[notification.id] = Object.assign({}, notification);
		this.notifications_[notification.id].timeoutId = timeoutId;
	}
}

module.exports = AlarmServiceDriverNode;
