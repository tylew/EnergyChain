import { evaluateTransaction } from "../../../hyperledger/api-EvaluateTransaction"

export default function api(req,res) {
  const userid = req.query.userid

  if(userid == null ) {
    res.send({'error': 500})
    return
  }

  //                       /// userid / DL function ///
  evaluateTransaction(req, res, userid, 'EnergyAssetContract', 'AllHistoricalEnergyAssets')
}