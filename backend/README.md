backend/
│
├── src/
│   ├── core/                        # 核心功能模块
│   │   ├── interfaces/              # 接口定义
│   │   │   ├── protocol.interface.ts
│   │   │   ├── validator.interface.ts
│   │   │   └── message.interface.ts
│   │   │
│   │   └── abstracts/               # 抽象基类
│   │       ├── base-protocol.abstract.ts
│   │       └── base-validator.abstract.ts
│   │
│   ├── protocols/                   # 具体协议实现
│   │   ├── tcp/
│   │   │   ├── tcp-protocol.ts
│   │   │   └── tcp-validator.ts
│   │   │
│   │   ├── serial/
│   │   │   ├── serial-protocol.ts
│   │   │   └── serial-validator.ts
│   │   │
│   │   ├── mqtt/
│   │   │   ├── mqtt-protocol.ts
│   │   │   └── mqtt-validator.ts
│   │   │
│   │   └── bluetooth/
│   │       ├── bluetooth-protocol.ts
│   │       └── bluetooth-validator.ts
│   │
│   ├── managers/                    # 管理器
│   │   ├── communication-manager.ts
│   │   ├── protocol-manager.ts
│   │   └── connection-pool.ts
│   │
│   ├── validators/                  # 通用验证器
│   │   ├── crc-validator.ts
│   │   ├── length-validator.ts
│   │   └── message-validator.ts
│   │
│   ├── utils/                       # 工具类
│   │   ├── logger.ts
│   │   ├── error-handler.ts
│   │   └── config-loader.ts
│   │
│   ├── middlewares/                 # 中间件
│   │   ├── authentication.ts
│   │   ├── rate-limiter.ts
│   │   └── error-interceptor.ts
│   │
│   ├── models/                      # 数据模型
│   │   ├── device.model.ts
│   │   ├── message.model.ts
│   │   └── connection.model.ts
│   │
│   ├── services/                    # 业务服务
│   │   ├── device-discovery.service.ts
│   │   ├── message-routing.service.ts
│   │   └── protocol-conversion.service.ts
│   │
│   ├── config/                      # 配置文件
│   │   ├── default.config.ts
│   │   ├── protocol.config.ts
│   │   └── environment.config.ts
│   │
│   └── index.ts                     # 入口文件
│
├── tests/                           # 测试目录
│   ├── unit/
│   │   ├── protocols/
│   │   ├── validators/
│   │   └── managers/
│   │
│   └── integration/
│       ├── communication-flow.test.ts
│       └── protocol-integration.test.ts
│
├── docs/                            # 文档
│   ├── api-docs/
│   ├── protocol-specs/
│   └── architecture-diagram.md
│
├── logs/                            # 日志目录
│
├── scripts/                         # 构建和部署脚本
│   ├── build.sh
│   └── deploy.sh
│
├── package.json
├── tsconfig.json
├── .env
├── .gitignore
└── README.md