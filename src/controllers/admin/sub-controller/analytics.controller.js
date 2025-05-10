import User from "../../../models/user.model.js";
import Guide from "../../../models/guide.model.js";
import CustomizeBooking from "../../../models/customizeBooking.model.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

import { Op, fn, col, literal } from "sequelize";

// Controller to get user growth data (monthly registrations)
const getUserGrowthData = asyncHandler(async (req, res) => {
  // Get year from query params or use current year
  const year = req.query.year || new Date().getFullYear();
  
  // Use Sequelize model method instead of raw SQL query
  // Original query:
  // SELECT 
  //   EXTRACT(MONTH FROM "createdAt") AS month_num,
  //   TO_CHAR("createdAt", 'Month') AS month_name,
  //   COUNT(*) AS user_count
  // FROM users
  // WHERE 
  //   EXTRACT(YEAR FROM "createdAt") = :year
  // GROUP BY month_num, month_name
  // ORDER BY month_num ASC
  
  const userGrowthData = await User.findAll({
    attributes: [
      [fn('EXTRACT', literal('MONTH FROM "createdAt"')), 'month_num'],
      [fn('TO_CHAR', col('createdAt'), 'Month'), 'month_name'],
      [fn('COUNT', '*'), 'user_count']
    ],
    where: {
      createdAt: {
        [Op.and]: [
          literal(`EXTRACT(YEAR FROM "createdAt") = ${year}`)
        ]
      }
    },
    group: ['month_num', 'month_name'],
    order: [[literal('month_num'), 'ASC']],
    raw: true
  });

  // Format data to match the chart's expected structure
  const formattedData = [];
  
  // Ensure all months are represented
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  monthNames.forEach((monthName, index) => {
    const monthData = userGrowthData.find(
      item => parseInt(item.month_num) === index + 1
    );
    
    formattedData.push({
      month: monthName,
      users: monthData ? parseInt(monthData.user_count) : 0
    });
  });

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "User growth data fetched successfully", formattedData)
  );
});

// Controller to get guide growth data
const getGuideGrowthData = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  
  // Use Sequelize model method instead of raw SQL query
  // Original query:
  // SELECT 
  //   EXTRACT(MONTH FROM "createdAt") AS month_num,
  //   TO_CHAR("createdAt", 'Month') AS month_name,
  //   COUNT(*) AS guide_count
  // FROM guides
  // WHERE 
  //   EXTRACT(YEAR FROM "createdAt") = :year
  // GROUP BY month_num, month_name
  // ORDER BY month_num ASC
  
  const guideGrowthData = await Guide.findAll({
    attributes: [
      [fn('EXTRACT', literal('MONTH FROM "createdAt"')), 'month_num'],
      [fn('TO_CHAR', col('createdAt'), 'Month'), 'month_name'],
      [fn('COUNT', '*'), 'guide_count']
    ],
    where: {
      createdAt: {
        [Op.and]: [
          literal(`EXTRACT(YEAR FROM "createdAt") = ${year}`)
        ]
      }
    },
    group: ['month_num', 'month_name'],
    order: [[literal('month_num'), 'ASC']],
    raw: true
  });
  
  // Format data with all months represented
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const formattedData = monthNames.map((monthName, index) => {
    const monthData = guideGrowthData.find(
      item => parseInt(item.month_num) === index + 1
    );
    
    return {
      month: monthName,
      guides: monthData ? parseInt(monthData.guide_count) : 0
    };
  });
  
  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "Guide growth data fetched successfully", formattedData)
  );
});

// Controller to get booking count data
const getBookingCountData = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  
  // Use Sequelize model method instead of raw SQL query
  // Original query:
  // SELECT 
  //   EXTRACT(MONTH FROM "createdAt") AS month_num,
  //   TO_CHAR("createdAt", 'Month') AS month_name,
  //   COUNT(*) AS booking_count
  // FROM customize_bookings
  // WHERE 
  //   EXTRACT(YEAR FROM "createdAt") = :year
  // GROUP BY month_num, month_name
  // ORDER BY month_num ASC
  
  const bookingCountData = await CustomizeBooking.findAll({
    attributes: [
      [fn('EXTRACT', literal('MONTH FROM "createdAt"')), 'month_num'],
      [fn('TO_CHAR', col('createdAt'), 'Month'), 'month_name'],
      [fn('COUNT', '*'), 'booking_count']
    ],
    where: {
      createdAt: {
        [Op.and]: [
          literal(`EXTRACT(YEAR FROM "createdAt") = ${year}`)
        ]
      }
    },
    group: ['month_num', 'month_name'],
    order: [[literal('month_num'), 'ASC']],
    raw: true
  });
  
  // Format data with all months represented
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const formattedData = monthNames.map((monthName, index) => {
    const monthData = bookingCountData.find(
      item => parseInt(item.month_num) === index + 1
    );
    
    return {
      month: monthName,
      bookings: monthData ? parseInt(monthData.booking_count) : 0
    };
  });
  
  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "Booking count data fetched successfully", formattedData)
  );
});

