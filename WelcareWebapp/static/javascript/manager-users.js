$('#addNewUser').click(function(){
    $('#submitButton').text('Create profile')
    $('#addNewUserModal').modal('show')
})

$('.closeModal').click(function(){
    $('#addNewUserModal').modal('hide')
})

getUsersList();

function getUsersList(){
    $.ajax({
        url: '/getUsersList',
        method: 'GET',
        success: function(response) {
            $('.record-table tbody').empty()
            if(response.user_records.length > 0){
                var counter = 1;
                response.user_records.forEach(element => {
                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${element[2]}</td>
                            <td>${element[3]}</td>
                            <td>${element[1]}</td>
                            <td>${element[4]}</td>
                            <td>${element[5]}</td>
                            <td>
                                <img src="/static/images/${element[6]}" draggable="false" style="width:90px; border-radius: 10px;">
                            </td>
                            <td>
                                <span class="text-primary" style="cursor: pointer;" onclick="editAccount(${element[0]})"><i class="fas fa-edit"></i></span>
                                &nbsp; 
                                <span class="text-danger" style="cursor: pointer;" onclick="deleteAccount(${element[0]})"><i class="fas fa-trash"></i></span>
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
                $('#diary-records-body').html('<p class="text-muted">No records available.</p>')
            }
            // $('#diary-records-body').html(response);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    })
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
                    getUsersList();
                }
                else{
                    alert('An error occured.')
                }
            }
        })
    }
}