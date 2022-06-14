const { ObjectId } = require('mongodb');
const moment = require('moment');
const db = require('../database/connection');
const collection = require('../database/collection');

module.exports = {
  // get dates array
  getDates: (startDate, stopDate) => {
    const dateArray = new Array();
    let currentDate = new Date(currentDate);
    currentDate = startDate;
    while (currentDate <= stopDate) {
      dateArray.push(new Date(currentDate));
      currentDate = currentDate.addDays(1);
    }
    return dateArray;
  },
  // get total revenue for vendor
  getTotalRevenue: (hub) => new Promise(async (resolve, reject) => {
    const revenue = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.product.pickUpLocation': hub },
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $group: {
            _id: null,
            Total_Fare: { $sum: '$booking.product.Fare' },
          },
        },
      ])
      .toArray();
    if (revenue[0]) {
      const netRevenue = revenue[0].Total_Fare * 0.9;
      await db
        .get()
        .collection(collection.VENDOR_COLLECTION)
        .updateOne({ 'data.hubName': hub }, { $inc: { Revenue: netRevenue } });
      const adminRevenue = revenue[0].Total_Fare - netRevenue;
      await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .updateOne({}, { $inc: { Revenue: adminRevenue } });
      const revenuPerc = (netRevenue / revenue[0].Total_Fare) * 100;

      const response = {
        revenuPerc,
        netRevenue,
        revenue: revenue[0].Total_Fare,
      };
      resolve(response);
    } else {
      const netRevenue = 0;
      const revenuPerc = (revenue[0].Total_Fare - netRevenue) * 100;
      const response = {
        revenuPerc,
        netRevenue,
      };
      resolve(response);
    }
  }),

  //   total bookings count vendor

  getTotalBookings: (hub) => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.product.pickUpLocation': hub },
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $count: 'product',
        },
      ])
      .toArray();
    if (bookings[0]) {
      resolve(bookings[0].product);
    } else {
      const booking = 0;
      resolve(booking);
    }
  }),

  //   get total vehicles for vendor

  getTotalVehicles: (hub) => new Promise(async (resolve, reject) => {
    const vehicles = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .aggregate([
        {
          $match: { 'data.hubName': hub },
        },
        {
          $unwind: '$vehicles',
        },
        {
          $count: 'vehicles',
        },
      ])
      .toArray();
    if (vehicles[0]) {
      resolve(vehicles[0].vehicles);
    } else {
      const vehicles = 0;
      resolve(vehicles);
    }
  }),
  // getWallet vendor
  getWallet: (hub) => new Promise(async (resolve, reject) => {
    const wallet = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .aggregate([
        {
          $match: { 'data.hubName': hub },
        },
        {
          $project: { _id: 0, wallet: 1 },
        },
      ])
      .toArray();
    resolve(wallet[0].wallet);
  }),
  // requestForMoney: ()
  requestForMoney: (revenue, hub, vendorName) => new Promise(async (resolve, reject) => {
    const requests = {
      _id: new ObjectId(),
      vendorName,
      revenue,
      hub,
      requestDate: new Date(),
      approved: false,
    };
    await db.get().collection(collection.ADMIN_COLLECTION).updateOne(
      {},
      { $push: { requests } },
      { upsert: true },
    );
    resolve();
  }),

  //   get clime approvels for admin

  getClimeApproves: () => new Promise(async (resolve, reject) => {
    const requests = await db.get().collection(collection.ADMIN_COLLECTION).aggregate([
      {
        $unwind: '$requests',
      },
      {
        $match: { 'requests.approved': false },
      },
      {
        $project: { _id: 0, requests: 1 },
      },
    ]).toArray();
    resolve(requests);
  }),

  approveClimes: (data) => new Promise(async (resolve, reject) => {
    await db.get().collection(collection.ADMIN_COLLECTION).updateOne(
      { 'requests._id': ObjectId(data.id) },
      { $set: { 'requests.$.approved': true, 'requests.$.paymentId': `LD${new Date().getTime()}`, 'requests.$.approvedOn': new Date() } },
    );
    await db.get().collection(collection.VENDOR_COLLECTION).updateOne(
      { 'data.hubName': data.hub },
      { $inc: { wallet: parseInt(data.revenue) } },
    );
    resolve();
  }),

  getVendorGraphValues: (hub) => new Promise(async (resolve, reject) => {
    const values = await db.get().collection(collection.ADMIN_COLLECTION).aggregate([
      {
        $unwind: '$requests',
      },
      {
        $match: { 'requests.hub': hub },
      },
      {
        $project: { requests: 1, _id: 0 },
      },
    ]).toArray();

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(parseInt(moment(d).format('D'), 10));
    }

    for (const i in values) {
      if (values[i].requests.approvedOn) {
        values[i].requests.approvedOn = values[i].requests.approvedOn.getDate();
      }
    }
    const price = [];
    let p = 0;

    for (const i in days) {
      p = 0;
      for (const j in values) {
        if (days[i] === values[j].requests.approvedOn) {
          p += values[j].requests.revenue;
        }
      }
      price.push(p);
    }

    const response = {
      price,
      days,
    };
    resolve(response);
  }),

  getBookingValues: (hub) => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.product.pickUpLocation': hub },
        },
        {
          $project: {
            booking: {
              dropDate: '$booking.product.dropDate',
              Fare: '$booking.product.Fare',
            },
          },
        },
      ])
      .toArray();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(parseInt(moment(d).format('D'), 10));
    }
    console.log(days);
    for (const i in bookings) {
      if (bookings[i].booking.dropDate) {
        bookings[i].booking.dropDate = moment(bookings[i].booking.dropDate).toDate();
        bookings[i].booking.dropDate = bookings[i].booking.dropDate.getDate();
      }
    }
    const price = [];
    let p = 0;

    for (const i in days) {
      p = 0;
      for (const j in bookings) {
        if (days[i] === bookings[j].booking.dropDate) {
          p += bookings[j].booking.Fare;
        }
      }
      price.push(p);
    }

    const response = {
      price,
      days,
    };
    resolve(response);
  }),

  getAllBookings: (hub) => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.product.pickUpLocation': hub },
        },
        {
          $count: 'product',
        },
      ])
      .toArray();
    if (bookings[0]) {
      resolve(bookings[0].product);
    } else {
      const booking = 0;
      resolve(booking);
    }
  }),

  // ----------------------vendor end-------------------------------
  // -------------------------admin start------------------------------

  getTotalRevenueAdmin: () => new Promise(async (resolve, reject) => {
    const revenue = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $group: {
            _id: null,
            Total_Fare: { $sum: '$booking.product.Fare' },
          },
        },
      ])
      .toArray();
    if (revenue[0]) {
      resolve(revenue[0].Total_Fare);
    } else {
      revenue = 0;
      resolve(revenue);
    }
  }),

  //   total bookings count vendor

  getTotalBookingsAdmin: () => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $match: { 'booking.PaymentStatus': 'success' },
        },
        {
          $count: 'product',
        },
      ])
      .toArray();
    if (bookings[0]) {
      resolve(bookings[0].product);
    } else {
      const booking = 0;
      resolve(booking);
    }
  }),

  //   get total vehicles for vendor

  getTotalVehiclesAdmin: () => new Promise(async (resolve, reject) => {
    const vehicles = await db
      .get()
      .collection(collection.VENDOR_COLLECTION)
      .aggregate([
        {
          $unwind: '$vehicles',
        },
        {
          $count: 'vehicles',
        },
      ])
      .toArray();
    if (vehicles[0]) {
      resolve(vehicles[0].vehicles);
    } else {
      const vehicles = 0;
      resolve(vehicles);
    }
  }),

  getAllUser: () => new Promise(async (resolve, reject) => {
    const users = await db.get().collection(collection.USER_COLLECTION).aggregate([
      {
        $count: 'users',
      },
    ]).toArray();
    resolve(users[0].users);
  }),

  getProfit: () => new Promise(async (resolve, reject) => {
    const profit = await db.get().collection(collection.ADMIN_COLLECTION).aggregate([
      { $project: { Revenue: 1, _id: 0 } },
    ]).toArray();
    if (profit[0]) {
      resolve(profit[0].Revenue);
    } else {
      profit = 0;
      resolve(profit);
    }
  }),

  getAdminGraphValues: () => new Promise(async (resolve, reject) => {
    const values = await db.get().collection(collection.ADMIN_COLLECTION).aggregate([
      {
        $unwind: '$requests',
      },
      {
        $project: { requests: 1, _id: 0 },
      },
    ]).toArray();

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(parseInt(moment(d).format('D'), 10));
    }

    for (const i in values) {
      if (values[i].requests.approvedOn) {
        values[i].requests.approvedOn = values[i].requests.approvedOn.getDate();
      }
    }
    const price = [];
    let p = 0;

    for (const i in days) {
      p = 0;
      for (const j in values) {
        if (days[i] === values[j].requests.approvedOn) {
          p += values[j].requests.revenue;
        }
      }
      price.push(p);
    }

    const response = {
      price,
      days,
    };
    resolve(response);
  }),

  getAdminBookingValues: () => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $project: {
            booking: {
              dropDate: '$booking.product.dropDate',
              Fare: '$booking.product.Fare',
            },
          },
        },
      ])
      .toArray();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(parseInt(moment(d).format('D'), 10));
    }
    for (const i in bookings) {
      if (bookings[i].booking.dropDate) {
        bookings[i].booking.dropDate = moment(bookings[i].booking.dropDate).toDate();
        bookings[i].booking.dropDate = bookings[i].booking.dropDate.getDate();
      }
    }
    const price = [];
    let p = 0;

    for (const i in days) {
      p = 0;
      for (const j in bookings) {
        if (days[i] === bookings[j].booking.dropDate) {
          p += bookings[j].booking.Fare;
        }
      }
      price.push(p);
    }

    const response = {
      price,
      days,
    };
    resolve(response);
  }),

  getAllBookingsAdmin: () => new Promise(async (resolve, reject) => {
    const bookings = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .aggregate([
        {
          $unwind: '$booking',
        },
        {
          $unwind: '$booking.product',
        },
        {
          $count: 'product',
        },
      ])
      .toArray();
    if (bookings[0]) {
      resolve(bookings[0].product);
    } else {
      const booking = 0;
      resolve(booking);
    }
  }),

};
