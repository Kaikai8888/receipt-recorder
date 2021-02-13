CREATE DATABASE receipts_dev;
CREATE DATABASE receipts_test;

USE receipts_test;

SELECT * FROM users;
SELECT * FROM tags;
SELECT * FROM receipts;
SELECT * FROM products;
SELECT * FROM stores;
SELECT * FROM purchases;
SELECT * FROM taggings;

SELECT r.id, r.receiptNo, r.payment, r.date, r.tender, r.change, 
       r.StoreId, s.name, s.tel, s.gstReg,
       COUNT(pur.id) AS items,
       SUM(pur.quantity) AS qty,
       SUM(pur.quantity * pur.price) AS total
FROM Receipts AS r
LEFT JOIN Purchases AS pur ON r.id = pur.ReceiptId
LEFT JOIN Stores AS s ON r.StoreId = s.id
WHERE r.UserId = 1
GROUP BY r.id;

SELECT r.id,
       pro.id AS ProductId, pro.productNo, pro.name,
       pur.quantity, pur.price, 
       pur.price * pur.quantity AS subtotal
FROM Receipts AS r
LEFT JOIN Purchases AS pur ON r.id = pur.ReceiptId
LEFT JOIN Products AS pro ON pur.ProductId = pro.id
WHERE r.UserId = 1;

SELECT r.id, r.receiptNo, r.payment, r.date, r.tender, r.change, 
       r.StoreId, s.name AS storeName, s.tel, s.gstReg,
       pro.id AS ProductId, pro.productNo, pro.name,
       pur.quantity, pur.price, 
       pur.price * pur.quantity AS subtotal
FROM Receipts AS r
LEFT JOIN Purchases AS pur ON r.id = pur.ReceiptId
LEFT JOIN Products AS pro ON pur.ProductId = pro.id
LEFT JOIN Stores AS s ON r.StoreId = s.id
WHERE r.UserId = 1;




