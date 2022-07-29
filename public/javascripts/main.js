AOS.init({
  duration: 800,
  easing: 'slide',
});
(function ($) {
  var isMobile = {
    Android() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows() {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any() {
      return (
        isMobile.Android()
        || isMobile.BlackBerry()
        || isMobile.iOS()
        || isMobile.Opera()
        || isMobile.Windows()
      );
    },
  };

  $(window).stellar({
    responsive: true,
    parallaxBackgrounds: true,
    parallaxElements: true,
    horizontalScrolling: false,
    hideDistantElements: false,
    scrollProperty: 'scroll',
  });

  const fullHeight = function () {
    $('.js-fullheight').css('height', $(window).height());
    $(window).resize(() => {
      $('.js-fullheight').css('height', $(window).height());
    });
  };
  fullHeight();

  // loader
  const loader = function () {
    setTimeout(() => {
      if ($('#ftco-loader').length > 0) {
        $('#ftco-loader').removeClass('show');
      }
    }, 1);
  };
  loader();

  // Scrollax
  $.Scrollax();

  const carousel = function () {
    $('.carousel-car').owlCarousel({
      center: true,
      loop: true,
      autoplay: true,
      items: 1,
      margin: 30,
      stagePadding: 0,
      nav: false,
      navText: [
        '<span class="ion-ios-arrow-back">',
        '<span class="ion-ios-arrow-forward">',
      ],
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 2,
        },
        1000: {
          items: 3,
        },
      },
    });
    $('.carousel-testimony').owlCarousel({
      center: true,
      loop: true,
      items: 1,
      margin: 30,
      stagePadding: 0,
      nav: false,
      navText: [
        '<span class="ion-ios-arrow-back">',
        '<span class="ion-ios-arrow-forward">',
      ],
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 2,
        },
        1000: {
          items: 3,
        },
      },
    });
  };
  carousel();

  $('nav .dropdown').hover(
    function () {
      const $this = $(this);
      // 	 timer;
      // clearTimeout(timer);
      $this.addClass('show');
      $this.find('> a').attr('aria-expanded', true);
      // $this.find('.dropdown-menu').addClass('animated-fast fadeInUp show');
      $this.find('.dropdown-menu').addClass('show');
    },
    function () {
      const $this = $(this);
      // timer;
      // timer = setTimeout(function(){
      $this.removeClass('show');
      $this.find('> a').attr('aria-expanded', false);
      // $this.find('.dropdown-menu').removeClass('animated-fast fadeInUp show');
      $this.find('.dropdown-menu').removeClass('show');
      // }, 100);
    },
  );

  $('#dropdown04').on('show.bs.dropdown', () => {
    console.log('show');
  });

  // scroll
  const scrollWindow = function () {
    $(window).scroll(function () {
      const $w = $(this);
      const st = $w.scrollTop();
      const navbar = $('.ftco_navbar');
      const sd = $('.js-scroll-wrap');

      if (st > 150) {
        if (!navbar.hasClass('scrolled')) {
          navbar.addClass('scrolled');
        }
      }
      if (st < 150) {
        if (navbar.hasClass('scrolled')) {
          navbar.removeClass('scrolled sleep');
        }
      }
      if (st > 350) {
        if (!navbar.hasClass('awake')) {
          navbar.addClass('awake');
        }

        if (sd.length > 0) {
          sd.addClass('sleep');
        }
      }
      if (st < 350) {
        if (navbar.hasClass('awake')) {
          navbar.removeClass('awake');
          navbar.addClass('sleep');
        }
        if (sd.length > 0) {
          sd.removeClass('sleep');
        }
      }
    });
  };
  scrollWindow();

  var isMobile = {
    Android() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows() {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any() {
      return (
        isMobile.Android()
        || isMobile.BlackBerry()
        || isMobile.iOS()
        || isMobile.Opera()
        || isMobile.Windows()
      );
    },
  };

  const counter = function () {
    $('#section-counter, .hero-wrap, .ftco-counter').waypoint(
      function (direction) {
        if (
          direction === 'down'
          && !$(this.element).hasClass('ftco-animated')
        ) {
          const comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
          $('.number').each(function () {
            const $this = $(this);
            const num = $this.data('number');
            console.log(num);
            $this.animateNumber(
              {
                number: num,
                numberStep: comma_separator_number_step,
              },
              7000,
            );
          });
        }
      },
      { offset: '95%' },
    );
  };
  counter();

  const contentWayPoint = function () {
    let i = 0;
    $('.ftco-animate').waypoint(
      function (direction) {
        if (
          direction === 'down'
          && !$(this.element).hasClass('ftco-animated')
        ) {
          i++;

          $(this.element).addClass('item-animate');
          setTimeout(() => {
            $('body .ftco-animate.item-animate').each(function (k) {
              const el = $(this);
              setTimeout(
                () => {
                  const effect = el.data('animate-effect');
                  if (effect === 'fadeIn') {
                    el.addClass('fadeIn ftco-animated');
                  } else if (effect === 'fadeInLeft') {
                    el.addClass('fadeInLeft ftco-animated');
                  } else if (effect === 'fadeInRight') {
                    el.addClass('fadeInRight ftco-animated');
                  } else {
                    el.addClass('fadeInUp ftco-animated');
                  }
                  el.removeClass('item-animate');
                },
                k * 50,
                'easeInOutExpo',
              );
            });
          }, 100);
        }
      },
      { offset: '95%' },
    );
  };
  contentWayPoint();

  // navigation
  const OnePageNav = function () {
    $('.smoothscroll[href^=\'#\'], #ftco-nav ul li a[href^=\'#\']').on(
      'click',
      function (e) {
        e.preventDefault();

        const { hash } = this;
        const navToggler = $('.navbar-toggler');
        $('html, body').animate(
          {
            scrollTop: $(hash).offset().top,
          },
          700,
          'easeInOutExpo',
          () => {
            window.location.hash = hash;
          },
        );

        if (navToggler.is(':visible')) {
          navToggler.click();
        }
      },
    );
    $('body').on('activate.bs.scrollspy', () => {
      console.log('nice');
    });
  };
  OnePageNav();

  // magnific popup
  $('.image-popup').magnificPopup({
    type: 'image',
    closeOnContentClick: true,
    closeBtnInside: false,
    fixedContentPos: true,
    mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0, 1], // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      verticalFit: true,
    },
    zoom: {
      enabled: true,
      duration: 300, // don't foget to change the duration also in CSS
    },
  });

  $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
    disableOn: 700,
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,

    fixedContentPos: false,
  });

  // $('#book_pick_date,#book_off_date').datepicker({
  //   format: 'm/d/yyyy',
  //   autoclose: true,
  // });
}(jQuery));

