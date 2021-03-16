const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const crypto = require('crypto'),
    chalk = require('chalk'),
    owasp = require('owasp-password-strength-test'),
    validator = require('validator');
const config = require('../../../config/config');

/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = function (property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy email
 */
const validateLocalStrategyEmail = function (email) {
    return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email, {
        require_tld: false
    }));
};

/**
 * A Validation function for username
 * - at least 3 characters
 * - only a-z0-9_-.
 * - contain at least one alphanumeric character
 * - not in list of illegal usernames
 * - no consecutive dots: "." ok, ".." nope
 * - not begin or end with "."
 */

const validateUsername = function (username) {
    const usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;

    return (
        this.provider !== 'local' ||
        (username && usernameRegex.test(username) && config.illegalUsernames.indexOf(username) < 0)
    );
};

/**
 * User Schema
 */
const UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: 'Please supply an first name',
        validate: [validateLocalStrategyProperty, 'Please fill in your first name']
    },
    lastName: {
        type: String,
        trim: true,
        required: 'Please supply an last name',
        validate: [validateLocalStrategyProperty, 'Please fill in your last name']
    },
    email: {
        type: String,
        index: {
            unique: true,
            sparse: true // For this to work on a previously indexed field, the index must be dropped & the application restarted.
        },
        lowercase: true,
        trim: true,
        unique: 'Email already exists',
        required: 'Please supply an email address',
        validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
    },
    phoneNumber: {
        type: String,
        required: true
    },
    location: {
        type: { type: String },
        coordinates: [Number],
    },
    username: {
        type: String,
        unique: 'Username already exists',
        required: 'Please fill in a username',
        validate: [validateUsername, 'Please enter a valid username: 3+ characters long, non restricted word, characters "_-.", no consecutive dots, does not begin or end with dots, letters a-z and numbers 0-9.'],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
  });

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
    if (this.password && this.isModified('password')) {
        this.salt = crypto.randomBytes(16).toString('base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Hook a pre validate method to test the local password
 */
UserSchema.pre('validate', function (next) {
    if (this.password && this.isModified('password')) {
        const result = owasp.test(this.password);
        if (result.errors.length) {
            const error = result.errors.join(' ');
            this.invalidate('password', error);
        }
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

UserSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
}).set(function (fullName) {
    const splitName = fullName.split(' ');
    this.firstName = splitName[0] || '';
    this.lastName = splitName[1] || '';
});

UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
    const _this = this;
    const possibleUsername = username + (suffix || '');
    _this.findOne({
        username: possibleUsername
    }, function (err, user) {
        if (!err) {
            if (!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) +
                    1, callback);
            }
        } else {
            callback(null);
        }
    });
};

UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

mongoose.model('User', UserSchema);