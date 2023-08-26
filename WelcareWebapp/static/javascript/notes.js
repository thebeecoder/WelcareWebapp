$('.text').css('display', 'none')

function toggle(btnID, textID){
    var elem = $(`#${btnID}`).text();
    if (elem == "Read more") {
        $(`#${btnID}`).text("Show less");
        $(`#${textID}`).slideDown();
    }
    else {
        $(`#${btnID}`).text("Read more");
        $(`#${textID}`).slideUp();
    }
}