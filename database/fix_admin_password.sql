-- 修复admin用户密码哈希值
-- 密码: 123456
-- 生成的BCrypt哈希值: $2a$10$KBBuIx1BHWF8vX0CzDKRaOrJH7v617EfA0/WYojzVN6zX9Uz26cnS

USE contract_management;

-- 更新admin用户的密码哈希值
UPDATE users 
SET password_hash = '$2a$10$KBBuIx1BHWF8vX0CzDKRaOrJH7v617EfA0/WYojzVN6zX9Uz26cnS' 
WHERE username = 'admin';

-- 验证更新结果
SELECT username, password_hash, real_name, email, role 
FROM users 
WHERE username = 'admin';

-- 显示更新影响的行数
SELECT ROW_COUNT() as affected_rows;