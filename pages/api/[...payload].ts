import { NextApiRequest, NextApiResponse } from "next";

// Simple API handler for Payload CMS
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.status(200).json({ 
    message: "Payload API endpoint", 
    method: req.method,
    path: req.url 
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};
