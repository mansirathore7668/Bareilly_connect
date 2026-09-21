const Review = require("../models/Review");

async function attachCalculatedRatings(businesses) {
  if (!businesses.length) {
    return businesses;
  }

  const businessIds = businesses.map((business) => business._id);
  const stats = await Review.aggregate([
    { $match: { businessId: { $in: businessIds } } },
    {
      $group: {
        _id: "$businessId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const statsByBusiness = new Map(stats.map((item) => [item._id.toString(), item]));

  return businesses.map((business) => {
    const calculated = statsByBusiness.get(business._id.toString());
    if (!calculated) {
      return {
        ...business,
        ratingAverage: Number(business.ratingAverage) > 0 ? Number(business.ratingAverage) : 0,
        reviewCount: Number(business.reviewCount) || 0,
      };
    }

    return {
      ...business,
      ratingAverage: Number(calculated.averageRating.toFixed(1)),
      reviewCount: calculated.reviewCount,
    };
  });
}

module.exports = { attachCalculatedRatings };