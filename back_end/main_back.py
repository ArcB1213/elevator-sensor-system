from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta

from database_crtl import *


# 创建Flask应用实例
app = Flask(__name__)
# 配置
CORS(app, origins=['http://localhost:8080', 'http://localhost:5173'])
app.config['JWT_SECRET_KEY'] = '2352733'  # 生产环境中应该使用环境变量
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# 初始化数据库
db = DBConfig('root','20@jiAyUtoSX','localhost','3306','elevator-system')

# JWT工具函数
def generate_jwt_token(user_id, username, role='user'):
    try:
        payload = {
            'user_id': user_id,
            'username': username,
            'role': role,
            'exp': datetime.datetime.now(datetime.UTC) + timedelta(hours=JWT_EXPIRATION_HOURS),
            'iat': datetime.datetime.now(datetime.UTC)
        }
        return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm=JWT_ALGORITHM)
    except Exception as e:
        print(f"JWT generation error: {e}")
        return None

def verify_jwt_token(token):
    """验证JWT令牌"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        return payload, True
    except jwt.ExpiredSignatureError:
        return None, False
    except jwt.InvalidTokenError:
        return None, False

def create_response(data=None, message='', status=200, success=True):
    """统一响应格式"""
    return jsonify({
        'success': success,
        'message': message,
        'data': data,
        'timestamp': datetime.datetime.now(datetime.UTC).isoformat()
    }), status

@app.route('/api/auth/register', methods=['POST'])
def user_register():
    """用户注册API"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message='请求数据不能为空',
                status=400,
                success=False
            )

        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        role = data.get('role', 'user').strip()

        # 验证输入
        if not username or not password:
            return create_response(
                message='用户名和密码不能为空',
                status=400,
                success=False
            )

        status = db.user_register(username, role, password)

        if status == Status.OK:
            return create_response(
                message='注册成功',
                status=201
            )
        elif status == Status.ALREADY_EXISTS:
            return create_response(
                message='用户名已存在',
                status=409,
                success=False
            )
        else:
            return create_response(
                message='注册失败，请稍后重试',
                status=500,
                success=False
            )

    except Exception as e:
        return create_response(
            message=f'服务器错误: {str(e)}',
            status=500,
            success=False
        )

# 路由定义
@app.route('/api/auth/login', methods=['POST'])
def user_login():
    """用户登录API"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message='请求数据不能为空',
                status=400,
                success=False
            )

        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        # 验证输入
        if not username or not password:
            return create_response(
                message='用户名和密码不能为空',
                status=400,
                success=False
            )

        # 调用数据库登录函数
        user, status = db.user_login(username, password)
        if status == Status.OK and user:
            # 生成JWT令牌
            token = generate_jwt_token(user.user_id,user.name, user.role)
            return create_response(
                data={
                    'token': token,
                    'user': {
                        'id': user.user_id,
                        'username': user.name,
                        'role': user.role
                    }
                },
                message='登录成功'
            )
        elif status == Status.UNAUTHORIZED:
            return create_response(
                message='用户名或密码错误',
                status=401,
                success=False
            )
        elif status == Status.NOT_FOUND:
            return create_response(
                message='用户不存在',
                status=404,
                success=False
            )
        else:
            return create_response(
                message='登录失败，请稍后重试',
                status=500,
                success=False
            )

    except Exception as e:
        print(f'服务器错误: {str(e)}')
        return create_response(
            message=f'服务器错误: {str(e)}',
            status=500,
            success=False
        )


@app.route('/api/auth/verify', methods=['GET'])
def verify_token():
    """验证JWT令牌"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return create_response(
                message='未提供有效的认证令牌',
                status=401,
                success=False
            )

        token = auth_header.split(' ')[1]
        payload, is_valid = verify_jwt_token(token)

        if is_valid:
            return create_response(
                data={
                    'user': {
                        'id': payload['user_id'],
                        'username': payload['username'],
                        'role': payload['role']
                    }
                },
                message='令牌验证成功'
            )
        else:
            return create_response(
                message='令牌无效或已过期',
                status=401,
                success=False
            )

    except Exception as e:
        return create_response(
            message=f'令牌验证失败: {str(e)}',
            status=401,
            success=False
        )


@app.route('/api/auth/logout', methods=['POST'])
def user_logout():
    """用户登出API"""
    # JWT是无状态的，登出主要由前端处理（删除本地存储的token）
    return create_response(message='登出成功')

@app.route('/api/elevators')
def get_elevators():
    """获取所有电梯信息的API"""
    elevators,status = db.get_elevator_list()
    if(status == Status.OK and elevators):
        return create_response(
            data=[{
                'id': elevator.elevator_id,
                'name': elevator.name,
                'location': elevator.location,
                'status': elevator.status,
                'last_maintenance': elevator.last_maintenance
            } for elevator in elevators],
            message='电梯信息获取成功'
        )
    else:
        return create_response(
            message='电梯信息获取失败',
            status=500,
            success=False
        )

@app.route('/api/elevators/<id>')
def get_elevator_info(id):
    """获取单个电梯信息的API"""
    elevator = db.get_elevator(id)

    if elevator:
        return create_response(
            data={
                'id': elevator.elevator_id,
                'name': elevator.name,
                'location': elevator.location,
                'status': elevator.status,
                'last_maintenance': elevator.last_maintenance
            },
            message='电梯信息获取成功'
        )
    else:
        return create_response(
            message='电梯未找到',
            status=404,
            success=False
        )

@app.route('/api/elevators/<id>/sensors')
def get_elevator_sensors(id):
    """获取电梯传感器信息的API"""
    sensor_data_list,status =db.get_elevator_sensors(id)

    if sensor_data_list and status == Status.OK:
        return create_response(
            data=[{
                'id': sensor_data.sensor_id,
                'type': sensor_data.type,
                'value': sensor_data.value,
                'is_abnormal': sensor_data.is_abnormal,
                'timestamp': sensor_data.timestamp.isoformat() if sensor_data.timestamp else None
            } for sensor_data in sensor_data_list],
            message='传感器信息获取成功'
        )
    elif status == Status.NOT_FOUND:
        return create_response(
            message='传感器未找到',
            status=404,
            success=False
        )
    else:
        return create_response(
            message='传感器信息获取失败',
            status=500,
            success=False
        )

#工具函数，不匹配路由
def get_elevator_sensors_data(id):
    sensors = db.get_elevator_sensors(id)
    data_list = []

    for s in sensors:
        s_data, status = db.get_sensor_data(s.sensor_id)
        if status == Status.OK:
            data_list.append(s_data)

    return sensors, data_list

if __name__ == '__main__':
    app.run(debug=True)