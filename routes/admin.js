const express = require('express');

const router = express.Router();
const { ObjectId } = require('mongodb');
const storage = require('../middleware/multer');
const vehicleHelpers = require('../helpers/vehicle-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const couponsHelpers = require('../helpers/coupons-helpers');
const dashboardHelpers = require('../helpers/dashboard-helpers');

const adminLogin = (req, res, next) => {
  if (req.session.adminLogin) {
    next();
  } else {
    res.redirect('/admin');
  }
};

const messgeLength = async (req, res, next) => {
  const messages = await adminHelpers.getMessages();
  if (messages) {
    req.session.messageLength = messages.length;
  } else {
    req.session.messageLength = 0;
  }

  next();
};

const notification = async (req, res, next) => {
  const notiMessage = await adminHelpers.getNotification();
  req.notiMessage = notiMessage;
  if (notiMessage) {
    req.session.notificationLength = notiMessage.length;
  } else {
    req.session.notificationLength = 0;
  }

  next();
};
router.get('/', (req, res) => {
  if (req.session.adminLogin) {
    res.redirect('/admin/home');
  }
  res.render('admin/login', {
    loginPageAdmin: true,
    admin: true,
    message: req.flash('loginError'),
  });
});

router.post('/login-form', async (req, res) => {
  try {
    await adminHelpers.adminLogin(req.body);
    req.session.adminLogin = true;
    res.redirect('/admin/home');
  } catch (response) {
    req.session.adminLoginError = true;
    req.flash('loginError', 'Invalid user name or password');
    res.redirect('/admin/');
  }
});

router.get(
  '/home',
  notification,
  messgeLength,
  adminLogin,
  async (req, res) => {
    if (req.session.adminLogin) {
      const revenue = await dashboardHelpers.getTotalRevenueAdmin();
      const bookings = await dashboardHelpers.getTotalBookingsAdmin();
      const vehicles = await dashboardHelpers.getTotalVehiclesAdmin();
      const users = await dashboardHelpers.getAllUser();
      const Profit = await dashboardHelpers.getProfit();
      const values = await dashboardHelpers.getAdminGraphValues();
      const bookingValues = await dashboardHelpers.getAdminBookingValues();
      const totalBooking = await dashboardHelpers.getAllBookingsAdmin();
      const bookingDiff = bookings / totalBooking;
      let bookingPers = bookingDiff * 100;
      bookingPers = Math.floor(bookingPers);
      let profitPers = (Profit / revenue) * 100;
      profitPers = Math.floor(profitPers);
      res.render('admin/home', {
        admin: true,
        notiMessage: req.notiMessage,
        revenue,
        bookings,
        vehicles,
        users,
        Profit,
        values,
        bookingValues,
        bookingPers,
        profitPers,
      });
    } else {
      res.redirect('/admin');
    }
  },
);

// malappuram hub car collection

router.get(
  '/cars',
  notification,
  messgeLength,
  adminLogin,
  async (req, res) => {
    const cars = await adminHelpers.getVehicles('cars');
    res.render('admin/cars', {
      admin: true,
      cars,
      notiMessage: req.notiMessage,
    });
  },
);

router.get(
  '/bikes',
  notification,
  messgeLength,
  adminLogin,
  async (req, res) => {
    const bikes = await adminHelpers.getVehicles('bikes');
    res.render('admin/bikes', {
      admin: true,
      bikes,
      notiMessage: req.notiMessage,
    });
  },
);

router.get(
  '/info:id',
  notification,
  adminLogin,
  messgeLength,
  async (req, res) => {
    const info = await vehicleHelpers.findSingVehicle(req.params.id);
    res.render('admin/vehicleInfo', {
      admin: true,
      info,
      message: req.flash('updated'),
      notiMessage: req.notiMessage,
    });
  },
);

router.post(
  '/editVehicle:id',
  notification,
  messgeLength,
  adminLogin,
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
      res.redirect(`/admin/info${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
);

router.get('/deleteProductAdmin', async (req, res) => {
  try {
    await vehicleHelpers.deleteVehicle(req.query.vehicleId);
    res.json({ deleted: true });
  } catch (err) {
    console.log(err);
  }
});

router.get(
  '/customers',
  adminLogin,
  notification,
  messgeLength,
  async (req, res) => {
    const userData = await adminHelpers.getCustomers();
    res.render('admin/customers', {
      admin: true,
      userData,
      blocked: req.session.blocked,
      notiMessage: req.notiMessage,
    });
  },
);

router.get('/blockTheUser/:id', async (req, res) => {
  await adminHelpers.blockUser(req.params.id);
  req.session.blocked = true;
  res.redirect('/admin/customers');
});

router.get('/unBlockTheUser/:id', async (req, res) => {
  await adminHelpers.unBlockUser(req.params.id);
  res.redirect('/admin/customers');
});

// -------------------bookings section start----------------------------
router.get(
  '/bookings',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const bookings = await adminHelpers.getBookings();
    res.render('admin/allBookings', {
      admin: true,
      bookings,
      notiMessage: req.notiMessage,
    });
  },
);

router.get(
  '/compleated-bookings',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const compleated = await adminHelpers.getCompleatedBookings();
    res.render('admin/compleatedBookings', {
      admin: true,
      compleated,
      notiMessage: req.notiMessage,
    });
  },
);

router.get(
  '/upcoming-booking',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const upcoming = await adminHelpers.getUpcomingBookings();
    res.render('admin/upcomingBookings', {
      admin: true,
      upcoming,
      notiMessage: req.notiMessage,
    });
  },
);

router.get(
  '/active-bookings',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const active = await adminHelpers.getActiveBookings();
    res.render('admin/activeBookings', {
      admin: true,
      active,
      notiMessage: req.notiMessage,
    });
  },
);

router.get(
  '/cancelled-booking',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const bookings = await adminHelpers.getCancelledBookings();
    res.render('admin/allBookings', {
      admin: true,
      bookings,
      notiMessage: req.notiMessage,
    });
  },
);

// ------------------------booking section end-----------------------

// ------------------------vendor data start -------------------------

router.get(
  '/approvedVendors',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const vendorData = await adminHelpers.getApprovedVendors();
    res.render('admin/approved-vendors', {
      admin: true,
      vendorData,
      notiMessage: req.notiMessage,
    });
  },
);

router.get(
  '/NotApprovedVendors',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const vendorData = await adminHelpers.getNotApprovedVendors();
    res.render('admin/notapproved-vendors', {
      admin: true,
      vendorData,
      notiMessage: req.notiMessage,
    });
  },
);

router.get('/approveVendor/', async (req, res) => {
  await adminHelpers.changeApproveTrue(req.query.id);
  res.json({ approved: true });
});

router.get('/notApproveVendor', async (req, res) => {
  await adminHelpers.changeApprovefalse(req.query.id);
  res.json({ ok: true });
});

router.get(
  '/climeRequests',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const approvels = await dashboardHelpers.getClimeApproves();
    res.render('admin/climes', { admin: true, approvels });
  },
);

router.get('/approveClimes', async (req, res) => {
  await dashboardHelpers.approveClimes(req.query);
  res.json({ approved: true });
});

// -------------------------vendor end ------------------------------------

// --------------------------coupon section start--------------------------

router.get(
  '/coupons',
  messgeLength,
  notification,
  adminLogin,
  async (req, res) => {
    const couponData = await couponsHelpers.getCoupons();
    res.render('admin/coupons', {
      admin: true,
      couponData,
      notiMessage: req.notiMessage,
    });
  },
);

router.post('/add-coupons', async (req, res) => {
  couponsHelpers.addCoupons(req.body);
  res.redirect('/admin/coupons');
});

router.get('/deleteCoupon:id', async (req, res) => {
  await couponsHelpers.deleteCoupon(req.params.id);
  res.redirect('/admin/coupons');
});

router.post('/uploadMessage', async (req, res) => {
  const Name = JSON.stringify(req.body['message[clindName]']);
  const Message = JSON.stringify(req.body['message[msg]']);
  const Subject = JSON.stringify(req.body['message[subject]']);
  const Email = JSON.stringify(req.body['message[clindEmail]']);
  const Time = JSON.stringify(req.body['message[time]']);

  const clindMessage = {
    _id: new ObjectId(),
    Name,
    Email,
    Subject,
    Message,
    Time,
  };
  await adminHelpers.addMessages(clindMessage);
  res.json();
});

router.post('/uploadNotification', async (req, res) => {
  const { message } = req.body;
  await adminHelpers.updateNotification(message);
});

router.get('/inbox', messgeLength, notification, async (req, res) => {
  const messages = await adminHelpers.getMessages();
  res.render('admin/inbox', {
    admin: true,
    messages,
    notiMessage: req.notiMessage,
  });
});

router.get('/deleteMessage/:id', async (req, res) => {
  await adminHelpers.deleteMessage(req.params.id);
  res.redirect('/admin/inbox');
});

router.get('/clearNotifi', async (req, res) => {
  await adminHelpers.clearNotification();
  res.redirect('/admin/home');
});

router.get('/logout', (req, res) => {
  req.session.adminLogin = false;
  res.redirect('/admin/');
});
module.exports = router;
