#!/usr/bin/env node

/**
 * SSL 和域名配置测试脚本
 * 测试域名解析、SSL 证书和 HTTPS 重定向
 */

const https = require('https');
const http = require('http');
const dns = require('dns').promises;
const { URL } = require('url');

class DomainSSLTester {
    constructor(domain) {
        this.domain = domain;
        this.results = {
            dnsResolution: null,
            httpRedirect: null,
            httpsAccess: null,
            sslCertificate: null,
            securityHeaders: null
        };
    }

    /**
     * 测试 DNS 解析
     */
    async testDNSResolution() {
        console.log('🔍 测试 DNS 解析...');
        
        try {
            const addresses = await dns.resolve4(this.domain);
            const wwwAddresses = await dns.resolve4(`www.${this.domain}`).catch(() => []);
            
            this.results.dnsResolution = {
                success: true,
                rootDomain: addresses,
                wwwDomain: wwwAddresses,
                message: `DNS 解析成功 - ${this.domain}: ${addresses.join(', ')}`
            };
            
            console.log('✅ DNS 解析正常');
            console.log(`   根域名: ${addresses.join(', ')}`);
            if (wwwAddresses.length > 0) {
                console.log(`   www 子域名: ${wwwAddresses.join(', ')}`);
            }
            
        } catch (error) {
            this.results.dnsResolution = {
                success: false,
                error: error.message,
                message: `DNS 解析失败: ${error.message}`
            };
            console.log('❌ DNS 解析失败:', error.message);
        }
    }

