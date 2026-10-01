document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.getElementById("navbar");

    window.addEventListener("scroll", function () {
        if (window.scrollY > 0) {
            navbar.classList.add("shadow-md");
        } else {
            navbar.classList.remove("shadow-md");
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
        if (link.classList.contains("active")) {
            link.classList.add("text-primary");
        } else {
            link.classList.remove("text-primary");
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    var menuButtons = document.querySelectorAll(".menu-button");
    var menus = document.querySelectorAll(".menu");
    var menuIcons = document.querySelectorAll(".menu-icon");
    var menuIconPaths = document.querySelectorAll(".menu-icon-path");

    menuButtons.forEach(function (button, index) {
        button.addEventListener("click", function () {
            var menu = menus[index];
            var menuIconPath = menuIconPaths[index];

            menu.classList.toggle("hidden");
            if (menu.classList.contains("hidden")) {
                menuIconPath.setAttribute("d", "M4 6h16M4 12h16m-7 6h7");
            } else {
                menuIconPath.setAttribute("d", "M6 18L18 6M6 6l12 12");
            }
        });
    });
});
document.addEventListener("scroll", function () {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 0) {
        navbar.classList.add("shadow");
    } else {
        navbar.classList.remove("shadow");
    }
});



$('.meet-slider').slick({
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: '<div class="slick-prev flex z-[2] justify-center min-w-10 lg:min-w-11 max-w-10 lg:max-w-11 min-h-10 lg:min-h-11 items-center max-h-10 lg:max-h-11 w-full h-full rounded-full bg-primary transition-all duration-300"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.7977 18.7565C11.2614 18.2927 11.2614 17.5409 10.7977 17.0772L3.72079 10.0002L10.7977 2.92318C11.2614 2.45944 11.2614 1.70755 10.7977 1.2438C10.334 0.78006 9.58207 0.78006 9.11837 1.2438L1.2017 9.16052C0.978929 9.38313 0.853846 9.68523 0.853846 10.0002C0.853846 10.3151 0.978929 10.6172 1.2017 10.8398L9.11837 18.7565C9.58207 19.2202 10.334 19.2202 10.7977 18.7565Z"/></svg></div>',
    nextArrow: '<div class="slick-next flex z-[2] justify-center min-w-10 lg:min-w-11 max-w-10 lg:max-w-11 min-h-10 lg:min-h-11 items-center max-h-10 lg:max-h-11 w-full h-full rounded-full bg-primary transition-all duration-300"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 20" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.20132 18.7565C0.73758 18.2927 0.73758 17.5409 1.20132 17.0772L8.27824 10.0002L1.20132 2.92318C0.73758 2.45944 0.73758 1.70755 1.20132 1.2438C1.66507 0.78006 2.41696 0.78006 2.88065 1.2438L10.7973 9.16052C11.0201 9.38313 11.1452 9.68523 11.1452 10.0002C11.1452 10.3151 11.0201 10.6172 10.7973 10.8398L2.88065 18.7565C2.41696 19.2202 1.66507 19.2202 1.20132 18.7565Z"/></svg></div>',
    responsive: [

        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                arrows: false,
            }
        },
    ]
});
$('.business-slider').slick({
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    centerMode: true,
    centerPadding: "0px",
    prevArrow: '<div class="slick-prev flex z-[2] justify-center min-w-10 lg:min-w-[46px] max-w-10 lg:max-w-[46px] min-h-10 lg:min-h-[46px] items-center max-h-10 lg:max-h-[46px] w-full h-full rounded-full bg-primary !border border-white hover:border-primary transition-all duration-300 items-center"><svg xmlns="http://www.w3.org/2000/svg" width="31" height="32" viewBox="0 0 31 32" fill="none"><path d="M7.8335 16H23.1668" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.4335 20.6001L7.8335 16.0001L12.4335 11.4001" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
    nextArrow: '<div class="slick-next flex z-[2] justify-center min-w-10 lg:min-w-[46px] max-w-10 lg:max-w-[46px] min-h-10 lg:min-h-[46px] items-center max-h-10 lg:max-h-[46px] w-full h-full rounded-full bg-primary !border border-white hover:border-primary transition-all duration-300 items-center"><svg xmlns="http://www.w3.org/2000/svg" width="31" height="32" viewBox="0 0 31 32" fill="none"><path d="M23.1665 16H7.83317" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5665 20.6001L23.1665 16.0001L18.5665 11.4001" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
    responsive: [
        {
            breakpoint: 1024,

            settings: {
                slidesToShow: 2,
            }
        },
        {
            breakpoint: 768,
            settings: {
                arrows: false,
                slidesToShow: 1,
                dots: true,
            }
        },
        {
            breakpoint: 640,
            settings: {
                arrows: false,
                slidesToShow: 1,
                dots: true
            }
        }
    ]
});
$('.action-slider').slick({
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
        {
            breakpoint: 1536,
            settings: {
                dots: true,
                slidesToShow: 4,
            }
        },
        {
            breakpoint: 1280,
            settings: {
                dots: true,
                slidesToShow: 3,
            }
        },
        {
            breakpoint: 1024,
            settings: {
                dots: true,
                slidesToShow: 2,
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 1,
                dots: true
            }
        }
    ]
});

