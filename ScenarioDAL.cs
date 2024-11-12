SELECT 
    t.name AS TableName,
    c.name AS ColumnName
FROM 
    sys.columns c
JOIN 
    sys.tables t ON c.object_id = t.object_id
WHERE 
    c.name LIKE '%SFTP%'
ORDER BY 
    t.name;