    /**
     * 测试 HTTP 到 HTTPS 重定向
     */
    async testHTTPRedirect() {
        console.log('🔄 测试 HTTP 重定向...');
        
        return new Promise((resolve) => {
            const req = http.request({
                hostname: this.domain,
                port: 80,
                path: '/',
                method: 'GET'
            }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400) {
                    const location = res.headers.location;
                    const isHTTPS = location && location.startsWith('https://');
                    
                    this.results.httpRedirect = {
                        success: isHTTPS,
                        statusCode: res.statusCode,
                        location: location,
                        message: isHTTPS ? 
                            `HTTP 重定向正常 (${res.statusCode} -> ${location})` :
                            `HTTP 重定向异常 (${res.statusCode} -> ${location})`
                    };
                    
                    if (isHTTPS) {
                        console.log('✅ HTTP 重定向到 HTTPS 正常');
                    } else {
                        console.log('❌ HTTP 重定向异常');
                    }
                } else {
                    this.results.httpRedirect = {
                        success: false,
                        statusCode: res.statusCode,
                        message: `HTTP 请求未重定向 (状态码: ${res.statusCode})`
                    };
                    console.log('❌ HTTP 请求未重定向');
                }
                resolve();
            });

            req.on('error', (error) => {
                this.results.httpRedirect = {
                    success: false,
                    error: error.message,
                    message: `HTTP 请求失败: ${error.message}`
                };
                console.log('❌ HTTP 请求失败:', error.message);
                resolve();
            });

            req.setTimeout(10000, () => {
                req.destroy();
                this.results.httpRedirect = {
                    success: false,
                    error: 'timeout',
                    message: 'HTTP 请求超时'
                };
                console.log('❌ HTTP 请求超时');
                resolve();
            });

            req.end();
        });
    }

    /**
     * 测试 HTTPS 访问
     */
    async testHTTPSAccess() {
        console.log('🔒 测试 HTTPS 访问...');
        
        return new Promise((resolve) => {
            const req = https.request({
                hostname: this.domain,
                port: 443,
                path: '/',
                method: 'GET'
            }, (res) => {
                this.results.httpsAccess = {
                    success: res.statusCode >= 200 && res.statusCode < 400,
                    statusCode: res.statusCode,
                    headers: res.headers,
                    message: `HTTPS 访问${res.statusCode >= 200 && res.statusCode < 400 ? '正常' : '异常'} (状态码: ${res.statusCode})`
                };
                
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    console.log('✅ HTTPS 访问正常');
                } else {
                    console.log('❌ HTTPS 访问异常, 状态码:', res.statusCode);
                }
                resolve();
            });

            req.on('error', (error) => {
                this.results.httpsAccess = {
                    success: false,
                    error: error.message,
                    message: `HTTPS 访问失败: ${error.message}`
                };
                console.log('❌ HTTPS 访问失败:', error.message);
                resolve();
            });

            req.setTimeout(10000, () => {
                req.destroy();
                this.results.httpsAccess = {
                    success: false,
                    error: 'timeout',
                    message: 'HTTPS 请求超时'
                };
                console.log('❌ HTTPS 请求超时');
                resolve();
            });

            req.end();
        });
    }

    /**
     * 测试 SSL 证书
     */
    async testSSLCertificate() {
        console.log('📜 测试 SSL 证书...');
        
        return new Promise((resolve) => {
            const req = https.request({
                hostname: this.domain,
                port: 443,
                path: '/',
                method: 'GET'
            }, (res) => {
                const cert = res.socket.getPeerCertificate();
                
                if (cert && cert.valid_to) {
                    const expiryDate = new Date(cert.valid_to);
                    const currentDate = new Date();
                    const daysLeft = Math.floor((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
                    
                    this.results.sslCertificate = {
                        success: daysLeft > 0,
                        issuer: cert.issuer.CN || cert.issuer.O || 'Unknown',
                        subject: cert.subject.CN || this.domain,
                        validFrom: cert.valid_from,
                        validTo: cert.valid_to,
                        daysLeft: daysLeft,
                        fingerprint: cert.fingerprint,
                        message: daysLeft > 0 ? 
                            `SSL 证书有效 (剩余 ${daysLeft} 天)` :
                            `SSL 证书已过期 (过期 ${Math.abs(daysLeft)} 天)`
                    };
                    
                    console.log('✅ SSL 证书信息:');
                    console.log(`   颁发者: ${cert.issuer.CN || cert.issuer.O}`);
                    console.log(`   有效期: ${cert.valid_from} - ${cert.valid_to}`);
                    console.log(`   剩余天数: ${daysLeft} 天`);
                    
                } else {
                    this.results.sslCertificate = {
                        success: false,
                        error: 'no certificate',
                        message: '无法获取 SSL 证书信息'
                    };
                    console.log('❌ 无法获取 SSL 证书信息');
                }
                resolve();
            });

            req.on('error', (error) => {
                this.results.sslCertificate = {
                    success: false,
                    error: error.message,
                    message: `SSL 证书检查失败: ${error.message}`
                };
                console.log('❌ SSL 证书检查失败:', error.message);
                resolve();
            });

            req.setTimeout(10000, () => {
                req.destroy();
                this.results.sslCertificate = {
                    success: false,
                    error: 'timeout',
                    message: 'SSL 证书检查超时'
                };
                console.log('❌ SSL 证书检查超时');
                resolve();
            });

            req.end();
        });
    }

    /**
     * 测试安全头
     */
    async testSecurityHeaders() {
        console.log('🛡️  测试安全头...');
        
        return new Promise((resolve) => {
            const req = https.request({
                hostname: this.domain,
                port: 443,
                path: '/',
                method: 'GET'
            }, (res) => {
                const headers = res.headers;
                const securityHeaders = {
                    'strict-transport-security': headers['strict-transport-security'],
                    'x-content-type-options': headers['x-content-type-options'],
                    'x-frame-options': headers['x-frame-options'],
                    'x-xss-protection': headers['x-xss-protection'],
                    'referrer-policy': headers['referrer-policy'],
                    'content-security-policy': headers['content-security-policy']
                };

                const missingHeaders = [];
                const presentHeaders = [];

                Object.entries(securityHeaders).forEach(([header, value]) => {
                    if (value) {
                        presentHeaders.push(header);
                    } else {
                        missingHeaders.push(header);
                    }
                });

                this.results.securityHeaders = {
                    success: missingHeaders.length === 0,
                    presentHeaders: presentHeaders,
                    missingHeaders: missingHeaders,
                    headers: securityHeaders,
                    message: missingHeaders.length === 0 ?
                        '所有安全头都已配置' :
                        `缺少安全头: ${missingHeaders.join(', ')}`
                };

                console.log('🛡️  安全头检查结果:');
                presentHeaders.forEach(header => {
                    console.log(`   ✅ ${header}: ${securityHeaders[header]}`);
                });
                missingHeaders.forEach(header => {
                    console.log(`   ❌ ${header}: 未配置`);
                });

                resolve();
            });

            req.on('error', (error) => {
                this.results.securityHeaders = {
                    success: false,
                    error: error.message,
                    message: `安全头检查失败: ${error.message}`
                };
                console.log('❌ 安全头检查失败:', error.message);
                resolve();
            });

            req.setTimeout(10000, () => {
                req.destroy();
                this.results.securityHeaders = {
                    success: false,
                    error: 'timeout',
                    message: '安全头检查超时'
                };
                console.log('❌ 安全头检查超时');
                resolve();
            });

            req.end();
        });
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log(`\n🚀 开始测试域名: ${this.domain}`);
        console.log('='.repeat(50));

        await this.testDNSResolution();
        await this.testHTTPRedirect();
        await this.testHTTPSAccess();
        await this.testSSLCertificate();
        await this.testSecurityHeaders();

        this.generateReport();
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        console.log('\n📊 测试报告');
        console.log('='.repeat(50));

        const tests = [
            { name: 'DNS 解析', result: this.results.dnsResolution },
            { name: 'HTTP 重定向', result: this.results.httpRedirect },
            { name: 'HTTPS 访问', result: this.results.httpsAccess },
            { name: 'SSL 证书', result: this.results.sslCertificate },
            { name: '安全头', result: this.results.securityHeaders }
        ];

        let passedTests = 0;
        let totalTests = tests.length;

        tests.forEach(test => {
            const status = test.result?.success ? '✅ 通过' : '❌ 失败';
            const message = test.result?.message || '未测试';
            
            console.log(`${test.name}: ${status}`);
            console.log(`   ${message}`);
            
            if (test.result?.success) {
                passedTests++;
            }
        });

        console.log('\n' + '='.repeat(50));
        console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
        
        if (passedTests === totalTests) {
            console.log('🎉 所有测试通过！域名和 SSL 配置正常。');
            process.exit(0);
        } else {
            console.log('⚠️  部分测试失败，请检查配置。');
            process.exit(1);
        }
    }
}

// 命令行使用
if (require.main === module) {
    const domain = process.argv[2];
    
    if (!domain) {
        console.log('用法: node test-ssl-domain.js <domain>');
        console.log('示例: node test-ssl-domain.js example.com');
        process.exit(1);
    }

    const tester = new DomainSSLTester(domain);
    tester.runAllTests().catch(error => {
        console.error('测试过程中发生错误:', error);
        process.exit(1);
    });
}

module.exports = DomainSSLTester;