const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add virtual for calculating total
cartSchema.virtual("total").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
});

// Static method to find or create a cart
cartSchema.statics.findOrCreateCart = async function (userId) {
  try {
    let cart = await this.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      cart = await this.create({ user: userId, items: [] });
    }
    return cart;
  } catch (error) {
    console.error("Error in findOrCreateCart:", error);
    throw error;
  }
};

// Method to add or update item
cartSchema.methods.addOrUpdateItem = async function (productId, quantity) {
  try {
    const existingItem = this.items.find(
      (item) =>
        item.product._id.equals(productId) || item.product.equals(productId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product: productId, quantity });
    }

    await this.save();
    await this.populate("items.product");
    return this;
  } catch (error) {
    console.error("Error in addOrUpdateItem:", error);
    throw error;
  }
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function (productId, quantity) {
  try {
    const existingItem = this.items.find(
      (item) =>
        item.product._id.equals(productId) || item.product.equals(productId)
    );

    if (!existingItem) {
      return null;
    }

    if (quantity > 0) {
      existingItem.quantity = quantity;
    } else {
      this.items = this.items.filter(
        (item) =>
          !(
            item.product._id.equals(productId) || item.product.equals(productId)
          )
      );
    }

    await this.save();
    await this.populate("items.product");
    return this;
  } catch (error) {
    console.error("Error in updateItemQuantity:", error);
    throw error;
  }
};

// Method to remove item
cartSchema.methods.removeItem = async function (productId) {
  try {
    const existingItem = this.items.find(
      (item) =>
        item.product._id.equals(productId) || item.product.equals(productId)
    );

    if (!existingItem) {
      return null;
    }

    this.items = this.items.filter(
      (item) =>
        !(item.product._id.equals(productId) || item.product.equals(productId))
    );

    await this.save();
    await this.populate("items.product");
    return this;
  } catch (error) {
    console.error("Error in removeItem:", error);
    throw error;
  }
};

// Method to clear cart
cartSchema.methods.clearCart = async function () {
  try {
    this.items = [];
    await this.save();
    return this;
  } catch (error) {
    console.error("Error in clearCart:", error);
    throw error;
  }
};

// Create the model
const Cart = mongoose.model("Cart", cartSchema);

// Export the model
module.exports = Cart;
