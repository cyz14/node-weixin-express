## My Notes

### Setup

1. Install localtunnel globally  
    `npm install -g localtunnel`
2. Choose a local port to support service, e.g. 2048, then run localtunnel  
    `lt --port 2048`  
    lt will give a url to visit from outside web to your chosen port
3. Then config node-weixin-express with config yaml file.
    * port should be the same as previous port on which service is supported to providing
    * host should be the IP of the running host, e.g. localhost for your local computer
    * weixin:
        - server host should be the url got in step 2
        - server prefix should start with '/'
        - app: id, secret, token should be the same as in mp.weixin.qq.com
4. Run node-weixin-express
    * If node-weixin-express is installed globally, just run   
    `weixin <config-file-name>.yaml`
    * To test node-weixin-express locally, just run  
    ```sh
    [/path/to/node-weixin-express]$ node ./lib/cli.js <config-file-name>.yaml 
    ```

### Nginx 反向代理
    node-weixin-express 可以运行在一个端口上，然后用nginx在80端口反向代理到这个端口来。
    略去Nginx的安装步骤。
#### Nginx 反向代理配置部分
Nginx 版本：`nginx version: nginx/1.4.6 (Ubuntu)`   
在 /usr/local/nginx/ 下有 nginx.conf 文件。以这个配置文件运行的命令是：
```sh
sudo nginx -c /usr/local/nginx/nginx.conf 
```
注：应该需要管理员权限，指定配置文件是 －c ，路径在我的虚拟机上nginx貌似不支持相对路径。

可以建立 /usr/local/nging/conf/include 文件夹单独存放配置文件供include
比如在 include 路径下新建 node-weixin.conf
```nginx
# 声明这个虚拟 server, 具体的作用还不明白 
upstream nodejs {
        server 127.0.0.1:2048; # 这个port是 node-weixin 在 listen 的端口
        keepalive 64;
}

server {
        listen       80;
        server_name  www.chenyazheng.cn chenyazheng.cn;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            # 后端服务
            proxy_pass http://localhost:2048;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Host $http_host;
            proxy_set_header X-Nginx-Proxy true;
        }

        error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

}
```

之后需要在 /usr/local/nginx/nginx.conf 中把上面的conf文件 include 进来
```
http {
    server {
        ...
        include       /usr/local/nginx/conf/include/*.conf;
        ...
    }
}


```

### Check Token
在微信的基本配置页面，填写服务器配置的URL应该是 Setup中第二步获得的localtunnel的URL作为baseurl，格式是  
    `baseurl+'/prefix'+'/auth/ack'`
且默认情况下只有选择明文模式才可以通过验证，因为代码中应该还没有加解密的部分。

### 微信Web开发者工具测试
扫码验证登录后，URL地址栏输入tunnel地址没有反应，不能挑战，经过试验发现本地URL应该是   
`http://localhost:2048`
即localhost加端口号

## 在windows下用Ngrok和nginx本地调试
[Ngrok的参考链接: https://natapp.cn/article/wechat_local_debug](https://natapp.cn/article/wechat_local_debug)

### nginx的配置
nginx的conf文件中，include一个server的配置，在server_name中按照上面的教程里的把natapp给出的url加进去就可以了。运行nginx依然是用-c指定配置文件。
Windows本地的ngrok默认是穿透80端口，所以node-weixin-express的配置yaml文件里的port可以直接设置为80。
微信测试号的token验证接口是 natapp_Url + 前缀 + /auth/ack。server的host也是这个。  
jssdk接口的安全域名是 natapp_Url, 不加后面的/jssdk/config, 也不加前面的 http(s):// 。
