const express = require('express');
const storage = require('../middleware/multer');

const router = express.Router();
const userHelper = require('../helpers/user-helpers');
const otpHelpers = require('../helpers/otp-helpers');
const vehicleHelpers = require('../helpers/vehicle-helpers');
const couponsHelpers = require('../helpers/coupons-helpers');
const vendorHelpers = require('../helpers/vendor-helpers');

/* GET home page. */

router.get('/', async (req, res) => {
  if (req.session.user) {
    const cartData = await userHelper.getCartCount(req.session.user);
    req.session.cartLength = cartData;
  }
  const Hub = await vendorHelpers.getHubName();
  const coupons = await couponsHelpers.getCoupons();
  res.render('user/index', {
    user: true,
    home: true,
    cartData: req.session.cartLength,
    Hub,
    coupons,
  });
});
// user loign
router.post('/login', (req, res) => {
  const { userName } = req.body;
  req.session.userName = userName;
  userHelper
    .doLogin(req.body)
    .then((response) => {
      req.session.userLogin = true;
      req.session.user = response.user;

      if (req.session.user.blocked === true) {
        req.session.userLogin = false;
        res.json({ blocked: true });
        console.log('its blocked');
      } else {
        res.json({ login: req.session.userLogin });
      }
    })
    .catch((message) => {
      req.session.loginError = true;
      if (message) {
        res.json(message);
      }
    });
});
// forgot password
router.post('/forgot', (req, res) => {
  // eslint-disable-next-line camelcase
  const { phone_number } = req.body;
  req.session.forgotMobile = phone_number;

  userHelper
    .checkUser(phone_number)
    .then(() => {
      otpHelpers
        .makeOtp(phone_number)
        .then((verification) => {
          console.log(verification);
          res.json({ exist: true, phone_number: req.session.forgotMobile });
        })
        .catch(() => {
          res.json({ error: true });
        });
    })
    .catch(() => {
      res.json({ notexist: true });
    });
});
// verify forgot password
router.post('/verify_otp_for_password', (req, res) => {
  // eslint-disable-next-line camelcase
  const phone_number = req.session.forgotMobile;
  const { otp_f } = req.body;
  otp = otp_f.join('');
  otpHelpers
    .verifyOtp(otp, phone_number)
    .then((verification_check) => {
      console.log(verification_check.status);
      if (verification_check.status == 'approved') {
        console.log('approved');
        res.json({ verified: true });
      } else {
        console.log('not approved');
        res.json({ invalid: true });
      }
    })
    .catch(() => {
      console.log('verify faild');
      res.json({ error: true });
    });
});
// resend forgot otp
router.get('/resentForgot', (req, res) => {
  const phone_number = req.session.forgotMobile;
  otpHelpers
    .makeOtp(phone_number)
    .then((verification) => {
      res.json({ verification: true });
    })
    .catch(() => {
      res.json({ Mobilefaild: true });
    });
});

router.post('/make_new_password', (req, res) => {
  const { password, confirm_password } = req.body;
  const phone_number = req.session.forgotMobile;
  const userData = {
    number: phone_number,
    password,
  };
  userHelper.updatePassword(userData).then(() => {
    req.session.userLogin = true;
    res.redirect('/');
  });
});

