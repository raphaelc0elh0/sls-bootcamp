import httpMiddleware from "@libs/middleware";
import { Auction } from "./schema";
import AuctionsService from "./service";
import validator from "../../libs/validator";
import { listAuctionsSchema } from "./schemas/listAuctionsSchema";
import { createAuctionSchema } from "./schemas/createAuctionSchema";
import { placeBidSchema } from "./schemas/placeBidSchema";

export const createAuction = httpMiddleware(async (event) => {
  const { title } = event.body as any;
  const { email } = event.requestContext.authorizer;

  const result = await new AuctionsService().create({ title, seller: email });

  return {
    statusCode: 201,
    body: JSON.stringify(result),
  };
}).use(validator(createAuctionSchema));

export const getAuction = httpMiddleware(async (event) => {
  const { id } = event.pathParameters;

  const result = await new AuctionsService().getById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});

export const listAuctions = httpMiddleware(async (event) => {
  const status = event.queryStringParameters.status as Auction["status"];

  const result = await new AuctionsService().list({ status });

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
}).use(validator(listAuctionsSchema));

export const placeBid = httpMiddleware(async (event) => {
  const { id } = event.pathParameters;
  const { amount } = event.body as any;
  const { email } = event.requestContext.authorizer;

  await new AuctionsService().placeBid(id, { amount, bidder: email });

  return {
    statusCode: 204,
    body: null,
  };
}).use(validator(placeBidSchema));

export const processAuctions = async () => {
  const closedPromisesLength = await new AuctionsService().closeAuctions();
  console.log({
    closedAuctions: closedPromisesLength,
  });
};

export const uploadAuctionPicture = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ name: process.env.AUCTIONS_BUCKET_NAME }),
  };
};