document.addEventListener('DOMContentLoaded', (event) => {
  function OTPInput() {
    const inputs = document.querySelectorAll('#otp > *[id]');
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
          inputs[i].value = '';
          if (i !== 0) inputs[i - 1].focus();
        } else if (i === inputs.length - 1 && inputs[i].value !== '') {
          return true;
        } else if (event.keyCode > 47 && event.keyCode < 58) {
          inputs[i].value = event.key;
          if (i !== inputs.length - 1) inputs[i + 1].focus();
          event.preventDefault();
        } else if (event.keyCode > 64 && event.keyCode < 91) {
          inputs[i].value = String.fromCharCode(event.keyCode);
          if (i !== inputs.length - 1) inputs[i + 1].focus();
          event.preventDefault();
        }
      });
    }
  }
  OTPInput();
});

// ------------------------validation and signup section start -------------------------------

$('#userLoginForm').validate({
  rules: {
    userName: {
      required: true,
      lettersonly: true,
    },
    password: 'required',
  },
  messages: {
    userName: {
      required: 'user name cannot be empty',
    },
    password: 'password cannot be empty',
  },
  errorPlacement(error, element) {
    error.insertBefore(element);
  },
  submitHandler(form) {
    $.ajax({
      type: 'POST',
      data: $(form).serialize(),
      url: '/login',
      success(data) {
        if (data.login) {
          $('#loginForm').modal('hide');
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
          });
          Toast.fire({
            icon: 'success',
            title: 'Signed in successfully',
          }).then(() => {
            window.location.reload();
          });
        } else if (data.blocked) {
          $('#errmessage').text('You are blocked by admin');
        }

        if (data.loginError) {
          $('#loginForm').modal('hide');
          $('#exampleModal').modal('show');
          $('#please_signup').text('account not exist ,please register');
        } else if (data.message) {
          $('#errmessage').text(data.message);
        }
      },
    });
  },
});
// verify otp for signup
$('#verify_otp').validate({
  submitHandler(form) {
    $.ajax({
      type: 'POST',
      data: $(form).serialize(), // serializes the form's elements.
      url: '/verify',
      success(data) {
        if (data.verified) {
          $('#OTPmodel').modal('hide');
          $('#password-modal').modal('show');
        }
        if (data.invalid) {
          $('#invalid_otp').text('invalid Otp');
        }
        if (data.error) {
          $('#invalid_otp').text(
            'an error occure please check your connection',
          );
        }
      },
    });
  },
});

