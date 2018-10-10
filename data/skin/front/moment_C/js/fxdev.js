var stickyShopMenu = $('#mega-menu').offset().top;

$(window).scroll(function() {
    
    if ($(window).scrollTop() >= stickyShopMenu) {
        $('.top_red').addClass('fx_fixed_top');
    }
     else {
         $('.top_red').removeClass('fx_fixed_top');
    }
});

$(document).ready(function() {
    init(); 
    bindTopBanner();
    bindSideBar();
    $('[data-toggle="tooltip"]').tooltip();  
});

function init() {
    if (Cookies.get('right_sidebar') ===  'Y') {
        $("#fxSideBar").addClass('open');
        $('.fx_quick_btn .showbtn').addClass('off');
    } 
}

function bindSideBar() {
    $('.fx_quick_btn .showbtn').click(function() {
        $('.fx_quick_btn .showbtn').toggleClass('off');
        $('#fxSideBar').toggleClass('open');
        
        if($('#fxSideBar').hasClass('open')) {
            Cookies.set('right_sidebar', 'Y');
        } else {
            Cookies.set('right_sidebar', 'N');
        }
    });

    $('.fx_quick_btn .scroll_top').click(function() {
        $('html, body').animate({scrollTop: 0}, 500);
    });

    $('.fx_quick_btn .scroll_bottom').click(function() {
        $('html, body').animate({scrollTop: $('html, body').height()}, 500);
    });
}

function bindTopBanner() {
    $(".fx_topbanner_togglebtn").click(function() {
        $("#fxTopBanner").slideToggle();	
        $('.fx_topbanner_togglebtn').toggleClass('on');
        if ($('.fx_topbanner_togglebtn').hasClass('on')) {
            Cookies.set('top_banner', 'Y');        
        } else {
            Cookies.set('top_banner', 'N');
        }
        
    });
    
}