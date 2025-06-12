import pymysql
import hashlib
import datetime
import json
import os

class Status:
    """
    @brief 状态码类，用于定义操作的状态
    """
    OK = 0
    ERROR = 1
    NOT_FOUND = 2
    ALREADY_EXISTS = 3
    INVALID_INPUT = 4
    UNAUTHORIZED = 5
    FORBIDDEN = 6
    INTERNAL_ERROR = 7

class user:
    """
    @brief 用户类，用于表示数据库中的用户信息

    该类封装了用户的基本信息和操作方法，提供了对用户数据的访问和修改接口
    """
    def __init__(self, user_id=None, name=None, role=None, password_hash=None,created_at=None):
        self.user_id = user_id
        self.name = name
        self.role = role
        self.password_hash = password_hash
        self.created_at = created_at

    def set_by_row(self, row):
        """
        @brief 根据数据库行数据设置用户属性
        @param row 数据库查询结果行
        """
        self.user_id = row[0]
        self.name = row[1]
        self.role = row[2]
        self.password_hash = row[3]
        self.created_at = row[4]

class elevator:
    """
    @brief 电梯类，用于表示数据库中的电梯信息

    该类封装了电梯的基本信息和操作方法，提供了对电梯数据的访问和修改接口
    """
    def __init__(self, row):
        self.elevator_id = row[0]
        self.name = row[1]
        self.location = row[2]
        self.status = row[3]
        self.last_maintenance = row[4]

class sensor:
    """
    @brief 传感器类，用于表示数据库中的传感器信息

    该类封装了传感器的基本信息和操作方法，提供了对传感器数据的访问和修改接口
    """
    def __init__(self, sensor_id, elevator_id, type, max_value,min_value):
        self.sensor_id = sensor_id
        self.elevator_id = elevator_id
        self.type = type
        self.max_value = max_value
        self.min_value = min_value

    def set_by_row(self, row):
        """
        @brief 根据数据库行数据设置传感器属性
        @param row 数据库查询结果行
        """
        self.sensor_id = row[0]
        self.elevator_id = row[1]
        self.type = row[2]
        self.max_value = row[3]
        self.min_value = row[4]

class sensor_data:
    """
    @brief 传感器数据类，用于表示数据库中的传感器数据

    该类封装了传感器数据的基本信息和操作方法，提供了对传感器数据的访问和修改接口
    """
    def __init__(self, sensor_id=None,sensor_type=None,value=None,is_abnormal=False,timestamp=None):
        self.sensor_id = sensor_id
        self.type = sensor_type
        self.value = value
        self.is_abnormal = is_abnormal
        self.timestamp = timestamp

    def set_by_row(self, row):
        """
        @brief 根据数据库行数据设置传感器数据属性
        @param row 数据库查询结果行
        """
        self.sensor_id = row[0]
        self.type = row[1]
        self.value = row[2]
        self.is_abnormal = row[3]
        self.timestamp = row[4] if row[4] else datetime.datetime.now()

