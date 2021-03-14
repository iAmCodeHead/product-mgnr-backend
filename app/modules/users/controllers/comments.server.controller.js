const Comments = require('mongoose').model('Comments');
const nodemailer = require('nodemailer');
const productDbo = require('../dbo/products.server.dbo');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const client = require('twilio')(accountSid, authToken);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

exports.makeComment = function (req, res) {

    productDbo.findProductById(req.body.productId, function(err, result) {
        if (err) {
            res.status(400).send({
                success: false,
                message: err
            })
        } else {
        let data = {
            comment: req.body.comment,
            commentBy: {
                name: req.userDetails.name,
                id: req.userDetails.id,
                location: req.userDetails.location
            },
            commentOn: {
                productName: result.productName,
                id: result._id,
                location: result.location
            }
        }

        const comment = new Comments(data);

        comment.save(function (err, result) {
            if (err) {
                res.status(422).send({
                    success: false,
                    message: err.message
                })
            } else {

                const text = `${data.comment} - ${data.commentBy.name}`;

                let msg = {
                    subject: 'New Comment on your product',
                    to: req.userDetails.email,
                    text,
                    from: `"${data.commentBy.name}" <Product Manager App>`
                };

                transporter.sendMail(msg);

                client.messages
                .create({
                   body: text,
                   from: '+14708655351',
                   to: '+2348148404629'

                 })
                .then(message => {});
  

                res.status(200).send({
                    success: true,
                    message: 'Comment Saved!',
                    data: result
                });
            }
        });
        }
    });
}


exports.viewComments = function (req, res) {}