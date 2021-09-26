const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

const generateAccessToken = (user, secret, expiresIn) => {
    return jwt.sign({
        'address': user.address,
    }, secret, {
        'expiresIn': expiresIn
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// Return status with message
const invalid_input = {
    code: 400,
    message: "Invalid Input"
}

const server_err = {
    code: 500,
    message: "Server Error"
}

const {
    User,
    ToObjectId
} = require('./../mongoUtil.js');

const { checkIfAuthenticatedJWT } = require("../middlewares/index");

// login the user
router.post('/connect', async (req, res) => {
    if (!req.body.address) {
        res.sendStatus = 400;
        return res.json(invalid_input)
    }

    try {
        let user = await User.findOne({ address: req.body.address });
        let isNew = false;
        if (user.length == 0) {
            user = await User.create({
                address: req.body.address
            })
            isNew = true;
        }
        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '1d');
        let refreshToken = generateAccessToken(user, process.env.REFRESH_TOKEN_SECRET, "2d");

        let data = {
            "token": accessToken,
            "refreshToken": refreshToken,
            "newUser": true
        }
        if (isNew) {
            data["newUser"] = true;
        }

        return res.status(200).json(data)
    } catch (e) {
        return res.status(500).json(server_err);
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    try {
        const filter = { address : req.user.address}
        let user_proj = {
            _id: false,
            active: false,
            created_at: false,
            updated_at: false,
            __v: false
        }
        let user = await User.findOne(filter, user_proj).lean();
        return res.status(200).json(user)
    } catch (e) {
        return res.status(500).json(server_err);
    }
})


router.post('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    try {
        const filter = { address : req.user.address}
        const update = {
            nickname : req.body.nickname,
            fullname: req.body.fullname,
            gender: req.body.gender,
            dob: req.body.dob
        }
        let user = await User.findOneAndUpdate(filter, update)
        return res.status(200).json(user)
    } catch (e) {
        return res.status(500).json(server_err);
    }
})

router.post('/refresh', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    }

    // check if the provided token has been black listed
    const blacklistedToken = await BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        'require': false
    })

    if (blacklistedToken) {
        res.status(401);
        return res.send("The provided refresh token has expired")
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        // reload the user information from the database
        let userModel = await User.where({
            'email': user.email
        }).fetch({
            'require': false
        })


        let accessToken = generateAccessToken(userModel, process.env.TOKEN_SECRET, '15m')
        res.json({
            accessToken
        })
    })
})

router.post("/logout", async (req, res) => {
    let refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        res.sendStatus(401);
    }
    else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                res.sendStatus(403);
            } else {
                const token = new BlacklistedToken();
                token.set('token', refreshToken);
                token.set('date_created', new Date());
                await token.save();
                res.json({
                    'message': 'Logged out'
                })
            }
        })
    }
})

module.exports = router;