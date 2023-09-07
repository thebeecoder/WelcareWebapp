$('#reportrange').on('DOMSubtreeModified', function () {
    if ($('#reportrange span').text() != '') {
        getDiaries();
    }
});

$('#adddNewNote').click(function(){
    const date = new Date();
    $('#visit_date').val(date.toISOString().slice(0, 16))

    $('#submitButton').text('Add new note')
    $('#adddNewDiaryModal').modal('show')
})

$('.closeModal').click(function(){
    $('#adddNewDiaryModal').modal('hide')
})

getDiaries();

function getDiaries(){
    $.ajax({
        url: '/getrecordsforadmin',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function(response) {
            $('.record-table tbody').empty()
            if(response.diary_records.length > 0){
                var counter = 1;
                response.diary_records.forEach(element => {
                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${element[1]} ${element[2]}</td>
                            <td>${element[3]}</td>
                            <td>${element[4]}</td>
                            <td>
                                <span class="text-primary" style="cursor: pointer;" onclick="editNote(${element[0]})"><i class="fas fa-edit"></i></span>
                                &nbsp; 
                                <span class="text-danger" style="cursor: pointer;" onclick="deleteNote(${element[0]})"><i class="fas fa-trash"></i></span>
                            </td>
                        </tr>
                    `)
                    counter ++;
                });
                $('.record-table').removeClass('d-none')
                $('#diary-records-body').html('')
            }
            else{
                $('.record-table').addClass('d-none')
                $('#diary-records-body').html('<p class="text-muted">No record available.</p>')
            }
            // $('#diary-records-body').html(response);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
}
function editNote(email) {
    $.ajax({
        url: '/updateDiary',
        method: 'GET',
        data: {'recordID': redordID},
        success: function(response) {
            console.log(response.diary_records)
            $('#record_id').val(response.diary_records[0][0])
            $('#user_email').val(response.diary_records[0][1])

                $('#email').val(diaryRecord.email);
                $('#visit_date').val(diaryRecord.attended_datetime);

                $('#submitButton').text('Update Diary');
                $('#addNewDiaryModal').modal('show');
            }
        }
    });
}


function deleteNote(redordID){
    if(confirm("Are you sure you want to delete this diary?")){
        $.ajax({
            url: '/deleteDiary',
            method: 'GET',
            data: {'redordID': redordID},
            success: function(response) {
                if(response.message == 'Success'){
                    getDiaries();
                }
                else{
                    alert('An error occured.')
                }
            }
        })
    }
}

$('#submitButton').click(function(){
    if($(this).val() == 'Update Diary'){
        $.ajax({
            url: '/updateDiary,
            method: 'POST',
            data: $('noteForm').serialize(),
            success: function(response) {
                if(response.message == 'Success'){
                    getDiaries();
                }
                else{
                    alert('An error occured.')
                }
            }
        })
    }
    else{
        $.ajax({
            url: '/addNewDiary',
            method: 'POST',
            data: $('noteForm').serialize(),
            success: function(response) {
                if(response.message == 'Success'){
                    getDiaries();
                }
                else{
                    alert('An error occured.')
                }
            }
        })
    }
})