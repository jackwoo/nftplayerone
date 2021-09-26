const express = require('express');
require('dotenv').config();

const cors = require('cors');

const ethers = require('ethers');
const Market = require(process.env.CONTRACT_ADDRESS_MARKET);
const NFT = require(process.env.CONTRACT_ADDRESS_NFT)

const multer = require("multer");
const path = require('path');
const fs = require("fs");

const axios = require("axios");

// To create folders to store uploaded files
const upload = multer({
    dest: "./uploads/profile"
});

const profile_folder = multer({
    dest: "./public/img/profile"
});

const user_folder = multer({
    dest: "./public/img/user"
});

const {
    Item,
    User,
    Verification,
    Transaction,
    ToObjectId
} = require('./mongoUtil.js');


let app = express();
/* Express Settings */
app.use(express.json())
app.use(cors());
app.use(express.static('public'))
app.options('**', cors());
app.listen(8000);

// Return status with message
const invalid_input = {
    code: 400,
    message: "Invalid Input"
}

const server_err = {
    code: 500,
    message: "Server Error"
}

const api = {
    users: require("./routes/users.js")
}

app.get("/:address/creation", async function(req, res){
    try {
        let user_proj = {
            active: false,
            created_at: false,
            updated_at: false,
            __v: false
        }
        let user = await User.findOne({ address: req.params.address }, user_proj).lean();
        if (!isEmptyObject(user)) {
            let projection = {
                creator_id: false,
                listing_id: false,
                created_at: false,
                updated_at: false,
                __v: false
            }

            let item = await Item.find({ creator_id: ToObjectId(user._id) }, projection);
            let tras_select = {
                event_type: true,
                price: true,
                from_account: true,
                to_account: true,
                updated_at: true
            }

            let tras = await Transaction.find({
                $or: [
                    { 'from_account': ToObjectId(user._id) },
                    { 'to_account': ToObjectId(user._id) }
                ]
            }, tras_select).populate({
                path: 'from_account',
                select: 'username image_url address -_id'
            }).populate({
                path: 'to_account',
                select: 'username image_url address -_id'
            }).populate({
                path: 'item_id',
                select: 'name _id image_url'
            }).sort({ updated_at: -1 });

            user["nft"] = item;
            user["tradings"] = tras;
        }
        return res.status(200).json(user)
    } catch (e) {
        return res.status(500).json(server_err);
    }
})

// API: get user profile and created nft
app.get("/:address/user", async function (req, res) {
    try {
        let user_proj = {
            active: false,
            created_at: false,
            updated_at: false,
            __v: false
        }
        let user = await User.findOne({ address: req.params.address }, user_proj).lean();
        return res.status(200).json(user)
    } catch (e) {
        return res.status(500).json(server_err);
    }
})

// API: update user profile

/* Item */
// API: list all listed items
app.get('/item', async function (req, res) {
    try {
        let projection = {
            creator_id: false,
            listing_id: false,
            created_at: false,
            updated_at: false,
            birthday: false,
            gender: false,
            name: false,
            __v: false
        }
        // let items = await Item.find({ listed: true }, projection);
        let items = await Item.find({ listed: true  }, projection).populate({
            path: "owner.owner_id",
            select: "nickname image_url address -_id"
        }).lean();
        return res.status(200).json(items);
    } catch (e) {
        return res.status(500).json(server_err);
    }
})

// API: list owned items
app.get('/:address/item', async function (req, res) {
    try {
        let projection = {
            creator_id: false,
            listing_id: false,
            created_at: false,
            updated_at: false,
            __v: false
        }
        let user = await User.findOne({ address: req.params.address });
        if (!user) {
            return res.status(500).json(server_err);
        }
        let items = await Item.find({ "owner.owner_id": user._id }, projection);
        return res.status(200).json(items);
    } catch (e) {
        console.log(e);
        return res.status(500).json(server_err);
    }
})

app.get('/item/featured', async function (req, res) {
    let projection = {
        text: true,
        image_url: true,
        owner: true,
        price: true,
        listed: true,
        _id: true,
        verified: true,
    }
    let item = await Item.findOne({ listed: true }, projection).sort({ created_at: -1 }).limit(1).lean();
    let user = await User.findOne({ _id: ToObjectId(item.owner.owner_id) });
    item['owner'] = {};
    item['owner']['username'] = user.username;
    item['owner']['image_url'] = user.image_url;
    return res.status(200).json(item);
})

