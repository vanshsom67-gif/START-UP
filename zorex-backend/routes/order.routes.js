const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly, deliveryOnly } = require("../middleware/auth");
const { sendOrderEmail } = require("../config/email");
const Razorpay = require("razorpay");
const {
  isDBConnected,
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignDelivery,
  getAssignedOrders,
  getOrderStats,
  updateProduct,
  getProductById,
} = require("../config/dataStore");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey1234",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret1234",
});

// Helper: Deduct stock from product and variant
const deductOrderStock = async (items) => {
  for (const item of items) {
    if (!item.productId) continue;
    try {
      if (isDBConnected()) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        product.stock = Math.max(0, product.stock - (item.quantity || 1));
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants.find(
            (v) =>
              v.size.toLowerCase() === (item.size || "").toLowerCase() &&
              (v.color || "").toLowerCase() === (item.color || "").toLowerCase()
          );
          if (variant) {
            variant.stock = Math.max(0, variant.stock - (item.quantity || 1));
          }
        }
        await product.save();
      } else {
        const prod = await getProductById(item.productId);
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 100) - (item.quantity || 1));
          let newVariants = prod.variants;
          if (newVariants && newVariants.length > 0) {
            newVariants = newVariants.map((v) => {
              if (
                (v.size || "").toLowerCase() === (item.size || "").toLowerCase() &&
                (v.color || "").toLowerCase() === (item.color || "").toLowerCase()
              ) {
                return { ...v, stock: Math.max(0, (v.stock || 0) - (item.quantity || 1)) };
              }
              return v;
            });
          }
          await updateProduct(item.productId, { stock: newStock, variants: newVariants });
        }
      }
    } catch (err) {
      console.error(`Failed to deduct stock for product ${item.productId}:`, err);
    }
  }
};

// ─── POST /api/orders — Place new order (Protected) ───────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { items, subtotal, discount, couponCode, total, paymentMethod, shippingAddress, notes } = req.body;

    if (!items || items.length === 0 || !total) {
      return res.status(400).json({ message: "Items and total are required" });
    }

    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email;

    if (isDBConnected()) {
      const order = await Order.create({
        user: userId,
        customerEmail: userEmail,
        items,
        subtotal: Number(subtotal) || Number(total),
        discount: Number(discount) || 0,
        couponCode: couponCode || "",
        total: Number(total),
        deliveryCharge: 0,
        paymentMethod: paymentMethod || "WhatsApp",
        shippingAddress: shippingAddress || "Via WhatsApp",
        notes: notes || "",
        isPaid: false,
        trackingLogs: [
          {
            status: "Placed",
            message: "Order placed successfully.",
          },
        ],
      });

      // If online payment (UPI or Card), initiate Razorpay Order creation
      if (paymentMethod === "UPI" || paymentMethod === "Card") {
        try {
          const options = {
            amount: Math.round(Number(total) * 100),
            currency: "INR",
            receipt: `receipt_order_${order._id}`,
          };
          const razorpayOrder = await razorpay.orders.create(options);
          order.razorpayOrderId = razorpayOrder.id;
          await order.save();

          return res.status(201).json({
            status: "success",
            order,
            razorpayOrder,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_dummykey1234",
          });
        } catch (rzpErr) {
          console.error("Razorpay Order creation error:", rzpErr);
          return res.status(500).json({
            message: "Failed to initialize online payment",
            error: rzpErr.message,
          });
        }
      }

      try {
        await deductOrderStock(order.items);
        await sendOrderEmail(order, req.user);
      } catch (emailErr) {
        console.error("Failed to send order email:", emailErr);
      }

      return res.status(201).json({ status: "success", order });
    }

    // Standalone JSON Mode
    const order = await createOrder({
      user: userId,
      customerEmail: userEmail,
      items,
      subtotal: Number(subtotal) || Number(total),
      discount: Number(discount) || 0,
      couponCode: couponCode || "",
      total: Number(total),
      deliveryCharge: 0,
      paymentMethod: paymentMethod || "WhatsApp",
      shippingAddress: shippingAddress || "Via WhatsApp",
      notes: notes || "",
      isPaid: false,
    });

    try {
      await deductOrderStock(order.items);
      await sendOrderEmail(order, req.user);
    } catch (emailErr) {
      console.error("Failed to send order email:", emailErr);
    }

    res.status(201).json({ status: "success", order });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Could not place order" });
  }
});

// ─── POST /api/orders/verify-payment — Verify Razorpay Payment (Protected) ───
router.post("/verify-payment", protect, async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({ message: "All payment credentials are required" });
    }

    if (isDBConnected()) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummysecret1234");
      hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: "Invalid payment signature verification failed" });
      }

      order.isPaid = true;
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpayOrderId = razorpayOrderId;
      order.razorpaySignature = razorpaySignature;
      order.status = "Confirmed";
      await order.save();

      try {
        await deductOrderStock(order.items);
        await sendOrderEmail(order, req.user);
      } catch (e) {}

      return res.json({ status: "success", order });
    }

    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const updated = await updateOrderStatus(orderId, "Confirmed", "Online Payment Verified successfully.");
    res.json({ status: "success", order: updated });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Could not verify payment" });
  }
});

