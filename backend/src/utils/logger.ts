// src/utils/logger.ts

export const Logger = {
    info: (msg: string) => console.log(msg),
    error: (msg: string, err?: Error) => {
        console.error(msg);
        if (err) {
            console.error(err.stack);
        }
    }
};