// validate signup with password and confirm password

$('#password_signup').validate({
  rules: {
    password: {
      required: true,
      minlength: 8,
    },
    confirm_password: {
      required: true,
      equalTo: '#password',
    },
  },
  messgaes: {
    confirm_password: {
      equalTo: 'password should be same',
    },
  },
  errorPlacement(error, element) {
    error.insertBefore(element);
  },
});

// singnukp form submit
$('#signupFormSubmit').validate({
  rules: {
    phone_number: {
      required: true,
      maxlength: 10,
      minlength: 10,
    },
    userName: {
      required: true,
      lettersonly: true,
    },
  },
  messages: {
    phone_number: {
      required: 'password cannot be empty',
      maxlength: 'please enter a valid phone number',
      minlength: 'please enter atleast 10 numbers',
    },
    userName: {
      required: 'user name cannot be left empty',
    },
  },
  errorPlacement(error, element) {
    error.insertBefore(element);
  },
  submitHandler(form) {
    $.ajax({
      type: 'POST',
      data: $(form).serialize(), // serializes the form's elements.
      url: '/signupform',
      success(data) {
        if (data.verified) {
          $('#exampleModal').modal('hide');
          $('#OTPmodel').modal('show');
          $('#otp_sent').text(data.phone_number);
        }
        if (data.exist) {
          $('#user_exist').text('mobile number already exist');
        }
        if (data.userExist) {
          $('#user_exist').text('User name already exist');
        }
        if (data.Mobilefaild) {
          $('#user_exist').text('an error ocuured please check your network');
        }
      },
    });
  },
});
// resent otp
$('#resent_otp').click(() => {
  $.ajax({
    type: 'GET',

    url: '/resent',
    success(response) {
      if (response.verification) {
        $('#invalid_otp').text('Otp sended please check your messages');
      }
      if (response.Mobilefaild) {
        $('#invalid_otp').text('an error ocuured please check your network');
      }
    },
  });
});

// forgot password verify otp
$('#verify_forgot_password').validate({
  rules: {
    phone_number: 'required',
  },
  errorPlacement(error, element) {
    error.insertBefore(element);
  },
  submitHandler(form) {
    $.ajax({
      type: 'POST',

      data: $(form).serialize(), // serializes the form's elements.
      url: '/forgot',
      success(data) {
        if (data.exist) {
          $('#forgot_modal').modal('hide');
          $('#make_new_password').modal('show');
          $('#otp_sent_forgot').text(data.phone_number);
        }
        if (data.notexist) {
          $('#exist').text('user not exist');
        }
        if (data.error) {
          $('#exist').text('an error occure please check your internet');
        }
      },
    });
  },
});
// verify otp for forgot password

