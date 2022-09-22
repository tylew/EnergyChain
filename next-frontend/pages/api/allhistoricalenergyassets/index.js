export default function api(req,res) {
    console.log("Error: Non-dynamic api requested")
    res.send({'error': 500})
}