import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";

export type APIGatewayController = Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
>;
