import { Injectable } from '@nestjs/common';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, TextRun } from 'docx';
import { TestReport, TestSchemeReport, TestStepReport, TestUseCaseReport } from '../types/testreport';

@Injectable()
export class DocxGenerator {
    constructor() {

    }
    
    private createBasicInfoTable(report: TestReport): Table {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('测试计划ID')] }),
                        new TableCell({ children: [new Paragraph(report.testPlanId)] }),
                        new TableCell({ children: [new Paragraph('执行日期')] }),
                        new TableCell({ children: [new Paragraph(report.executionDate)] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('执行环境')] }),
                        new TableCell({ children: [new Paragraph(report.environment)] }),
                        new TableCell({ children: [new Paragraph('执行人')] }),
                        new TableCell({ children: [new Paragraph(report.executor)] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('执行时长')] }),
                        new TableCell({ children: [new Paragraph(report.duration)] }),
                        new TableCell({ children: [new Paragraph('')] }),
                        new TableCell({ children: [new Paragraph('')] })
                    ]
                })
            ]
        });
    }

    private createSummaryTable(summary: TestReport['summary']): Table {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('总用例数')] }),
                        new TableCell({ children: [new Paragraph(summary.totalUseCases.toString())] }),
                        new TableCell({ children: [new Paragraph('总步骤数')] }),
                        new TableCell({ children: [new Paragraph(summary.totalSteps.toString())] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('通过步骤数')] }),
                        new TableCell({ children: [new Paragraph(summary.passedSteps.toString())] }),
                        new TableCell({ children: [new Paragraph('失败步骤数')] }),
                        new TableCell({ children: [new Paragraph(summary.failedSteps.toString())] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('成功率')] }),
                        new TableCell({ children: [new Paragraph(`${summary.successRate}%`)] }),
                        new TableCell({ children: [new Paragraph('')] }),
                        new TableCell({ children: [new Paragraph('')] })
                    ]
                })
            ]
        });
    }

    private createSchemeTable(scheme: TestSchemeReport): Table {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('通过数')] }),
                        new TableCell({ children: [new Paragraph(scheme.passCount.toString())] }),
                        new TableCell({ children: [new Paragraph('失败数')] }),
                        new TableCell({ children: [new Paragraph(scheme.failCount.toString())] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph('总数')] }),
                        new TableCell({ children: [new Paragraph(scheme.totalCount.toString())] }),
                        new TableCell({ children: [new Paragraph('成功率')] }),
                        new TableCell({ children: [new Paragraph(`${scheme.successRate}%`)] })
                    ]
                })
            ]
        });
    }

    private createTestStepTable(steps: TestStepReport[]): Table {
        const headerRow = new TableRow({
            children: [
                'Step ID', '步骤名称', '状态', '发送数据', '接收数据', '执行时间', '端口'
            ].map(header => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text: header, bold: true })]
                })]
            }))
        });

        const dataRows = steps.map(step => new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(step.stepId)] }),
                new TableCell({ children: [new Paragraph(step.name)] }),
                new TableCell({ children: [new Paragraph(step.status)] }),
                new TableCell({ children: [new Paragraph(step.sendData || '')] }),
                new TableCell({ children: [new Paragraph(step.receiveData || '')] }),
                new TableCell({ children: [new Paragraph(step.time || '')] }),
                new TableCell({ children: [new Paragraph(step.port || '')] })
            ]
        }));

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows]
        });
    }

    private formatJson(jsonString: string): string {
        try {
            // 处理可能的转义字符串
            let dataToFormat = jsonString;
            
            // 如果是字符串形式的JSON，需要先解析一次
            if (typeof jsonString === 'string' && jsonString.trim().startsWith('"')) {
                // 解析转义的JSON字符串
                dataToFormat = JSON.parse(jsonString);
            }
            
            // 再次解析并格式化
            const parsedData = JSON.parse(dataToFormat);
            return JSON.stringify(parsedData, null, 2);
        } catch (error) {
            console.error('JSON format error:', error);
            return jsonString; // 如果解析失败，返回原始字符串
        }
    }

    private createJsonParagraph(jsonText: string): Paragraph[] {
        if(!jsonText) {
            return [];
        }
        const formattedJson = this.formatJson(jsonText);
        // 按行分割格式化后的JSON
        const jsonLines = formattedJson.split('\n');
        
        // 为每行创建一个段落，保持缩进和格式
        return jsonLines.map(line => 
            new Paragraph({
                children: [
                    new TextRun({
                        text: line,
                        font: 'Consolas',
                        size: 20,
                    })
                ],
                spacing: {
                    before: 40,
                    after: 40
                },
                indent: {
                    left: 720  // 基础缩进
                }
            })
        );
    }

    private createTestStepDetails(step: TestStepReport): Paragraph[] {
        const paragraphs: Paragraph[] = [];
        const [schemeidx, useCaseidx, stepidx] = step.stepId.split('-');
        // 步骤标题
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `步骤${stepidx}: ${step.name}`,
                        bold: true,
                        size: 24
                    })
                ],
                spacing: {
                    before: 400,
                    after: 200
                }
            })
        );

        // 状态和端口信息
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: '状态: ', bold: true }),
                    new TextRun({
                        text: step.status,
                        color: step.status.toLowerCase() === 'pass' ? '008000' : 'FF0000'
                    }),
                    new TextRun({ text: '    ' }),
                    new TextRun({ text: '端口: ', bold: true }),
                    new TextRun({ text: step.port || 'N/A' })
                ],
                spacing: {
                    before: 200,
                    after: 200
                }
            })
        );

        // 执行时间
        if (step.time) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: '执行时间: ', bold: true }),
                        new TextRun({ text: step.time })
                    ],
                    spacing: {
                        before: 200,
                        after: 200
                    }
                })
            );
        }

        // 发送数据
        if (step.sendData) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '发送数据:',
                            bold: true,
                            break: 1
                        })
                    ],
                    spacing: {
                        before: 200
                    }
                })
            );

            if (step.port === 'mqtt') {
                paragraphs.push(...this.createJsonParagraph(step.sendData));
            } else {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: step.sendData,
                                font: 'Consolas',
                                size: 20
                            })
                        ],
                        spacing: {
                            before: 100,
                            after: 200
                        },
                        indent: {
                            left: 720
                        }
                    })
                );
            }
        }

        // 接收数据
        if (step.receiveData) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '接收数据:',
                            bold: true,
                            break: 1
                        })
                    ],
                    spacing: {
                        before: 200
                    }
                })
            );

            if (step.port === 'mqtt') {
                paragraphs.push(...this.createJsonParagraph(step.receiveData));
            } else {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: step.receiveData,
                                font: 'Consolas',
                                size: 20
                            })
                        ],
                        spacing: {
                            before: 100,
                            after: 200
                        },
                        indent: {
                            left: 720
                        }
                    })
                );
            }
        }

        // 预期数据
        if (step.expectedData) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '预期数据:',
                            bold: true,
                            break: 1
                        })
                    ],
                    spacing: {
                        before: 200
                    }
                })
            );

            if (step.port === 'mqtt') {
                paragraphs.push(...this.createJsonParagraph(step.expectedData));
            } else {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: step.expectedData,
                                font: 'Consolas',
                                size: 20
                            })
                        ],
                        spacing: {
                            before: 100,
                            after: 200
                        },
                        indent: {
                            left: 720
                        }
                    })
                );
            }
        }

        if (step.errmsg) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '错误信息:',
                            bold: true,
                            break: 1
                        })
                    ],
                    spacing: {
                        before: 200
                    }
                })
            );

            // if (step.port === 'mqtt') {
            //     paragraphs.push(...this.createJsonParagraph(step.errmsg || ''));
            // } else {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: step.errmsg || '',
                                font: 'Consolas',
                                size: 20
                            })
                        ],
                        spacing: {
                            before: 100,
                            after: 200
                        },
                        indent: {
                            left: 720
                        }
                    })
                );
            // }
        }
        // 添加分隔线
        paragraphs.push(this.createSeparatorLine());

        return paragraphs;
    }

    private createSeparatorLine(): Paragraph {
        // 使用较短的分隔线，约为页面宽度的80%
        return new Paragraph({
            children: [
                new TextRun({
                    text: '─'.repeat(60),  // 减少重复次数
                    color: 'CCCCCC'
                })
            ],
            spacing: {
                before: 400,
                after: 400
            },
            alignment: AlignmentType.CENTER  // 居中对齐
        });
    }

    private createUseCaseSection(useCase: TestUseCaseReport): Paragraph[] {
        const paragraphs: Paragraph[] = [];

        // 用例标题
        paragraphs.push(
            new Paragraph({
                text: `用例: ${useCase.name}`,
                heading: HeadingLevel.HEADING_3,
                spacing: {
                    before: 400,
                    after: 200
                }
            })
        );

        // 用例状态
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: '状态: ', bold: true }),
                    new TextRun({
                        text: useCase.status,
                        color: useCase.status.toLowerCase() === 'pass' ? '008000' : 'FF0000'
                    })
                ],
                spacing: {
                    before: 200,
                    after: 400
                }
            })
        );

        // 用例统计信息
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: '执行统计：', bold: true }),
                    new TextRun({ text: '\n通过步骤: ' }),
                    new TextRun({ text: useCase.passCount.toString() }),
                    new TextRun({ text: '\n失败步骤: ' }),
                    new TextRun({ text: useCase.failCount.toString() }),
                    new TextRun({ text: '\n成功率: ' }),
                    new TextRun({ text: `${useCase.successRate}%` })
                ],
                spacing: {
                    before: 200,
                    after: 400
                }
            })
        );

        // 测试步骤标题
        paragraphs.push(
            new Paragraph({
                text: '测试步骤详情',
                heading: HeadingLevel.HEADING_4,
                spacing: {
                    before: 400,
                    after: 400
                }
            })
        );

        // 添加每个测试步骤的详情
        useCase.steps.forEach(step => {
            paragraphs.push(...this.createTestStepDetails(step));
        });

        return paragraphs;
    }

    async generateReport(report: TestReport, extension: string): Promise<Buffer> {
        if (extension !== 'docx') {
            throw new Error('Unsupported file extension');
        }
        const doc = new Document({
            styles: {
                paragraphStyles: [
                    {
                        id: 'Heading1',
                        name: 'Heading 1',
                        basedOn: 'Normal',
                        next: 'Normal',
                        quickFormat: true,
                        run: {
                            size: 32,
                            bold: true,
                            color: '000000'
                        }
                    },
                    {
                        id: 'CodeBlock',
                        name: 'Code Block',
                        basedOn: 'Normal',
                        next: 'Normal',
                        quickFormat: true,
                        run: {
                            font: 'Consolas',
                            size: 20
                        },
                        paragraph: {
                            indent: {
                                left: 720
                            },
                            spacing: {
                                before: 200,
                                after: 200
                            }
                        }
                    }
                ]
            },
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: `测试报告: ${report.testPlanName}`,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({ text: '\n' }),
                    new Paragraph({
                        text: '1. 基本信息',
                        heading: HeadingLevel.HEADING_2
                    }),
                    this.createBasicInfoTable(report),
                    new Paragraph({ text: '\n' }),
                    new Paragraph({
                        text: '2. 测试总结',
                        heading: HeadingLevel.HEADING_2
                    }),
                    this.createSummaryTable(report.summary),
                    ...report.schemes.flatMap((scheme, schemeIndex) => [
                        new Paragraph({ text: '\n' }),
                        new Paragraph({
                            text: `${schemeIndex + 3}. 测试方案: ${scheme.name}`,
                            heading: HeadingLevel.HEADING_2
                        }),
                        this.createSchemeTable(scheme),
                        ...scheme.useCases.flatMap(useCase => this.createUseCaseSection(useCase))
                    ])
                ]
            }]
        });

        return await Packer.toBuffer(doc);
    }
}