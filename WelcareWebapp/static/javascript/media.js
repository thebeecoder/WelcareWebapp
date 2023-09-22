let capturedImageDataURL = null;
let capturedVideoDataURL = null;
// Function to open media in a larger view
function openMediaInLargeView(mediaUrl) {
    $('#mediaLargeView').attr('src', mediaUrl);
    $('#mediaModal').modal('show');

    $('#mediaModal .btn-secondary').on('click', function () {
        $('#mediaModal').modal('hide'); // This line closes the modal
    });
}
// Function to populate media previews
function populateMediaPreviews(mediaData) {
    const thumbnailSize = '200px'; // Set your desired thumbnail size here
    const previewContainer = document.getElementById('preview-container');

    mediaData.forEach(function (media) {
        const mediaUrl = `/static/media/${media.media_data}`;
        const mediaElement = document.createElement('div');
        mediaElement.className = 'col-md-4 mb-3 preview-item';
        mediaElement.setAttribute('data-media-id', media.media_id); // Add a data attribute to store media ID
        const videoThumbnail = media.thumbnail_base64;

        if (media.media_type.startsWith('image')) {
            mediaElement.innerHTML = `
                <img src="${mediaUrl}" alt="${media.mediatitle}" class="img-thumbnail" style="max-width: 100%; max-height: 100%; cursor: pointer;" onclick="openMediaInLargeView('${mediaUrl}')">
                <i class="fas fa-times cross-icon" style="cursor: pointer;"></i>
                <p class="card-text title">${media.mediatitle}</p>
                <p class="card-text timestamp">${media.upload_datetime}</p>
            `;
        } else if (media.media_type.startsWith('video')) {
            mediaElement.innerHTML = `
                <a class="video-link" href="${mediaUrl}" data-mfp-src="${mediaUrl}">
                    <img src="data:image/jpeg;base64,${videoThumbnail}" alt="${media.mediatitle}" class="img-thumbnail" style="max-width: 100%; max-height: 100%; cursor: pointer;" data-video="${mediaUrl}" onclick="openMediaInLargeView('${mediaUrl}')">
                    <i class="fas fa-play-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: #007bff; cursor: pointer;"></i>
                    <i class="fas fa-times cross-icon" style="cursor: pointer;"></i>
                    <p class="card-text title" color="black">${media.mediatitle}</p> <!-- This is where the title is -->
                    <p class="card-text timestamp">${media.upload_datetime}</p>
                `;


        }

        previewContainer.appendChild(mediaElement);

        const crossIcon = mediaElement.querySelector('.cross-icon');
        crossIcon.addEventListener('click', function () {
            const mediaId = media.media_id; // Get the media ID from the data attribute
            deleteMediaItemWithConfirmation(mediaId); // Call the function to confirm deletion
        });
    });
}

function deleteMediaItemWithConfirmation(mediaId) {
    // Show a confirmation dialog
    $('#deleteConfirmationModal').modal('show');

    // Handle the "Confirm" button click
    $('#confirmDeleteBtn').on('click', function () {
        // Close the confirmation dialog
        $('#deleteConfirmationModal').modal('hide');

        // Send an AJAX request to delete the media item
        $.ajax({
            url: '/deletemedia',
            method: 'POST',
            data: { media_id: mediaId },
            success: function (response) {
                // Handle the success response, e.g., remove the media item from the preview
                console.log(response.message); // Log the success message

                // Update the UI by removing the media element from the previewContainer
                const mediaElementToRemove = $(`#preview-container .preview-item[data-media-id="${mediaId}"]`);
                mediaElementToRemove.remove();
            },
            error: function (xhr, status, error) {
                // Handle the error response, e.g., show an error message
                console.error(error);
            }
        });

        // Remove the click event handler to prevent multiple submissions
        $('#confirmDeleteBtn').off('click');
    });

    // Handle the "Cancel" button click
    $('#cancelDeleteBtn').on('click', function () {
        // Close the confirmation dialog
        $('#deleteConfirmationModal').modal('hide');
    });
}


