#!/usr/bin/env node

/**
 * SSL Certificate Monitor
 * 监控 SSL 证书到期时间并发送警告
 */

const https = require('https');
const tls = require('tls');

class SSLMonitor {
    constructor(domain, warningDays = 30) {
        this.domain = domain;
        this.warningDays = warningDays;
    }

    /**
     * 检查 SSL 证书
     */
    async checkSSLCertificate() {
        return new Promise((resolve, reject) => {
            const options = {
                host: this.domain,
                port: 443,
                method: 'GET',
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                const cert = res.socket.getPeerCertificate();
                
                if (!cert || !cert.valid_to) {
                    reject(new Error('无法获取证书信息'));
                    return;
                }

                const expiryDate = new Date(cert.valid_to);
                const currentDate = new Date();
                const daysLeft = Math.floor((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

                const result = {
                    domain: this.domain,
                    issuer: cert.issuer.CN || cert.issuer.O || 'Unknown',
                    subject: cert.subject.CN || this.domain,
                    validFrom: new Date(cert.valid_from),
                    validTo: expiryDate,
                    daysLeft: daysLeft,
                    isExpired: daysLeft < 0,
                    needsWarning: daysLeft < this.warningDays,
                    fingerprint: cert.fingerprint
                };

                resolve(result);
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('连接超时'));
            });

            req.end();
        });
    }

    /**
     * 格式化输出结果
     */
    formatResult(result) {
        const status = result.isExpired ? '❌ 已过期' : 
                     result.needsWarning ? '⚠️  即将过期' : '✅ 正常';

        return `
SSL 证书检查结果 - ${result.domain}
========================================
状态: ${status}
颁发者: ${result.issuer}
主题: ${result.subject}
有效期: ${result.validFrom.toLocaleDateString()} - ${result.validTo.toLocaleDateString()}
剩余天数: ${result.daysLeft} 天
指纹: ${result.fingerprint}
========================================
        `.trim();
    }

    /**
     * 运行监控检查
     */
    async monitor() {
        try {
            console.log(`正在检查 ${this.domain} 的 SSL 证书...`);
            const result = await this.checkSSLCertificate();
            
            console.log(this.formatResult(result));

            if (result.isExpired) {
                console.error(`🚨 警告: ${this.domain} 的 SSL 证书已过期！`);
                process.exit(1);
            } else if (result.needsWarning) {
                console.warn(`⚠️  警告: ${this.domain} 的 SSL 证书将在 ${result.daysLeft} 天后过期！`);
                process.exit(1);
            } else {
                console.log(`✅ ${this.domain} 的 SSL 证书状态正常`);
                process.exit(0);
            }

        } catch (error) {
            console.error(`❌ 检查 ${this.domain} 的 SSL 证书时出错:`, error.message);
            process.exit(1);
        }
    }
}

/**
 * 批量检查多个域名
 */
async function checkMultipleDomains(domains, warningDays = 30) {
    const results = [];
    
    for (const domain of domains) {
        try {
            const monitor = new SSLMonitor(domain, warningDays);
            const result = await monitor.checkSSLCertificate();
            results.push(result);
            console.log(monitor.formatResult(result));
        } catch (error) {
            console.error(`检查 ${domain} 失败:`, error.message);
            results.push({
                domain: domain,
                error: error.message,
                isError: true
            });
        }
    }

    // 汇总报告
    const expired = results.filter(r => !r.isError && r.isExpired);
    const warning = results.filter(r => !r.isError && r.needsWarning);
    const errors = results.filter(r => r.isError);

    console.log('\n========================================');
    console.log('SSL 证书监控汇总报告');
    console.log('========================================');
    console.log(`总计检查: ${domains.length} 个域名`);
    console.log(`正常: ${results.length - expired.length - warning.length - errors.length} 个`);
    console.log(`警告: ${warning.length} 个`);
    console.log(`过期: ${expired.length} 个`);
    console.log(`错误: ${errors.length} 个`);

    if (expired.length > 0 || warning.length > 0 || errors.length > 0) {
        process.exit(1);
    }
}

// 命令行使用
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
用法: node ssl-monitor.js <domain> [warning-days]
或者: node ssl-monitor.js --batch domain1,domain2,domain3 [warning-days]

示例:
  node ssl-monitor.js example.com
  node ssl-monitor.js example.com 7
  node ssl-monitor.js --batch example.com,api.example.com 30
        `);
        process.exit(1);
    }

    const warningDays = parseInt(args[args.length - 1]) || 30;

    if (args[0] === '--batch') {
        const domains = args[1].split(',').map(d => d.trim());
        checkMultipleDomains(domains, warningDays);
    } else {
        const domain = args[0];
        const monitor = new SSLMonitor(domain, warningDays);
        monitor.monitor();
    }
}

module.exports = SSLMonitor;