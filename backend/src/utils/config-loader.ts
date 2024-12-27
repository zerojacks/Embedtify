// src/utils/config-loader.ts
export class ConfigLoader {
    static loadProtocolConfig(): ProtocolConfig {
        // 从环境变量、配置文件加载协议配置
        return {
            protocols: {
                tcp: {
                    host: process.env.TCP_HOST,
                    port: parseInt(process.env.TCP_PORT || '8080')
                },
                serial: {
                    path: process.env.SERIAL_PATH,
                    baudRate: parseInt(process.env.SERIAL_BAUD || '9600')
                }
            }
        };
    }
}