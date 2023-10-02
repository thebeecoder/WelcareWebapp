let capturedImageDataURL = null;
let capturedVideoDataURL = null;
// Function to open media in a larger view
function openMediaInLargeView(mediaUrl) {
    $('#mediaLargeView').attr('src', mediaUrl);
    $('#mediaModal').modal('show');
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
                <p class="card-text title">${media.first_name} ${media.last_name}</p>
                <p class="card-text title">${media.email}</p>
                <p class="card-text timestamp" style="margin-bottom: 20%;">${media.upload_datetime}&nbsp;</p>
                <br>
                <br>
            `;
        } else if (media.media_type.startsWith('video')) {
            mediaElement.innerHTML = `
                <a class="video-link" href="${mediaUrl}" data-mfp-src="${mediaUrl}">
                    <img src="data:image/jpeg;base64,${videoThumbnail}" alt="${media.mediatitle}" class="img-thumbnail" style="max-width: 100%; max-height: 100%; cursor: pointer;" data-video="${mediaUrl}">
                    <i class="fas fa-play-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: #007bff; cursor: pointer;"></i>
                    <i class="fas fa-times cross-icon" style="cursor: pointer;"></i>
                    <p class="card-text title" color="black">${media.mediatitle}</p> <!-- This is where the title is -->
                    <p class="card-text title">${media.first_name} ${media.last_name}</p>
                    <p class="card-text title">${media.email}</p>
                    <p class="card-text timestamp" style="margin-bottom: 20%;">${media.upload_datetime}</p>
                    <br>
                    <br>
                `;


        }

        $('.video-link').magnificPopup({
            type: 'iframe', // This specifies that it's an iframe (video)
            iframe: {
                patterns: {
                    youtube: {
                        index: 'youtube.com/', // YouTube videos
                        src: mediaUrl // Use the video URL here
                    }
                    // Add more patterns for other video platforms if needed
                }
            }
        });

        previewContainer.appendChild(mediaElement);

        const crossIcon = mediaElement.querySelector('.cross-icon');
        crossIcon.addEventListener('click', function () {
            event.preventDefault(); // Prevent any default actions
            event.stopPropagation();
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
            url: '/deletemediaadmin',
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
                previewItem.style.marginTop = '13%';

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

                 // Create the label for the title input
                const titleInputLabel = document.createElement('label');
                titleInputLabel.textContent = 'Title:';

                // Create the email dropdown
                const emailDropdown = document.createElement('select');
                emailDropdown.className = 'form-control';
                emailDropdown.id = 'user_id'; // Set the id to match your form
                emailDropdown.name = 'user_id'; // Set the name to match your form
                emailDropdown.required = true;

                // Create the default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select an email';
                defaultOption.selected = true;
                emailDropdown.appendChild(defaultOption);

                // Fetch and populate the email options dynamically
                $.ajax({
                    url: '/getUsersListformedia',
                    method: 'GET',
                    success: function (response) {
                        console.log(response);
                        if (response.users_list && response.users_list.length > 0) {
                            response.users_list.forEach(function (users) { // Use 'user' instead of 'users_list'
                                // Create an option element for each user
                                const option = document.createElement('option');
                                option.value = users.user_id; // Use the user_id as the value
                                option.textContent = users.email; // Use the email as the display text
                                option.style.color = 'black';
                                emailDropdown.appendChild(option);
                            });
                        } else {
                            console.error('No users with emails found.');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error(error);
                    }
                });



                // Create the label for the email dropdown
                const emailLabel = document.createElement('label');
                emailLabel.textContent = 'Email:';
                emailLabel.htmlFor = 'user_id';

               // Create the timestamp input field (editable)
                const timestampInput = document.createElement('input');
                timestampInput.type = 'datetime-local';
                timestampInput.id = 'upload-datetime';
                timestampInput.className = 'form-control timestamp-input';
                timestampInput.contentEditable = 'true'; // Make it editable

                // Create the label for the timestamp input
                const timestampLabel = document.createElement('label');
                timestampLabel.textContent = 'Timestamp:';
                timestampLabel.htmlFor = 'timestamp-input';


                // Create the cross icon for removing the item
                const crossIcon = document.createElement('i');
                crossIcon.className = 'fas fa-times cross-icon';
                crossIcon.addEventListener('click', function () {
                    previewContainer.removeChild(previewItem);
                });


                // Add the elements to the preview item
                previewItem.appendChild(mediaElement);
                previewItem.appendChild(titleInputLabel);
                previewItem.appendChild(mediaTitleInput);
                previewItem.appendChild(emailLabel);
                previewItem.appendChild(emailDropdown);
                previewItem.appendChild(timestampLabel);
                previewItem.appendChild(timestampInput);
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
        url: '/getmediaforadmin',
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
                const elements = document.getElementsByClassName("record");
                while(elements.length > 0){
                    elements[0].parentNode.removeChild(elements[0]);
                }
                photoCanvas.width = videoElement.videoWidth;
                photoCanvas.height = videoElement.videoHeight;
                // Clear the canvas before capturing
                photoCanvas.getContext('2d').clearRect(0, 0, photoCanvas.width, photoCanvas.height);
                if (cameraStream) {
                    isCapturingImage = true;
                    toggleCanvasVisibility(isCapturingImage);
                    photoCanvas.getContext('2d').drawImage(videoElement, 0, 0);
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
                const elements = document.getElementsByClassName("record");
                while(elements.length > 0){
                    elements[0].parentNode.removeChild(elements[0]);
                }
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
                        // videoCanvas.getContext('2d').drawImage(videoElement, 340, 640);
                        videoElement.style.display = "none";
                        downloadVideoLink.href = videoLocalURL;
                        capturedVideoDataURL = videoLocalURL;
                        addMediaToPreviewContainerRecord(capturedVideoDataURL, 'video');
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


                    // videoCanvas.getContext('2d').drawImage(videoElement, 340, 640);
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
                const elements = document.getElementsByClassName("record");
                while(elements.length > 0){
                    elements[0].parentNode.removeChild(elements[0]);
                }
            });



            // Event listener for clicking the "Save" button
            saveMediaButton.addEventListener('click', function () {
                if (photoCanvas.style.display === 'block') {

                    const imageDataURL = photoCanvas.toDataURL('image/jpeg');
                    addMediaToPreviewContainer(imageDataURL, 'image');
                } else if (videoCanvas.style.display === 'block') {
                    // const videoDataURL = videoCanvas.toDataURL('video/webm');
                    // console.log(videoDataURL,'videoDataURL')
                    // console.log(videoDataURL,'videoDataURL')
                    addMediaToPreviewContainer(capturedVideoDataURL, 'video');
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


            function addMediaToPreviewContainerRecord(dataURL, mediaType) {
                const previewContainer = document.getElementById('preview-record');
                const previewItem = document.createElement('div');
                previewItem.className = 'col-md-12 mb-3 record';

                const mediaElement = mediaType.startsWith('image')
                    ? document.createElement('img')
                    : document.createElement('video');

                mediaElement.controls = true;
                mediaElement.src = dataURL;



                previewItem.appendChild(mediaElement);

                previewContainer.appendChild(previewItem);
            }
            // Function to add media to the preview container
            function addMediaToPreviewContainer(dataURL, mediaType) {
                const previewContainer = document.getElementById('preview-container');
                const previewItem = document.createElement('div');
                previewItem.className = 'col-md-4 mb-3 preview-item';
                previewItem.style.marginTop = '13%';

                const mediaElement = mediaType.startsWith('image')
                    ? document.createElement('img')
                    : document.createElement('video');

                mediaElement.controls = true;
                mediaElement.src = dataURL;

                const mediaTitleInput = document.createElement('input');
                mediaTitleInput.type = 'text';
                mediaTitleInput.className = 'form-control media-title-input';
                mediaTitleInput.placeholder = 'Enter media title';

                 // Create the label for the title input
                const titleInputLabel = document.createElement('label');
                titleInputLabel.textContent = 'Title:';

                // Create the email dropdown
                const emailDropdown = document.createElement('select');
                emailDropdown.className = 'form-control';
                emailDropdown.id = 'user_id'; // Set the id to match your form
                emailDropdown.name = 'user_id'; // Set the name to match your form
                emailDropdown.required = true;

                // Create the default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select an email';
                defaultOption.selected = true;
                emailDropdown.appendChild(defaultOption);

                // Fetch and populate the email options dynamically
                $.ajax({
                    url: '/getUsersListformedia',
                    method: 'GET',
                    success: function (response) {
                        console.log(response);
                        if (response.users_list && response.users_list.length > 0) {
                            response.users_list.forEach(function (users) { // Use 'user' instead of 'users_list'
                                // Create an option element for each user
                                const option = document.createElement('option');
                                option.value = users.user_id; // Use the user_id as the value
                                option.textContent = users.email; // Use the email as the display text
                                option.style.color = 'black';
                                emailDropdown.appendChild(option);
                            });
                        } else {
                            console.error('No users with emails found.');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error(error);
                    }
                });

                // Create the label for the email dropdown
                const emailLabel = document.createElement('label');
                emailLabel.textContent = 'Email:';
                emailLabel.htmlFor = 'user_id';

               // Create the timestamp input field (editable)
                const timestampInput = document.createElement('input');
                timestampInput.type = 'datetime-local';
                timestampInput.id = 'upload-datetime';
                timestampInput.className = 'form-control timestamp-input';
                timestampInput.contentEditable = 'true'; // Make it editable

                // Create the label for the timestamp input
                const timestampLabel = document.createElement('label');
                timestampLabel.textContent = 'Timestamp:';
                timestampLabel.htmlFor = 'timestamp-input';

                const crossIcon = document.createElement('i');
                crossIcon.className = 'fas fa-times cross-icon';

                crossIcon.addEventListener('click', function (event) {
                    if (event.target.classList.contains('cross-icon')) {
                        // Get the parent element of the crossIcon
                        const parentElement = event.target.parentElement;

                        // Check if the parent element exists
                        if (parentElement) {
                            // Remove the parent element
                            parentElement.remove();
                        }
                    }
                });

                previewItem.appendChild(mediaElement);
                previewItem.appendChild(titleInputLabel);
                previewItem.appendChild(mediaTitleInput);
                previewItem.appendChild(emailLabel);
                previewItem.appendChild(emailDropdown);
                previewItem.appendChild(timestampLabel);
                previewItem.appendChild(timestampInput);
                previewItem.appendChild(crossIcon);
                previewContainer.appendChild(previewItem);

            }


            // Add an event listener to the "Save" button
            $('#submit').click(function (event) {
                event.preventDefault();

                $('#submit').prop('disabled', true);
                // Get the media title input value
                const selectedDatetime = $('#upload-datetime').val();
                const mediaTitle = $('.media-title-input').val();
                const selectedUserId = $('#user_id').val();
                const formData = new FormData();
                // Check if mediaTitle is not empty
                if (mediaTitle) {
                    formData.append('upload_datetime', selectedDatetime);
                    formData.append('mediaTitle', mediaTitle); // Include the mediaTitle
                    if (selectedUserId) {
                        formData.append('user_id', selectedUserId); // Include the user_id in the FormData
                    } else {
                        // Handle the case where no user is selected
                        console.error('No user selected.');
                    }

                    if (capturedImageDataURL) {
                        var requestData = JSON.stringify({ photo: capturedImageDataURL,title: mediaTitle});
                        $.ajax({
                            url: '/capture_photo',
                            method: 'POST',
                            data: requestData,
                            processData: false,
                            contentType: 'application/json',
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
                                                <p class="user-id">User ID: ${media.user_id}</p>
                                                <p class="timestamp">${media.upload_datetime}</p>
                                            `;
                                        } else if (media.media_type.startsWith('video')) {
                                            mediaElement.innerHTML = `
                                                <video controls src="${mediaUrl}" class="video-thumbnail" ></video>
                                                <p class="media-title">${media.mediatitle}</p>
                                                <p class="user-id">User ID: ${media.user_id}</p>
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

                    }

                    // Check if there's captured video data and append it
                    if (capturedVideoDataURL) {
                        console.log(capturedVideoDataURL,'capturedVideoDataURL')
                        // formData.append('video', capturedVideoDataURL);
                        fetch(capturedVideoDataURL)
                        .then(response => response.blob())
                        .then(blob => {

                            formData.append('video', blob, 'captured_video.webm'); // 'video' is the field name

                        $.ajax({
                            url: '/capture_video',
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
                                                <p class="user-id">User ID: ${media.user_id}</p>
                                                <p class="timestamp">${media.upload_datetime}</p>
                                            `;
                                        } else if (media.media_type.startsWith('video')) {
                                            mediaElement.innerHTML = `
                                                <video controls src="${mediaUrl}" class="video-thumbnail" ></video>
                                                <p class="media-title">${media.mediatitle}</p>
                                                <p class="user-id">User ID: ${media.user_id}</p>
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
                    });
                    }

                    // Check if a file is selected in the "file-input" field and append it
                    const fileInput = $('#file-input')[0];

                    if (fileInput.files.length > 0) {
                        console.log(fileInput.files[0])
                        formData.append('file', fileInput.files[0]);
                        $.ajax({
                            url: '/insertmediaforadmin',
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
                                                <p class="user-id">User ID: ${media.user_id}</p>
                                                <p class="timestamp">${media.upload_datetime}</p>
                                            `;
                                        } else if (media.media_type.startsWith('video')) {
                                            mediaElement.innerHTML = `
                                                <video controls src="${mediaUrl}" class="video-thumbnail" ></video>
                                                <p class="media-title">${media.mediatitle}</p>
                                                <p class="user-id">User ID: ${media.user_id}</p>
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
                    }


                    // Perform your AJAX request using formData

                } else {
                    // Handle the case when mediaTitle is empty
                    alert('Please enter a media title.');
                    $('#submit').prop('disabled', false);
                }
            });

        });