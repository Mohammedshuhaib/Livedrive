const express = require('express');
const storage = require('../middleware/multer');

const router = express.Router();
const vendorHelpers = require('../helpers/vendor-helpers');
const vehicleHelpers = require('../helpers/vehicle-helpers');
const userHelpers = require('../helpers/user-helpers');
const dashboardHelpers = require('../helpers/dashboard-helpers');

/* GET users listing. */
const vendorLogin = (req, res, next) => {
  if (req.session.vendorLogin) {
    next();
  } else {
    res.redirect('/vendor');
  }
};

// login form
router.get('/', (req, res) => {
  if (req.session.vendorLogin) {
    res.redirect('/vendor/home');
  }
  res.render('vendor/login', {
    loginPage: true,
    vendor: true,
    message: req.flash('signupMessage'),
    errorMessage: req.flash('errorMessage'),
    loginError: req.flash('message'),
  });
});

// submit login form

router.post('/login-form', (req, res) => {
  vendorHelpers
    .doLogin(req.body)
    .then((response) => {
      req.session.vendorLogin = true;
      req.session.vendorId = response.vendorid;
      req.session.hub = response.hub;
      req.session.vendorName = response.Name;
      if (response.vendor.approved === true) {
        res.redirect('/vendor/home');
      } else {
        req.session.vendorLogin = false;
        req.flash(
          'message',
          'admin not approved, please wait until admin approve your request',
        );
        res.redirect('/vendor');
      }
    })
    .catch(() => {
      req.session.vendorLoginError = true;
      req.flash('errorMessage', 'invalid user name or password');
      res.redirect('/vendor');
    });
});
// signup form
router.get('/signup', (req, res) => {
  res.render('vendor/signup', { loginPage: true, vendor: true });
});
// submit signup form
router.post(
  '/signup-form',
  storage.single('vendorIdProof'),
  async (req, res, next) => {
    delete req.body.confirm_password;
    try {
      const signup = await vendorHelpers.dosignup(req.body, req.file.filename);
      req.flash(
        'signupMessage',
        'signup success, Please wait for admin aprovel',
      );
      res.redirect('/vendor');
    } catch (err) {
      console.log(err);
    }
  },
);

// home router

router.get('/home', vendorLogin, async (req, res) => {
  const revenue = await dashboardHelpers.getTotalRevenue(req.session.hub);
  const bookings = await dashboardHelpers.getTotalBookings(req.session.hub);
  const vehicles = await dashboardHelpers.getTotalVehicles(req.session.hub);
  const values = await dashboardHelpers.getVendorGraphValues(req.session.hub);
  const bookingValues = await dashboardHelpers.getBookingValues(req.session.hub);
  const totalBooking = await dashboardHelpers.getAllBookings(req.session.hub);
  const bookingDiff = bookings/totalBooking;
  let bookingPers = bookingDiff * 100;
  bookingPers = Math.floor(bookingPers);
  let wallet;
  wallet = await dashboardHelpers.getWallet(req.session.hub);
  if (isNaN(wallet)) {
    wallet = 0;
  }
  let showButton;
  req.session.climeMoney = revenue.netRevenue - wallet;
  if (req.session.climeMoney != 0) {
    showButton = true;
  }
  res.render('vendor/home', {
    vendor: true,
    revenue,
    bookings,
    vehicles,
    wallet,
    vendorName: req.session.vendorName,
    showButton,
    values,
    bookingValues,
    bookingPers,
  });
});

// request money wallet

router.get('/requestMoney', vendorLogin, async (req, res) => {
  await dashboardHelpers.requestForMoney(
    req.session.climeMoney,
    req.session.hub,
    req.session.vendorName,
  );
  res.json({ sended: true });
});

// vehicles list rooter

router.get('/carList', vendorLogin, async (req, res) => {
  const { hub } = req.session;
  const cars = await vehicleHelpers.showCars(hub);

  res.render('vendor/cars', { vendor: true, cars });
});

router.get('/bikeList', vendorLogin, async (req, res) => {
  const { hub } = req.session;
  const bikes = await vehicleHelpers.showBikes(hub);

  res.render('vendor/bikes', { vendor: true, bikes });
});