// Add this script after including jQuery and Bootstrap
$(document).ready(function () {
    const mediaSourceModal = $('#mediaSourceModal');
    const fileInput = $('#file-input');
    const selectMediaBtn = $('#selectMediaBtn');
    const submitBtn = $('#submit');
    const videoElement = document.getElementById('cameraPreview');

    fileInput.on('change', function () {
        // Check if there are any files selected
        if (fileInput[0].files.length > 0) {
            // Enable the "Save" button
            submitBtn.prop('disabled', false);
            selectMediaBtn.addClass('disabled');
        } else {
            // No files selected, so disable the "Save" button
            submitBtn.prop('disabled', true);
        }
    });

    $('#selectMediaBtn').click(function () {
        $('#mediaSourceModal').modal('show');
    });

    // Close the modal when clicking the "Close" button or the cross icon
    $('#mediaSourceModal .close, #mediaSourceModal .btn-secondary').click(function () {
        $('#mediaSourceModal').modal('hide');
    });

    $('#uploadFromDeviceBtn').click(function () {
        videoElement.style.display = 'none';
        $('#file-input').click();
    });

    //$('#openCameraBtn').click(function () {
       // openCamera();
        //mediaSourceModal.modal('hide');
        //videoElement.style.display = 'block';
    //});

    // Function to open the camera and display the stream
    //function openCamera() {

        //const videoElement = document.getElementById('cameraPreview');


        // Check if the browser supports the MediaDevices API
        //if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            //navigator.mediaDevices.getUserMedia({ video: true })
                //.then(function (stream) {
                   // videoElement.srcObject = stream;

      //          })
      //          .catch(function (error) {
       //             console.error('Error accessing the camera: ', error);
        //        });
        //} else {
         //   console.error('getUserMedia is not supported in this browser.');
     //   }
    //}

    // Event listener for the file input change
    document.getElementById('file-input').addEventListener('change', function (event) {
        const fileInput = event.target;
        const previewContainer = document.getElementById('preview-container');

        for (const file of fileInput.files) {
            const reader = new FileReader();

            reader.onload = function (e) {
                // Create a new div element for the media item
                const previewItem = document.createElement('div');
                previewItem.className = 'col-md-4 mb-3 preview-item';

                // Create the media element (image or video)
                const mediaElement = file.type.includes('image')
                    ? document.createElement('img')
                    : document.createElement('video');
                mediaElement.controls = true;
                mediaElement.src = e.target.result;

                // Create the title input field
                const mediaTitleInput = document.createElement('input');
                mediaTitleInput.type = 'text';
                mediaTitleInput.className = 'form-control media-title-input';
                mediaTitleInput.placeholder = 'Enter media title';

                // Create the timestamp element
                const timestampElement = document.createElement('p');
                timestampElement.className = 'card-text timestamp';
                timestampElement.textContent = new Date().toLocaleString();

                // Create the cross icon for removing the item
                const crossIcon = document.createElement('i');
                crossIcon.className = 'fas fa-times cross-icon';
                crossIcon.addEventListener('click', function () {
                    previewContainer.removeChild(previewItem);
                });

                // Add the elements to the preview item
                previewItem.appendChild(mediaElement);
                previewItem.appendChild(mediaTitleInput);
                previewItem.appendChild(timestampElement);
                previewItem.appendChild(crossIcon);

                const mediaTitle = mediaTitleInput.value;

                // Add the preview item to the preview container
                previewContainer.appendChild(previewItem);
            };

            reader.readAsDataURL(file);
        }
    });

    const reportrange = document.getElementById('reportrange');
    const observer = new MutationObserver(function () {
        if ($('#reportrange span').text() !== '') {
            updateMediaRecords();
        }
    });

    observer.observe(reportrange, { childList: true, subtree: true });
});




$('#reportrange').on('DOMSubtreeModified', function () {
    if ($('#reportrange span').text() !== '') {
        updateMediaRecords();
    }
});

