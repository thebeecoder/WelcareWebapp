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
        const videoThumbnail = media.thumbnail_base64;

        if (media.media_type.startsWith('image')) {
            mediaElement.innerHTML = `
                <img src="${mediaUrl}" alt="${media.mediatitle}" class="img-thumbnail" style="max-width: 100%; max-height: 100%; cursor: pointer;" onclick="openMediaInLargeView('${mediaUrl}')">
                <i class="fas fa-times cross-icon"></i>
                <p class="card-text title">${media.mediatitle}</p>
                <p class="card-text timestamp">${media.upload_datetime}</p>
            `;
        } else if (media.media_type.startsWith('video')) {

            mediaElement.innerHTML = `
                <a class="video-link" href="${mediaUrl}" data-mfp-src="${mediaUrl}">
                    <img src="data:image/jpeg;base64,${videoThumbnail}" alt="${media.mediatitle}" class="img-thumbnail" style="max-width: 100%; max-height: 100%; cursor: pointer;" data-video="${mediaUrl}" onclick="openMediaInLargeView('${mediaUrl}')">
                    <i class="fas fa-play-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: #007bff; cursor: pointer;"></i>
                <i class="fas fa-times cross-icon"></i>
                <p class="card-text title" color="black">${media.mediatitle}</p> <!-- This is where the title is -->
                <p class="card-text timestamp">${media.upload_datetime}</p>
            `;
        }

        previewContainer.appendChild(mediaElement);

        const crossIcon = mediaElement.querySelector('.cross-icon');
                crossIcon.addEventListener('click', function () {
                    $('#preview-container').remove(mediaElement);
               });
    });
}

// Add this script after including jQuery and Bootstrap
$(document).ready(function () {
    $('#selectMediaBtn').click(function () {
        $('#mediaSourceModal').modal('show');
    });

    // Close the modal when clicking the "Close" button or the cross icon
    $('#mediaSourceModal .close, #mediaSourceModal .btn-secondary').click(function () {
        $('#mediaSourceModal').modal('hide');
    });

    $('#uploadFromDeviceBtn').click(function () {
        $('#file-input').click();
    });

    $('#openCameraBtn').click(function () {
        openCamera();
        $('#mediaSourceModal .close, #mediaSourceModal .btn-secondary').click(function () {
        $('#mediaSourceModal').modal('hide');
        });
    });

    // Function to open the camera and display the stream
    function openCamera() {

        const videoElement = document.getElementById('cameraPreview');

        // Check if the browser supports the MediaDevices API
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function (stream) {
                    videoElement.srcObject = stream;
                    videoElement.style.display = 'block';
                })
                .catch(function (error) {
                    console.error('Error accessing the camera: ', error);
                });
        } else {
            console.error('getUserMedia is not supported in this browser.');
        }
    }
});




document.getElementById('file-input').addEventListener('change', function (event) {
    const previewContainer = document.getElementById('preview-container');

    for (const file of event.target.files) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'col-md-4 mb-3 preview-item';

            const mediaElement = file.type.includes('image')
                ? `<img src="${e.target.result}" alt="Image">`
                : `<video controls><source src="${e.target.result}" type="${file.type}"></video>`;

            previewItem.innerHTML = `
                ${mediaElement}
                <i class="fas fa-times cross-icon"></i>
                <p class="card-text timestamp">${new Date().toLocaleString()}</p>
            `;

            previewContainer.appendChild(previewItem);

            const crossIcon = previewItem.querySelector('.cross-icon');
            crossIcon.addEventListener('click', function () {
                previewContainer.removeChild(previewItem);
            });
        };

        reader.readAsDataURL(file);
    }
});

$('#reportrange').on('DOMSubtreeModified', function () {
    if ($('#reportrange span').text() !== '') {
        updateMediaRecords();
    }
});

// Call the populateMediaPreviews function with the media data from the response
populateMediaPreviews(response.media);


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
