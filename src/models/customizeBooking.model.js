import mongoose from "mongoose";



const CustomizeBookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
    },
    bookingDetails: {
      destination: { type: String },
      startingLocation: { type: String },
      numberOfAdults: { type: Number },
      numberOfChildren: { type: Number },
      estimatedDays: { type: Number },
      estimatedPrice: { type: Number },
    },
    status: {
      bookingStatus: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      travelStatus: {
        type: String,
        enum: ["not started", "started", "completed"],
        default: "not started",
      },
    },
    platformLiability: { type: Boolean, default: false }, //this field is for whether the platform is liable (responsible) for the booking or not
  },
  { timestamps: true }
);

const CustomizeBooking = mongoose.model(
  "CustomizeBooking",
  CustomizeBookingSchema
);

export default CustomizeBooking;
