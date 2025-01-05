import mongoose from "mongoose";



const PackageBookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    details: {
      adult: { type: String },
      children: { type: String },
      date: { type: String },
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
  },
  { timestamps: true }
);

const PackageBooking = mongoose.model("PackageBooking", PackageBookingSchema);

export default PackageBooking;