// ─── GET /api/orders/mine — My own orders (Protected) ─────────────────
router.get("/mine", protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    if (isDBConnected()) {
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("deliveryPartner", "name phone");

      return res.json({ status: "success", count: orders.length, orders });
    }

    const orders = await getUserOrders(userId);
    res.json({ status: "success", count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch your orders" });
  }
});

// ─── GET /api/orders — All orders (Admin Only) ────────────────────────
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    if (isDBConnected()) {
      let query = {};
      if (status) query.status = status;

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "name email phone")
        .populate("deliveryPartner", "name email phone");

      return res.json({
        status: "success",
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        orders,
      });
    }

    const all = await getAllOrders({ status });
    res.json({
      status: "success",
      total: all.length,
      page: 1,
      pages: 1,
      orders: all,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch orders" });
  }
});

// ─── PATCH /api/orders/:id — Update order status (Admin Only) ─────────
router.patch("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Valid status values: ${validStatuses.join(", ")}`,
      });
    }

    if (isDBConnected()) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.status = status;
      order.trackingLogs.push({
        status,
        message: `Order status updated to ${status} by Administrator.`,
      });
      
      await order.save();
      return res.json({ status: "success", order });
    }

    const order = await updateOrderStatus(req.params.id, status, `Order status updated to ${status} by Administrator.`);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ status: "success", order });
  } catch (error) {
    res.status(500).json({ message: "Could not update order" });
  }
});

// ─── GET /api/orders/stats/summary — Stats for admin dashboard ─────────
router.get("/stats/summary", protect, adminOnly, async (req, res) => {
  try {
    if (isDBConnected()) {
      const totalOrders = await Order.countDocuments();
      const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      const pendingOrders = await Order.countDocuments({ status: "Placed" });
      const deliveredOrders = await Order.countDocuments({ status: "Delivered" });

      return res.json({
        status: "success",
        stats: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingOrders,
          deliveredOrders,
        },
      });
    }

    const stats = await getOrderStats();
    res.json({ status: "success", stats });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch stats" });
  }
});

// ─── GET /api/orders/assigned — Assigned orders for delivery partner ───
router.get("/assigned", protect, deliveryOnly, async (req, res) => {
  try {
    const partnerId = req.user._id || req.user.id;
    if (isDBConnected()) {
      const orders = await Order.find({ deliveryPartner: partnerId })
        .sort({ createdAt: -1 })
        .populate("user", "name email phone");
      return res.json({ status: "success", count: orders.length, orders });
    }

    const orders = await getAssignedOrders(partnerId);
    res.json({ status: "success", count: orders.length, orders });
  } catch (error) {
    console.error("Fetch assigned orders error:", error);
    res.status(500).json({ message: "Could not fetch assigned orders" });
  }
});

// ─── PATCH /api/orders/:id/assign-delivery — Assign courier & partner (Admin Only) ───
router.patch("/:id/assign-delivery", protect, adminOnly, async (req, res) => {
  try {
    const { deliveryPartner, courierName, trackingId, estimatedDeliveryDate } = req.body;

    if (isDBConnected()) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.deliveryPartner = deliveryPartner || null;
      order.courierName = courierName || "";
      order.trackingId = trackingId || "";
      order.estimatedDeliveryDate = estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null;
      
      if (order.status === "Placed") {
        order.status = "Confirmed";
      }

      order.trackingLogs.push({
        status: order.status,
        message: `Delivery assigned. Courier: ${courierName || "Local Delivery Partner"}, Tracking ID: ${trackingId || "Local-ZX"}.`,
      });

      await order.save();
      return res.json({ status: "success", order });
    }

    const order = await assignDelivery(req.params.id, {
      deliveryPartner,
      courierName,
      trackingId,
      estimatedDeliveryDate,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ status: "success", order });
  } catch (error) {
    console.error("Assign delivery error:", error);
    res.status(500).json({ message: "Could not assign delivery" });
  }
});

// ─── PATCH /api/orders/:id/delivery-status — Update delivery tracking status (Delivery Only) ───
router.patch("/:id/delivery-status", protect, deliveryOnly, async (req, res) => {
  try {
    const { status, message } = req.body;
    const validStatuses = ["Shipped", "Out for Delivery", "Delivered", "Cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Valid delivery statuses: ${validStatuses.join(", ")}` });
    }

    const partnerId = req.user._id || req.user.id;

    if (isDBConnected()) {
      const order = await Order.findOne({ _id: req.params.id, deliveryPartner: partnerId });
      if (!order) {
        return res.status(404).json({ message: "Order not found or not assigned to you" });
      }

      order.status = status;
      if (status === "Delivered" && order.paymentMethod === "COD") {
        order.isPaid = true;
      }

      order.trackingLogs.push({
        status,
        message: message || `Order status updated to ${status} by delivery partner.`,
      });

      await order.save();
      return res.json({ status: "success", order });
    }

    const order = await updateOrderStatus(req.params.id, status, message || `Order status updated to ${status} by delivery partner.`);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ status: "success", order });
  } catch (error) {
    console.error("Update delivery status error:", error);
    res.status(500).json({ message: "Could not update delivery status" });
  }
});

module.exports = router;
