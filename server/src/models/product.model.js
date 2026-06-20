import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    costPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    stockCount: {
      type: Number,
      required: true,
      default: 0,
    },
    priceProposals: [
      {
        proposedPrice: { type: Number, required: true },
        proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true  // createdAt and updatedAt
  }
);

// İndexlər - Sorğuların sürətini artırır
productSchema.index({ name: 1 }); // Ad üzrə axtarış üçün
productSchema.index({ createdAt: -1 }); // Tarix üzrə sıralama üçün
productSchema.index({ salePrice: 1 }); // Qiymət üzrə filter üçün


const Product = mongoose.model("Product", productSchema);

export default Product;
