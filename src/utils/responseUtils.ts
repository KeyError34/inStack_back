import { Response } from "express";

interface IResponseData<T>{
  message: string
  data?:T
}
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  { message, data }: IResponseData<T>
) => {
  res.status(statusCode).json({
    message,
    ...(data && { data }), 
  });
};
