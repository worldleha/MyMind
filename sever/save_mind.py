import asyncio
import os
import time

#读取头部
async def read_headers(reader):
    header_bs = bytearray()
    header_bs += await reader.readuntil(b'\r\n\r\n')
    return header_bs

# 读取数据部分
async def read_data(reader):
    data_bs = bytearray()
    try:
        data_bs += await reader.readuntil(b'$$\r\n')
    except asyncio.exceptions.LimitOverrunError:
        #接收文件过大
        print("out of limit")
        return b""
    
    data = data_bs.split(b"~~$~~")
    path = "../mymind/database/"+data[0].decode("utf8")
    path2 = path+"/"+data[1].decode("utf8")
    return path, path2, data[2][:-4]

# 返回时间
def return_GMT_time():
    gmt_time = time.gmtime()
    time_format = "%a, %d %b %Y %H:%M:%S GMT"
    return time.strftime(time_format, gmt_time).encode()

# 对头信息判断
def accept_headers(headers):
    print(headers)
    return bool(headers)

# 发送头文件

async def send_message(writer):
    status_message = 'HTTP/1.1 200 OK\n'
    header_message = '''Content-Type:text/html;charset=UTF-8
Server:Tengine/1.4.6
Access-Control-Allow-Origin:*
Access-Control-Allow-Methods:POST
Content-Length:15
'''
    end_message = '\n'
    writer.write((status_message+header_message+end_message).encode())
    await writer.drain()

# 服务器响应
async def response(reader, writer):

    print("----")
    
    header_bs = await read_headers(reader)
    if accept_headers(header_bs):
        
        path, path2, data = await read_data(reader)
        
        if not os.path.exists(path):
            os.mkdir(path = path)
        
        _, f_type = os.path.splitext(path2)
        
        match(f_type):
            case '.json':
                
                with open(path2, "wb") as f:
                    f.write(data)
                print(path2,"save")
                    
            case '.png'|'.jpg'|'.jpeg':
                
                if not os.path.exists(path2):
                    with open(path2, "wb") as f:
                        f.write(data)
                    print(path2,"save")
                else:
                    print(path2,"exsist")

                    
        print("complete")
        
        await send_message(writer)
        writer.write("Save Complete\n\n".encode())
        await writer.drain()


async def create_server():

    server_cor = asyncio.start_server(response, "127.0.0.1", 8840, limit = 2**24)
    server = await server_cor
    async with server:
        await server.serve_forever()

if __name__ == "__main__":

    asyncio.run(create_server())