$('#verify_otp_for_password').validate({
  submitHandler(form) {
    $.ajax({
      type: 'POST',
      data: $(form).serialize(), // serializes the form's elements.
      url: '/verify_otp_for_password',
      success(data) {
        if (data.verified) {
          $('#make_new_password').modal('hide');
          $('#new_password-modal').modal('show');
        }
        if (data.invalid) {
          $('#invalid_otp_forgot').text('invalid Otp');
        }
        if (data.error) {
          $('#invalid_otp_forgot').text(
            'an error occure please check your connection',
          );
        }
      },
    });
  },
});
// resend otp for forgot password

$('#resent_otp_fotgot').click(() => {
  $.ajax({
    type: 'GET',

    url: '/resentForgot',
    success(response) {
      if (response.verification) {
        $('#invalid_otp_forgot').text('Otp sended please check your messages');
      }
      if (response.Mobilefaild) {
        $('#invalid_otp_forgot').text(
          'an error ocuured please check your network',
        );
      }
    },
  });
});

// validate new password
$('#new_password').validate({
  rules: {
    password: {
      required: true,
      minlength: 8,
    },
    confirm_password: {
      required: true,
      equalTo: '#password_forgot',
    },
  },
  messgaes: {
    confirm_password: {
      equalTo: 'password should be same',
    },
    errorPlacement(error, element) {
      error.insertBefore(element);
    },

  },
});

$('#into_signup').click(() => {
  $('#loginForm').modal('hide');
});
$('#btn').click(() => {
  '#btn'.style.color = 'salmon';
});

$('#forgot_password').click(() => {
  $('#loginForm').modal('hide');
});

$(window).bind('pageshow', (event) => {
  if (event.originalEvent.persisted) {
    window.location.reload();
  }
});

// add jquery to an validator function
jQuery.validator.addMethod(
  'lettersonly',
  function (value, element) {
    return this.optional(element) || /^[a-z]\w+$/i.test(value);
  },
  'only Numbers not allowed',
);

$(document).ready(() => {
  const url = window.location;
  $('ul.navbar-nav li a').each(function () {
    if (this.href == url) {
      $('ul.navbar-nav li').each(function () {
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
        }
      });
      $(this).parent().addClass('active');
    }
  });
});
// -----------------------------validation and user signup end -------------------------
// ---------------------------------------profile start---------------------------------

// open profile edit modal with single function

$('.edit_tag').click(function () {
  $('.parent')
    .children()
    .each(function () {
      $(this).hide();
    });
  $(`div.${$(this).attr('id')}`).show();
});

// edit user full name
function updateDatas(userData, purpose) {
  if (document.getElementById('userName').value === '') {
    document.querySelector('#errorMessageName').innerHTML = 'Please Enter Your Name';
    return false;
  }
  const fullname = $('#userName').val();
  $.ajax({
    type: 'POST',
    url: '/updateUser',
    data: { userData, purpose, fullname },
    success(response) {
      if (response.updated) {
        window.location.reload();
      }
    },
  });
}
// update mobile number

function updateMobile(userData, purpose) {
  if (document.getElementById('userNumber').value === '') {
    document.querySelector('#errorMessageMobile').innerHTML = 'Please Enter Mobile Number';
    return false;
  }
  const mobileNumber = $('#userNumber').val();

  $.ajax({
    type: 'POST',
    url: '/updateUser',
    data: { userData, purpose, mobileNumber },
    success(response) {
      if (response.verified) {
        $('#editUser').modal('hide');
        $('#OTPmodal').modal('show');
      }
      if (response.error) {
        document.querySelector('#errorMessageMobile').innerHTML = 'Invalid mobile number';
      }
    },
  });
}

