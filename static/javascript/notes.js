$('.text').css('display', 'none');

function toggle(btnID, textID) {
    var elem = $(`#${btnID}`).text();
    if (elem == "Read more") {
        showMore(btnID, textID);
    } else {
        showLess(btnID, textID);
    }
}

function showMore(btnID, textID) {
    $(`#${btnID}`).text("Show less");
    $(`#${textID}`).slideDown();
    $(`#${btnID}`).attr('data-state', 'expanded');
}

function showLess(btnID, textID) {
    $(`#${btnID}`).text("Read more");
    var truncatedContent = truncateText($(`#${textID}`).text(), 100); // Truncate the content
    $(`#${textID}`).text(truncatedContent); // Display the truncated content
    $(`#${btnID}`).attr('data-state', 'collapsed');
}

$('#reportrange').on('DOMSubtreeModified', function () {
    if ($('#reportrange span').text() != '') {
        updateNotesRecords();
    }
});

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
    }
    return text;
}

function updateNotesRecords() {
    $.ajax({
        url: '/getnotes',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function (response) {
            if ('notes' in response && response.notes.length > 0) {
            // Handle the response data here
                if ('notes' in response) {
                    var notesContainer = $('#notes-container');

                    // Clear existing content
                    notesContainer.empty();

                    // Iterate through the notes and populate them on the frontend
                    response.notes.forEach(function (note) {
                        var truncatedContent = truncateText(note.content, 100); // Display first 100 characters
                        var noteHtml = `
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col">
                                                <h5 class="mt-2">${note.title}</h5>
                                            </div>
                                            <div class="col-auto">
                                                <div class="mt-1">
                                                    <small>${note.note_date}</small>
                                                </div>
                                            </div>
                                        </div>
                                        <hr>
                                        <div class="row">
                                            <div class="col">
                                                <div class="note-content">
                                                    <span id="uniqueTextID-${note.note_id}" class="text">${truncatedContent}</span>
                                                    <span id="fullTextID-${note.note_id}" class="d-none">${note.content}</span>
                                                </div>
                                                <button class="btn btn-light mt-3 read-more" data-state="collapsed" id="${note.note_id}">Read more</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                        // Append the note HTML to the container
                        notesContainer.append(noteHtml);
                    });

                    // Add click event listeners to "Read more" buttons
                    $('.read-more').on('click', function () {
                        var contentElement = $(this).prev('.note-content').find('.text');
                        var fullTextElement = $(this).prev('.note-content').find('.d-none');
                        var currentState = $(this).attr('data-state');

                        if (currentState === 'collapsed') {
                            contentElement.text(fullTextElement.text());
                            showMore($(this).attr('id'), contentElement.attr('id'));
                        } else {
                            showLess($(this).attr('id'), contentElement.attr('id'));
                        }
                    });

                    // Initially hide the content
                    $('.note-content .text').each(function () {
                        var fullTextElement = $(this).next('.d-none');
                        $(this).text(truncateText(fullTextElement.text(), 100));
                    });

                    $('#no-records-message').empty();
                }
            }
            else
            {

                $('#notes-container').empty();
                $('#no-records-message').html('No records available for the selected date range.');
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
        }
    });
}
