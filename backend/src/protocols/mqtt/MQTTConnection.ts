import { Connection } from '../Connection';
import { MqttConnectConfig } from '../../types/devices';
import mqtt, { MqttClient } from 'mqtt';
import { Logger } from '@/utils/logger';

interface MessageHandler {
    id: string;
    topic: string;
    callback: (id: string, data: Buffer) => void;
    timeout: NodeJS.Timeout | null;
    timeoutDuration: number;
}

// 定义消息队列项接口
interface MessageQueueItem {
    topic: string;
    message: Buffer;
    timestamp: number;
}

export class MQTTConnection implements Connection {
    private config: MqttConnectConfig;
    private client: MqttClient | null = null;
    private messageHandlers: Map<string, MessageHandler> = new Map();
    private messageQueue: MessageQueueItem[] = [];
    private readonly MAX_QUEUE_SIZE = 1000; // 最大队列大小
    private readonly MAX_MESSAGE_AGE = 60000; // 消息最大存活时间(ms)
    private queueCleanupInterval: ReturnType<typeof setInterval> | null = null;

    constructor(config: MqttConnectConfig) {
        this.config = config;
    }

    async connect(): Promise<boolean> {
        if (this.queueCleanupInterval) {
            clearInterval(this.queueCleanupInterval);
        }

        // 启动消息队列清理定时器
        this.queueCleanupInterval = setInterval(() => {
            const now = Date.now();
            this.messageQueue = this.messageQueue.filter(item => 
                now - item.timestamp < this.MAX_MESSAGE_AGE
            );
        }, 10000); // 每10秒清理一次

        return new Promise((resolve, reject) => {
            const { ip, port, username, password, clientid } = this.config;
            const url = `mqtt://${ip}:${port}`;
            
            this.client = mqtt.connect(url, {
                clientId: clientid,
                username,
                password,
                reconnectPeriod: 5000, // 重连间隔
                keepalive: 60,
            });

            this.client.on('connect', () => {
                // 重连后重新订阅所有主题
                console.log('MQTT connected');
                this.resubscribeAll();
                console.log('MQTT subscribe all');
                resolve(true);
            });

            this.client.on('message', (topic, message) => {
                this.handleIncomingMessage(topic, message);
            });

            this.client.on('error', (err) => {
                console.error('MQTT connection error:', err);
                reject(err);
            });

            this.client.on('close', () => {
                console.log('MQTT connection closed');
            });

            this.client.on('reconnect', () => {
                console.log('MQTT reconnecting...');
            });
        });
    }

    private handleIncomingMessage(topic: string, message: Buffer) {
        // 将新消息添加到队列
        this.messageQueue.push({
            topic,
            message,
            timestamp: Date.now()
        });

        // 如果队列超出大小限制，移除最旧的消息
        if (this.messageQueue.length > this.MAX_QUEUE_SIZE) {
            this.messageQueue.shift();
        }

        // 处理所有匹配的处理器
        for (const handler of this.messageHandlers.values()) {
            if (handler.topic === topic) {
                try {
                    const messageStr = message.toString();
                    const messageJson = JSON.parse(messageStr);
                    const formattedMessage = {
                        topic: topic,
                        payload: messageJson,
                    };
                    handler.callback(handler.id, Buffer.from(JSON.stringify(formattedMessage)));
                } catch (error) {
                    console.error(`Error processing message for handler ${handler.id}:`, error);
                }
            }
        }
    }


    async disconnect(): Promise<void> {
        if (this.queueCleanupInterval) {
            clearInterval(this.queueCleanupInterval);
            this.queueCleanupInterval = null;
        }
        
        // 清理所有处理器
        for (const handler of this.messageHandlers.values()) {
            if (handler.timeout) {
                clearTimeout(handler.timeout);
            }
        }
        this.messageHandlers.clear();
        this.messageQueue = [];

        return new Promise((resolve, reject) => {
            if (this.client) {
                this.client.end(false, {}, (err) => {
                    if (err) {
                        console.error('MQTT disconnection error:', err);
                        reject(err);
                    } else {
                        console.log('MQTT disconnected');
                        resolve();
                    }
                });
                this.client = null;
            } else {
                resolve();
            }
        });
    }

