$('#reportrange').on('DOMSubtreeModified', function(){
    if($('#reportrange span').text() != ''){
        updateDiaryRecords();
    }
})

function updateDiaryRecords() {
    $.ajax({
        url: '/getrecords',
        method: 'GET',
        data: {
            start_date: moment($('#reportrange span').text().split(' - ')[0], 'MMMM D, YYYY').format('YYYY-MM-DD'),
            end_date: moment($('#reportrange span').text().split(' - ')[1], 'MMMM D, YYYY').format('YYYY-MM-DD')
        },
        success: function(response) {
            $('.record-table tbody').empty()
            if(response.diary_records.length > 0){
                var counter = 1;
                response.diary_records.forEach(element => {
                    $('.record-table tbody').append(`
                        <tr>
                            <td>${counter}</td>
                            <td>${moment(element[0]).format('dddd, DD MMM, YYYY hh:mm A')}</td>
                        </tr>
                    `)
                    counter ++;
                });
                $('.record-table').removeClass('d-none')
                $('#diary-records-body').html('')
            }
            else{
                $('.record-table').addClass('d-none')
                $('#diary-records-body').html('<p class="text-muted">No records available for the selected date range.</p>')
            }
            console.log(response.diary_records)
            // $('#diary-records-body').html(response);
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}