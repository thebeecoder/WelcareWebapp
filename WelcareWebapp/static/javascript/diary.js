$('#reportrange').on('DOMSubtreeModified', function(){
    if($('#reportrange span').text() != ''){
        updateDiaryRecords();
    }
})

function updateDiaryRecords() {
    $.ajax({
        url: '/get-records',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function(response) {
            console.log(response)
            // $('#diary-records-body').html(response);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}