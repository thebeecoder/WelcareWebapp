$('#reportrange').on('DOMSubtreeModified', function () {
    if ($('#reportrange span').text() != '') {
        getDiaries();
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

$('#addNewDiary').click(function(){
    const date = new Date();
    $('#visit_date').val(date.toISOString().slice(0, 16))

    $('#submitButton').text('Add diary')
    $('#addNewDiaryModal').modal('show')
})

$('.closeModal').click(function(){
    $('#addNewDiaryModal').modal('hide')
})

var allDiaries = '';
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
                allDiaries = response.diary_records;
                response.diary_records.forEach(element => {
                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${element[1]} ${element[2]}</td>
                            <td>${element[3]}</td>
                            <td>${element[4]}</td>
                            <td>
                                <span class="text-primary" style="cursor: pointer;" onclick="editNote(${element[0]})"><i class="fas fa-edit"></i></span>
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

function editNote(redordID) {
    var result = allDiaries.find(function (item) {
        return item[0] == redordID;
    });

    $('#record_id').val(result[0]);
    $('#userr_id').val(result[5]);
    var parsedDate = new Date(result[4]);
    $('#visit_date').val(parsedDate.toISOString().slice(0, 16));

    $('#submitButton').text('Update diary');
    $('#addNewDiaryModal').modal('show');
}


$('#submitButton').click(function(){
    if($(this).text() == 'Update diary'){
        $.ajax({
            url: '/updateDiary',
            method: 'POST',
            data: $('#noteForm').serialize(),
            success: function(response) {
                if(response.message == 'Success'){
                    getDiaries();
                }
                else{
                    alert('An error occured.')
                }
                $('#addNewDiaryModal').modal('hide');
            }
        })
    }
    else{
        $.ajax({
            url: '/addNewDiary',
            method: 'POST',
            data: $('#noteForm').serialize(),
            success: function(response) {
                if(response.message == 'Success'){
                    getDiaries();
                }
                else{
                    alert('An error occured.')
                }
                $('#addNewDiaryModal').modal('hide');
            }
        })
    }
})

$('.closeModal').click(function(){
    $('#addNewDiaryModal').modal('hide');
});