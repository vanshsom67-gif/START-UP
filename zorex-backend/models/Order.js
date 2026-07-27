const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  quantity: { type: Number, default: 1, min: 1 },
  size: { type: String, default: "" },
  color: { type: String, default: "" },
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = guest WhatsApp order
    },
    customerEmail: {
      type: String,
      default: "",
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    total: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["WhatsApp", "COD", "UPI", "Card"],
      default: "WhatsApp",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Placed",
    },
    shippingAddress: {
      type: String,
      default: "Via WhatsApp",
    },
    notes: { type: String, default: "" },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    courierName: {
      type: String,
      default: "",
    },
    trackingId: {
      type: String,
      default: "",
    },
    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },
    trackingLogs: [
      {
        status: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
