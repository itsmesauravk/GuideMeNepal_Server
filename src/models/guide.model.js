import mongoose from "mongoose";



const GuideSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contact: { type: String, required: true },
    password: { type: String, required: true },
    profile: {
      languageSpeak: [String],
      verified: { type: Boolean, default: false },
      registrationStatus: {
        type: String,
        enum: ["pending", "registered", "rejected"],
        default: "pending",
      },
      certificationPhotos: [String],
      selfVideo: String,
      guidingAreas: [String],
      aboutMe: String,
      experiences: [String],
      gallery: [
        {
          type: String,
          mediaType: { type: String, enum: ["photo", "video"] },
        },
      ],
    },
    securityMetadata: {
      lastPassword: String,
      wrongPasswordCounter: { type: Number, default: 0 },
      isSuspended: { type: Boolean, default: false },
    },
    availability: {
      isActivate: { type: Boolean, default: false },
      isAvailable: { type: Boolean, default: true },
    },
    otp: { code: String, expiresAt: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const Guide = mongoose.model("Guide", GuideSchema);

export default Guide;