// Call the populateMediaPreviews function with the media data from the response
function updateMediaRecords() {
    $.ajax({
        url: '/getmedia',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function (response) {
            if (response.media && response.media.length > 0) {
                // Clear existing content
                $('#preview-container').empty();

                // Call the populateMediaPreviews function with the media data from the response
                populateMediaPreviews(response.media);

            } else {
                var noRecordsMessage = '<p class="text-muted"><br><br>No records available for the selected date range.</p>';
                $('#preview-container').html(noRecordsMessage);
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
            const openCameraBtn = document.querySelector("#openCameraBtn"); // Select the "Open Camera" button
            const videoElement = document.querySelector("#cameraPreview");
            const captureButton = document.querySelector("#capture-photo");
            const photoCanvas = document.querySelector("#photoCanvas");
            const videoCanvas = document.querySelector("#videoCanvas"); // Select the video canvas
            const startRecordButton = document.querySelector("#start-record");
            const stopRecordButton = document.querySelector("#stop-record");
            const downloadVideoLink = document.querySelector("#download-video");
            const mediaSourceModal = $('#mediaSourceModal');
            const cameraModal = $('#cameraModal');
            const closeButton = document.querySelector("#cameraModal .close");
            const saveMediaButton = document.querySelector("#save-media");

            let cameraStream = null;
            let mediaRecorder = null;
            let videoBlobsRecorded = [];
            let isCapturingImage = false; // Track whether capturing an image or recording video

            // Function to toggle visibility of video and photo canvases
            function toggleCanvasVisibility(isImage) {
                if (isImage) {
                    videoElement.style.display = 'none';
                    videoCanvas.style.display = 'none';
                    photoCanvas.style.display = 'block';
                } else {
                    videoElement.style.display = 'block';
                    videoCanvas.style.display = 'block';
                    photoCanvas.style.display = 'none';
                }
            }

            // Event listener for clicking the "Open Camera" button
            openCameraBtn.addEventListener('click', function () {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                        .then(function (stream) {
                            cameraStream = stream;
                            videoElement.srcObject = cameraStream;
                            mediaSourceModal.modal('hide');
                            cameraModal.modal('show');
                            toggleCanvasVisibility(isCapturingImage);
                        })
                        .catch(function (error) {
                            console.error('Error accessing the camera: ', error);
                        });
                } else {
                    console.error('getUserMedia is not supported in this browser.');
                }
            });

            // Event listener for clicking the "Capture Photo" button
            captureButton.addEventListener('click', function () {
                $('#save-media').prop('disabled', false);
                $('#start-record').prop('disabled', false);
                $('#stop-record').prop('disabled', true);
                $('#download-video').prop('disabled', true);
                photoCanvas.style.display = "block";
                videoCanvas.style.display = "none";
                if (cameraStream) {
                    isCapturingImage = true;
                    toggleCanvasVisibility(isCapturingImage);
                    photoCanvas.getContext('2d').drawImage(videoElement, 340, 640);
                    capturedImageDataURL = photoCanvas.toDataURL('image/jpeg');
                } else {
                    console.error('Camera not started.');
                }
            });

            // Event listener for clicking the "Start Recording" button
            startRecordButton.addEventListener('click', function () {
                $('#save-media').prop('disabled', true);
                $('#capture-photo').prop('disabled', true);
                $('#stop-record').prop('disabled', false);
                $('#start-record').prop('disabled', true);
                $('#download-video').prop('disabled', true);
                if (cameraStream) {
                    isCapturingImage = false;
                    toggleCanvasVisibility(isCapturingImage);
                    mediaRecorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });

                    mediaRecorder.addEventListener('dataavailable', function (e) {
                        videoBlobsRecorded.push(e.data);
                    });

                    mediaRecorder.addEventListener('stop', function () {
                        let videoLocalURL = URL.createObjectURL(new Blob(videoBlobsRecorded, { type: 'video/webm' }));
                        videoElement.src = videoLocalURL; // Set the video element's source
                        videoCanvas.getContext('2d').drawImage(videoElement, 340, 640);
                        downloadVideoLink.href = videoLocalURL;
                        capturedVideoDataURL = videoLocalURL;
                        const videoContext = videoCanvas.getContext('2d');
                    });

                    mediaRecorder.start(1000); // Start recording with 1-second chunks
                } else {
                    console.error('Camera not started.');
                }
            });



            // Event listener for clicking the "Stop Recording" button
            stopRecordButton.addEventListener('click', function () {
                $('#save-media').prop('disabled', false);
                $('#download-video').prop('disabled', false);
                $('#capture-photo').prop('disabled', false);
                $('#stop-record').prop('disabled', true);
                $('#start-record').prop('disabled', false);
                photoCanvas.style.display = "none";
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    videoCanvas.getContext('2d').drawImage(videoElement, 340, 640);
                } else {
                    console.error('Recording not started.');
                }
            });

            // Event listener for clicking the "Start Camera" button inside the cameraModal
            const startCameraButton = document.querySelector("#start-camera");
            startCameraButton.addEventListener('click', function () {
                $('#save-media').prop('disabled', true);
                $('#download-video').prop('disabled', true);
                $('#stop-record').prop('disabled', true);
                $('#start-record').prop('disabled', false);
                $('#capture-photo').prop('disabled', false);
                isCapturingImage = false;
                toggleCanvasVisibility(isCapturingImage);
            });



            // Event listener for clicking the "Save" button
            saveMediaButton.addEventListener('click', function () {
                if (photoCanvas.style.display === 'block') {
                    const imageDataURL = photoCanvas.toDataURL('image/jpeg');
                    addMediaToPreviewContainer(imageDataURL, 'image');
                } else if (videoCanvas.style.display === 'block') {
                    const videoDataURL = videoCanvas.toDataURL('video/webm');
                    addMediaToPreviewContainer(videoDataURL, 'video');
                }

                // Disable the "Save" button
                $('#save-media').prop('disabled', true);
                $('#submit').prop('disabled', false);

                cameraModal.modal('hide');

                if (cameraStream) {
                    cameraStream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                }
            });


            closeButton.addEventListener('click', function () {
                // Close the cameraModal using Bootstrap's modal method
                $('#cameraModal').modal('hide');

                // Stop the camera stream if it's currently active
                if (cameraStream) {
                    cameraStream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                }

                // Clear the contents of the canvases
                photoCanvas.getContext('2d').clearRect(0, 0, photoCanvas.width, photoCanvas.height);
                videoCanvas.getContext('2d').clearRect(0, 0, videoCanvas.width, videoCanvas.height);

                // Reset any other states or variables as needed
            });



            // Function to add media to the preview container
            function addMediaToPreviewContainer(dataURL, mediaType) {
                const previewContainer = document.getElementById('preview-container');
                const previewItem = document.createElement('div');
                previewItem.className = 'col-md-4 mb-3 preview-item';

                const mediaElement = mediaType.startsWith('image')
                    ? document.createElement('img')
                    : document.createElement('video');

                mediaElement.controls = true;
                mediaElement.src = dataURL;

                const mediaTitleInput = document.createElement('input');
                mediaTitleInput.type = 'text';
                mediaTitleInput.className = 'form-control media-title-input';
                mediaTitleInput.placeholder = 'Enter media title';

                const timestampElement = document.createElement('p');
                timestampElement.className = 'card-text timestamp';
                timestampElement.textContent = new Date().toLocaleString();

                const crossIcon = document.createElement('i');
                crossIcon.className = 'fas fa-times cross-icon';

                crossIcon.addEventListener('click', function (event) {
                    if (event.target.classList.contains('cross-icon')) {
                        const mediaId = media.media_id;
                        deleteMediaItemWithConfirmation(mediaId);
                    }
                });

                previewItem.appendChild(mediaElement);
                previewItem.appendChild(mediaTitleInput);
                previewItem.appendChild(timestampElement);
                previewItem.appendChild(crossIcon);
                previewContainer.appendChild(previewItem);
            }


            // Add an event listener to the "Save" button
            $('#submit').click(function (event) {
                event.preventDefault();

                $('#submit').prop('disabled', true);
                // Get the media title input value
                const mediaTitle = $('.media-title-input').val();

                // Check if mediaTitle is not empty
                if (mediaTitle) {
                    const formData = new FormData();
                    formData.append('mediaTitle', mediaTitle); // Include the mediaTitle

                    if (capturedImageDataURL) {
                        formData.append('capturedImage', capturedImageDataURL);
                    }

                    // Check if there's captured video data and append it
                    if (capturedVideoDataURL) {
                        formData.append('capturedVideo', capturedVideoDataURL);
                    }

                    // Check if a file is selected in the "file-input" field and append it
                    const fileInput = $('#file-input')[0];
                    if (fileInput.files.length > 0) {
                        formData.append('file', fileInput.files[0]);
                    }

                    // Perform your AJAX request using formData
                    $.ajax({
                        url: '/insertmedia',
                        method: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            // Handle the success response
                            console.log(response);

                            // Clear the media title input
                            $('.media-title-input').val('');

                            $('.media-title-input').css('visibility', 'hidden');

                            // Optionally, update the UI with the newly added media
                            if (response.media) {
                                const newMediaContainer = $('#new-media-container');

                                // Loop through the new media items in the response
                                response.media.forEach(function (media) {
                                    const mediaUrl = `/static/media/${media.media_data}`;

                                    // Create a new element for the media
                                    const mediaElement = document.createElement('div');
                                    mediaElement.className = 'new-media-item';

                                    // Check if the media type is image or video and create appropriate HTML
                                    if (media.media_type.startsWith('image')) {
                                        mediaElement.innerHTML = `
                                            <img src="${mediaUrl}" alt="${media.mediatitle}" class="img-thumbnail">
                                            <p class="media-title">${media.mediatitle}</p>
                                            <p class="timestamp">${media.upload_datetime}</p>
                                        `;
                                    } else if (media.media_type.startsWith('video')) {
                                        mediaElement.innerHTML = `
                                            <video controls src="${mediaUrl}" class="video-thumbnail" ></video>
                                            <p class="media-title">${media.mediatitle}</p>
                                            <p class="timestamp">${media.upload_datetime}</p>
                                        `;
                                    }

                                    // Append the new media element to the container
                                    newMediaContainer.append(mediaElement);
                                });

                                updateMediaRecords();
                            }

                            location.reload();
                            $('#submit').prop('disabled', true);
                        },
                        error: function (xhr, status, error) {
                            // Handle the error response
                            console.error(error);
                        }
                    });
                } else {
                    // Handle the case when mediaTitle is empty
                    alert('Please enter a media title.');
                    $('#submit').prop('disabled', false);
                }
            });

        });