# 域名配置指南 (Domain Setup Guide)

## 17.1 购买域名 (Domain Purchase)

### 推荐域名注册商

#### 国际注册商
1. **Namecheap** (推荐)
   - 价格透明，无隐藏费用
   - 免费 WHOIS 隐私保护
   - 良好的客户支持
   - 网址: https://www.namecheap.com

2. **Cloudflare Registrar**
   - 成本价注册，无加价
   - 集成 DNS 管理
   - 优秀的安全功能
   - 网址: https://www.cloudflare.com/products/registrar/

3. **Google Domains**
   - 简单易用的界面
   - 与 Google 服务集成
   - 可靠的 DNS 服务
   - 网址: https://domains.google.com

#### 国内注册商
1. **阿里云**
   - 支持中文客服
   - 国内访问速度快
   - 网址: https://wanwang.aliyun.com

2. **腾讯云**
   - 价格竞争力强
   - 完善的云服务生态
   - 网址: https://dnspod.cloud.tencent.com

### 域名选择建议

#### 域名后缀推荐
- `.com` - 最通用，用户信任度高
- `.ai` - 适合 AI 相关项目
- `.tools` - 适合工具类网站
- `.app` - 适合应用类项目

#### 域名命名建议
- 简短易记（建议 15 个字符以内）
- 避免使用连字符和数字
- 与项目主题相关
- 易于拼写和发音

#### 示例域名
```
ai-tools-hub.com
toolsnavigator.ai
myaitools.app
aitoolbox.tools
```

### 购买流程

#### 1. 域名搜索和选择
```bash
# 检查域名可用性的工具
# 可以使用 whois 命令检查域名状态
whois example.com
```

#### 2. 注册信息准备
- 个人/公司名称
- 联系邮箱
- 联系电话
- 地址信息

#### 3. 购买注意事项
- 选择合适的注册年限（建议 1-2 年）
- 启用 WHOIS 隐私保护
- 考虑购买相关域名变体（.com, .net 等）
- 设置自动续费避免过期

### 域名管理权限获取

#### DNS 管理权限
确保获得以下管理权限：
- DNS 记录管理（A, CNAME, MX, TXT 记录）
- 域名服务器设置
- 域名转移权限
- WHOIS 信息修改权限

#### 安全设置
- 启用域名锁定（Domain Lock）
- 设置强密码和双因素认证
- 定期检查域名状态
- 备份重要的 DNS 配置

### 成本预算

#### 年度费用估算
```
域名注册费用: $10-50/年
WHOIS 隐私保护: $0-10/年 (部分注册商免费)
DNS 服务: $0-20/年 (基础服务通常免费)
SSL 证书: $0/年 (Let's Encrypt 免费，Vercel 自动提供)
```

### 验证清单

完成域名购买后，请确认：
- [ ] 域名注册成功
- [ ] 收到注册确认邮件
- [ ] 可以登录域名管理面板
- [ ] DNS 管理权限正常
- [ ] WHOIS 隐私保护已启用
- [ ] 域名锁定已启用
- [ ] 联系信息准确无误
- [ ] 自动续费已设置（可选）

### 下一步
域名购买完成后，继续进行 DNS 配置步骤。
## 17.2 
配置 DNS (DNS Configuration)

### 在 Vercel 添加自定义域名

#### 1. 登录 Vercel 控制台
1. 访问 https://vercel.com
2. 登录您的 Vercel 账号
3. 选择您的项目

#### 2. 添加域名
1. 进入项目设置页面
2. 点击 "Domains" 选项卡
3. 点击 "Add" 按钮
4. 输入您购买的域名（例如：example.com）
5. 点击 "Add" 确认

#### 3. 获取 DNS 配置信息
Vercel 会提供以下 DNS 记录配置：

```dns
# 主域名配置
Type: A
Name: @
Value: 76.76.19.61

# www 子域名配置
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# 或者使用 Vercel 的 CNAME 配置
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### DNS 记录配置步骤

#### 方法一：使用 A 记录（推荐用于根域名）
```dns
# 在域名注册商的 DNS 管理面板添加：
Type: A
Name: @ (或留空，表示根域名)
Value: 76.76.19.61
TTL: 3600 (1小时)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### 方法二：使用 CNAME 记录
```dns
# 如果注册商支持根域名 CNAME：
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 不同注册商的 DNS 配置

#### Namecheap 配置步骤
1. 登录 Namecheap 账号
2. 进入 "Domain List"
3. 点击域名旁的 "Manage" 按钮
4. 选择 "Advanced DNS" 选项卡
5. 添加以下记录：
```dns
Type: A Record
Host: @
Value: 76.76.19.61
TTL: Automatic

Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

