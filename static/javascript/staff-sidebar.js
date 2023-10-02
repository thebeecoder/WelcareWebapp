$('.sidebar').html(
`
    <div class="logo">
        <img src="../static/walcarelogo.png" alt="Logo" class="logo-img">
    </div>

    <a href="/staffprofile">
        <!--<img class="user-image" src="../static/images/blank-profile.jpg" draggable="false" alt="User Profile">-->
        <img class="user-image" src="${userData.profile_picture}" alt="User Profile">
    </a>
    <div class="user-name text-center">
        ${userData.first_name} ${userData.last_name}
    </div>
    <div class="mt-3 text-center">
        <a class="profile-status" href="/staffprofile">Edit</a>
    </div>

    <div class="modules-container">
        <div class="dashboard">
            <a href="/staff_dashboard">
                <div class="sidebar-icon">
                    <i class="fas fa-home"></i>
                </div>
                Dashboard
            </a>
        </div>
        <a href="/staff_diary">
            <div class="sidebar-icon">
                <i class="fas fa-book"></i>
            </div>
            Manage Diary
        </a>
        <a href="/staff_notes">
            <div class="sidebar-icon">
                <i class="fas fa-sticky-note"></i>
            </div>
            Manage Notes
        </a>
        <a href="/staff_media">
            <div class="sidebar-icon">
                <i class="fas fa-photo-video"></i>
            </div>
            Manage Media
        </a>
        <a href="/staff_attendance">
            <div class="sidebar-icon">
                <i class="fas fa-calendar-check"></i>
            </div>
            Manage Attendance
        </a>
    </div>
    <div class="logout-button">
        <a href="/logout"><i class="fas fa-sign-out-alt"></i>&nbsp;&nbsp;Logout</a>
    </div>
`
)