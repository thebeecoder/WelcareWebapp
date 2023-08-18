document.addEventListener("DOMContentLoaded", function() {
    const inputElements = document.querySelectorAll(".form-control");
    inputElements.forEach(function(input) {
        input.addEventListener("focus", function() {
            input.parentElement.classList.add("focused");
        });

        input.addEventListener("blur", function() {
            if (input.value === "") {
                input.parentElement.classList.remove("focused");
            }
        });
    });
});