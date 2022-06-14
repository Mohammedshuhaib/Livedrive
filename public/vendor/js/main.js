
$.noConflict();

jQuery(document).ready(($) => {
  [].slice.call(document.querySelectorAll('select.cs-select')).forEach((el) => {
    new SelectFx(el);
  });

  jQuery('.selectpicker').selectpicker;

  $('.search-trigger').on('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    $('.search-trigger').parent('.header-left').addClass('open');
  });

  $('.search-close').on('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    $('.search-trigger').parent('.header-left').removeClass('open');
  });

  $('.equal-height').matchHeight({
    property: 'max-height',
  });

  // var chartsheight = $('.flotRealtime2').height();
  // $('.traffic-chart').css('height', chartsheight-122);

  // Counter Number
  $('.count').each(function () {
    $(this)
      .prop('Counter', 0)
      .animate(
        {
          Counter: $(this).text(),
        },
        {
          duration: 3000,
          easing: 'swing',
          step(now) {
            $(this).text(Math.ceil(now));
          },
        },
      );
  });

  // Menu Trigger
  $('#menuToggle').on('click', (event) => {
    const windowWidth = $(window).width();
    if (windowWidth < 1010) {
      $('body').removeClass('open');
      if (windowWidth < 760) {
        $('#left-panel').slideToggle();
      } else {
        $('#left-panel').toggleClass('open-menu');
      }
    } else {
      $('body').toggleClass('open');
      $('#left-panel').removeClass('open-menu');
    }
  });

  $('.menu-item-has-children.dropdown').each(function () {
    $(this).on('click', function () {
      const $temp_text = $(this).children('.dropdown-toggle').html();
      $(this)
        .children('.sub-menu')
        .prepend(`<li class="subtitle">${$temp_text}</li>`);
    });
  });

  // Load Resize
  $(window).on('load resize', (event) => {
    const windowWidth = $(window).width();
    if (windowWidth < 1010) {
      $('body').addClass('small-device');
    } else {
      $('body').removeClass('small-device');
    }
  });
});



$(window).bind('pageshow', (event) => {
  if (event.originalEvent.persisted) {
    window.location.reload();
  }
});

$(document).ready(() => {
  const url = window.location;
  $('ul.nav li a').each(function () {
    if (this.href == url) {
      $('ul.nav li').each(function () {
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
        }
      });
      $(this).parent().addClass('active');
    }
  });
});

// change values while selecting vehicle type

$(document).on('ready', () => {
  $('#typesOfVehicle').on('change', function () {
    const el = $(this);
    if (el.val() === 'car') {
      $('#transmissionType').html(
        '<option value=\'Automatic\'>Automatic</option>',
      );
      $('#transmissionType').append('<option value=\'Manual\'>Manual</option>');
      $('#AcType').show();
      $('#Catogary').show();
    } else {
      $('#transmissionType').html('<option value=\'Geared\'>Geared</option>');
      $('#transmissionType').append(
        '<option value=\'Gearless\'>Gearless</option>',
      );
      $('#AcType').hide();
      $('#Catogary').hide();
    }
  });
  $('#imageFile').hide();
  $('#editVehicle').hide();
  $('#vehicleName').prop('disabled', true);
  $('#vehicleNumber').prop('disabled', true);
  $('#typesOfVehicleEdit').prop('disabled', true);
  $('#transmissionTypeEdit').prop('disabled', true);
  $('#kilometers').prop('disabled', true);
  $('#fuelType').prop('disabled', true);
  $('#CatogaryType').prop('disabled', true);
  $('#acType').prop('disabled', true);
  $('#seaterType').prop('disabled', true);
  $('#rent').prop('disabled', true);

  $('#enableEdit').click(() => {
    $('#imageFile').show();
    $('#editVehicle').show();
    $('#vehicleName').prop('disabled', false);
    $('#vehicleNumber').prop('disabled', false);
    $('#typesOfVehicleEdit').prop('disabled', false);
    $('#transmissionTypeEdit').prop('disabled', false);
    $('#kilometers').prop('disabled', false);
    $('#fuelType').prop('disabled', false);
    $('#CatogaryType').prop('disabled', false);
    $('#acType').prop('disabled', false);
    $('#seaterType').prop('disabled', false);
    $('#rent').prop('disabled', false);
  });
  $('#typesOfVehicleEdit').on('change', function () {
    const el = $(this);
    if (el.val() === 'car') {
      $('#transmissionTypeEdit').html(
        '<option value=\'Automatic\'>Automatic</option>',
      );
      $('#transmissionTypeEdit').append(
        '<option value=\'Manual\'>Manual</option>',
      );
      $('#acType').show();
      $('#CatogaryType').show();
    } else {
      $('#transmissionTypeEdit').html('<option value=\'Geared\'>Geared</option>');
      $('#transmissionTypeEdit').append(
        '<option value=\'Gearless\'>Gearless</option>',
      );
      $('#acType').hide();
      $('#CatogaryType').hide();
    }
  });
});

