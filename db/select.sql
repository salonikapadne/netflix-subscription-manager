SELECT 
    s.id AS subscription_id,
    u.name AS user_name,
    u.email,
    p.name AS plan_name,
    p.price_cents,
    s.status,
    s.started_at,
    s.ends_at
FROM subscriptions s
JOIN users u ON u.id = s.user_id
JOIN plans p ON p.id = s.plan_id
ORDER BY s.created_at DESC;