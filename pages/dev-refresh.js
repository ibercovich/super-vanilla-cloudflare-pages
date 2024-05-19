(function () {
	const CHECK_INTERVAL = 5000; // Check every 5 seconds
	let firstTimestamp = null;

	console.log('dev-refresh loaded');

	async function checkForUpdates() {
		try {
			const response = await fetch('/buildts.gen.json'); // Adjust the URL if needed
			const data = await response.json();
			const newTimestamp = data.timestamp;

			if (firstTimestamp === null) {
				firstTimestamp = newTimestamp;
			}

			if (newTimestamp !== firstTimestamp) {
				firstTimestamp = newTimestamp;
				location.reload();
			}
		} catch (error) {
			console.error('Error fetching build timestamp:', error);
		}
	}

	setInterval(checkForUpdates, CHECK_INTERVAL);
})();
