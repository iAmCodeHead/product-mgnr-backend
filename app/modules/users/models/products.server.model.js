const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const config = require('../../../config/config');


const validateProductName = function (productName) {
    const productNameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;

    return (
        this.provider !== 'local' ||
        (productName && productNameRegex.test(productName) && config.illegalUsernames.indexOf(productName) < 0)
    );
};

const ProductSchema = new Schema({
    productName: {
        type: String,
        unique: 'productName already exists',
        required: 'Please supply a product',
        validate: [validateProductName, 'Please enter a valid username: 3+ characters long, non restricted word, characters "_-.", no consecutive dots, does not begin or end with dots, letters a-z and numbers 0-9.'],
        lowercase: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        default: 'default.png'
    },
    location: {
        type: String,
        required: true
    },
    owner: {
        name: { type: String },
        email: { type: String },
        phoneNumber: { type: String }
    }
}, {
    timestamps: true
  });

ProductSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

mongoose.model('Products', ProductSchema);