class DBConfig:
    """
    @brief 数据库配置类，用于管理数据库连接和操作

    该类提供了数据库初始化、用户管理、订单管理等核心功能，
    封装了与MySQL数据库的交互操作，支持企业管理员、家长、教师和业务员四种角色的管理
    """
    user = 0
    password = ""
    host = ""
    port = 0
    database = ""
    admin = ""
    admin_password = ""
    connection = None

    def __init__(self, user_t, password_t, host_t, port_t, database_t):
        """
        @brief 这个函数用于初始化数据库
        @param user_t 数据库用户名
        @param password_t 数据库密码
        @param host_t 数据库主机地址
        @param port_t 数据库端口号
        @param database_t 数据库名称
        @return Status.OK 初始化成功
        @return Status.ERROR 初始化失败
        """
        # connect to database
        self.user = user_t
        self.password = password_t
        self.host = host_t
        self.port = int(port_t)
        self.database = database_t
        try:
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                charset='utf8mb4'
            )
            self.status = Status.OK
        except pymysql.MySQLError as e:
            print(f"Database connection error: {e}")
            self.status = Status.ERROR

    def __del__(self):
        """
        @brief 析构函数，关闭数据库连接
        """

        if hasattr(self, 'connection') and self.connection:
            try:
                self.connection.close()
                print("Database connection closed")
            except Exception as e:
                print(f"Database connection error: {e}")
                pass

    def ensure_connection(self):
        """确保数据库连接有效"""
        try:
            # 检查连接是否已关闭或过期
            if self.connection is None or not self.connection.open:
                self._reconnect()
                return

            # 执行简单查询测试连接
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()

        except (pymysql.err.OperationalError, pymysql.err.InterfaceError):
            # 重新连接
            self._reconnect()

    def _reconnect(self):
        """重新建立数据库连接"""
        try:
            # 如果之前有连接，先尝试关闭
            if hasattr(self, 'connection') and self.connection and hasattr(self.connection, 'close'):
                try:
                    self.connection.close()
                except:
                    pass

            # 创建新连接
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                charset='utf8mb4'
            )
            self.status = Status.OK
        except pymysql.MySQLError as e:
            print(f"数据库重连失败: {e}")
            self.connection = None
            self.status = Status.ERROR

    def user_register(self, name, role, password) -> Status:
        """
        @brief 用户注册
        @param name 用户名
        @param role 用户角色
        @param password 密码
        @return Status.OK 注册成功
        @return Status.ERROR 注册失败
        @return Status.ALREADY_EXISTS 用户已存在
        """
        self.ensure_connection()
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE username = %s", (name,))
                if cursor.fetchone():
                    return Status.ALREADY_EXISTS

                password_hash = hashlib.sha256(password.encode()).hexdigest()
                cursor.execute(
                    "INSERT INTO users (username, role, password) VALUES (%s, %s, %s)",
                    (name, role, password_hash)
                )
                self.connection.commit()
                return Status.OK
        except pymysql.MySQLError as e:
            print(f"Database error: {e}")
            return Status.ERROR

    def user_login(self, username, password) -> tuple[user, Status]|tuple[None, Status]:
        """
        @brief 用户登录验证
        @param username 用户名
        @param password 密码
        @return Status.OK 登录成功
        @return Status.ERROR 登录失败
        """
        self.ensure_connection()
        print("start login")
        try:
            with self.connection.cursor() as cursor:
                print("start SQL query")
                cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
                user_data = cursor.fetchone()
                print("SQL query finished")
                if user_data:
                    password_hash = user_data[2]
                    if hashlib.sha256(password.encode()).hexdigest() == password_hash:
                        User = user()
                        User.set_by_row(user_data)
                        print(f"User {username} logged in successfully.")
                        print(User.name)
                        return User, Status.OK
                    else:
                        print(f"Invalid password for user {username}.")
                        return None, Status.UNAUTHORIZED
                print('User not found.')
                return None, Status.NOT_FOUND
        except pymysql.MySQLError as e:
            print(f"Database error: {e}")
            return None, Status.INTERNAL_ERROR
        except Exception as e:  # ✅ 捕获其他异常
            print(f"Unexpected error: {e}")
            return None, Status.INTERNAL_ERROR

    def get_elevator_list(self) -> tuple[list[elevator], Status]:
        """
        @brief 获取电梯列表
        @return list[elevator] 电梯列表
        @return Status.OK 获取成功
        @return Status.ERROR 获取失败
        """
        self.ensure_connection()
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT id,name,location,status,last_maintenance FROM elevators")
                rows = cursor.fetchall()

                elevators = []
                if(rows):
                    for row in rows:
                        e = elevator(row)
                        elevators.append(e)
                print(elevators[0].location)
                return elevators, Status.OK
        except pymysql.MySQLError as e:
            print(f"Database error: {e}")
            return [], Status.INTERNAL_ERROR

    def get_elevator(self, elevator_id) -> elevator|None:
        """
        @brief 获取指定电梯信息
        @param elevator_id 电梯ID
        @return elevator 电梯对象
        @return None 如果电梯不存在
        """
        self.ensure_connection()
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT * FROM elevators WHERE id = %s", (elevator_id,))
                row = cursor.fetchone()
                if row:
                    elev = elevator(row)
                    return elev
                return None
        except pymysql.MySQLError as e:
            print(f"Database error: {e}")
            return None


    def get_elevator_sensors(self, elevator_id) -> tuple[list[sensor_data], Status]|tuple[None, Status]:
        """
        @brief 获取指定电梯的传感器列表

        """
        self.ensure_connection()
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""SELECT sensor_id, sensor_type,value, is_abnormal, timestamp
                                  FROM v_latest_sensor_data WHERE elevator_id = %s
                                  order by sensor_id """,
                               (elevator_id,))
                rows = cursor.fetchall()
                if rows:
                    sensor_data_list = [sensor_data(*row) for row in rows]
                    return sensor_data_list, Status.OK
                return None, Status.NOT_FOUND
        except pymysql.MySQLError as e:
            print(f"Database error: {e}")
            return None, Status.INTERNAL_ERROR

