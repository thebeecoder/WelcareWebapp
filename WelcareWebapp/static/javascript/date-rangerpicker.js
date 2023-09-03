$(function() {

    var start = moment().subtract(29, 'days');
    var end = moment();

    function cb(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()]
        },
        "apply.daterangepicker": function(ev, picker) {
            var start_date = picker.startDate.format('YYYY-MM-DD');
            var end_date = picker.endDate.format('YYYY-MM-DD');

            console.log(start_date, end_date);

            // Send AJAX request
            updateDiaryRecords(start_date, end_date);
            updateAttendanceRecords(start_date, end_date);
            updateNotesRecords(start_date, end_date);
        }
    }, cb);

    cb(start, end);
});