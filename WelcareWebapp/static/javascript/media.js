document.getElementById('file-input').addEventListener('change', function (event) {
    const previewContainer = document.getElementById('preview-container');

    for (const file of event.target.files) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'col-md-4 mb-3 preview-item';

            const mediaElement = file.type.includes('image')
                ? `<img src="${e.target.result}" alt="Image">`
                : `<video controls><source src="${e.target.result}" type="${file.type}"></video>`;

            previewItem.innerHTML = `
                ${mediaElement}
                <i class="fas fa-times cross-icon"></i>
                <p class="card-text timestamp">${new Date().toLocaleString()}</p>
            `;

            previewContainer.appendChild(previewItem);

            const crossIcon = previewItem.querySelector('.cross-icon');
            crossIcon.addEventListener('click', function () {
                previewContainer.removeChild(previewItem);
            });
        };

        reader.readAsDataURL(file);
    }
});