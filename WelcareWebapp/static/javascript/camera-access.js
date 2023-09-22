const startRecordButton = document.querySelector("#start-record");
const stopRecordButton = document.querySelector("#stop-record");
const downloadVideoLink = document.querySelector("#download-video");

let cameraStream = null;
let mediaRecorder = null;
let videoBlobsRecorded = [];

startRecordButton.addEventListener('click', function () {
    if (cameraStream) {
        mediaRecorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });

        mediaRecorder.addEventListener('dataavailable', function (e) {
            videoBlobsRecorded.push(e.data);
        });

        mediaRecorder.addEventListener('stop', function () {
            let videoLocalURL = URL.createObjectURL(new Blob(videoBlobsRecorded, { type: 'video/webm' }));
            downloadVideoLink.href = videoLocalURL;
        });

        mediaRecorder.start(1000); // Start recording with 1-second chunks
    } else {
        console.error('Camera not started.');
    }
});

stopRecordButton.addEventListener('click', function () {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    } else {
        console.error('Recording not started.');
    }
});