function updateEmail(userData, purpose) {
  if (document.getElementById('userEmail').value === '') {
    document.querySelector('#errorMessageemail').innerHTML = 'Please Enter Email Address';
    return false;
  }
  const emailAddress = $('#userEmail').val();

  $.ajax({
    type: 'POST',
    url: '/updateUser',
    data: { userData, purpose, emailAddress },
    success(response) {
      if (response.msg) {
        $('#editUser').modal('hide');
        $('#EmailOTPmodal').modal('show');
      }
      if (response.error) {
        document.querySelector('#errorMessageemail').innerHTML = 'Invalid email address';
      }
    },
  });
}

// verify otp

$('#verify_otp_editPhone').validate({
  submitHandler(form) {
    $.ajax({
      type: 'POST',
      data: $(form).serialize(), // serializes the form's elements.
      url: '/verify_otp',
      success(data) {
        if (data.updated) {
          console.log('ok');
          window.location.reload();
        }
        if (data.invalid) {
          $('#invalid_otp').text('invalid Otp');
        }
        if (data.error) {
          $('#invalid_otp').text(
            'an error occure please check your connection',
          );
        }
      },
    });
  },
});

$('#verify_otp_editEmail').validate({
  submitHandler(form) {
    $.ajax({
      type: 'POST',
      data: $(form).serialize(), // serializes the form's elements.
      url: '/verify_Email_otp',
      success(data) {
        if (data.updated) {
          window.location.reload();
        }
        if (data.invalid) {
          $('#invalid_otp_mail').text('invalid Otp');
        }
      },
    });
  },
});

// update date of birth
function updateBirth(userData, purpose) {
  if (document.getElementById('updateBirth').value === '') {
    document.querySelector('#errorMessageBirh').innerHTML = 'Please Enter Your Date Of Birth';
    return false;
  }
  const dateofbirth = $('#updateBirth').val();
  $.ajax({
    type: 'POST',
    url: '/updateUser',
    data: { userData, purpose, dateofbirth },
    success(response) {
      if (response.updated) {
        window.location.reload();
      }
    },
  });
}

// update licese number

function updateLicense(userData, purpose) {
  if (document.getElementById('license').value === '') {
    document.querySelector('#errorMessageLicense').innerHTML = 'Please Enter License Number';
    return false;
  }
  const license = $('#license').val();
  $.ajax({
    type: 'POST',
    url: '/updateUser',
    data: { userData, purpose, license },
    success(response) {
      if (response.updated) {
        window.location.reload();
      }
    },
  });
}
$('#show_profile_button').hide();
function avatarImg(event) {
  document.getElementById('avatarView').src = URL.createObjectURL(
    event.target.files[0],
  );
  $('#show_profile_button').show();
}
$('#show_btn').hide();
function idUpload(event) {
  document.getElementById('ImgView').src = URL.createObjectURL(
    event.target.files[0],
  );
  $('#show_btn').show();
}
function addToCart(
  id,
  rent,
  pickupdate,
  dropdate,
  days,
  pickuplocation,
  droplocation,
  vehicleImage,
) {
  $.ajax({
    type: 'GET',
    url: '/add-to-cart',
    data: {
      id,
      rent,
      pickupdate,
      dropdate,
      days,
      pickuplocation,
      droplocation,
      vehicleImage,
    },
    success(response) {
      if (response.added) {
        const counter = parseInt($('#cartBadge').html(), 10) + 1;
        $('#cartBadge').html(counter);
        Swal.fire({
          position: 'top-right',
          icon: 'success',
          title: 'vehicle added to the cart',
          showConfirmButton: false,
          timer: 1500,
        });
      }
      if (response.loginError) {
        $('#loginForm').modal('show');
        $('#errmessage').text('Please login');
      }
    },
  });
}