    async send(data: Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client) {
                this.client.publish(this.config.topic, data, { qos: this.config.qos }, (err) => {
                    if (err) {
                        console.error('MQTT send error:', err);
                        reject(err);
                    } else {
                        console.log('MQTT message sent');
                        resolve();
                    }
                });
            } else {
                reject(new Error('MQTT client not connected'));
            }
        });
    }

    async receive(): Promise<Buffer> {
        // This method can be used to handle specific logic if needed
        return Buffer.from([]);
    }

    async subscribe(topic: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client?.subscribe(topic, { qos: this.config.qos }, (err) => {
                if (err) {
                    console.error('MQTT subscribe error:', err);
                    reject(err);
                }
                resolve();
            });
        });
    }

    private cleanAndStandardizeJson(str: string): string {
        // 1. 移除所有换行符和制表符
        let cleanStr = str.replace(/[\n\t]/g, '');
        
        // 2. 处理多余的空格
        cleanStr = cleanStr.replace(/\s+/g, ' ').trim();
        
        // 3. 给没有引号的属性名添加双引号
        cleanStr = cleanStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
        
        return cleanStr;
    }

    async sendAndReceive(data: string, timeout: number): Promise<Buffer> {
        try {    
            if(!data){
                throw new Error('Invalid data input' + data);
            }
            // Clean up the input data by removing all whitespace characters
            const cleanedData = this.cleanAndStandardizeJson(data); // Remove all types of whitespace
    
            // Ensure data is a non-empty string
            if (!cleanedData || typeof cleanedData !== 'string') {
                throw new Error('Invalid data input');
            }
    
            // Parse the JSON data safely
            console.log("cleanedData", cleanedData);
            let jsonData;
            try {
                jsonData = JSON.parse(cleanedData);
            } catch (parseError) {
                console.error("Failed to parse JSON:", parseError);
                throw new Error('Failed to parse JSON data');
            }
    
            const topic = jsonData.topic;
            const message = jsonData.payload;
    
            // Check if topic and message are defined
            if (!topic || !message) {
                throw new Error('Topic or payload not found in the data');
            }
    
            const token = message.token;
            if (typeof token === 'undefined') {
                throw new Error('Token not found in the message payload');
            }
    
            console.log("Parsed JSON Data:", jsonData);
            console.log("Topic:", topic);
            console.log("Message:", message);
    
            // Split the topic into segments
            const segments = topic.split('/');
            
            // Swap the first two segments
            if (segments.length > 2) {
                [segments[1], segments[2]] = [segments[2], segments[1]];
            }
    
            // Join the segments back into a new topic
            const newTopic = segments.join('/');
    
            // Subscribe to the new topic
            await this.subscribe(newTopic);
            console.log("Subscribed to new topic:", newTopic);
    
            // Publish the message to the original topic
            this.client?.publish(topic, JSON.stringify(message));
            console.log("Published message to topic:", topic);
    
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    this.client?.unsubscribe(newTopic);
                    reject(new Error('Timeout waiting for response'));
                }, timeout);
    
                const messageHandler = (receivedTopic: string, receivedMessage: Buffer) => {
                    console.log("Received message on topic:", receivedTopic);
                    if (receivedTopic === newTopic) {
                        try {
                            const receivedMessageJson = JSON.parse(receivedMessage.toString());
                            if (receivedMessageJson.token === token) {
                                clearTimeout(timeoutId);
                                this.client?.unsubscribe(newTopic);
                                this.client?.off('message', messageHandler); // Remove event listener
                                const message = {
                                    topic: receivedTopic,
                                    payload: receivedMessageJson,
                                }
                                resolve(Buffer.from(JSON.stringify(message)));
                            }
                        } catch (parseError) {
                            console.error("Failed to parse received message:", parseError);
                            this.client?.off('message', messageHandler); // Remove event listener
                            reject(parseError);
                        }
                    }
                };
    
                this.client?.on('message', messageHandler);
            });
        } catch (error) {
            console.error("Error in sendAndReceive:", error);
            throw error;
        }
    }

    private async resubscribeAll() {
        const topics = new Set<string>();
        this.messageHandlers.forEach(handler => {
            topics.add(handler.topic);
        });

        for (const topic of topics) {
            await this.subscribe(topic);
        }
    }

    async listen(id: string, expectedResult: string, timeout: number, callback: (id: string, data: Buffer) => void): Promise<Buffer> {
        try {
            const cleanedData = this.cleanAndStandardizeJson(expectedResult);
            const message = JSON.parse(cleanedData);
            const topic = message.topic;
    
            // 检查是否已存在相同ID的处理器
            if (this.messageHandlers.has(id)) {
                await this.unlisten(id);
            }
    
            return new Promise((resolve, reject) => {
                // 设置超时处理
                const timeoutId = setTimeout(() => {
                    this.unlisten(id);
                    // 不直接抛出异常，而是通过 reject 处理超时
                    reject(new Error(`Listen timeout for id: ${id}`));
                }, timeout);
    
                // 创建新的处理器
                const handler: MessageHandler = {
                    id,
                    topic,
                    callback,
                    timeout: timeoutId,
                    timeoutDuration: timeout
                };
    
                this.messageHandlers.set(id, handler);
    
                // 订阅主题并返回状态
                this.subscribe(topic)
                    .then(() => {
                        resolve(Buffer.from(JSON.stringify({ status: 'listening', id, topic })));
                    })
                    .catch((error) => {
                        // 清理超时定时器和处理器
                        clearTimeout(timeoutId);
                        this.messageHandlers.delete(id);
                        reject(error);
                    });
            });
        } catch (error) {
            console.error(`Error in listen for id ${id}:`, error);
            // 确保错误被正确地传播，而不是直接抛出
            throw new Error(`Failed to set up listener for id ${id}`);
        }
    }

    async unlisten(id: string) {
        const handler = this.messageHandlers.get(id);
        if (handler) {
            if (handler.timeout) {
                clearTimeout(handler.timeout);
            }
            
            // 检查是否还有其他处理器在监听相同的主题
            let hasOtherHandlers = false;
            for (const [otherId, otherHandler] of this.messageHandlers.entries()) {
                if (otherId !== id && otherHandler.topic === handler.topic) {
                    hasOtherHandlers = true;
                    break;
                }
            }

            // 如果没有其他处理器监听此主题，则取消订阅
            if (!hasOtherHandlers && this.client) {
                this.client.unsubscribe(handler.topic);
            }
            this.messageHandlers.delete(id);
        }
    }
} 
