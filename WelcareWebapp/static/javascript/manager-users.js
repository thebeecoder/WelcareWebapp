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
            if(response.users_list.length > 0){
                var counter = 1;
                response.users_list.forEach(element => {
                    const profilePictureUrl = `/static/images/${element[6]}`;
                    $('.record-table tbody').append(`
                        <tr>
                            <th>${counter}</th>
                            <td>${element[2]}</td>
                            <td>${element[3]}</td>
                            <td>${element[1]}</td>
                            <td>${element[4]}</td>
                            <td>${element[5]}</td>
                            <td>
                                <img src="${profilePictureUrl}" draggable="false" style="width:90px; border-radius: 10px; cursor: pointer;" onclick="viewProfilePicture('${profilePictureUrl}')">
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

function viewProfilePicture(profilePictureUrl) {
    $('#largeProfilePicture').attr('src', profilePictureUrl);
    $('#profilePictureModal').modal('show');
}
$(document).ready(function () {
    // Add a click event listener to the close button within the modal
    $('.modal .close').on('click', function () {
        $(this).closest('.modal').modal('hide'); // Close the closest modal
    });
});


function editAccount(userID){
    $.ajax({
        url: '/getUserDetails',
        method: 'GET',
        data: {'userID': userID},
        success: function(response) {
            $('#user_id').val(response.user_details[0][0])
            $('#first_name').val(response.user_details[0][2])
            $('#last_name').val(response.user_details[0][3])
            $('#email').val(response.user_details[0][1])
            $('#password').val(response.user_details[0][4])
            $('#role').val(response.user_details[0][5])
            $('#profile_picture').val('')

            $('#addNewUserModal').modal('show')
            $('#submitButton').text('Update profile')
        }
    })
}

$('#submitButton').click(function(){
    if($(this).text() == 'Update profile'){
        console.log($('#userProfileForm').serialize());
        $.ajax({
            url: '/update_profile',
            method: 'POST',
            data: $('#userProfileForm').serialize(),
            success: function(response) {
                if(response.message == 'Success'){
                    getUsersList();
                }
                else{
                    alert(response.message)
                }
                $('#addNewUserModal').modal('hide')
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        })
    }
    else{
        $.ajax({
            url: '/createProfile',
            method: 'POST',
            data: $('#userProfileForm').serialize(),
            success: function(response) {
                if(response.message == 'Success'){
                    getUsersList();
                }
                else{
                    alert(response.message)
                }
                $('#addNewUserModal').modal('hide')
            }
        })
    }
})

// Event listener for profile picture input change
$('#profile_picture').on('change', function () {
    const fileInput = this;
    const profilePicturePreview = $('#profilePicturePreview');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Display the selected image in the preview
            profilePicturePreview.attr('src', e.target.result);
        };

        reader.readAsDataURL(fileInput.files[0]);
    } else {
        // No file selected or invalid file format, show the default profile picture
        profilePicturePreview.attr('src', '/static/images/default_profile_picture.jpg');
    }
});

// Function to clear the profile picture input and preview
function clearProfilePictureInput() {
    $('#profile_picture').val(null);
    $('#profilePicturePreview').attr('src', '/static/images/default_profile_picture.jpg');
}

// Clear the profile picture input and preview when the modal is closed
$('#addNewUserModal').on('hidden.bs.modal', function () {
    clearProfilePictureInput();
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
                    alert(response.message)
                }
            }
        })
    }
}