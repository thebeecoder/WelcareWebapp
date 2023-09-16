// Add this code to manage-users.js

// Event handler for clicking on a profile picture
$('.record-table').on('click', 'img.profile-picture', function () {
    var imageUrl = $(this).attr('src');
    $('#enlargedProfilePicture').attr('src', imageUrl);
    $('#profilePictureModal').modal('show');
});

// Event handler for closing the profile picture modal
$('#profilePictureModal').on('hidden.bs.modal', function () {
    $('#enlargedProfilePicture').attr('src', ''); // Clear the image source
});

$('#addNewUser').click(function(){
    $('#submitButton').text('Create profile');
    $('#addNewUserModal').modal('show');
});

$('.closeModal').click(function(){
    $('#addNewUserModal').modal('hide');
});

getUsersList();

function getUsersList(){
    $.ajax({
        url: '/getUsersList',
        method: 'GET',
        success: function(response) {
            $('.record-table tbody').empty();
            if(response.users_list.length > 0){
                var counter = 1;
                response.users_list.forEach(element => {
                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${element[2]}</td>
                            <td>${element[3]}</td>
                            <td>${element[1]}</td>
                            <td>${element[4]}</td>
                            <td>${element[5]}</td>
                            <td>
                                <img src="/static/images/${element[6]}" draggable="false" style="width:90px; border-radius: 10px;" class="profile-picture" data-toggle="modal" data-target="#profilePictureModal">
                            </td>
                            <td>
                                <span class="text-primary" style="cursor: pointer;" onclick="editAccount(${element[0]})"><i class="fas fa-edit"></i></span>
                                &nbsp; 
                                <span class="text-danger" style="cursor: pointer;" onclick="deleteAccount(${element[0]})"><i class="fas fa-trash"></i></span>
                            </td>
                        </tr>
                    `);
                    counter++;
                });
                $('.record-table').removeClass('d-none');
                $('#diary-records-body').html('');
            }
            else{
                $('.record-table').addClass('d-none');
                $('#diary-records-body').html('<p class="text-muted">No records available.</p>');
            }
        },
        error: function(xhr, status, error) {
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
            $('#user_id').val(response.user_details[0][0]);
            $('#first_name').val(response.user_details[0][2]);
            $('#last_name').val(response.user_details[0][3]);
            $('#email').val(response.user_details[0][1]);
            $('#password').val(response.user_details[0][4]);
            $('#role').val(response.user_details[0][5]);

            $('#addNewUserModal').modal('show');
            $('#submitButton').text('Update profile');
        }
    });
}

$('#submitButton').click(function(){
    if($(this).text() == 'Update profile'){
        console.log('Button clicked');
        $.ajax({
            url: '/update_profile',
            method: 'POST',
            data: new FormData($('#userProfileForm')[0]), // Use FormData to handle file upload
            contentType: false,
            processData: false,
            success: function(response) {
                if(response.message == 'Success'){
                    getUsersList();
                }
                else{
                    alert(response.message);
                }
                $('#addNewUserModal').modal('hide');
            }
        });
    }
    else{
        $.ajax({
            url: '/createProfile',
            method: 'POST',
            data: new FormData($('#userProfileForm')[0]), // Use FormData to handle file upload
            contentType: false,
            processData: false,
            success: function(response) {
                if(response.message == 'Success'){
                    getUsersList();
                }
                else{
                    alert(response.message);
                }
                $('#addNewUserModal').modal('hide');
            }
        });
    }
});

function deleteAccount(userID){
    if(confirm("Are you sure you want to delete this account? It will permanently delete all the data for this user.")){
        $.ajax({
            url: '/deleteUser',
            method: 'GET',
            data: {'userID': userID},
            success: function(response) {
                if(response.message == 'Success'){
                    getUsersList();
                }
                else{
                    alert(response.message);
                }
            }
        });
    }
}