// Helper function to calculate growth percentage
const calculateGrowthPercentage = (data) => {
  if (data.length < 2) return 0;
  
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth > 0 ? currentMonth - 1 : 11;
  
  const currentMonthData = data[currentMonth]?.users || data[currentMonth]?.guides || data[currentMonth]?.bookings || 0;
  const lastMonthData = data[lastMonth]?.users || data[lastMonth]?.guides || data[lastMonth]?.bookings || 0;
  
  if (lastMonthData === 0) return 100; // Full growth if last month was zero
  
  return ((currentMonthData - lastMonthData) / lastMonthData * 100).toFixed(1);
};

// Combined controller to get all analytics data in one request
const getAllAnalyticsData = asyncHandler(async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  
  // User growth data query
  // Original query:
  // SELECT 
  //   EXTRACT(MONTH FROM "createdAt") AS month_num,
  //   TO_CHAR("createdAt", 'Month') AS month_name,
  //   COUNT(*) AS user_count
  // FROM users
  // WHERE 
  //   EXTRACT(YEAR FROM "createdAt") = :year
  // GROUP BY month_num, month_name
  // ORDER BY month_num ASC
  
  const userGrowthData = await User.findAll({
    attributes: [
      [fn('EXTRACT', literal('MONTH FROM "createdAt"')), 'month_num'],
      [fn('TO_CHAR', col('createdAt'), 'Month'), 'month_name'],
      [fn('COUNT', '*'), 'user_count']
    ],
    where: {
      createdAt: {
        [Op.and]: [
          literal(`EXTRACT(YEAR FROM "createdAt") = ${year}`)
        ]
      }
    },
    group: ['month_num', 'month_name'],
    order: [[literal('month_num'), 'ASC']],
    raw: true
  });
  
  // Guide growth data query
  // Original query:
  // SELECT 
  //   EXTRACT(MONTH FROM "createdAt") AS month_num,
  //   TO_CHAR("createdAt", 'Month') AS month_name,
  //   COUNT(*) AS guide_count
  // FROM guides
  // WHERE 
  //   EXTRACT(YEAR FROM "createdAt") = :year
  // GROUP BY month_num, month_name
  // ORDER BY month_num ASC
  
  const guideGrowthData = await Guide.findAll({
    attributes: [
      [fn('EXTRACT', literal('MONTH FROM "createdAt"')), 'month_num'],
      [fn('TO_CHAR', col('createdAt'), 'Month'), 'month_name'],
      [fn('COUNT', '*'), 'guide_count']
    ],
    where: {
      createdAt: {
        [Op.and]: [
          literal(`EXTRACT(YEAR FROM "createdAt") = ${year}`)
        ]
      }
    },
    group: ['month_num', 'month_name'],
    order: [[literal('month_num'), 'ASC']],
    raw: true
  });
  
  // Booking count data query
  // Original query:
  // SELECT 
  //   EXTRACT(MONTH FROM "createdAt") AS month_num,
  //   TO_CHAR("createdAt", 'Month') AS month_name,
  //   COUNT(*) AS booking_count
  // FROM customize_bookings
  // WHERE 
  //   EXTRACT(YEAR FROM "createdAt") = :year
  // GROUP BY month_num, month_name
  // ORDER BY month_num ASC
  
  const bookingCountData = await CustomizeBooking.findAll({
    attributes: [
      [fn('EXTRACT', literal('MONTH FROM "createdAt"')), 'month_num'],
      [fn('TO_CHAR', col('createdAt'), 'Month'), 'month_name'],
      [fn('COUNT', '*'), 'booking_count']
    ],
    where: {
      createdAt: {
        [Op.and]: [
          literal(`EXTRACT(YEAR FROM "createdAt") = ${year}`)
        ]
      }
    },
    group: ['month_num', 'month_name'],
    order: [[literal('month_num'), 'ASC']],
    raw: true
  });
  
  // Format data with all months represented
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Format user data
  const formattedUserData = monthNames.map((monthName, index) => {
    const monthData = userGrowthData.find(
      item => parseInt(item.month_num) === index + 1
    );
    
    return {
      month: monthName,
      users: monthData ? parseInt(monthData.user_count) : 0
    };
  });
  
  // Format guide data
  const formattedGuideData = monthNames.map((monthName, index) => {
    const monthData = guideGrowthData.find(
      item => parseInt(item.month_num) === index + 1
    );
    
    return {
      month: monthName,
      users: monthData ? parseInt(monthData.guide_count) : 0
    };
  });
  
  // Format booking data
  const formattedBookingData = monthNames.map((monthName, index) => {
    const monthData = bookingCountData.find(
      item => parseInt(item.month_num) === index + 1
    );
    
    return {
      month: monthName,
      bookings: monthData ? parseInt(monthData.booking_count) : 0
    };
  });
  
  // Calculate growth percentages
  const userGrowthPercentage = calculateGrowthPercentage(formattedUserData);
  const guideGrowthPercentage = calculateGrowthPercentage(formattedGuideData);
  const bookingGrowthPercentage = calculateGrowthPercentage(formattedBookingData);
  
  // Create response data
  const responseData = {
    userGrowth: {
      data: formattedUserData,
      growthPercentage: userGrowthPercentage
    },
    guideGrowth: {
      data: formattedGuideData,
      growthPercentage: guideGrowthPercentage
    },
    bookingGrowth: {
      data: formattedBookingData,
      growthPercentage: bookingGrowthPercentage
    }
  };

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "Analytics data fetched successfully", responseData)
  );
});

export {
  getUserGrowthData,
  getGuideGrowthData,
  getBookingCountData,
  getAllAnalyticsData
};