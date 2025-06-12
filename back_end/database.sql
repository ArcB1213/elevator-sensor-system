-- 用户表
CREATE TABLE USERS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,  -- 添加唯一约束
    password VARCHAR(255) NOT NULL,   -- 明确字段用途
    role ENUM('user', 'admin') DEFAULT 'user',  -- 使用ENUM限制角色值
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 添加索引
    INDEX idx_username (username)
);

CREATE TABLE ELEVATORS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status ENUM('正常运行', '警告', '故障') DEFAULT '正常运行',
    last_maintenance DATE,

    -- 添加索引以提高查询性能
    INDEX idx_status (status),
    INDEX idx_location (location),
    INDEX idx_last_maintenance (last_maintenance)
);

CREATE TABLE SENSORS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    elevator_id INT NOT NULL,
    type VARCHAR(30) NOT NULL,
    max_value FLOAT,
    min_value FLOAT,
    FOREIGN KEY (elevator_id) REFERENCES ELEVATORS(id),
    -- 添加约束确保max_value > min_value
    CONSTRAINT chk_sensor_values CHECK (max_value > min_value),

    -- 添加索引
    INDEX idx_elevator_id (elevator_id),
    INDEX idx_type (type),
    INDEX idx_elevator_type (elevator_id, type)
);

CREATE TABLE SENSOR_DATA (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sensor_id INT NOT NULL,
    value FLOAT,
    is_abnormal BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES SENSORS(id)
);

-- ==========================================
-- 功能1: 更新sensor_data的is_abnormal字段
-- ==========================================

-- 创建存储过程：更新单条sensor_data的异常状态
DELIMITER //
CREATE PROCEDURE UpdateSensorDataAbnormal(IN sensor_data_id INT)
BEGIN
    UPDATE SENSOR_DATA sd
    JOIN SENSORS s ON sd.sensor_id = s.id
    SET sd.is_abnormal = CASE
        WHEN sd.value < s.min_value OR sd.value > s.max_value THEN TRUE
        ELSE FALSE
    END
    WHERE sd.id = sensor_data_id;
END //
DELIMITER ;

-- 创建存储过程：批量更新所有sensor_data的异常状态
DELIMITER //
CREATE PROCEDURE UpdateAllSensorDataAbnormal()
BEGIN
    UPDATE SENSOR_DATA sd
    JOIN SENSORS s ON sd.sensor_id = s.id
    SET sd.is_abnormal = CASE
        WHEN sd.value < s.min_value OR sd.value > s.max_value THEN TRUE
        ELSE FALSE
    END;
END //
DELIMITER ;

-- 创建触发器：在插入新的sensor_data时自动计算is_abnormal
DELIMITER //
CREATE TRIGGER tr_sensor_data_insert_abnormal
BEFORE INSERT ON SENSOR_DATA
FOR EACH ROW
BEGIN
    DECLARE max_val FLOAT;
    DECLARE min_val FLOAT;

    -- 获取对应传感器的阈值
    SELECT max_value, min_value
    INTO max_val, min_val
    FROM SENSORS
    WHERE id = NEW.sensor_id;

    -- 计算是否异常
    IF NEW.value < min_val OR NEW.value > max_val THEN
        SET NEW.is_abnormal = TRUE;
    ELSE
        SET NEW.is_abnormal = FALSE;
    END IF;
END //
DELIMITER ;

-- 创建触发器：在更新sensor_data的value时自动重新计算is_abnormal
DELIMITER //
CREATE TRIGGER tr_sensor_data_update_abnormal
BEFORE UPDATE ON SENSOR_DATA
FOR EACH ROW
BEGIN
    DECLARE max_val FLOAT;
    DECLARE min_val FLOAT;

    -- 只有当value字段发生变化时才重新计算
    IF NEW.value != OLD.value THEN
        -- 获取对应传感器的阈值
        SELECT max_value, min_value
        INTO max_val, min_val
        FROM SENSORS
        WHERE id = NEW.sensor_id;

        -- 重新计算是否异常
        IF NEW.value < min_val OR NEW.value > max_val THEN
            SET NEW.is_abnormal = TRUE;
        ELSE
            SET NEW.is_abnormal = FALSE;
        END IF;
    END IF;
END //
DELIMITER ;

-- ==========================================
-- 功能2: 更新elevators的status字段
-- ==========================================

-- 创建存储过程：更新单个电梯的状态
DELIMITER //
CREATE PROCEDURE UpdateElevatorStatus(IN elevator_id INT)
BEGIN
    DECLARE abnormal_count INT DEFAULT 0;
    DECLARE new_status ENUM('正常运行', '警告', '故障');

    -- 计算该电梯最新传感器数据中异常的数量
    SELECT COUNT(DISTINCT sd.sensor_id)
    INTO abnormal_count
    FROM SENSOR_DATA sd
    JOIN SENSORS s ON sd.sensor_id = s.id
    WHERE s.elevator_id = elevator_id
      AND sd.is_abnormal = TRUE
      AND sd.timestamp = (
          SELECT MAX(sd2.timestamp)
          FROM SENSOR_DATA sd2
          WHERE sd2.sensor_id = sd.sensor_id
      );

    -- 根据异常数量确定状态
    IF abnormal_count = 0 THEN
        SET new_status = '正常运行';
    ELSEIF abnormal_count = 1 THEN
        SET new_status = '警告';
    ELSE
        SET new_status = '故障';
    END IF;

    -- 更新电梯状态
    UPDATE ELEVATORS
    SET status = new_status
    WHERE id = elevator_id;
