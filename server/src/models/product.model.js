import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
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
productSchema.index({ price: 1 }); // Qiymət üzrə filter üçün


const Product = mongoose.model("Product", productSchema);

export default Product;
