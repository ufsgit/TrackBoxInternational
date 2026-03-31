DELIMITER //

CREATE PROCEDURE sp_GetDashboardStats(
    IN p_filter VARCHAR(20),       -- 'day', 'month', 'all'
    IN p_startDate DATE,
    IN p_endDate DATE,
    IN p_userId INT,
    IN p_branchId INT,
    IN p_userRole VARCHAR(20)
)
BEGIN
    -- 1. Summary Counts
    -- Total Students
    SELECT COUNT(*) as totalStudents 
    FROM students 
    WHERE (p_userRole = 'admin' OR assigned_to = p_userId OR branch_id = p_branchId)
    AND (p_startDate IS NULL OR created_at >= p_startDate)
    AND (p_endDate IS NULL OR created_at <= p_endDate);

    -- 2. Status Distribution
    SELECT status, COUNT(*) as count 
    FROM students 
    WHERE (p_userRole = 'admin' OR assigned_to = p_userId OR branch_id = p_branchId)
    AND (p_startDate IS NULL OR created_at >= p_startDate)
    AND (p_endDate IS NULL OR created_at <= p_endDate)
    GROUP BY status;

    -- 3. Graph Data
    IF p_filter = 'day' THEN
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as label, COUNT(*) as count 
        FROM students 
        WHERE (p_userRole = 'admin' OR assigned_to = p_userId OR branch_id = p_branchId)
        AND (p_startDate IS NULL OR created_at >= p_startDate)
        AND (p_endDate IS NULL OR created_at <= p_endDate)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at);
    ELSE
        -- Default to Month (for 'month' or 'all')
        SELECT DATE_FORMAT(created_at, '%Y-%m') as label, COUNT(*) as count 
        FROM students 
        WHERE (p_userRole = 'admin' OR assigned_to = p_userId OR branch_id = p_branchId)
        AND (p_startDate IS NULL OR created_at >= p_startDate)
        AND (p_endDate IS NULL OR created_at <= p_endDate)
        GROUP BY YEAR(created_at), MONTH(created_at)
        ORDER BY YEAR(created_at), MONTH(created_at);
    END IF;

END //

DELIMITER ;