router.get('/addVehicles', vendorLogin, (req, res) => {
  res.render('vendor/addvehicle', {
    vendor: true,
    vehicleAdded: req.flash('vehicleadded'),
  });
});

router.post(
  '/vehicle-form',
  vendorLogin,
  storage.single('vehicleImg'),
  async (req, res) => {
    try {
      const response = await vehicleHelpers.addvehicle(
        req.body,
        req.file.filename,
        req.session.vendorId,
      );
      console.log(response);

      req.flash('vehicleadded', 'Vehicle added succesfully');
      res.redirect('/vendor/addVehicles');
    } catch (err) {
      console.log(err);
    }
  },
);

router.get('/info:id', vendorLogin, async (req, res) => {
  const info = await vehicleHelpers.findSingVehicle(req.params.id);
  res.render('vendor/vehicleInfo', {
    vendor: true,
    info,
    message: req.flash('updated'),
  });
});

router.post(
  '/editVehicle:id',
  vendorLogin,
  storage.single('vehicleImage'),
  async (req, res) => {
    try {
      const response = await vehicleHelpers.updateSingleVehicle(
        req.params.id,
        req.body,
      );
      if (req.file) {
        await vehicleHelpers.updatevehicleImg(req.params.id, req.file.filename);
        req.flash('updated', 'vehicles updated succesfully');
        res.redirect(`/vendor/info${req.params.id}`);
      }
      req.flash('updated', 'vehicles updated succesfully');
      res.redirect(`/vendor/info${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
);

router.get('/deleteProductVendor', vendorLogin, async (req, res) => {
  try {
    await vehicleHelpers.deleteVehicle(req.query.vehicleId);
    res.json({ deleted: true });
  } catch (err) {
    console.log(err);
  }
});

router.get('/bookings', vendorLogin, async (req, res) => {
  const bookings = await vendorHelpers.getBookings(req.session.hub);
  res.render('vendor/allBookings', { vendor: true, bookings });
});

router.get('/compleated-bookings', vendorLogin, async (req, res) => {
  const compleated = await vendorHelpers.getCompleatedBookings(req.session.hub);
  res.render('vendor/compleatedBookings', { vendor: true, compleated });
});

router.get('/upcoming-bookings', vendorLogin, async (req, res) => {
  const upcoming = await vendorHelpers.getUpcomingBookings(req.session.hub);
  res.render('vendor/upcomingBookings', { vendor: true, upcoming });
});

router.get('/active-bookings', vendorLogin, async (req, res) => {
  const active = await vendorHelpers.getActiveBookings(req.session.hub);
  res.render('vendor/activeBookings', { vendor: true, active });
});
router.get('/cancelled-bookings', vendorLogin, async (req, res) => {
  const bookings = await vendorHelpers.getCancelledBookings(req.session.hub);
  res.render('vendor/cancelledBookings', { vendor: true, bookings });
});
router.get('/approve-bookings', vendorLogin, async (req, res) => {
  const bookings = await vendorHelpers.getApprovedBookings(req.session.hub);
  res.render('vendor/approvels', { vendor: true, bookings });
});

router.get('/profile', vendorLogin, async (req, res) => {
  const vendorData = await vendorHelpers.getSingleVendor(req.session.vendorId);
  res.render('vendor/profile', { vendor: true, vendorData });
});

router.post(
  '/vendorProfile',
  storage.single('vendorIdProof'),
  async (req, res) => {
    await vendorHelpers.updateVendor(req.session.vendorId, req.body, req.file);
    if (req.file) {
      await vendorHelpers.updateId(req.session.vendorId, req.file.filename);
    }
  },
);

router.get('/changeLocation', async (req, res) => {
  const response = await vendorHelpers.changeLocation(req.query);
  if (response.updated) {
    req.session.updated = true;
    res.json({ updated: true });
  } else {
    res.json({ updated: false });
  }
});

// logout rooter
router.get('/logout', (req, res) => {
  req.session.vendorLogin = false;
  res.redirect('/vendor');
});

module.exports = router;
