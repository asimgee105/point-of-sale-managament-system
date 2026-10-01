"use strict";
window.addEventListener('load', function () {
    if (window.location.hash.startsWith('#/')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        location.reload();
    }
});

$(document).ready(function() {
    $('#languageDropdownButton').on('click', function() {
        $('#languageDropdownList').toggleClass('hidden');
    });
    $('.language-option').on('click', function() {
        var languageCode = $(this).attr('data-value');
        localStorage.setItem("updated_language", languageCode);
        $.ajax({
            type: "POST",
            url: "/change-language",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            data: {
                languageCode: languageCode
            },
            success: function() {
                location.reload();
            },
        });
    });

    $(document).on('click', function(event) {
        var target = $(event.target);
        if (!target.closest('#languageDropdownButton').length && !target.closest('#languageDropdownList').length) {
            $('#languageDropdownList').addClass('hidden');
        }
    });
});

