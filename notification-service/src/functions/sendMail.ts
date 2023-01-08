import { SQSHandler } from "aws-lambda";
import { SES } from "aws-sdk";

const ses = new SES({ region: process.env.REGION });

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    console.log("record processing...", record);

    const email = JSON.parse(record.body);
    const { subject, body, recipient } = email;

    const params = {
      Source: "raphael.lima.coelho@gmail.com",
      Destination: {
        ToAddresses: [recipient],
      },
      Message: {
        Body: {
          Text: {
            Data: body,
          },
        },
        Subject: {
          Data: subject,
        },
      },
    };

    try {
      const result = await ses.sendEmail(params).promise();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
};
