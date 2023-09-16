const cameraPreview = document.getElementById('cameraPreview');
const capturePhotoBtn = document.getElementById('capturePhotoBtn');
const capturedPhoto = document.getElementById('capturedPhoto');
const recordedVideo = document.getElementById('recordedVideo');
let mediaStream;
let mediaRecorder;
let recordedChunks = [];
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');
const openCameraBtn = document.getElementById('openCameraBtn');

document.addEventListener('DOMContentLoaded', function () {

    // Function to start the webcam preview and initialize mediaRecorder
    const cameraPreview = document.getElementById('cameraPreview');
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    const recordedVideo = document.getElementById('recordedVideo');
    let mediaStream;
    let mediaRecorder;
    let recordedChunks = [];

    async function startCameraPreview() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = mediaStream;

            mediaRecorder = new MediaRecorder(mediaStream);

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoURL = window.URL.createObjectURL(blob);

                recordedVideo.style.display = 'block';
                recordedVideo.src = videoURL;

                recordedChunks = [];
            };

            startRecordingBtn.disabled = false;
        } catch (error) {
            console.error('Error accessing the camera: ', error);
        }
    }

    startRecordingBtn.addEventListener('click', () => {
        console.log(mediaRecorder)
        if (mediaRecorder && mediaRecorder.state === 'inactive') {
            console.log('Start')
            mediaRecorder.start();
            startRecordingBtn.textContent = 'Recording...';
            stopRecordingBtn.disabled = false;
        }
    });

    stopRecordingBtn.addEventListener('click', () => {
        console.log(mediaRecorder)
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            console.log('Stop')
            mediaRecorder.stop();
            startRecordingBtn.textContent = 'Start Recording';
        }
    });





capturePhotoBtn.addEventListener('click', function () {
    // Get the video element and canvas element
    const videoElement = document.getElementById('cameraPreview');
    const canvasElement = document.createElement('canvas');
    const context = canvasElement.getContext('2d');

    // Set the canvas dimensions to match the video dimensions
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw a frame from the video onto the canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Convert canvas content to a data URL (base64 encoded image)
    const photoDataURL = canvasElement.toDataURL('image/jpeg');

    // Display the captured photo
    capturedPhoto.src = photoDataURL;

    // Send the captured photo to the server
    fetch('/capture_photo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photo: photoDataURL }),
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));
});


// Add click event listener to open camera button
openCameraBtn.addEventListener('click', function () {
    // Show the mediaSourceModal when the "Open Camera" button is clicked
    $('#mediaSourceModal').modal('show');
    document.getElementById('capturePhotoBtn').style.display = 'block';
    document.getElementById('startRecordingBtn').style.display = 'block';
    document.getElementById('capturedPhoto').style.display = 'none';
    document.getElementById('recordedVideo').style.display = 'none';
    document.getElementById('stopRecordingBtn').style.display = 'none';

    // Start the webcam preview when the modal is shown
    startCameraPreview();
})

capturePhotoBtn.addEventListener('click', function () {
    // Show the mediaSourceModal when the "Open Camera" button is clicked
    $('#mediaSourceModal').modal('show');
    document.getElementById('capturedPhoto').style.display = 'block';
    document.getElementById('startRecordingBtn').style.display = 'none';
    // Start the webcam preview when the modal is shown
    startCameraPreview();
})

startRecordingBtn.addEventListener('click', function () {
    // Show the mediaSourceModal when the "Open Camera" button is clicked
    $('#mediaSourceModal').modal('show');
    document.getElementById('capturedPhoto').style.display = 'none';
    document.getElementById('capturePhotoBtn').style.display = 'none';
    document.getElementById('startRecordingBtn').style.display = 'block';
    document.getElementById('startRecordingBtn').disabled = true;
    document.getElementById('recordedVideo').style.display = 'block';
    document.getElementById('stopRecordingBtn').style.display = 'block';
    

    // Start the webcam preview when the modal is shown
    startCameraPreview();
})

});