// user signup
router.post('/signupform', (req, res) => {
  const { userName, phone_number } = req.body;
  req.session.number = phone_number;
  req.session.userName = userName;

  userHelper
    .userExist(phone_number, userName)
    .then((exist) => {
      if (exist.mobileExist) {
        req.session.exist = true;
        res.json({ exist: true });
      } else {
        req.session.exist = true;
        res.json({ userExist: true });
      }
    })
    .catch(() => {
      otpHelpers
        .makeOtp(phone_number)
        .then((verification) => {
          res.json({ verified: true, phone_number: req.session.number });
        })
        .catch(() => {
          res.json({ Mobilefaild: true });
        });
    });
});
// resend otp
router.get('/resent', (req, res) => {
  const phone_number = req.session.number;
  otpHelpers
    .makeOtp(phone_number)
    .then((verification) => {
      res.json({ verification: true });
    })
    .catch(() => {
      res.json({ Mobilefaild: true });
    });
});
// verify otp
router.post('/verify', (req, res) => {
  let { otp } = req.body;
  otp = otp.join('');
  const phone_number = req.session.number;
  otpHelpers
    .verifyOtp(otp, phone_number)
    .then((verification_check) => {
      if (verification_check.status == 'approved') {
        console.log('approved');
        res.json({ verified: true });
      } else {
        console.log('not approved');
        res.json({ invalid: true });
      }
    })
    .catch(() => {
      console.log('verify faild');
      res.json({ error: true });
    });
});
// user enter password
router.post('/sighnup', (req, res) => {
  const { password, confirm_password } = req.body;
  const phone_number = req.session.number;
  const user = req.session.userName;
  const userData = {
    user,
    number: phone_number,
    password,
    blocked: false,
  };
  userHelper.userSignup(userData).then((response) => {
    req.session.userLogin = true;
    res.json({ verified: true });
  });
});
// date formate

function dateFormat(date) {
  const dateData = date.split('-'); // For example
  const dateObject = new Date(Date.parse(dateData));
  const dateReadable = dateObject.toDateString();
  const [, M, Dt, Y] = dateReadable.split(' ');
  const dateString = [M, Dt, Y].join(' ');
  return dateString;
}
// vehicle router
router.post('/vehicles', async (req, res) => {
  let vehicleLength;
  const Hub = await vendorHelpers.getHubName();
  const {
    pickUpLocation, dropLocation, pickUpDate, dropDate, selectVehicle,
  } = req.body;
  let cartData;
  if (req.session.user) {
    cartData = await userHelper.getCartCount(req.session.user);
  }
  const dateOne = new Date(pickUpDate);
  const dateTwo = new Date(dropDate);
  const differece = dateTwo.getTime() - dateOne.getTime();
  const totalDays = Math.ceil(differece / (1000 * 3000 * 24));
  req.session.days = totalDays;
  req.session.bookingDetails = req.body;
  if (selectVehicle == 'car') {
    const cars = await vehicleHelpers.getAllVehicles(
      selectVehicle,
      pickUpLocation,
      pickUpDate,
      dropDate,
    );
    vehicleLength = cars.length;
    res.render('user/car', {
      user: true,
      cars,
      details: req.session.bookingDetails,
      dropDate,
      cartData,
      Hub,
      vehicleLength,
    });
  } else {
    const bikes = await vehicleHelpers.getAllVehicles(
      selectVehicle,
      pickUpLocation,
      pickUpDate,
      dropDate,
    );
    vehicleLength = bikes.length;
    res.render('user/bike', {
      user: true,
      bikes,
      details: req.session.bookingDetails,
      dropDate,
      cartData,
      Hub,
      vehicleLength,
    });
  }
});

router.get('/about', async (req, res) => {
  let cartData;
  if (req.session.user) {
    cartData = await userHelper.getCartCount(req.session.user);
  }
  res.render('user/about', { user: true, cartData });
});

router.get('/profile', async (req, res) => {
  req.session.relative_nav = true;
  const { userName } = req.session;
  let cartData;
  if (req.session.user) {
    cartData = await userHelper.getCartCount(req.session.user);
  }
  userHelper.findSigleUser(userName).then((userData) => {
    res.render('user/profile', { userData, user: true, cartData });
  });
});
// user update data

