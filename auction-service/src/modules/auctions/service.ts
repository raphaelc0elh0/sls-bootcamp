import createHttpError from "http-errors";
import AuctionsRepository from "./repository";
import { Auction, CreateAuctionProps, PlaceBidProps } from "./schema";

export default class AuctionsHTTPService {
  private repo: AuctionsRepository;

  constructor() {
    this.repo = new AuctionsRepository();
  }

  async create(props: CreateAuctionProps) {
    const { title, seller } = props;

    return await this.repo.create({ title, seller });
  }

  async closeAuctions() {
    try {
      const auctionsToClose = await this.list({ ended: true });
      const auctionPromises = auctionsToClose.map((auction) =>
        this.repo.update(auction, { status: "CLOSED" })
      );
      await Promise.all(auctionPromises);

      return auctionPromises.length;
    } catch (error) {
      console.log(error);
      throw new createHttpError.InternalServerError(error);
    }
  }

  async getById(id: string) {
    const auction = await this.repo.retrieve(id);

    if (!auction) {
      throw new createHttpError.NotFound("Auction not found");
    }

    return auction;
  }

  async list({ ended, status }: ListOptions) {
    if (ended) {
      return await this.repo.listEnded();
    }

    if (status) {
      return await this.repo.listByStatus(status);
    }

    return await this.repo.scan();
  }

  async placeBid(id: string, props: PlaceBidProps) {
    const { amount, bidder } = props;

    const auction = await this.getById(id);

    if (auction.status === "CLOSED") {
      throw new createHttpError.Forbidden(`Cannot bid on closed auctions`);
    }

    if (auction.seller === bidder) {
      throw new createHttpError.Forbidden(`You cannot bid on your own auction`);
    }

    if (auction.highestBid.bidder === bidder) {
      throw new createHttpError.Forbidden(`You are already the highest bidder`);
    }

    if (amount <= auction.highestBid.amount) {
      throw new createHttpError.Forbidden(
        `Bid must be higher than ${auction.highestBid.amount}`
      );
    }

    return await this.repo.patchBid(id, { amount, bidder });
  }
}

type ListOptions = {
  ended?: boolean;
  status?: Auction["status"];
};
