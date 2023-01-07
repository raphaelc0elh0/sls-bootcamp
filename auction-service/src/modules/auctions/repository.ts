import { DynamoDB } from "aws-sdk";
import { v4 as uuidV4 } from "uuid";
import createHttpError from "http-errors";
import { Auction, CreateAuctionProps } from "./schema";

export default class AuctionsRepository {
  private documents = new DynamoDB.DocumentClient();
  private tableName = process.env.AUCTIONS_TABLE_NAME;

  async create(props: CreateAuctionProps) {
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + 1);

    const Item: Auction = {
      ...props,
      id: uuidV4(),
      status: "OPEN",
      created_at: new Date().toISOString(),
      ending_at: endDate.toISOString(),
      highestBid: {
        amount: 0,
      },
    };

    try {
      await this.documents
        .put({
          TableName: this.tableName,
          Item,
        })
        .promise();
    } catch (error) {
      console.log(error);
      throw new createHttpError.InternalServerError(error);
    }

    return Item;
  }

  async retrieve(id: string) {
    const result = await this.documents
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();

    return result.Item as Auction;
  }

  async scan() {
    const result = await this.documents
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return result.Items as Auction[];
  }

  async listByStatus(status?: Auction["status"]) {
    const result = await this.documents
      .query({
        TableName: this.tableName,
        IndexName: "status-ending_at",
        KeyConditionExpression: "#status= :status",
        ExpressionAttributeValues: { ":status": status },
        ExpressionAttributeNames: { "#status": "status" },
      })
      .promise();

    return result.Items as Auction[];
  }

  async listEnded() {
    const now = new Date();

    const result = await this.documents
      .query({
        TableName: this.tableName,
        IndexName: "status-ending_at",
        KeyConditionExpression: "#status= :status AND ending_at <= :now",
        ExpressionAttributeValues: {
          ":status": "OPEN",
          ":now": now.toISOString(),
        },
        ExpressionAttributeNames: {
          "#status": "status",
        },
      })
      .promise();

    return result.Items as Auction[];
  }

  async patchBid(id: string, amount: number) {
    await this.documents
      .update({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: "set highestBid.amount = :amount",
        ExpressionAttributeValues: {
          ":amount": amount,
        },
      })
      .promise();
  }

  async update(current: Auction, patch: Partial<Auction>) {
    const Item: Auction = {
      ...current,
      ...patch,
    };

    await this.documents
      .put({
        TableName: this.tableName,
        Item,
      })
      .promise();

    return Item;
  }
}
