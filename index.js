const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const cartRoutes=require('./routes/cart');
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const productRoutes = require('./routes/productRoutes');
const categoryRoutes=require('./routes/categoryRoutes');
const dashboardRoutes = require("./routes/dashboard");
const introRoutes = require("./routes/CategoryIntro");
const promoRoutes = require("./routes/promoRoutes");
const teaserRoutes = require("./routes/teaser");
const favouriteRoutes = require("./routes/favouriteRoutes");
const checkoutRoutes = require("./routes/checkout");
const webhookRoutes = require("./routes/webhook");
const orderRoutes = require("./routes/order");
dotenv.config();
// console.log(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use("/api/webhook", webhookRoutes); 
app.use(express.json());
app.use(cors());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//http://localhost:5000/api-docs
app.use((err,req,res,next)=>{
    res.json(err).status(500)
})
app.use("/api/checkout",checkoutRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/products', productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teasers", teaserRoutes);
app.use("/api/intros", introRoutes);
app.use('/api/promos', promoRoutes);
app.use("/api/favourites", favouriteRoutes);



mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
