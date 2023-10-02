$('#reportrange').on('DOMSubtreeModified', function () {
    if ($('#reportrange span').text() != '') {
        getNotes();
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

$('#addNewNote').click(function(){
    const date = new Date();
    $('#note_date').val(date.toISOString().slice(0, 16))

    $('#submitButton').text('Add Note')
    $('#addNewNoteModal').modal('show')
})

$('.closeModal').click(function(){
    $('#addNewNoteModal').modal('hide')
})

var allNotes = '';
function getNotes(){
    $.ajax({
        url: '/getNotesForAdmin',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            order_by: 'desc'
        },
        success: function(response) {
            $('.record-table tbody').empty()
            if(response.notes.length > 0){
                var counter = 1;
                allNotes = response.notes;
                response.notes.forEach(element => {
                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${element[1]} ${element[2]}</td>
                            <td>${element[3]}</td>
                            <td>${element[4]}</td>
                            <td>${element[6]}</td>
                            <td>${element[5]}</td>
                            <td>
                                <span class="text-primary" style="cursor: pointer;" onclick="editNote(${element[0]})"><i class="fas fa-edit"></i></span>
                            </td>
                        </tr>
                    `)
                    counter ++;
                });
                $('.record-table').removeClass('d-none')
                $('#manage-notes-body').html('')
            }
            else{
                $('.record-table').addClass('d-none')
                $('#manage-notes-body').html('<p class="text-muted">No record available.</p>')
            }
            // $('#diary-records-body').html(response);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
}

function editNote(noteID) {
    var result = allNotes.find(function (item) {
        return item[0] == noteID;
    });

    $('#note_id').val(result[0]);
    $('#userr_id').val(result[7]);
    var parsedDate = new Date(result[5]);
    $('#note_date').val(parsedDate.toISOString().slice(0, 16));
    $('#Title').val(result[4]);
    $('#content').val(result[6]);

    $('#submitButton').text('Update Note');
    $('#addNewNoteModal').modal('show');
}

$('#submitButton').click(function(){
    if($(this).text() == 'Update Note'){
        $.ajax({
            url: '/updateNote',
            method: 'POST',
            data: $('#noteForm').serialize(),
            success: function(response) {
                if(response.message == 'Success'){
                    getNotes();
                }
                else{
                    alert('An error occured.')
                }
                $('#addNewNoteModal').modal('hide');
            }
        })
    }
    else{
        $.ajax({
            url: '/addNewNote',
            method: 'POST',
            data: $('#noteForm').serialize(),
            success: function(response) {
                if(response.message == 'Success'){
                    getNotes();
                }
                else{
                    alert('An error occured.')
                }
                $('#addNewNoteModal').modal('hide');
            }
        })
    }
})

$('.closeModal').click(function(){
    $('#addNewNoteModal').modal('hide');
});