END //
DELIMITER ;

-- 创建存储过程：更新所有电梯的状态
DELIMITER //
CREATE PROCEDURE UpdateAllElevatorStatus()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE elev_id INT;

    -- 声明游标
    DECLARE elevator_cursor CURSOR FOR
        SELECT id FROM ELEVATORS;

    -- 声明异常处理
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- 打开游标
    OPEN elevator_cursor;

    -- 循环处理每个电梯
    read_loop: LOOP
        FETCH elevator_cursor INTO elev_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 更新当前电梯状态
        CALL UpdateElevatorStatus(elev_id);
    END LOOP;

    -- 关闭游标
    CLOSE elevator_cursor;
END //
DELIMITER ;

-- 创建触发器：当sensor_data的is_abnormal字段发生变化时，自动更新相关电梯状态
DELIMITER //
CREATE TRIGGER tr_update_elevator_status_on_sensor_change
AFTER UPDATE ON SENSOR_DATA
FOR EACH ROW
BEGIN
    DECLARE elev_id INT;

    -- 只有当is_abnormal字段发生变化时才触发
    IF NEW.is_abnormal != OLD.is_abnormal THEN
        -- 获取对应的电梯ID
        SELECT elevator_id INTO elev_id
        FROM SENSORS
        WHERE id = NEW.sensor_id;

        -- 更新电梯状态
        CALL UpdateElevatorStatus(elev_id);
    END IF;
END //
DELIMITER ;

-- 创建触发器：当插入新的sensor_data时，自动更新相关电梯状态
DELIMITER //
CREATE TRIGGER tr_update_elevator_status_on_sensor_insert
AFTER INSERT ON SENSOR_DATA
FOR EACH ROW
BEGIN
    DECLARE elev_id INT;

    -- 获取对应的电梯ID
    SELECT elevator_id INTO elev_id
    FROM SENSORS
    WHERE id = NEW.sensor_id;

    -- 更新电梯状态
    CALL UpdateElevatorStatus(elev_id);
END //
DELIMITER ;

-- ==========================================
-- 辅助查询函数
-- ==========================================

-- 创建视图：获取每个传感器的最新数据及其异常状态
CREATE VIEW v_latest_sensor_data AS
SELECT
    s.id as sensor_id,
    s.elevator_id,
    s.type as sensor_type,
    s.max_value,
    s.min_value,
    sd.id as data_id,
    sd.value,
    sd.is_abnormal,
    sd.timestamp
FROM SENSORS s
LEFT JOIN SENSOR_DATA sd ON s.id = sd.sensor_id
WHERE sd.timestamp = (
    SELECT MAX(timestamp)
    FROM SENSOR_DATA sd2
    WHERE sd2.sensor_id = s.id
)
OR sd.id IS NULL;

-- 创建视图：获取每个电梯的异常传感器统计
CREATE VIEW v_elevator_abnormal_stats AS
SELECT
    e.id as elevator_id,
    e.name,
    e.location,
    e.status,
    COUNT(lsd.sensor_id) as total_sensors,
    COUNT(CASE WHEN lsd.is_abnormal = TRUE THEN 1 END) as abnormal_sensors,
    COUNT(CASE WHEN lsd.is_abnormal = FALSE THEN 1 END) as normal_sensors
FROM ELEVATORS e
LEFT JOIN v_latest_sensor_data lsd ON e.id = lsd.elevator_id
GROUP BY e.id, e.name, e.location, e.status;

-- ==========================================
-- 使用示例和测试
-- ==========================================

-- 示例1：手动更新所有传感器数据的异常状态
-- CALL UpdateAllSensorDataAbnormal();

-- 示例2：手动更新所有电梯的状态
-- CALL UpdateAllElevatorStatus();

-- 示例3：查看电梯异常统计
-- SELECT * FROM v_elevator_abnormal_stats;

-- 示例4：查看最新传感器数据
-- SELECT * FROM v_latest_sensor_data WHERE elevator_id = 1;

-- 示例5：插入测试数据（会自动触发异常检测和状态更新）
-- INSERT INTO SENSOR_DATA (sensor_id, value) VALUES (1, 999.9);

-- ==========================================
-- 初始化数据
-- ==========================================

-- 如果需要对现有数据进行初始化，执行以下语句：
-- 1. 更新所有现有sensor_data的is_abnormal字段
-- CALL UpdateAllSensorDataAbnormal();

-- 2. 更新所有电梯的status字段
-- CALL UpdateAllElevatorStatus();