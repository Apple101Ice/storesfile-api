let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const { storesData } = require("./storesData");
let fs = require("fs");
let fname = "chainStores.txt";

app.get("/resetData", function (req, res) {
    let data = JSON.stringify(storesData);
    fs.writeFile(fname, data, function (err) {
        if (err) res.status(404).send(err);
        else res.send("Data in file is reset");
    });
});

app.get("/shops", function (req, res) {
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            res.send(storesArray.shops);
        }
    });
});

app.post("/shops", function (req, res) {
    let body = req.body;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let maxid = storesArray.shops.reduce((acc, curr) => curr.shopId > acc ? curr.shopId : acc, 0);
            let newShop = { shopId: maxid + 1, ...body };
            storesArray.shops.push(newShop);
            let data1 = JSON.stringify(storesArray);
            fs.writeFile(fname, data1, function (err) {
                if (err) res.send(404).send(err);
                else res.send(newShop);
            });
        }
    });
});

app.get("/products", function (req, res) {
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            res.send(storesArray.products);
        }
    });
});

app.get("/products/:id", function (req, res) {
    const id = +req.params.id;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let index = storesArray.products.findIndex(p1 => p1.productId === id);
            if (index >= 0) {
                res.send(storesArray.products[index]);
            }
            else
                res.send("Not Found");
        }
    });
});

app.post("/products", function (req, res) {
    let body = req.body;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let maxid = storesArray.products.reduce((acc, curr) => curr.productId > acc ? curr.productId : acc, 0);
            let newProduct = { productId: maxid + 1, ...body };
            storesArray.products.push(newProduct);
            let data1 = JSON.stringify(storesArray);
            fs.writeFile(fname, data1, function (err) {
                if (err) res.send(404).send(err);
                else res.send(newProduct);
            });
        }
    });
});

app.put("/products/:id", function (req, res) {
    const id = +req.params.id;
    const body = req.body;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let index = storesArray.products.findIndex(p1 => p1.productId === id);
            if (index >= 0) {
                let productId = storesArray.products[index].productId;
                let updatedProduct = { ...body };
                updatedProduct.productId = productId;
                storesArray.products[index] = updatedProduct;
                let data1 = JSON.stringify(storesArray);
                fs.writeFile(fname, data1, function (err) {
                    if (err) res.send(404).send(err);
                    else res.send(updatedProduct);
                });
            }
            else
                res.send("Not Found");
        }
    });
});

app.get("/purchases", function (req, res) {
    const name = req.query.name;
    const productName = req.query.productName;
    const sort = req.query.sort;

    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let arr = storesArray.purchases;
            let errors = [];
            if (name) {
                const shop = storesArray.shops.find(p1 => p1.name === name);
                if (shop) {
                    const shopId = shop.shopId;
                    arr = arr.filter(a1 => a1.shopId === shopId);
                }
                else
                    errors.push("Shop name not found.");
            }
            if (productName) {
                const prodList = productName.split(',');
                const prodarr = storesArray.products.filter(p1 => prodList.indexOf(p1.productName) >= 0);
                const prodIds = prodarr.map(p1 => p1.productId);
                arr = arr.filter(p1 => prodIds.indexOf(p1.productId) >= 0);
            }
            if (sort) {
                if (sort === 'QtyAsc')
                    arr.sort((p1, p2) => p1.quantity - p2.quantity);
                if (sort === 'QtyDesc')
                    arr.sort((p1, p2) => -1 * (p1.quantity - p2.quantity));
                if (sort === 'ValueAsc')
                    arr.sort((p1, p2) => p1.quantity * p1.price - p2.quantity * p2.price);
                if (sort === 'ValueDesc')
                    arr.sort((p1, p2) => -1 * (p1.quantity * p1.price - p2.quantity * p2.price));
            }

            errors.length !== 0 ? res.send(errors.join(', ')) : res.send(arr);
        }
    });
});

app.get("/purchases", function (req, res) {
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            res.send(storesArray.purchases);
        }
    });
});

app.get("/purchases/shops/:id", function (req, res) {
    const id = +req.params.id;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let arr = storesArray.purchases.filter(p1 => p1.shopId === id);
            res.send(arr);
        }
    });
});

app.get("/purchases/products/:id", function (req, res) {
    const id = +req.params.id;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let arr = storesArray.purchases.filter(p1 => p1.productId === id);
            res.send(arr);
        }
    });
});

app.get("/totalPurchase/shop/:id", function (req, res) {
    const id = +req.params.id;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let arr = storesArray.purchases.filter(p1 => p1.shopId === id);
            let totalQty = arr.map((a1, index) => {
                let productName = storesArray.products.find(p1 => p1.productId === a1.productId).productName;
                let totalPurchase = arr.reduce((acc, curr) => acc += curr.productId === a1.productId ? curr.quantity : 0, 0);
                if (arr.findIndex(b1 => b1.productId === a1.productId) === index)
                    return { productName: productName, totalPurchase: totalPurchase };
            });
            totalQty = totalQty.filter(p1 => p1);
            res.send(totalQty);
        }
    });
});

app.get("/totalPurchase/product/:id", function (req, res) {
    const id = +req.params.id;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let arr = storesArray.purchases.filter(p1 => p1.productId === id);
            let totalQty = arr.map((a1, index) => {
                let shopName = storesArray.shops.find(p1 => p1.shopId === a1.shopId).name;
                let totalPurchase = arr.reduce((acc, curr) => acc += curr.shopId === a1.shopId ? curr.quantity : 0, 0);
                if (arr.findIndex(b1 => b1.shopId === a1.shopId) === index)
                    return { shopName: shopName, totalPurchase: totalPurchase };
            });
            totalQty = totalQty.filter(p1 => p1);
            res.send(totalQty);
        }
    });
});

app.post("/purchases", function (req, res) {
    let body = req.body;
    fs.readFile(fname, "utf8", function (err, data) {
        if (err) res.status(404).send(err);
        else {
            const storesArray = JSON.parse(data);
            let maxid = storesArray.purchases.reduce((acc, curr) => curr.purchaseId > acc ? curr.purchaseId : acc, 0);
            let newPurchase = { purchaseId: maxid + 1, ...body };
            storesArray.purchases.push(newPurchase);
            let data1 = JSON.stringify(storesArray);
            fs.writeFile(fname, data1, function (err) {
                if (err) res.send(404).send(err);
                else res.send(newPurchase);
            });
        }
    });
});