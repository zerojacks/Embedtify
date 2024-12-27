import { Injectable } from '@nestjs/common';
import { TestReport, TestSchemeReport, TestStepReport, TestUseCaseReport } from '../types/testreport';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NewPDFGenerator {
    private static readonly DEFAULT_FONT_PATH = '../resources/fonts/SimSun.ttf';
    constructor() {

    }

    async generateReport(report: TestReport, extension: string): Promise<Buffer> {
        if (extension !== 'pdf') {
            throw new Error('Unsupported file extension');
        }
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            const doc = new PDFDocument({
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                },
                size: 'A4'
            });

            // 收集生成的数据块
            doc.on('data', chunks.push.bind(chunks));
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

            // 设置中文字体
            const fontPath = path.resolve(__dirname, NewPDFGenerator.DEFAULT_FONT_PATH);
            doc.registerFont('SimSun', fontPath);  // 需要提供字体文件
            doc.font('SimSun');

            // 生成报告标题
            doc.fontSize(24)
                .text(`测试报告: ${report.testPlanName}`, {
                    align: 'center'
                })
                .moveDown(2);

            // 基本信息
            doc.fontSize(18)
                .text('1. 基本信息')
                .moveDown(1);

            doc.fontSize(12);
            this.addBasicInfo(doc, report);
            doc.moveDown(2);

            // 测试总结
            doc.fontSize(18)
                .text('2. 测试总结', 50, doc.y)
                .moveDown(1);

            doc.fontSize(12);
            this.addSummary(doc, report.summary);
            doc.moveDown(2);

            // 测试方案
            report.schemes.forEach((scheme, index) => {
                doc.fontSize(18)
                    .text(`${index + 3}. 测试方案: ${scheme.name}`, 50, doc.y)
                    .moveDown(1);

                doc.fontSize(12);
                this.addSchemeInfo(doc, scheme);
                doc.moveDown(1);

                // 用例详情
                scheme.useCases.forEach((useCase, useCaseIndex) => {
                    this.addUseCaseDetails(doc, useCase, index + 3, useCaseIndex + 1);
                });
            });

            doc.end();
        });
    }

    private addSchemeInfo(doc: PDFKit.PDFDocument, scheme: TestSchemeReport): void {
        // 创建方案统计信息表格
        const tableData = [
            ['通过数:', scheme.passCount.toString(), '失败数:', scheme.failCount.toString()],
            ['总数:', scheme.totalCount.toString(), '成功率:', `${scheme.successRate}%`]
        ];
    
        this.createTable(doc, tableData, 4);
    
        // 在表格后添加一些空间
        doc.moveDown(1);
    
        // 如果成功率低于某个阈值（例如80%），可以添加警告信息
        if (scheme.successRate < 80) {
            doc.fillColor('red')
                .text('注意：该测试方案的成功率低于80%，请关注失败用例。')
                .fillColor('black')  // 恢复默认颜色
                .moveDown(1);
        }
    
        // 添加用例统计汇总
        doc.text(`该方案包含 ${scheme.useCases.length} 个测试用例：`, 
            100,
            doc.y,
            {
                continued: false
            });
    
        // 计算用例状态统计
        const passedUseCases = scheme.useCases.filter(uc => uc.status.toLowerCase() === 'pass').length;
        const failedUseCases = scheme.useCases.length - passedUseCases;
    
        const useCaseStats = [
            `通过用例数: ${passedUseCases}`,
            `失败用例数: ${failedUseCases}`,
            `用例通过率: ${((passedUseCases / scheme.useCases.length) * 100).toFixed(2)}%`
        ];
    
        doc.moveDown(0.5);
        useCaseStats.forEach(stat => {
            doc.text(stat);
        });
    
        // 添加分隔线
        doc.moveDown(1)
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .strokeColor('#CCCCCC')
            .stroke()
            .moveDown(1);
    }
    
    // 可选：添加一个辅助方法来添加统计信息
    private addStatistics(doc: PDFKit.PDFDocument, label: string, value: string | number): void {
        doc.text(`${label}: ${value}`, {
            continued: false
        });
    }
    private addBasicInfo(doc: PDFKit.PDFDocument, report: TestReport): void {
        const tableData = [
            ['测试计划ID:', report.testPlanId, '执行日期:', report.executionDate],
            ['执行环境:', report.environment, '执行人:', report.executor],
            ['执行时长:', report.duration, '', '']
        ];

        this.createTable(doc, tableData, 4);
    }

    private addSummary(doc: PDFKit.PDFDocument, summary: TestReport['summary']): void {
        const tableData = [
            ['总用例数:', summary.totalUseCases.toString(), '总步骤数:', summary.totalSteps.toString()],
            ['通过步骤数:', summary.passedSteps.toString(), '失败步骤数:', summary.failedSteps.toString()],
            ['成功率:', `${summary.successRate}%`, '', '']
        ];

        this.createTable(doc, tableData, 4);
    }

    private createTable(doc: PDFKit.PDFDocument, data: string[][], columns: number): void {
        const pageWidth = doc.page.width - 100;  // 留出边距
        const columnWidth = pageWidth / columns;
        const rowHeight = 25;

        data.forEach((row, rowIndex) => {
            const height = doc.y + (rowIndex * rowHeight);
            row.forEach((cell, cellIndex) => {
                doc.text(
                    cell,
                    30 + (cellIndex * columnWidth),
                    height,
                    {
                        width: columnWidth,
                        align: cellIndex % 2 === 0 ? 'right' : 'left'
                    }
                );
            });
        });

        doc.moveDown(data.length);
    }

    private formatJson(jsonString: string): string {
        try {
            let dataToFormat = jsonString;
            if (typeof jsonString === 'string' && jsonString.trim().startsWith('"')) {
                dataToFormat = JSON.parse(jsonString);
            }
            const parsedData = JSON.parse(dataToFormat);
            return JSON.stringify(parsedData, null, 2);
        } catch {
            return jsonString;
        }
    }

    private addStepDetails(doc: PDFKit.PDFDocument, step: TestStepReport): void {
        // 步骤标题
        doc.fontSize(14)
            .text(`步骤 ${step.stepId}: ${step.name}`, 50, doc.y)
            .moveDown(0.5);

        // 状态和端口
        doc.fontSize(12)
            .text(`状态: ${step.status}    端口: ${step.port || 'N/A'}`, 100, doc.y)
            .moveDown(0.5);

        if (step.time) {
            doc.text(`执行时间: ${step.time}`, 100, doc.y).moveDown(0.5);
        }

        // 发送数据
        if (step.sendData) {
            doc.text('发送数据:', 100, doc.y).moveDown(0.5);
            if (step.port === 'mqtt') {
                doc.font('Courier')
                    .text(this.formatJson(step.sendData), {
                        indent: 20,
                        align: 'left'
                    })
                    .font('SimSun');
            } else {
                doc.text(step.sendData, {
                    indent: 20
                });
            }
            doc.moveDown(0.5);
        }

        // 接收数据
        if (step.receiveData) {
            doc.text('接收数据:', 100, doc.y).moveDown(0.5);
            if (step.port === 'mqtt') {
                doc.font('Courier')
                    .text(this.formatJson(step.receiveData), {
                        indent: 20,
                        align: 'left'
                    })
                    .font('SimSun');
            } else {
                doc.text(step.receiveData, {
                    indent: 20
                });
            }
            doc.moveDown(0.5);
        }

        // 分隔线
        doc.moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .strokeColor('#CCCCCC')
            .stroke()
            .moveDown(1);
    }

    private addUseCaseDetails(
        doc: PDFKit.PDFDocument,
        useCase: TestUseCaseReport,
        schemeIndex: number,
        useCaseIndex: number
    ): void {
        // 添加分页检查
        if (doc.y > doc.page.height - 200) {
            doc.addPage();
        }

        doc.fontSize(16)
            .text(`${schemeIndex}.${useCaseIndex} 用例: ${useCase.name}`, 50, doc.y)
            .moveDown(0.5);

        doc.fontSize(12)
            .text(`状态: ${useCase.status}`)
            .moveDown(0.5);

        // 用例统计
        doc.text([
            `通过步骤: ${useCase.passCount}`,
            `失败步骤: ${useCase.failCount}`,
            `成功率: ${useCase.successRate}%`
        ].join('\n'))
        .moveDown(1);

        doc.fontSize(14)
            .text('测试步骤详情')
            .moveDown(1);

        // 添加每个测试步骤
        useCase.steps.forEach(step => {
            // 检查是否需要新页
            if (doc.y > doc.page.height - 300) {
                doc.addPage();
            }
            this.addStepDetails(doc, step);
        });
    }
}
