import createHttpError from "http-errors";
import AuctionsRepository from "./repository";
import { Auction, CreateAuctionProps } from "./schema";

export default class AuctionsHTTPService {
  private repo: AuctionsRepository;

  constructor() {
    this.repo = new AuctionsRepository();
  }

  async create(props: CreateAuctionProps) {
    const { title } = props;

    return await this.repo.create({ title });
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

  async placeBid(id: string, amount: number) {
    const auction = await this.getById(id);

    if (auction.status === "CLOSED") {
      throw new createHttpError.Forbidden(`Cannot bid on closed auctions`);
    }

    if (amount <= auction.highestBid.amount) {
      throw new createHttpError.Forbidden(
        `Bid must be higher than ${auction.highestBid.amount}`
      );
    }

    return await this.repo.patchBid(id, amount);
  }
}

type ListOptions = {
  ended?: boolean;
  status?: Auction["status"];
};