// API: get an item
app.get('/item/:id', async function (req, res) {
    try {
        let projection = {
            creator_id: false,
            listing_id: false,
            created_at: false,
            updated_at: false,
            __v: false
        }
        let id = ToObjectId(req.params.id);

        let item = await Item.findOne({ _id: id }, projection).populate({
            path: "owner.owner_id",
            select: "username image_url address -_id"
        }).lean();
        if (isEmptyObject(item)) {
            return res.status(404).json(server_err);
        }

        item["isOwner"] = false;
        if (req.query.address) {
            if (item.owner.owner_id.address == req.query.address) {
                item["isOwner"] = true;
            }
        }

        let tras_select = {
            event_type: true,
            price: true,
            from_account: true,
            to_account: true,
            updated_at: true
        }

        let trading_history = await Transaction.find({
            item_id: ToObjectId(item._id)
        }, tras_select).populate({
            path: 'from_account',
            select: 'username image_url address -_id'
        }).populate({
            path: 'to_account',
            select: 'username image_url address -_id'
        }).sort({ updated_at: -1 });

        item['trading_history'] = trading_history;

        return res.status(200).json(item);
    } catch (e) {
        console.log(e);
        return res.status(500).json(server_err);
    }
})

// API: get item object id
app.get('/item/token/:id', async function (req, res) {
    try {
        let item = await Item.findOne({ token_id: req.params.id });
        return res.status(200).json(item._id);
    } catch (e) {
        return res.status(500).json(server_err);
    }
})

// API: update item

/* Transactions */
// API: list item
// Set API Route (URL)
// Req -> request, the request and parameters sended from frontend
// Res -> result/response, the response send to frontend

/* Request can accept three types of data
    req.body -> body of the request, mainly used in post request
    req.params -> parameters are variables in the url, e.g. /listing/:id, id is a parameter
    req.query -> parameters which are extended from url, e.g. /listing?id=123, id is a query with value = 123
*/
app.post('/listing', async function (req, res) {
    let {
        item_id,
        address,
        price
    } = req.body;

    try {
        // These are functions from mongoose
        let user = await User.findOne({ address: address });
        let transaction = await Transaction.create({
            item_id: ToObjectId(item_id),
            event_type: "listing",
            from_account: ToObjectId(user._id),
            price: price
        })
        // Return the result in json format
        return res.status(200).json({ transcation: transaction._id });
    } catch (e) {
        console.log(e);
        return res.status(500).json(server_err);
    }
})

// API: unlist item
app.post('/unlist', async function (req, res) {
    let {
        item_id,
        address,
    } = req.body;

    try {
        // These are functions from mongoose
        let user = await User.findOne({ address: address });
        let transaction = await Transaction.create({
            item_id: ToObjectId(item_id),
            event_type: "unlist",
            from_account: ToObjectId(user._id),
        })

        // Return the result in json format
        return res.status(200).json({ transcation: transaction._id });
    } catch (e) {
        console.log(e);
        return res.status(500).json(server_err);
    }
})

// API: purchase item 
app.post('/purchase', async function (req, res) {
    let {
        item_id,
        address,
    } = req.body;

    try {
        // These are functions from mongoose
        let buyer = await User.findOne({ address: address });
        let item = await Item.findOne({ _id: ToObjectId(item_id) });
        let seller = await User.findOne({ _id: ToObjectId(item.owner.owner_id) });
        if (isEmptyObject(buyer) || isEmptyObject(item) || isEmptyObject(seller)) {
            return res.status(400).json(invalid_input)
        }

        let transaction = await Transaction.create({
            item_id: ToObjectId(item_id),
            event_type: "buy",
            from_account: ToObjectId(buyer._id),
            to_account: ToObjectId(seller._id),
            price: item.price
        })

        // Return the result in json format
        return res.status(200).json({ transcation: transaction._id });
    } catch (e) {
        console.log(e);
        return res.status(500).json(server_err);
    }
})

/* Admin */
// API: verify item

