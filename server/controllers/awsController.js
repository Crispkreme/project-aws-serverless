const OrderedProduct = require("../models/OrderedProduct");
const {
    SNSClient,
    PublishCommand,
    ConfirmSubscriptionCommand,
} = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// We will subscribe our server application to SNS
// - the server will approve subscription / confirm subscription
// Client will publish message to SNS
// SNS delivers the message to our application (which is a subscribed application to SNS) - hidden
// Our server application will use SES to send email using sendEmail function

// This function sends a message that contains the order detail to an AWS SNS topic
async function publishSNSMessage(order) {
    const snsClient = new SNSClient({
        credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
        region: process.env.REGION,
    });

    const params = {
        TopicArn: process.env.TOPIC_ARN,
        Message: JSON.stringify({
        message: "Ordered Product",
        data: {
            orderedProduct: order, // This is the order details fetched from the database
        },
        }),
    };

    try {
        const data = await snsClient.send(new PublishCommand(params));
        console.log("SNS message published! Message ID:", data.MessageId);
    } catch (error) {
        console.error("Error publishing SNS message:", error);
    }
}

// This function retrieves the ordered product by its order id from the database and the uses publishSNSMessage() function to send the order details to SNS
module.exports.publishMessage = (orderId) => {
    OrderedProduct.findById(orderId)
        .then((result) => publishSNSMessage(result))
        .catch((error) => console.log(error));
};

// This function will be used by incomingMessageHandler to send email using AWS SES. It builds an html table with the order details which will be the email body to be sent using AWS SES.
module.exports.sendEmail = async (order) => {
  try {
    const sesClient = new SESClient({
        credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
        region: process.env.REGION,
    });

    let tableHtml = `
		<p>Your order #${order._id} has been successfully placed!</p><br>

		<table style="border-collapse: collapse; border: 1px solid black;">
            <thead>
            <tr>
                <th style="border: 1px solid black; padding: 8px;">Product</th>
                <th style="border: 1px solid black; padding: 8px;">Qty</th>
                <th style="border: 1px solid black; padding: 8px;">Price</th>
                <th style="border: 1px solid black; padding: 8px;">Subtotal</th>
            </tr>
            </thead>
            <tbody>
		`;

        for (let i = 0; i < order.products.length; i++) {
        const row = order.products[i];
        tableHtml += `
                <tr>
                    <td style="border: 1px solid black; padding: 8px;">${
                    row.name
                    }</td>
                    <td style="border: 1px solid black; padding: 8px;">${
                    row.quantity
                    }</td>
                    <td style="border: 1px solid black; padding: 8px;">₱${row.price.toFixed(
                    2
                    )}</td>
                    <td style="border: 1px solid black; padding: 8px;">₱${(
                    row.price * row.quantity
                    ).toFixed(2)}</td>
                </tr>
                `;
        }

        tableHtml += `
	            <td style="padding: 8px;">Total</td>
	            <td></td>
	            <td></td>
	            <td style="padding: 8px;">₱${order.totalAmount.toFixed(2)}</td>
	        </tbody>
	        </table>
	    `;

        const params = {
            // Email of the app / business/ company / owner application
            Source: process.env.FROM_TO,
            Destination: {
                // Email of the customer
                ToAddress: [process.env.SEND_TO],
                CcAddress: [], // Example: "sales@mail.com"
                BccAddress: [],
            },

            Message: {
                Subject: {
                Data: "Order Successfully Placed",
                },
                Body: {
                Html: {
                    Data: tableHtml,
                },
                },
            },
            ReplyToAddress: [process.env.FROM_TO],
        };

        const confirmCommand = new SendEmailCommand(params);
        await sesClient.send(confirmCommand);
        console.log("Email sent!");
    } catch (error) {
        console.log("Error sending email: ", error);
    }
};

// This function will be used to confirm subscription to our AWS SNS
module.exports.incomingMessageHandler = async (req, res) => {
    const snsClient = new SNSClient({
        credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
        region: process.env.REGION,
    });

    const { Type, TopicArn, Token } = req.body;

    if (Type === "SubscriptionConfirmation") {
        const confirmParams = {
        TopicArn,
        Token,
        };
        try {
        const confirmCommand = new ComfirmSubscriptionCommand(confirmParams);
        await snsClient.send(confirmCommand);
        console.log("Subscription confirmed ");
        res.sendStatus(200);
        } catch (error) {
        console.error("Error confirming subscription", error);
        res.sendStatus(500);
        }
    } // 1
    else {
        console.log("Received message of type ", Type);
        let message = JSON.parse(req.body.Message);

        let orderedProduct = message.data.getOrderedProducts;
        module.exports.sendEmail(orderedProduct);
        res.sendStatus(200);
    } // 2
};
