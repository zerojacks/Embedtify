// src/services/message-routing.service.ts
export class MessageRoutingService {
    private validators: IMessageValidator[] = [];
    private converters: ProtocolConverterInterface[] = [];
  
    preprocessMessage(message: Message): Message {
      // 消息验证
      this.validators.forEach(validator => {
        if (!validator.validate(message)) {
          throw new MessageValidationError();
        }
      });
  
      // 协议转换
      return this.converters.reduce(
        (msg, converter) => converter.convert(msg),
        message
      );
    }
  
    registerValidator(validator: IMessageValidator) {
      this.validators.push(validator);
    }
  
    registerConverter(converter: ProtocolConverterInterface) {
      this.converters.push(converter);
    }
  }