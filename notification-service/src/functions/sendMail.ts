import { APIGatewayController } from "@libs/api-gateway";

const _handler: APIGatewayController = async (event) => {
  console.log(event);

  return {
    statusCode: 201,
    body: JSON.stringify(event),
  };
};

export const handler = _handler;