// API: upload image
app.post(
    "/upload",
    upload.single("file" /* name attribute of <file> element in your form */),
    (req, res) => {
        let tempPath = req.file.path;
        let targetPath = path.join("./public/img/profile/" + req.file.filename + ".png");
        let returnPath = "/img/profile/" + req.file.filename + ".png";
        let mime = req.file.mimetype.toLowerCase();
        if (['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].indexOf(mime) == -1) {
            fs.unlink(tempPath, err => {
                if (err) console.log(err);
                res.status(403).json(invalid_input);
            });
        } else {
            fs.rename(tempPath, targetPath, err => {
                if (err) {
                    console.log(err);
                    res.status(403).json(invalid_input);
                } else {
                    res.status(200).json({ data: returnPath });
                }
            });
        }
    }
);

async function main(){
    app.use("/api/user", express.json(), api.users);
}

// Webhook on ethers to check transaction status
const listenToEvents = () => {
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
    const networkId = '97';

    const market = new ethers.Contract(
        Market.networks[networkId].address,
        Market.abi,
        provider
    )

    const nft = new ethers.Contract(
        NFT.networks[networkId].address,
        NFT.abi,
        provider
    )

    // Hook to listing event on blockchain
    // Check if listing event is completed
    // Update the item listing status on the db
    market.on('Listing', async (token_id, from, price, timestamp) => {
        let user = await User.findOne({ address: from });
        let item = await Item.findOne({ token_id: token_id })

        let trans = await Transaction.create({
            item_id: ToObjectId(item._id),
            event_type: "listing",
            from_account: ToObjectId(user._id),
            price: price,
            status: 1
        })

        await Item.findByIdAndUpdate(
            ToObjectId(trans.item_id),
            {
                $set: {
                    listing_id: ToObjectId(trans._id),
                    listed: true,
                    price: price,
                }
            }
        )
    })

    // Hook to mint event on blockchain
    // Check if mint event is completed
    // Create the creation transaction and item on db
    nft.on('Mint', async (token_id, creator, tokenurl, timestamp) => {
        creator = await User.findOne({ address: creator })

        let transaction = await Transaction.create({
            event_type: "create",
            from_account: ToObjectId(creator._id),
            status: 1
        })

        let metadata;
        try {
            await axios.get(tokenurl).then(res => {
                metadata = res.data
            }).catch(err => {
                console.log(err)
            });
        }
        catch (err) {
            console.log(err);
        }

        let item = await Item.create({
            token_id: token_id,
            text: metadata.text,
            creator_id: ToObjectId(creator._id),
            owner: {
                owner_id: ToObjectId(creator._id),
                transcation_id: ToObjectId(transaction._id)
            }
        });

        await Transaction.findByIdAndUpdate(
            ToObjectId(transaction._id),
            {
                $set: {
                    item_id: ToObjectId(item._id)
                }
            }
        )
    })

    market.on("Cancellation", async (token_id, from, timestamp) => {
        let user = await User.findOne({ address: from });
        let item = await Item.findOne({ token_id: token_id })
        let trans = await Transaction.create({
            item_id: ToObjectId(item._id),
            event_type: "unlist",
            from_account: ToObjectId(user._id),
            status: 1
        })

        await Item.findByIdAndUpdate(
            ToObjectId(trans.item_id),
            {
                $set: {
                    listing_id: null,
                    listed: false,
                    price: null,
                }
            }
        )
    })

    market.on("Edit", async (token_id, from, old_price, new_price, timestamp) => {
        let user = await User.findOne({ address: from });
        let item = await Item.findOne({ token_id: token_id })

        let trans = await Transaction.create({
            item_id: ToObjectId(item._id),
            event_type: "listing",
            from_account: ToObjectId(user._id),
            price: new_price,
            status: 1
        })

        await Item.findByIdAndUpdate(
            ToObjectId(trans.item_id),
            {
                $set: {
                    listing_id: ToObjectId(trans._id),
                    listed: true,
                    price: new_price,
                }
            }
        )
    })

    market.on('Purchase', async (buyer, seller, token_id, price, timestamp) => {
        // Create purchase transaction
        buyer = await User.findOne({ address: buyer });
        seller = await User.findOne({ address: seller });
        let item = await Item.findOne({ token_id: token_id });

        await Transaction.create({
            item_id: ToObjectId(item._id),
            event_type: "sell",
            from_account: ToObjectId(seller._id),
            to_account: ToObjectId(buyer._id),
            price: price,
            status: 1
        })

        let transaction = await Transaction.create({
            item_id: ToObjectId(item._id),
            event_type: "buy",
            from_account: ToObjectId(buyer._id),
            to_account: ToObjectId(seller._id),
            price: price,
            status: 1
        })

        await Item.findByIdAndUpdate(
            ToObjectId(item._id),
            {
                $set: {
                    listing_id: null,
                    listed: false,
                    price: null,
                    owner: {
                        owner_id: ToObjectId(buyer._id),
                        transaction_id: ToObjectId(transaction._id)
                    }
                }
            }
        )
    })
}

main();
listenToEvents();

function isEmptyObject(obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
