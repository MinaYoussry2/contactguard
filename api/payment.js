export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { orderID, userId } = req.body
  if (!orderID) return res.status(400).json({ error: 'No order ID' })
  try {
    const authRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    const authData = await authRes.json()
    const accessToken = authData.access_token

    const orderRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    const order = await orderRes.json()

    if (order.status === 'COMPLETED') {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET)
      await supabase.from('payments').insert({
        user_id: userId,
        paypal_order_id: orderID,
        amount: 7.99,
        status: 'completed',
        created_at: new Date().toISOString()
      })
      await supabase.rpc('add_credit', { uid: userId })
      res.status(200).json({ success: true })
    } else {
      res.status(400).json({ error: 'Payment not completed' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Payment verification failed' })
  }
}
