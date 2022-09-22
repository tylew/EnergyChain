import { submitTransaction } from "../../../hyperledger/api-SubmitTransaction"

export default function api(req,res) {
  const { userid, hourblock, maxkwh, price } = req.query
  //  example route:
  //    /api/setprosumerpref/0?hourblock=10&maxkwh=5&price=.4

  console.log(userid, hourblock, maxkwh, price)
  // res.send(200)

  //             ///            userid       contractname              func        args
  submitTransaction(req, res, userid, 'ProsumerPrefContract', 'UpdatePrefHour', [`${hourblock}`, maxkwh, price])
}