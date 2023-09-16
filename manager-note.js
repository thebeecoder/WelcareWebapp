$('#reportrange').on('DOMSubtreeModified', function () {
    if ($('#reportrange span').text() != '') {
        getAllNotes();
    }
});

$('#addNewUser').click(function(){
    $('#submitButton').text('Create profile')
    $('#addNewUserModal').modal('show')
})

$('.closeModal').click(function(){
    $('#addNewUserModal').modal('hide')
})

function getAllNotes() {
    $.ajax({
        url: '/getNotesForAdmin',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function (response) {
            console.log(response);
            $('.record-table tbody').empty();

            if (response.notes.length > 0) {
                var counter = 1;

                response.notes.forEach(note => {
                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${note.title}</td>
                            <td>${note.content}</td>
                            <td>${note.note_date}</td>
                            <td>${note.note_id}</td>
                            <td>
                                <span class="text-primary" style="cursor: pointer;" onclick="editAccount(${note.note_id})"><i class="fas fa-edit"></i></span>
                                &nbsp;
                                <span class="text-danger" style="cursor: pointer;" onclick="deleteAccount(${note.note_id})"><i class="fas fa-trash"></i></span>
                            </td>
                        </tr>
                    `);
                    counter++;
                });

                $('.record-table').removeClass('d-none');
                $('#manage-notes-body').html('');
            } else {
                $('.record-table').addClass('d-none');
                $('#manage-notes-body').html('<p class="text-muted">No record available.</p>');
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}


function editAccount(userID){
    $.ajax({
        url: '/getUserDetails',
        method: 'GET',
        data: {'userID': userID},
        success: function(response) {
            console.log(response)
            $('#submitButton').text('Update profile')
        }
    })
}

function deleteAccount(userID){
    if(confirm("Are you sure you want to delete this account?")){
        $.ajax({
            url: '/deleteUser',
            method: 'GET',
            data: {'userID': userID},
            success: function(response) {
                console.log(response)
                if(response.message == 'Success'){
                    getAllNotes();
                }
                else{
                    alert('An error occured.')
                }
            }
        })
    }
}