function bookVehicle(data) {
  let value;
  if (data === 1) {
    value = 'details';
  } else {
    value = 'cart';
  }
  $.ajax({
    type: 'GET',
    data: {value},
    url: '/checkout',
    success(response) {
      if (response.loginError) {
        $('#loginForm').modal('show');
        $('#errmessage').text('Please login');
      }
      if( response.ok) {
        window.location = '/checkoutPage'
      }
    },
  });
}

function removeCart(id) {
  $.ajax({
    type: 'GET',
    url: '/removeFromCart',
    data: { id },
    success(response) {
      if (response.deleted) {
        Swal.fire({
          position: 'top-right',
          icon: 'success',
          title: 'vehicle remove from the cart',
          showConfirmButton: false,
          timer: 1000,
        }).then(() => {
          window.location.reload();
        });
      }
    },
  });
}

function checkIdProof() {
  const srcImage = document.getElementById('idProofImg').src.split('/').pop();
  if (srcImage == '') {
    document.getElementById('idProofError').innerHTML = 'Cannot leave without upload idProof';
    return false;
  }
  $('#booknow').submit(function (e) {
    e.preventDefault(); // avoid to execute the actual submit of the form.
    const formData = new FormData(this);
    $.ajax({
      type: 'post',
      url: '/booknow',
      data: formData,
      processData: false,
      contentType: false,
      success(response) {
        if (response.status) {
          razorpayPayment(response.data, response.purpose);
        }
      },
    });
  });
}

function razorpayPayment(order, purpose) {
  const options = {
    key: 'rzp_test_9jtsFJQUBHDlTG', // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: 'INR',
    name: 'LiveDrive',
    description: 'Test Transaction',
    image: 'https://example.com/your_logo',
    order_id: order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: (response) => {
      verifyPayment(response, order, purpose);
    },
    prefill: {
      name: 'Mohammed shuhaib',
      email: 'shuhaibmohammedofficial@gmail.com',
      contact: '+918137947670',
    },
    notes: {
      address: 'Razorpay Corporate Office',
    },
    theme: {
      color: '#3399cc',
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.on('payment.failed', (response) => {
    paymentFailed(payment, response);
  });
  rzp1.open();
}
function verifyPayment(payment, order, purpose) {
  $.ajax({
    url: '/verify-payment',
    data: {
      payment,
      order,
      purpose,
    },
    method: 'post',
    success(response) {
      if (response.status) {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Booking success, please check booking section',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = '/booking';
        });
      } else {
        alert('payment failed');
      }
    },
  });
}

function paymentFailed(payment, order) {
  $.ajax({
    url: '/payment-failed',
    data: {
      payment,
      order,
    },
    method: 'post',
    success(response) {
      if (response.failed) {
        alert('payment failed');
      }
    },
  });
}

// cancell bookings

function cancelBooking(vehicleId, pick) {
  swal({
    title: 'Are you sure?',
    text: 'Once cancelled, 30% of the total rent will refund to your wallet!',
    icon: 'warning',
    buttons: true,
    dangerMode: true,
  }).then((ok) => {
    if (ok) {
      $.ajax({
        url: '/cancellBooking',
        data: { vehicleId, pick },
        method: 'post',
        success: (response) => {
          if (response.cancelled) {
            swal('Your rented vehicle has been cancelled!', {
              icon: 'success',
            }).then(() => {
              window.location.reload();
            });
          }
        },
      });
    } else {
      swal('Your vehicle is safe!');
    }
  });
}

function applyCoupon(discount, couponcode, couponId) {
  $.ajax({
    url: '/applyCoupon',
    data: {
      discount, couponcode, couponId,
    },
    method: 'post',
    success: (response) => {
      if (response.applied) {
        swal({
          title: 'Good job!',
          text: 'Promocode applide to your price!',
          icon: 'success',
          button: 'Aww yiss!',
        }).then(() => {
          window.location.reload();
          $('#couponModal').prop('disabled', true);
        });
      }
      if (response.exist) {
        Swal.fire('U have already used this coupon', '', 'error');
      }
    },
  });
}
