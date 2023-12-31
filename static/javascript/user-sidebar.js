$('.sidebar').html(
`
    <div class="logo">
        <img src="../static/walcarelogo.png" alt="Logo" class="logo-img">
    </div>

    <a href="/profile">
        <!--<img class="user-image" src="../static/images/blank-profile.jpg" draggable="false" alt="User Profile">-->
        <img class="user-image" src="${userData.profile_picture}" alt="User Profile">
    </a>
    <div class="user-name text-center">
        ${userData.first_name} ${userData.last_name}
    </div>
    <div class="mt-3 text-center">
        <a class="profile-status" href="/profile">Edit</a>
    </div>

    <div class="modules-container">
        <div class="dashboard">
            <a href="/user_dashboard">
                <div class="sidebar-icon">
                    <i class="fas fa-home"></i>
                </div>
                Dashboard
            </a>
        </div>
        <a href="/diary">
            <div class="sidebar-icon">
                <i class="fas fa-book"></i>
            </div>
            Diary
        </a>
        <a href="/notes">
            <div class="sidebar-icon">
                <i class="fas fa-sticky-note"></i>
            </div>
            Notes
        </a>
        <a href="/media">
            <div class="sidebar-icon">
                <i class="fas fa-photo-video"></i>
            </div>
            Media
        </a>
        <a href="/attendance">
            <div class="sidebar-icon">
                <i class="fas fa-calendar-check"></i>
            </div>
            Attendance
        </a>
    </div>
    <div class="logout-button">
        <a href="/logout"><i class="fas fa-sign-out-alt"></i>&nbsp;&nbsp;Logout</a>
    </div>
`
)