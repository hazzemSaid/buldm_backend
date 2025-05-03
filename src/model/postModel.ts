import mongoose from "mongoose";
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: null,
    },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
      placeName: {
        type: String,
        default: "",
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["lost", "found", "claimed"],
      required: true,
    },

    category: {
      type: String,

      default: "other",
    },

    predictedItems: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        confidence: {
          type: Number,
          required: true,
        },
        category: {
          type: String,
          default: "other",
        },
      },
    ],

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contactInfo: {
      type: String,
      default: "",
      trim: true,
    },
    when: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // يضيف createdAt و updatedAt تلقائيًا
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret._id;
      },
    },
  }
);
PostSchema.index({ "location.coordinates": "2dsphere" }); // إنشاء فهرس مكاني للبحث عن المواقع
PostSchema.index({ title: "text", description: "text" }); // إنشاء فهرس نصي للبحث عن العناوين والأوصاف
PostSchema.index({ status: 1 }); // إنشاء فهرس عادي للحالة
PostSchema.index({ createdAt: -1 }); // إنشاء فهرس عكسي لتاريخ الإنشاء
PostSchema.index({ user: 1 }); // إنشاء فهرس عادي للمستخدم
PostSchema.index({ category: 1 }); // إنشاء فهرس عادي للفئة

export default mongoose.model("Post", PostSchema);
/*
location: {
  type: { type: String, enum: ["Point"], required: true },
  coordinates: { type: [Number], required: true }
    placeName: {
        type: String,
        default: '',
        trim: true,
      },
}
*/
