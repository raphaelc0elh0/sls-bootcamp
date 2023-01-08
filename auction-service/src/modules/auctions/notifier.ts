import { SQS } from "aws-sdk";
import { Auction } from "./schema";

const sqs = new SQS();
const mailQueueUrl = process.env.MAIL_QUEUE_URL;

export default class AuctionsNotifier {
  async notifyOnClosedAuction(auction: Auction, type: "SUCCESS" | "FAILED") {
    return Promise.all([
      this.notifySeller(auction, type),
      this.notifyBidder(auction, type),
    ]);
  }

  private notifySeller(auction: Auction, type: "SUCCESS" | "FAILED") {
    const { title, seller } = auction;
    const { amount } = auction.highestBid;

    if (type === "FAILED") {
      return this.sendMessage(
        "No bids on your auction item :(",
        seller,
        `Oh no! Your item ${title} didn't get any bids. Better luck next time`
      );
    }
    return this.sendMessage(
      "Your item has been sold!",
      seller,
      `Woohoo!! Your item ${title} has been sold for $${amount}`
    );
  }

  private notifyBidder(auction: Auction, type: "SUCCESS" | "FAILED") {
    const { title } = auction;
    const { amount, bidder } = auction.highestBid;

    if (type === "FAILED") return;

    return this.sendMessage(
      "You won an auction!",
      bidder,
      `What a great deal!! You got yourself a ${title} for $${amount}`
    );
  }

  private sendMessage(subject: string, recipient: string, body: string) {
    return sqs
      .sendMessage({
        QueueUrl: mailQueueUrl,
        MessageBody: JSON.stringify({
          subject,
          recipient,
          body,
        }),
      })
      .promise();
  }
}
