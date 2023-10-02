const videoItems = document.querySelectorAll('.video-item');
const popup = document.querySelector('.popup');
const videoPlayer = document.getElementById('video-player');

videoItems.forEach(item => {
    item.addEventListener('click', function () {
        const videoUrl = item.querySelector('img').getAttribute('data-video');
        videoPlayer.src = videoUrl;
        popup.style.display = 'flex';
        videoPlayer.play();
    });
});

popup.addEventListener('click', function (e) {
    if (e.target === popup) {
        videoPlayer.pause();
        videoPlayer.src = '';
        popup.style.display = 'none';
    }
});

$('#reportrange').on('DOMSubtreeModified', function(){
    if($('#reportrange span').text() != ''){
        updateAttendanceRecords();
    }
})

function updateAttendanceRecords() {
    $.ajax({
        url: '/recordset', // Change this URL as needed
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function(response) {
            if (response && response.attendance_records && response.video_data) {
                $('.gallery').empty(); // Clear existing content
                if (response.attendance_records.length === 0) {
                    $('.gallery').append('<div id="attendance-records-body" class="text-muted">No records available for the selected date range.</div>');
                }
                else
                {
                    response.attendance_records.forEach && response.video_data.forEach(record => {
                        const videoItem = `
                            <div class="video-item">
                                <a class="video-link" href="${record.video_url}" data-mfp-src="${record.video_url}">
                                    <img src="data:image/jpeg;base64,${record.thumbnail_data}" alt="Attendance Thumbnail" data-video="${record.video_url}">
                                    <div class="video-title">${record.videotitle}</div>
                                    <small>Uploaded on <b>${record.attendance_datetime}</b></small>
                                </a>
                            </div>
                        `;
                        $('.gallery').append(videoItem);
                    });

                    $('.video-link').magnificPopup({
                        type: 'iframe' // Assuming you want to open videos in an iframe
                    });
                }
            }
            else {
                console.error("Invalid response data:", response);
            }
        },
        error: function(xhr, status, error) {
            console.error("AJAX error:", error);
        }
    });
}