#### Cloudflare 配置步骤
1. 登录 Cloudflare 控制台
2. 选择您的域名
3. 进入 "DNS" 选项卡
4. 添加记录：
```dns
Type: A
Name: @
IPv4 address: 76.76.19.61
Proxy status: Proxied (橙色云朵)

Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied
```

#### 阿里云 DNS 配置
1. 登录阿里云控制台
2. 进入 "域名与网站" > "云解析 DNS"
3. 点击域名进入解析设置
4. 添加解析记录：
```dns
记录类型: A
主机记录: @
解析线路: 默认
记录值: 76.76.19.61
TTL: 600

记录类型: CNAME
主机记录: www
解析线路: 默认
记录值: cname.vercel-dns.com
TTL: 600
```

### DNS 生效验证

#### 1. 使用命令行工具检查
```bash
# 检查 A 记录
dig example.com A

# 检查 CNAME 记录
dig www.example.com CNAME

# 使用 nslookup
nslookup example.com
nslookup www.example.com
```

#### 2. 在线 DNS 检查工具
- https://www.whatsmydns.net/
- https://dnschecker.org/
- https://www.nslookup.io/

#### 3. 预期结果
```bash
# 正确的 A 记录查询结果
$ dig example.com A
example.com.    300    IN    A    76.76.19.61

# 正确的 CNAME 记录查询结果
$ dig www.example.com CNAME
www.example.com.    300    IN    CNAME    cname.vercel-dns.com.
```

### DNS 生效时间

#### 典型生效时间
- **本地 DNS 缓存**: 立即 - 几分钟
- **ISP DNS 服务器**: 15分钟 - 2小时
- **全球 DNS 传播**: 2-48小时（通常 24小时内）

#### 加速 DNS 生效的方法
1. 设置较短的 TTL 值（300-3600秒）
2. 清除本地 DNS 缓存：
```bash
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache

# Linux
sudo systemctl restart systemd-resolved
```

### 常见问题排查

#### DNS 记录不生效
1. 检查记录类型和值是否正确
2. 确认 TTL 设置合理
3. 等待足够的传播时间
4. 清除本地 DNS 缓存

#### 部分地区无法访问
1. 使用多个 DNS 检查工具验证
2. 检查是否有地理位置限制
3. 确认所有必要的记录都已添加

#### Vercel 显示域名未验证
1. 确认 DNS 记录配置正确
2. 等待 DNS 传播完成
3. 在 Vercel 控制台点击 "Refresh" 按钮
4. 检查域名拼写是否正确

### 验证清单

DNS 配置完成后，请确认：
- [ ] 在域名注册商添加了正确的 DNS 记录
- [ ] A 记录指向 Vercel 的 IP 地址
- [ ] CNAME 记录配置正确
- [ ] DNS 检查工具显示记录生效
- [ ] Vercel 控制台显示域名验证成功
- [ ] 可以通过域名访问网站（可能需要等待）
- [ ] www 和非 www 版本都能正常访问## 17.3 配置
 SSL 证书 (SSL Certificate Configuration)

### Vercel 自动 SSL 证书

Vercel 为所有自定义域名自动提供免费的 SSL 证书，使用 Let's Encrypt 服务。

#### 自动证书生成过程
1. **域名验证**: DNS 记录生效后，Vercel 自动检测
2. **证书申请**: 向 Let's Encrypt 申请 SSL 证书
3. **证书安装**: 自动安装并配置证书
4. **自动续期**: 证书到期前自动续期

### SSL 证书验证步骤

#### 1. 检查 Vercel 控制台
1. 登录 Vercel 控制台
2. 进入项目的 "Domains" 页面
3. 查看域名状态：
   - ✅ **Valid**: 域名和 SSL 都配置成功
   - ⏳ **Pending**: 正在配置中
   - ❌ **Invalid**: 配置失败，需要检查

#### 2. 浏览器验证
```bash
# 访问您的域名，检查以下内容：
https://yourdomain.com

# 检查项目：
- 地址栏显示锁图标 🔒
- 证书信息显示 "Let's Encrypt"
- 没有安全警告
- 页面正常加载
```

#### 3. 命令行验证
```bash
# 使用 curl 检查 SSL 证书
curl -I https://yourdomain.com

# 使用 openssl 检查证书详情
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# 检查证书到期时间
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates
```

