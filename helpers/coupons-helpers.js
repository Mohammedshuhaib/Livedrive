const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const moment = require('moment');
const db = require('../database/connection');
const collection = require('../database/collection');

module.exports = {
  addCoupons: (couponData) => new Promise(async (resolve, reject) => {
    const coupon = {
      _id: new ObjectId(),
      CouponName: couponData.couponName,
      Couponcode: couponData.Couponcode,
      ExpiryDate: moment(couponData.expiryDate).format('MM/DD/YYYY hh:mm:ss'),
      Discount: parseInt(couponData.OfferAmount, 10),
      Discription: couponData.Discription,
      Createdat: `${moment().format('MM/DD/YYYY')} ${moment().format(
        'hh:mm:ss',
      )}`,
      Limit: parseInt(couponData.Limit, 10),
      users: [],
    };
    db.get()
      .collection(collection.ADMIN_COLLECTION)
      .updateOne({}, { $push: { coupon } }, { upsert: true });
    resolve();
  }),

  getCoupons: () => new Promise(async (resolve, reject) => {
    const couponData = await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .aggregate([
        {
          $unwind: '$coupon',
        },
        {
          $project: {
            coupon: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    for (const i in couponData) {
      if (
        new Date().getTime()
            >= new Date(couponData[i].coupon.ExpiryDate).getTime()
          || couponData[i].coupon.users.length === couponData[i].coupon.Limit
      ) {
        await db
          .get()
          .collection(collection.ADMIN_COLLECTION)
          .updateOne(
            { 'coupon._id': ObjectId(couponData[i].coupon._id) },
            {
              $pull: {
                coupon: { _id: new ObjectId(couponData[i].coupon._id) },
              },
            },
          );
      }
    }
    resolve(couponData);
  }),

  checkIdExist: (id, couponId) => new Promise(async (resolve, reject) => {
    const exist = await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .aggregate([
        {
          $unwind: '$coupon',
        },
        {
          $match: { 'coupon._id': ObjectId(couponId) },
        },
        {
          $match: { 'coupon.users': id },
        },
      ])
      .toArray();
    if (exist != '') {
      reject(exist);
    }
    resolve();
  }),

  updateUser: (id, couponId) => new Promise(async (resolve, reject) => {
    const response = await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .updateOne(
        { 'coupon._id': ObjectId(couponId) },
        { $push: { 'coupon.$.users': id } },
        { upsert: true },
      );
    resolve();
  }),

  deleteCoupon: (id) => new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.ADMIN_COLLECTION)
      .updateOne(
        { 'coupon._id': ObjectId(id) },
        {
          $pull: {
            coupon: { _id: new ObjectId(id) },
          },
        },
      );
    resolve();
  }),
};
