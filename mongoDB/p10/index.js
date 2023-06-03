//  study source -> mongoosejs.com

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//create product schema
const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "product title is required"],
    minlength: [
      3,
      "minimum length of the product title should be three character",
    ],
    maxlength: [
      10,
      "maximum length of the product title should be ten character",
    ],
    trim: true, //remove unnecessary space
    // enum: {
    //   values: ["iphone13", "samsung"],
    //   message: "{VALUE} not supported",
    // },
  },

  price: {
    type: Number,
    required: [true, "product price is required"],
    min: [1000, "minimum require price should be 1000"],
    max: [50000, "maximum require price should be 50000"],
  },

  rating: {
    type: Number,
    required: true,
  },

  description: {
    type: String,
    required: [true, "product description is required"],
    minlength: [
      10,
      "minimum length of the product description should be 10 character",
    ],
    maxlength: [
      50,
      "maximum length of the product description should be 50 character",
    ],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

//create product model
const Product = mongoose.model("Products", productsSchema);

//db connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/test");
    console.log("db is connected");
  } catch (error) {
    console.log("db is not  connected");
    console.log(error.message);
    process.exit(1);
  }
};

app.listen(port, async () => {
  console.log(`server is running at http://localhost:${port}`);
  await connectDB();
});

app.get("/", (req, res) => {
  res.send("welcome to home page");
});

//create a product
app.post("/products", async (req, res) => {
  try {
    const newProduct = new Product({
      title: req.body.title,
      price: req.body.price,
      rating: req.body.rating,
      description: req.body.description,
    });
    const productData = await newProduct.save(); //save to database
    res.status(201).send(productData);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//return all products
app.get("/products", async (req, res) => {
  try {
    let products;
    //design for query
    const price = req.query.price;
    const rating = req.query.rating;
    if (price && rating) {
      products = await Product.find({
        $and: [{ price: { $gt: price } }, { rating: { $gt: rating } }],
      });
    } else {
      products = await Product.find();
    }

    if (products) {
      res.status(200).send(products);
    } else {
      res.status(404).send({ message: "products not found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//return a specific products
app.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id; //get id
    const product = await Product.findOne({ _id: id });
    if (product) {
      res.status(200).send(product);
    } else {
      res.status(404).send({ message: "products not found" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//delete product
app.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete({ _id: id });
    if (product) {
      res.status(200).send(product);
    } else {
      res.status(404).send({ message: "products not deleted this id " });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//update product

app.put("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title: req.body.title,
          price: req.body.price,
          description: req.body.description,
          rating: req.body.rating,
        },
      },
      { new: true }
    );
    if (updatedProduct) {
      res.status(200).send(updatedProduct);
    } else {
      res.status(404).send({ message: "products not updated this id " });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
