const videoItems = document.querySelectorAll('.video-item');
const popup = document.querySelector('.popup');
const videoPlayer = document.getElementById('video-player');

videoItems.forEach(item => {
    item.addEventListener('click', function () {
        const videoUrl = item.querySelector('img').getAttribute('data-video');
        videoPlayer.src = videoUrl;
        popup.style.display = 'flex';
        videoPlayer.play();
    });
});

popup.addEventListener('click', function (e) {
    if (e.target === popup) {
        videoPlayer.pause();
        videoPlayer.src = '';
        popup.style.display = 'none';
    }
});