#### 4. 在线 SSL 检查工具
- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **SSL Checker**: https://www.sslchecker.com/
- **DigiCert SSL Installation Checker**: https://www.digicert.com/help/

### HTTPS 强制重定向配置

#### Vercel 自动重定向
Vercel 默认启用 HTTPS 重定向，无需额外配置。所有 HTTP 请求会自动重定向到 HTTPS。

#### 验证重定向功能
```bash
# 测试 HTTP 到 HTTPS 重定向
curl -I http://yourdomain.com

# 预期响应：
HTTP/1.1 308 Permanent Redirect
Location: https://yourdomain.com/
```

#### 自定义重定向配置（可选）
如果需要自定义重定向行为，可以创建 `vercel.json` 配置文件：

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "x-forwarded-proto",
          "value": "http"
        }
      ],
      "destination": "https://yourdomain.com/$1",
      "permanent": true
    }
  ]
}
```

### 安全头配置

为了增强安全性，建议配置安全响应头：

#### 创建 vercel.json 安全配置
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://*.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; font-src 'self';"
        }
      ]
    }
  ]
}
```

### SSL 证书监控

#### 证书到期监控
虽然 Vercel 自动续期证书，但建议设置监控：

1. **SSL 监控服务**:
   - UptimeRobot (免费)
   - Pingdom
   - StatusCake

2. **自定义监控脚本**:
```bash
#!/bin/bash
# ssl-check.sh - 检查 SSL 证书到期时间

DOMAIN="yourdomain.com"
DAYS_WARNING=30

# 获取证书到期时间
EXPIRY_DATE=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)

# 转换为时间戳
EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)

# 计算剩余天数
DAYS_LEFT=$(( ($EXPIRY_TIMESTAMP - $CURRENT_TIMESTAMP) / 86400 ))

echo "SSL certificate for $DOMAIN expires in $DAYS_LEFT days"

if [ $DAYS_LEFT -lt $DAYS_WARNING ]; then
    echo "WARNING: Certificate expires soon!"
    # 发送警告邮件或通知
fi
```

### 常见问题排查

#### SSL 证书未生效
1. **检查 DNS 配置**: 确保域名正确解析到 Vercel
2. **等待时间**: SSL 证书生成可能需要几分钟到几小时
3. **重新验证**: 在 Vercel 控制台点击 "Refresh" 按钮
4. **检查域名状态**: 确保域名在 Vercel 中显示为 "Valid"

#### 混合内容警告
如果页面包含 HTTP 资源，浏览器会显示警告：
1. 检查所有外部资源使用 HTTPS
2. 更新 Supabase 配置使用 HTTPS
3. 确保所有 API 调用使用 HTTPS

#### 证书链问题
如果遇到证书链问题：
1. 使用 SSL Labs 测试检查证书链
2. 确保中间证书正确安装（Vercel 自动处理）
3. 检查浏览器兼容性

### 性能优化

#### HTTP/2 支持
Vercel 自动启用 HTTP/2，提供更好的性能：
- 多路复用连接
- 服务器推送
- 头部压缩

#### 证书缓存
浏览器会缓存 SSL 证书信息，提高后续访问速度。

### 验证清单

SSL 配置完成后，请确认：
- [ ] Vercel 控制台显示域名状态为 "Valid"
- [ ] 浏览器地址栏显示锁图标
- [ ] 证书信息显示 "Let's Encrypt"
- [ ] HTTP 请求自动重定向到 HTTPS
- [ ] SSL Labs 测试评级为 A 或 A+
- [ ] 没有混合内容警告
- [ ] 所有页面和资源都通过 HTTPS 加载
- [ ] 移动设备上 SSL 证书正常工作
- [ ] 证书自动续期功能正常

### 完成域名配置

恭喜！您已经完成了完整的域名配置流程：

1. ✅ **域名购买**: 选择并购买了合适的域名
2. ✅ **DNS 配置**: 正确配置了 DNS 记录指向 Vercel
3. ✅ **SSL 证书**: 启用了 HTTPS 和自动 SSL 证书

您的 AI 工具导航网站现在可以通过自定义域名安全访问了！

### 下一步建议

1. **监控设置**: 配置网站监控和 SSL 证书监控
2. **性能优化**: 使用 CDN 和缓存策略优化加载速度
3. **SEO 优化**: 提交网站地图到搜索引擎
4. **备份策略**: 定期备份网站数据和配置
5. **安全审计**: 定期进行安全检查和更新