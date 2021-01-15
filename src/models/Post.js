const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const PostSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  info: {
    type: {
      area: {
        type: Number,
        required: true,
      },
      sale: {
        type: String,
        required: true,
      },
      room: {
        type: Number,
        required: true,
      },
      suite: {
        type: Number,
        required: true,
      },
      garage: {
        type: Number,
        required: true,
      },
      spotlight: {
        type: Boolean,
        require: true,
      },
    },
    required: true,
  },
  infoAdd: {
    type: [String],
    required: false,
  },
  address: {
    type: {
      street: {
        type: String,
        required: true,
      },
      district: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
    require: true,
  },
  images: {
    type: [
      {
        name: String,
        key: String,
        url: String,
        size: Number,
      },
    ],
    required: false,
  },
  thumbnail: {
    type: {
      name: String,
      key: String,
      url: String,
      size: Number,
    },
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

PostSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Post", PostSchema);