router.post('/updateUser', async (req, res) => {
  const { purpose } = req.body;
  if (purpose == 'userName') {
    const { userData, purpose, fullname } = req.body;
    try {
      await userHelper.updateUser(userData, purpose, fullname);
      res.json({ updated: true });
    } catch (err) {
      console.log(err);
    }
  } else if (purpose == 'Mobilenumber') {
    const { userData, purpose, mobileNumber } = req.body;
    req.session.editNumber = mobileNumber;
    req.session.userData = userData;
    req.session.purpose = purpose;

    await otpHelpers
      .makeOtp(mobileNumber)
      .then((verification) => {
        res.json({ verified: true });
      })
      .catch(() => {
        res.json({ error: true });
      });
  } else if (purpose == 'birth') {
    const { userData, purpose, dateofbirth } = req.body;
    try {
      await userHelper.updateUser(userData, purpose, dateofbirth);
      res.json({ updated: true });
    } catch (err) {
      console.log(err);
    }
  } else if (purpose == 'license') {
    const { userData, purpose, license } = req.body;
    try {
      await userHelper.updateUser(userData, purpose, license);
      res.json({ updated: true });
    } catch (err) {
      console.log(err);
    }
  } else if (purpose == 'email') {
    const { userData, purpose, emailAddress } = req.body;
    req.session.emailAddress = emailAddress;
    req.session.userData = userData;
    req.session.purpose = purpose;
    try {
      const msg = await otpHelpers.makeEmailOtp(emailAddress);
      req.session.otpCode = msg.otpCode;
      res.json(msg);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
});

router.post(
  '/profileUpdate',
  storage.fields([
    { name: 'idproof', maxCount: 1 },
    { name: 'profilePic', maxCount: 1 },
  ]),
  async (req, res) => {
    if (req.body.idProof == 'idproof') {
      await userHelper.updateUser(
        req.session.user.user,
        'idproof',
        req.files.idproof[0].filename,
      );
      res.redirect('/profile');
    } else {
      await userHelper.updateUser(
        req.session.user.user,
        'profilePic',
        req.files.profilePic[0].filename,
      );
      res.redirect('/profile');
    }
  },
);

// verify otp for edit number

router.post('/verify_otp', async (req, res) => {
  let { otp } = req.body;
  otp = otp.join('');
  const { purpose } = req.session;
  const { userData } = req.session;
  const mobileNumber = req.session.editNumber;
  await otpHelpers
    .verifyOtp(otp, mobileNumber)
    .then((verification_check) => {
      if (verification_check.status == 'approved') {
        console.log('approved');
        try {
          userHelper.updateUser(userData, purpose, mobileNumber);
          res.json({ updated: true });
        } catch (err) {
          console.log(err);
        }
      } else {
        console.log('not approved');
        res.json({ invalid: true });
      }
    })
    .catch(() => {
      console.log('verify faild');
      res.json({ error: true });
    });
});

router.post('/verify_Email_otp', async (req, res) => {
  let { otp } = req.body;
  otp = otp.join('');
  const { purpose } = req.session;
  const { userData } = req.session;
  const { emailAddress } = req.session;
  const { otpCode } = req.session;
  try {
    await otpHelpers.verifyEmailOtp(otp, otpCode);
    userHelper.updateUser(userData, purpose, emailAddress);
    res.json({ updated: true });
  } catch (err) {
    res.json({ invalid: true });
  }
});

router.get('/booking', async (req, res) => {
  if (req.session.userLogin) {
    const cartData = await userHelper.getCartCount(req.session.user);
    const bookingsData = await userHelper.getUpcomingBookings(req.session.user);
    const compleatedBooking = await userHelper.getCompleatedBookings(
      req.session.user,
    );
    const activeBooking = await userHelper.getActiveBookings(req.session.user);
    const cancelledBooking = await userHelper.getCancelledBookings(
      req.session.user,
    );
    res.render('user/bookings', {
      user: true,
      bookingsData,
      compleatedBooking,
      activeBooking,
      cancelledBooking,
      cartData,
    });
  } else {
    res.send('please login');
  }
});

// cart view
router.get('/cart', async (req, res) => {
  if (req.session.userLogin) {
    const cartLength = await userHelper.getCartCount(req.session.user);
    const { days } = req.session;
    const { cartData } = await userHelper.getCartData(req.session.user._id);
    const coupons = await couponsHelpers.getCoupons();
    if (cartData) {
      const cart = cartData.vehicles;
      req.session.cartData = cartData;

      if (cart) {
        let sum = 0;

        for (const element of cart) {
          sum += parseInt(element.vehicle.Rent);
        }

        const fare = cartData.Rate;
        const totalfare = fare * days;
        req.session.totalfare = totalfare;
        req.session.totalsumfare = sum;
        req.session.cart = cart;

        res.render('user/cart', {
          user: true,
          cart,
          totalfare,
          sum,
          data: req.session.bookingDetails,
          totaldays: req.session.days,
          cartData: cartLength,
          coupons,
        });
      } else {
        res.render('user/cart', { user: true, cartData: cartLength });
      }
    } else {
      res.render('user/cart', { user: true, cartData: cartLength });
    }
  } else {
    res.send('please login');
  }
});

// add to cart
router.get('/add-to-cart', async (req, res) => {
  const {
    id,
    rent,
    pickupdate,
    dropdate,
    days,
    pickuplocation,
    droplocation,
    vehicleImage,
  } = req.query;
  // const rent = parseInt(rentVehicle, 10);
  if (req.session.userLogin) {
    try {
      await userHelper.addToCart(
        id,
        req.session.user._id,
        rent,
        pickupdate,
        dropdate,
        days,
        pickuplocation,
        droplocation,
        vehicleImage,
      );
      res.json({
        added: true,
      });
    } catch (exist) {
      res.json({ exist: true });
    }
  } else {
    res.json({ loginError: true });
  }
});

// remove form cart
router.get('/removeFromCart', async (req, res) => {
  const { id } = req.query;
  if (req.session.userLogin) {
    await userHelper.removeCart(id);
    res.json({ deleted: true });
  } else {
    res.send('please login');
  }
});

router.get('/logout', (req, res) => {
  req.session.loginError = true;
  req.session.userLogin = false;
  res.redirect('/');
});

router.get('/active', (req, res) => {
  res.json();
});
router.get('/contact', async (req, res) => {
  let cartData;
  if (req.session.user) {
    cartData = await userHelper.getCartCount(req.session.user);
  }
  res.render('user/contact', { user: true, cartData });
});

// vehicle details

router.get('/details:id', async (req, res) => {
  req.session.vehicleId = req.params.id;
  let cartData;
  if (req.session.user) {
    cartData = await userHelper.getCartCount(req.session.user);
  }
  const vehicle = await vehicleHelpers.findSingVehicle(req.params.id);

  const fare = vehicle.vehicles.Rent;
  req.session.vehicle = vehicle;
  const pickUpDate = dateFormat(req.session.bookingDetails.pickUpDate);
  const dropDate = dateFormat(req.session.bookingDetails.dropDate);
  let showModal;
  const totalFare = fare * req.session.days;
  if (req.session.showLoginModal) {
    showModal = true;
  }

  req.session.totalFare = totalFare;
  res.render('user/details', {
    user: true,
    vehicle,
    details: req.session.bookingDetails,
    cartData,
    showModal,
    // Date: req.session.updatedDate,
    Days: req.session.days,
    totalFare,
    dropDate,
    pickUpDate,
  });
});

router.get('/checkout/:purpose', async (req, res) => {
  if (req.session.user) {
    const cartData = await userHelper.getCartCount(req.session.user);
    const { purpose } = req.params;
    let cartDatas;
    let cart;
    let vehicle;
    let totalFare;
    let days;
    let Discount;
    let couponCode;
    if (purpose === 'cart') {
      req.session.fromCart = true;
      cartDatas = req.session.cartData;
      cart = cartDatas.vehicles;
      totalFare = req.session.totalsumfare;
      if (req.session.coupenApplied) {
        Discount = req.session.Discount;
        totalFare -= Discount;
      }
      req.session.coupenApplied = false;
    } else {
      req.session.FromDetails = true;
      vehicle = req.session.vehicle;
      totalFare = req.session.totalFare;
      days = req.session.days;
      if (req.session.coupenApplied) {
        Discount = req.session.Discount;
        totalFare -= Discount;
      }
      req.session.coupenApplied = false;
    }
    if (Discount) {
      req.session.couponUsed = true;
      req.session.appliedUser = req.session.user._id;
      couponCode = req.session.couponcode;
    } else {
      req.session.appliedUser = 'null';
      req.session.couponUsed = false;
    }
    req.session.totalCheckoutFare = totalFare;
    const userData = await userHelper.findSigleUser(req.session.user.user);
    const coupons = await couponsHelpers.getCoupons();
    res.render('user/checkout', {
      user: true,
      cart,
      userData,
      vehicle,
      totalFare,
      days,
      coupons,
      Discount,
      couponCode,
      cartData,
    });
  } else {
    req.session.showLoginModal = true;
    res.redirect(`/details${req.session.vehicleId}`);
  }
});

router.post('/applyCoupon', async (req, res) => {
  const { user } = req.session;
  const totalFare = req.session.totalCheckoutFare;
  if (req.session.appliedUser == user._id) {
    res.json({ exist: true });
  } else {
    try {
      const alreadyTaken = await couponsHelpers.checkIdExist(
        user._id,
        req.body.couponId,
      );
      const { discount } = req.body;
      req.session.couponId = req.body.couponId;
      req.session.couponcode = req.body.couponcode;
      req.session.coupenApplied = true;
      const newFare = (totalFare / 100) * discount;
      req.session.Discount = newFare;
      res.json({ applied: true });
    } catch (alreadyTaken) {
      res.json({ exist: true });
    }
  }
});
// booking in details
router.post('/booknow', storage.single('userIdProof'), async (req, res) => {
  if (req.file) {
    await userHelper.updateIdUser(req.file.filename, req.body.name);
  }

  let vehicle;
  let days;
  let Dates;
  let totalFare;
  if (req.body.purpose == 'details') {
    totalFare = req.body.totalFare;
    Dates = req.session.bookingDetails;
    vehicle = req.session.vehicle;

    days = req.session.days;
    try {
      await otpHelpers.makeSuccessMessage(
        req.body.email,
        Dates.pickUpDate,
        req.session.user.user,
        Dates.pickUpLocation,
      );
    } catch (err) {
      console.log(err);
    }
    userHelper
      .addToBooking(req.session.user, vehicle, Dates, days, totalFare)
      .then(async (response) => {
        const data = await userHelper.generateRazorpay(
          totalFare * 100,
          response,
        );
        res.json({ status: true, data });
      });
  } else {
    totalFare = req.body.totalFare;
    const userData = req.session.user;
    const { cart } = req.session;
    const bookingId = await userHelper.addToBookingsCart(
      totalFare,
      userData,
      cart,
    );
    const data = await userHelper.generateRazorpay(totalFare * 100, bookingId);
    const { purpose } = req.body;

    res.json({ status: true, data, purpose });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    await userHelper.verifyPayment(req.body);
    req.session.orderId = req.body['order[receipt]'];
    await userHelper.changePaymentStatus(
      req.session.user,
      req.body['order[receipt]'],
      req.body.purpose,
    );

    if (req.session.couponUsed) {
      await couponsHelpers.updateUser(
        req.session.user._id,
        req.session.couponId,
      );
    }

    res.json({ status: true });
  } catch (err) {
    res.json({ status: false });
  }
});

router.post('/payment-failed', async (req, res) => {
  await userHelper.changeToFailed(req.session.user, req.body['order[receipt]']);
  res.json({ failed: true });
});

router.post('/cancellBooking', async (req, res) => {
  const { vehicleId } = req.body;
  await userHelper.changeToCancell(vehicleId, req.session.user);
  res.json({ cancelled: true });
});

module.exports = router;
