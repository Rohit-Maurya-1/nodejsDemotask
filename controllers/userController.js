const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const saltRounds = 10;
module.exports.createUser = async (req, res) => {
  const { name, email, password, address, latitude, longitude, status } =
    req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists",
        status: 400,
        response: {},
      });
    }
    const Password = await bcrypt.hash(password, saltRounds);
    const userData = await User.create({
      name,
      email,
      password: Password,
      address,
      latitude,
      longitude,
      status,
      registeredAt: new Date(),
    });
    const Token = jwt.sign(
      { userId: userData._id },
      process.env.JWT_SECRET,
      {}
    );
    if (Token) {
      const tokenData = await User.findByIdAndUpdate(
        userData._id,
        { $set: { token: Token } },
        { new: true }
      );
      return res.status(201).send({
        message: "user created successfully",
        status: 201,
        response: tokenData,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
//====================================

module.exports.updateStatus = async (req, res) => {
  try {
    const result = await User.updateMany({}, [
      {
        $set: {
          status: {
            $cond: {
              if: { $eq: ["$status", "active"] },
              then: "inactive",
              else: "active",
            },
          },
        },
      },
    ]);
    res.status(200).json({
      message: "User statuses updated successfully",
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

//===================================== lat log get distances calculation ================
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const R = 6371; // Radius of the Earth in km

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
};

module.exports.createDistance = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Destination coordinates are required." });
    }

    const userId = req.user._id;
    console.log(`User ID: ${userId}`); // Debugging: Check if userId is correct

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.latitude || !user.longitude) {
      return res.status(404).json({ message: "User location not found." });
    }

    // Calculate distance (assuming calculateDistance is implemented)
    const distance = calculateDistance(
      user.latitude,
      user.longitude,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    res.status(200).json({
      message: "Distance calculated successfully",
      distance: `${distance.toFixed(2)} km`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};


  
  

//=====================================================weekday user data get===============
module.exports.users = async (req, res) => {
  try {
    // Extract weekday from params and convert to integer
    const weekday = parseInt(req.params.weekday, 10);

    // Validate weekday code (1 = Sunday, 7 = Saturday)
    if (isNaN(weekday) || weekday < 1 || weekday > 7) {
      return res
        .status(400)
        .json({
          error:
            "Invalid weekday code. It must be between 1 (Sunday) and 7 (Saturday).",
        });
    }

    // Use MongoDB aggregation to find users created on the specified weekday
    const users = await User.aggregate([
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: "$registeredAt" }, // Extract the day of the week from createdAt
        },
      },
      {
        $match: {
          dayOfWeek: weekday, // Match the weekday code
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          dayOfWeek: 1,
          registeredAt: 1,
        },
      },
    ]);

    // Group users into an array for each day of the week
    const groupedUsers = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    // Add users to the corresponding day of the week in the result object
    users.forEach((user) => {
      switch (user.dayOfWeek) {
        case 1:
          groupedUsers.Sunday.push(user);
          break;
        case 2:
          groupedUsers.Monday.push(user);
          break;
        case 3:
          groupedUsers.Tuesday.push(user);
          break;
        case 4:
          groupedUsers.Wednesday.push(user);
          break;
        case 5:
          groupedUsers.Thursday.push(user);
          break;
        case 6:
          groupedUsers.Friday.push(user);
          break;
        case 7:
          groupedUsers.Saturday.push(user);
          break;
      }
    });

    // Respond with grouped users
    res.status(200).json({
      message: "Users retrieved successfully",
      data: groupedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
