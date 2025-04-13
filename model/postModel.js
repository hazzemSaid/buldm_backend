const mongoose = require('mongoose');

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
    }
    ,

    location: {
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          //i need can be empty

        },
      },
      placeName: {
        type: String,
        default: '',
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ['lost', 'found', 'claimed'],
      required: true,
    },

    category: {
      type: String,

      default: 'other',
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
          default: 'other',
        },
      },
    ],



    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    contactInfo: {
      type: String,
      default: '',
      trim: true,
    }
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

PostSchema.index({ 'location.coordinates': '2dsphere' });// إنشاء فهرس مكاني للبحث عن المواقع
PostSchema.index({ title: 'text', description: 'text' }); // إنشاء فهرس نصي للبحث عن العناوين والأوصاف
PostSchema.index({ status: 1 }); // إنشاء فهرس عادي للحالة
PostSchema.index({ 'location.coordinates': '2dsphere' });
PostSchema.index({ createdAt: -1 });// إنشاء فهرس عكسي لتاريخ الإنشاء
PostSchema.index({ user: 1 }); // إنشاء فهرس عادي للمستخدم
PostSchema.index({ category: 1 }); // إنشاء فهرس عادي للفئة

module.exports = mongoose.model('Post', PostSchema);
