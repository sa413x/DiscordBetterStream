class LetopisUtilities {
	constructor() {
	  this.updateInterval = null;
	  this.eventListenersAdded = false;
	  this.videoFrame = null;
	  this.handleMouseDown = this.handleMouseDown.bind(this);
	  this.handleMouseWheel = this.handleMouseWheel.bind(this);
	  
	  this.onStart();
	}

	onStart() {
	  this.checkForVideoFrame();
	  this.updateInterval = setInterval(
		() => this.checkForVideoFrame(),
		1000
	  );
	}
	
	onStop() {
		this.resetStyle();
		this.removeEventListeners();
		clearInterval(this.updateInterval);
	}

	checkForVideoFrame() {
	  const newVideoFrame = document.querySelector('.videoWrapper__73cb7');
	  
	  if (newVideoFrame !== null && this.eventListenersAdded && newVideoFrame !== this.videoFrame) {
		  this.removeEventListeners();
	  }

	  if (newVideoFrame !== null && !this.eventListenersAdded) {
		this.resetStyle();

		newVideoFrame.addEventListener('mousedown', this.handleMouseDown);
		newVideoFrame.addEventListener('wheel', this.handleMouseWheel);

		this.eventListenersAdded = true;
		this.videoFrame = newVideoFrame;
	  } else if (newVideoFrame === null && this.eventListenersAdded) {
		this.removeEventListeners();
	  }
	}
	
	resetStyle() {
		if (this.videoFrame) {
			this.videoFrame.style.top = '0px';
			this.videoFrame.style.left = '1px';
			this.videoFrame.style.transform = 'scale(1)';
			this.videoFrame.style.position = 'relative';
		}
	}

	removeEventListeners() {
	  if (this.videoFrame) {
		this.videoFrame.removeEventListener(
		  'mousedown',
		  this.handleMouseDown
		);
		this.videoFrame.removeEventListener('wheel', this.handleMouseWheel);
	  }

	  this.eventListenersAdded = false;
	  this.videoFrame = null;
	}

	// Handles moving the video frame with the middle mouse button
	handleMouseDown(e) {
	  if (e.button === 1) {
		e.preventDefault();
		const initialX = e.clientX;
		const initialY = e.clientY;
		const rect = this.videoFrame.getBoundingClientRect();

		const initialLeft =
		  parseInt(this.videoFrame.style.left, 10) || rect.left;
		const initialTop =
		  parseInt(this.videoFrame.style.top, 10) || rect.top;

		const onMouseMove = (moveEvent) => {
		  const dx = moveEvent.clientX - initialX;
		  const dy = moveEvent.clientY - initialY;

		  this.videoFrame.style.position = 'relative';
		  this.videoFrame.style.left = initialLeft + dx + 'px';
		  this.videoFrame.style.top = initialTop + dy + 'px';
		};

		const onMouseUp = () => {
		  document.removeEventListener('mousemove', onMouseMove);
		  document.removeEventListener('mouseup', onMouseUp);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	  }
	}

	// Handles zooming the video frame with the mouse wheel scroll
	handleMouseWheel(e) {
	  if (e.ctrlKey) {
		e.preventDefault();
		const scaleAmount = 0.05;
		const currentScale =
		  Number(this.videoFrame.style.transform.replace(/[^0-9.]/g, '')) ||
		  1;
		const delta = e.deltaY < 0 ? scaleAmount : -scaleAmount;
		const newScale = Math.max(0.1, currentScale + delta);

		// Calculate the point to zoom towards
		const rect = this.videoFrame.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const newX = ((x - rect.width / 2) * delta) / newScale;
		const newY = ((y - rect.height / 2) * delta) / newScale;

		// Update the transform and translation
		this.videoFrame.style.position = 'relative';
		this.videoFrame.style.transform = `scale(${newScale})`;
		this.videoFrame.style.left = `${
		  (parseFloat(this.videoFrame.style.left) || 0) - newX
		}px`;
		this.videoFrame.style.top = `${
		  (parseFloat(this.videoFrame.style.top) || 0) - newY
		}px`;
	  }
	}
}

document.letopis = new LetopisUtilities();

function handleUnload(button) {
	if (button.code === 'Delete') {
		if (button.shiftKey) {
			document.letopis.onStop();
			document.letopis = undefined;
			document.body.removeEventListener('keydown', handleUnload);
		} else {
			document.letopis.resetStyle();
		}
	}
}
document.body.addEventListener('keydown', handleUnload);
