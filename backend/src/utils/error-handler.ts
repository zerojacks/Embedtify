// src/utils/error-handler.ts
export class CommunicationErrorHandler {
    static handle(error: Error, retryOptions?: RetryOptions) {
        // 根据错误类型和重试配置处理
        if (error instanceof ConnectionError && retryOptions) {
            return this.handleConnectionError(error, retryOptions);
        }

        // 日志记录
        Logger.error(error);

        // 可能的错误上报机制
        ErrorReporter.report(error);
    }
}