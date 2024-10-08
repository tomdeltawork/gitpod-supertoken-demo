-- 插入專案數據
INSERT INTO AIT_Projects (name, description) 
VALUES 
('Project Alpha', 'Description for Project Alpha'),
('Project Beta', 'Description for Project Beta');

-- 插入用戶數據
INSERT INTO AIT_Users (name, email) 
VALUES 
('Alice Johnson', 'alice.johnson@example.com'),
('Bob Smith', 'bob.smith@example.com'),
('Charlie Brown', 'charlie.brown@example.com');

-- 插入任務數據
INSERT INTO AIT_Tasks (name, description, project_id) 
VALUES 
('Task 1', 'Design the database schema', 1),
('Task 2', 'Develop the REST API', 1),
('Task 3', 'Implement UI', 2),
('Task 4', 'Test the system', 2);

-- 插入工時數據
INSERT INTO AIT_Works (user_id, task_id, hours_worked, work_date) 
VALUES 
(1, 1, 5.0, '2024-09-22'),  -- Alice 在 Task 1 上工作 5 小時
(2, 2, 6.5, '2024-09-23'),  -- Bob 在 Task 2 上工作 6.5 小時
(3, 3, 4.0, '2024-09-23'),  -- Charlie 在 Task 3 上工作 4 小時
(1, 4, 7.0, '2024-09-24'),  -- Alice 在 Task 4 上工作 7 小時
(2, 1, 3.0, '2024-09-24'),  -- Bob 在 Task 1 上工作 3 小時
(3, 4, 6.0, '2024-09-25');  -- Charlie 在 Task 4 上工作 6 小時