// show vehicle image while selectiong in input files
function viewImage(event) {
  document.getElementById('imgView').src = URL.createObjectURL(
    event.target.files[0],
  );
}
// letters only function

//  validation vendor signup page
$(document).ready(() => {
  $('#signupFormVendor').validate({
    rules: {
      password: {
        required: true,
        minlength: 4,
      },
      confirm_password: {
        equalTo: '#password',
        required: true,
      },
      country: {
        required: true,
      },
      state: {
        required: true,
      },
      hub: {
        required: true,
      },
    },
  });
});

function getIdImg(event) {
  document.getElementById('idProofView').src = URL.createObjectURL(
    event.target.files[0],
  );
}
function approve(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'vendor can manage the vehicles!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Approve it!',
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: '/admin/approveVendor',
        data: { id },
        method: 'get',
        success: (response) => {
          if (response.approved) {
            Swal.fire(
              'Approved!',
              'The vendor has been approved.',
              'success',
            ).then(() => {
              window.location.reload();
            });
          }
        },
      });
    }
  });
}

function notApprove(id) {
  $.ajax({
    url: '/admin/notApproveVendor',
    method: 'get',
    data: { id },
    success: (response) => {
      if (response.ok) {
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'cancelled vendor approvel',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.reload();
        });
      }
    },
  });
}

function changeLocation(productId, pickLocation, dropLocation, bookingId, userName) {
  swal('Please enter kilometers:', {
    content: 'input',
  }).then((result) => {
    if (!result) {
      Swal.fire(
        'Please Enter the kilometer',
        'null value wont accept :)',
        'error',
      );
    } else {
      $.ajax({
        url: '/vendor/changeLocation',
        data: {
          productId, pickLocation, dropLocation, result, bookingId, userName,
        },
        method: 'get',
        success: (response) => {
          if (response.updated) {
            Swal.fire(
              'Approved!',
              'The vehicle is in your hub.',
              'success',
            ).then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire(
              'Approved!',
              'The vehicle is in your hub.',
              'success',
            ).then(() => {
              window.location.reload();
            });
          }
        },
      });
    }
  });
}

function getVendorid(picture) {
  console.log(picture);
  Swal.fire({
    title: 'Id proof!',
    text: 'Check the id proof is valid or not.',
    imageUrl: `/uploads/${picture}`,
    imageWidth: 400,
    imageHeight: 200,
    imageAlt: 'vendor id proof',
    animation: false,
  });
}
function DeleteVehicleVendor(vehicleId) {
  swal({
    title: 'Are you sure?',
    text: 'Once deleted, You never able to retrive back!',
    icon: 'warning',
    buttons: true,
    dangerMode: true,
  }).then((ok) => {
    if (ok) {
      $.ajax({
        url: '/vendor/deleteProductVendor',
        method: 'get',
        data: { vehicleId },
        success: (response) => {
          if (response.deleted) {
            swal('Your vehicle has been deleted!', {
              icon: 'success',
            }).then(() => {
              window.location.reload();
            });
          }
        },
      });
    }
  });
}
function DeleteVehicleAdmin(vehicleId) {
  swal({
    title: 'Are you sure?',
    text: 'Once deleted, You never able to retrive back!',
    icon: 'warning',
    buttons: true,
    dangerMode: true,
  }).then((ok) => {
    if (ok) {
      $.ajax({
        url: '/admin/deleteProductAdmin',
        method: 'get',
        data: { vehicleId },
        success: (response) => {
          if (response.deleted) {
            swal('Your vehicle has been deleted!', {
              icon: 'success',
            }).then(() => {
              window.location.reload();
            });
          }
        },
      });
    }
  });
}

function cancelBooking(vehicleId) {
  swal({
    title: 'Are you sure?',
    text: 'Once cancelled, The money will refunt to clint!',
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

function reqestMoney(vendorName) {
  socket.emit('climeMoney', { vendorName });
  $.ajax({
    url: '/vendor/requestMoney',
    method: 'get',
    success: (response) => {
      if (response.sended) {
        swal('Your clime request has send to admin please wait for approvel!', {
          icon: 'success',
        });
      }
    },
  });
}
function approveClime(id, revenue, hub) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'The 90 % of total rent will go to vendor account!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Approve it!',
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: '/admin/approveClimes',
        data: { id, revenue, hub },
        method: 'get',
        success: (response) => {
          if (response.approved) {
            Swal.fire(
              'Approved!',
              'The vendor clime approved.',
              'success',
            ).then(() => {
              window.location.reload();
            });
          }
        },
      });
    }
  });
}
