const mongoose = require('mongoose');
require('dotenv').config();
const moment = require('moment');

// Connect db
mongoose.connect(
    process.env.MONGO_URL,
    { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false
    }
);

// Create user schema and model
const userSchema = new mongoose.Schema({
    address: String,
    username: { type: String, default: null},
    image_url: { type: String, default: null},
    active: { type: Boolean, default: true}
}, {
    timestamps: { currentTime: () => moment().format("YYYY-MM-DD HH:mm:ss"), createdAt: 'created_at', updatedAt: 'updated_at' }
})

const itemSchema = new mongoose.Schema({
    token_id: String,
    gender: { type: String, default: null},
    birthday: { type: Date, default: null},
    image_url: { type: String, default: null},
    name: { type: String, default: null},
    verified: { type: Boolean, default: false},
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    owner: {
        owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        transcation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
    },
    listed: { type: Boolean, default: false},
    listing_id: { type: mongoose.Schema.Types.ObjectId, ref: 'transcation', default: null },
    price: { type: String, default: null},
    active: { type: Boolean, default: true}
}, {
    timestamps: { currentTime: () => moment().format("YYYY-MM-DD HH:mm:ss"), createdAt: 'created_at', updatedAt: 'updated_at' }
})

/* Status:
    1 -> Pending
    0 -> Rejected
    2 -> Success
*/
const verificationSchema = new mongoose.Schema({
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    photo_url: String,
    ic_url: String,
    status: { type: Number, default: 1},
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, {
    timestamps: { currentTime: () => moment().format("YYYY-MM-DD HH:mm:ss"), createdAt: 'created_at', updatedAt: 'updated_at' }
})

const adminSchema = new mongoose.Schema({
    username: String,
    passwrod: String,
}, {
    timestamps: { currentTime: () => moment().format("YYYY-MM-DD HH:mm:ss"), createdAt: 'created_at', updatedAt: 'updated_at' }
})

/* Status description:
    0 - Failed
    1 - Success
    2 - Pending
*/
const transactionSchema = new mongoose.Schema({
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    event_type: String,
    from_account: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: String,
    to_account: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transaction: {
        blockExploreLink: String,
        id: String
    },
    status: { type: Number },
    error_log: String
}, {
    timestamps: { currentTime: () => moment().format("YYYY-MM-DD HH:mm:ss"), createdAt: 'created_at', updatedAt: 'updated_at' }
})

const Item = mongoose.model('Item', itemSchema);
const User = mongoose.model('User', userSchema);
const Verification = mongoose.model('Verification', verificationSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Admin = mongoose.model('Admin', adminSchema);

const ToObjectId = (string) => {return mongoose.Types.ObjectId(string)}

module.exports = {
    Item,
    User,
    Verification,
    Transaction,
    Admin,

    ToObjectId
}