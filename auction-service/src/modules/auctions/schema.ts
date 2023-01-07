export type Auction = {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED";
  created_at: string;
  ending_at: string;
  highestBid: {
    amount: number;
  };
};

export type CreateAuctionProps = Pick<Auction, "title">;
