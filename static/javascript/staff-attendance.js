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
            $('#userr_id').append(`<option value="${element[0]}">${element[1]}</option>`)
        });
    }
});

$('#addNewAttendance').click(function(){
    const date = new Date();
    $('#attendance_date').val(date.toISOString().slice(0, 16))

    $('#submitButton').text('Add Attendance')
    $('#addNewAttendanceModal').modal('show')
})

$('.closeModal').click(function(){
    $('#addNewAttendanceModal').modal('hide')
})

var allAttendance = '';
function getAttendance(){
    $.ajax({
        url: '/getattendanceforadmin',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function(response) {
            $('.record-table tbody').empty()
            if(response.welcare_attendance.length > 0){
                var counter = 1;
                allAttendance = response.welcare_attendance;
                response.welcare_attendance.forEach(element => {
                    const attendancepathUrl = `/static/attendance/${element[6]}`;
                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${element[1]} ${element[2]}</td>
                            <td>${element[3]}</td>
                            <td>${element[4]}</td>
                            <td>${element[5]}</td>
                            <td>
                                <video controls style="width: 90px; border-radius: 10px; cursor: pointer;" onclick="viewattendancepath('${attendancepathUrl}')">
                                    <source src="${attendancepathUrl}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </td>
                            <td>
                                <span class="text-primary" style="cursor: pointer;" onclick="editNote(${element[0]})"><i class="fas fa-edit"></i></span>
                            </td>
                        </tr>
                    `)
                    counter ++;
                });
                $('.record-table').removeClass('d-none')
                $('#attendance-records-body').html('')
            }
            else{
                $('.record-table').addClass('d-none')
                $('#attendance-records-body').html('<p class="text-muted">No record available.</p>')
            }
            // $('#diary-records-body').html(response);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
}

function viewattendancepath(attendancepathUrl) {
    $('#videoPlayer').attr('src', attendancepathUrl);
    $('#videoModal').modal('show');
}


function editNote(attendanceID) {
    var result = allAttendance.find(function (item) {
        return item[0] == attendanceID;
    });

    $('#attendance_id').val(result[0]);
    $('#userr_id').val(result[7]);
    var parsedDate = new Date(result[4]);
    $('#attendance_date').val(parsedDate.toISOString().slice(0, 16));
    $('#title').val(result[5]);
    $('#media_path').val('');
    const attendancepathUrl = `/static/attendance/${result[6]}`;
    $('#attendancepathPreview').attr('src', attendancepathUrl);

    $('#submitButton').text('Update attendance');
    $('#addNewAttendanceModal').modal('show');
}

$('#submitButton').click(function(){
    if($(this).text() == 'Update attendance'){
        console.log($('#noteForm').serialize());
        var formData = new FormData($('#noteForm')[0]);
        $.ajax({
            url: '/updateattendance',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if(response.message == 'Success'){
                    getAttendance();
                }
                else{
                    alert('An error occured.')
                }
                $('#addNewAttendanceModal').modal('hide');
                location.reload();
            },
            error: function (xhr, status, error) {
                console.error(xhr.status + ': ' + xhr.statusText); // Log any AJAX errors
                alert('AJAX request failed. Check the console for more details.');
            }
        })
    }
    else{
        console.log($('#noteForm').serialize());
        var formData = new FormData($('#noteForm')[0]);
        $.ajax({
            url: '/Addnewattendance',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if(response.message == 'Success'){
                    getAttendance();
                }
                else{
                    alert('An error occured.')
                }
                $('#addNewAttendanceModal').modal('hide');
                location.reload();
            },
            error: function (xhr, status, error) {
                console.error(xhr.status + ': ' + xhr.statusText); // Log any AJAX errors
                alert('AJAX request failed. Check the console for more details.');
            }
        })
    }
})

$('#media_path').on('change', function () {
    const fileInput = this;
    const attendancepathPreview = $('#attendancepathPreview');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Display the selected video in the preview
            attendancepathPreview.attr('src', e.target.result);
        };

        reader.readAsDataURL(fileInput.files[0]);
    } else {
        // No file selected or invalid file format, clear the video preview
        attendancepathPreview.attr('src', '');
    }
});

function clearAttendanceInput() {
    $('#media_path').val(null);
    $('#attendancepathPreview').attr('src');
}

// Clear the profile picture input and preview when the modal is closed
$('#addNewAttendanceModal').on('hidden.bs.modal', function () {
    clearAttendanceInput();
});



$('.closeModal').click(function(){
    $('#addNewAttendanceModal').modal('hide');
});