$(document).ready(function () {
    var sections = $("section[id]"); // Select all sections with an ID
    var navLinks = $("a.nav-link");

    // Scroll to section on page load if hash exists
    var hash = window.location.hash;
    if (hash && $(hash).length) {
        $("html, body").animate(
            {
                scrollTop: $(hash).offset().top - 100,
            },
            800
        );
    } else {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    }

    // Smooth scrolling on nav link click
    navLinks.on("click", function (event) {
        var href = $(this).attr("href");

        if (href.startsWith("#")) {
            event.preventDefault();
            var target = $(href);

            if (target.length) {
                $("html, body").animate(
                    {
                        scrollTop: target.offset().top - 100,
                    },
                    800
                );

                history.pushState(null, null, href);
                updateActiveNav($(this));
            }
        }
    });

    // Update active nav on scroll
    $(window).on("scroll", function () {
        if (window.location.pathname != '/faqs') {
            var scrollPosition = $(window).scrollTop();

            let activeSection = "home"; // Default to Home

            sections.each(function () {
                var sectionTop = $(this).offset().top - 150; // Adjust for better accuracy
                var sectionId = $(this).attr("id");

                if (scrollPosition >= sectionTop) {
                    activeSection = sectionId;
                }
            });

            updateActiveNav($(`a[href='#${activeSection}']`));
        }
    });

    function updateActiveNav(activeLink) {
        navLinks.removeClass("active text-primary").addClass("text-black");

        if (activeLink.length && activeLink.attr("href") !== "{{ route('faqs') }}") {
            activeLink.addClass("active text-primary").removeClass("text-black");
        } else {
            $("a[href='#home']").addClass("active text-primary").removeClass("text-black"); // Keep Home active as default
        }
    }


    $('.tab-button:first').addClass('active');
    $('.tab-panel:first').removeClass('hidden');
    $('.tab-button').on('click', function () {
        const tabId = $(this).data('tab');
        $('.tab-button').removeClass('active');
        $('.tab-panel').addClass('hidden');
        $(this).addClass('active');
        $('#' + tabId).removeClass('hidden');
    });

    $('.accordion-header').on('click', function () {
        const content = $(this).next('.accordion-content');
        const iconImg = $(this).find('.icon img');
        const accordionItem = $(this).closest('.accordion-item');
        $('.accordion-content').not(content).slideUp();
        $('.accordion-item').not(accordionItem).removeClass('accordion-open');
        $('.accordion-header .icon img')
            .not(iconImg)
            .attr('src', '../assets/images/add-square-gray.png')
            .attr('alt', 'add icon');
        if (content.is(':visible')) {
            content.slideUp();
            accordionItem.removeClass('accordion-open');
            iconImg.attr('src', '../assets/images/add-square-gray.png').attr('alt', 'add icon');
        } else {
            content.slideDown();
            accordionItem.addClass('accordion-open');
            iconImg.attr('src', '../assets/images/minus-square-gray.png').attr('alt', 'minus icon');
        }
    });

    $("#contactForm").submit(function (e) {
        e.preventDefault();

        let formData = $(this).serialize();
        $(this).find(".error-msg").addClass("d-none").html("");
        $(this).find(".success-msg").addClass("d-none").html("");

        $.ajax({
            url: $(this).attr('action'),
            type: "POST",
            data: formData,
            beforeSend: function () {
                $("#contactSubmitBtn").text("Sending...").prop("disabled", true);
            },
            success: function (response) {
                if (response.success) {
                    $("#contactForm .success-msg").removeClass("d-none").text(response.message);
                    setTimeout(function () {
                        $("#contactForm .success-msg").addClass("d-none").text("");
                    }, 10000);
                    $("#contactForm")[0].reset();
                }
                $("#contactSubmitBtn").text("Send Message").prop("disabled", false);
            },
            error: function (xhr) {
                $("#contactForm .error-msg").removeClass("d-none").text(xhr.responseJSON.message);
                setTimeout(function () {
                    $("#contactForm .error-msg").addClass("d-none").text("");
                }, 10000);
                $("#contactSubmitBtn").text("Send Message").prop("disabled", false);
            },
        });
    });


    $(".pricing-slider").slick({
        autoplay: true,
        autoplaySpeed: 5000,
        dots: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        responsive: [{
            breakpoint: 1200,
            settings: {
                slidesToShow: 2,
                centerMode: true,
            },
        },
        {
            breakpoint: 991,
            settings: {
                slidesToShow: 1.7,
                centerMode: true,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
            },
        },
        ],
    });
});
