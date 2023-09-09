$('#reportrange').on('DOMSubtreeModified', function () {
    if ($('#reportrange span').text() != '') {
        getAttendance();
    }
});

$.ajax({
    url: '/getUsersList',
    method: 'GET',
    success: function(response) {
        response.users_list.forEach(element => {
            $('#user_id').append(`<option value="${element[0]}">${element[2]}</option>`);
        });
    }
});

var allAttendance = '';
function getAttendance(){
    $.ajax({
        url: '/getAttendanceForAdmin',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function(response) {
            $('.record-table tbody').empty();
            if(response.welcare_attendance.length > 0){
                var counter = 1;
                allAttendance = response.welcare_attendance;
                response.welcare_attendance.forEach(element => {
                    var mediaElement;

                    // Check if element.media_path exists and is a string
                    if (typeof element.media_path === 'string') {
                        if (element.media_path.endsWith(".mp4")) {
                            // If it's an mp4 video file, display it using a video tag
                            mediaElement = `<video controls class="video-preview"><source src="/static/attendance/${element.media_path}" type="video/mp4"></video>`;
                        } else {
                            // For other file types, display a message indicating the unsupported media type
                            mediaElement = `<p class="text-danger">Unsupported media type: ${element.media_path}</p>`;
                        }
                    } else {
                        // Handle the case where element.media_path is not a string
                        mediaElement = `<p class="text-danger">Invalid media path</p>`;
                    }

                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${element[1]} ${element[2]}</td>
                            <td>${element[3]}</td> <!-- Display date time -->
                            <td>${element[4]}</td> <!-- Display title -->
                            <td>${element[5]}</td> <!-- Display title -->
                            <td>
                                <video controls class="video-preview" style="width: 90px; border-radius: 10px;">
                                    <source src="/static/attendance/${element[6]}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </td>
                        </tr>
                    `);
                    counter++;
                });

                $('.record-table').removeClass('d-none');
                $('#attendance-records-body').html('');
            }
            else{
                $('.record-table').addClass('d-none');
                $('#attendance-records-body').html('<p class="text-muted">No records available.</p>');
            }
            // $('#attendance-records-body').html(response);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}

// Add a click event handler to all video elements with the class "video-preview"
$('.video-preview').click(function () {
    var videoSource = $(this).find('source').attr('src'); // Get the video source URL
    $('#video-player').attr('src', videoSource); // Set the source of the video player
    $('.popup').show(); // Show the popup
});

// Add a click event handler to close the video popup
$('.popup').click(function () {
    $('#video-player').attr('src', ''); // Clear the source of the video player
    $('.popup').hide(); // Hide the popup
});
