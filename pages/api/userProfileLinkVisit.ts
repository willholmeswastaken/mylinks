// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if(req.method !== 'POST') res.status(404)
    else{
        // todo:
        // check that the user profile exists, if not return badrequest
        // add user profile visit to db.
        res.status(200).json({ name: 'John Doe' })
    }
}
