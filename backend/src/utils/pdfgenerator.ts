import PDFDocument from 'pdfkit';
import path from 'path';
import { TestReport } from '../types/testreport';

export class PDFReportGenerator {
    private static readonly MARGIN = 50;
    private static readonly PAGE_WIDTH = 595.28;
    private static readonly PAGE_HEIGHT = 841.89;
    private static readonly CONTENT_WIDTH = 495;
    private static readonly DEFAULT_FONT_PATH = '../resources/fonts/SimSun.ttf';

    async generateFile(testReport: TestReport, extension: string): Promise<Buffer> {
        if (extension === 'pdf') {
            return this.generatePdf(testReport);
        }
        throw new Error('Unsupported file extension');
    }

    private generatePdf(testReport: TestReport): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: PDFReportGenerator.MARGIN,
                bufferPages: true
            });

            const buffers: Uint8Array[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            // 加载字体
            const fontPath = path.resolve(__dirname, '../resources/fonts/SimSun.ttf');
            doc.font(fontPath);
            try {
                this.generateCoverPage(doc, testReport);
                this.generateSummaryPage(doc, testReport);
                this.generateDetailPages(doc, testReport);
                this.updateAllPageNumbers(doc);
                doc.end();
                return doc;
            } catch (error) {
                reject(error);
            }
        });
    }
    private updateAllPageNumbers(doc: PDFKit.PDFDocument): void {
        // 遍历所有页面并更新页码
        const fontPath = path.resolve(__dirname, PDFReportGenerator.DEFAULT_FONT_PATH);
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);

            // 保存当前绘图状态
            doc.save();

            // 添加页码
            doc.font(fontPath)
                .fontSize(10)
                .fillColor('#666')
                .text(
                    `第 ${i + 1} 页，共 ${range.count} 页`,
                    0,
                    PDFReportGenerator.PAGE_HEIGHT - 2 * PDFReportGenerator.MARGIN,
                    { align: 'center' }
                );

            // 恢复之前的绘图状态
            doc.restore();
        }
    }

    private generateCoverPage(doc: PDFKit.PDFDocument, testReport: TestReport): void {
        // 添加公司Logo
        // doc.image('path/to/logo.png', this.MARGIN, 50, { width: 150 });

        // 报告标题
        doc.fontSize(28)
            .fillColor('#2c3e50')
            .text('测试报告', 0, 200, { align: 'center' });

        doc.fontSize(16)
            .fillColor('#34495e')
            .text(`测试方案: ${testReport.testPlanName}`, 0, 250, { align: 'center' });

        // 报告基本信息表格
        const startY = 350;
        this.drawInfoTable(doc, startY, [
            { label: '报告编号', value: testReport.id || '自动生成' },
            { label: '执行日期', value: testReport.executionDate },
            { label: '测试环境', value: testReport.environment || '生产环境' },
            { label: '执行人员', value: testReport.executor || '系统执行' }
        ]);

        doc.addPage();
    }

    private generateSummaryPage(doc: PDFKit.PDFDocument, testReport: TestReport): void {
        // 概述标题
        doc.fontSize(20)
            .fillColor('#2c3e50')
            .text('测试概述', PDFReportGenerator.MARGIN, 50);

        // 统计数据
        const summary = testReport.summary;
        const successRate = (summary.successRate * 100).toFixed(2);

        // 绘制统计图表
        this.drawPieChart(doc, 250, {
            passed: summary.passedSteps,
            failed: summary.failedSteps
        });

        // 统计表格
        this.drawStatsTable(doc, 400, [
            { label: '总用例数', value: summary.totalUseCases },
            { label: '总步骤数', value: summary.totalSteps },
            { label: '通过步骤数', value: summary.passedSteps },
            { label: '失败步骤数', value: summary.failedSteps },
            { label: '成功率', value: `${successRate}%` }
        ]);

        doc.addPage();
    }

    private generateDetailPages(doc: PDFKit.PDFDocument, testReport: TestReport): void {
        testReport.schemes.forEach((scheme, schemeIndex) => {
            // 方案标题
            doc.fontSize(18)
                .fillColor('#2c3e50')
                .text(`测试方案 ${schemeIndex + 1}: ${scheme.name}`, PDFReportGenerator.MARGIN, 50);

            let yOffset = 100;

            scheme.useCases.forEach((useCase, useCaseIndex) => {
                // 检查是否需要新页
                if (yOffset > 700) {
                    doc.addPage();
                    yOffset = 50;
                }

                // 用例标题
                doc.fontSize(14)
                    .fillColor('#34495e')
                    .text(`用例 ${useCaseIndex + 1}: ${useCase.name}`, PDFReportGenerator.MARGIN + 20, yOffset);

                yOffset += 30;

                useCase.steps.forEach((step, stepIndex) => {
                    // 检查是否需要新页
                    if (yOffset > 700) {
                        doc.addPage();
                        yOffset = 50;
                    }

                    // 步骤框
                    this.drawStepBox(doc, yOffset, step, stepIndex);

                    // 计算下一步骤的位置
                    let sendDataStr = step.sendData;
                    let receiveDataStr = step.receiveData;
                    if(step.port==="mqtt") {
                        const sendData = JSON.parse(step.sendData || '{}');
                        const receiveData = JSON.parse(step.receiveData || '{}');
                        sendDataStr = JSON.stringify(sendData, null, 2);
                        receiveDataStr = JSON.stringify(receiveData, null, 2);
                    }
            
                    const dataHeight = this.calculateDataHeight(doc, sendDataStr, receiveDataStr);
                    yOffset += dataHeight + 40;
                });
            });

            doc.addPage();
        });
    }

    private drawStepBox(doc: PDFKit.PDFDocument, y: number, step: any, index: number): number {
        let sendDataStr = step.sendData;
        let receiveDataStr = step.receiveData;
        console.log("step", step);
        if(step.port==="mqtt") {
            const sendData = JSON.parse(step.sendData || '{}');
            const receiveData = JSON.parse(step.receiveData || '{}');
            // 格式化数据
            sendDataStr = JSON.stringify(sendData, null, 2);
            receiveDataStr = JSON.stringify(receiveData, null, 2);
        }
    
    
        // 预先计算文本高度
        const sendDataHeight = doc.heightOfString(sendDataStr, {
            width: PDFReportGenerator.CONTENT_WIDTH - 40,
            align: 'left'
        });
        const receiveDataHeight = doc.heightOfString(receiveDataStr, {
            width: PDFReportGenerator.CONTENT_WIDTH - 40,
            align: 'left'
        });
    
        // 优化间距：标题(25) + 发送标签(15) + 发送数据 + 间距(8) + 接收标签(15) + 接收数据 + 时间高度(15) + 边距(10)
        const boxHeight = 25 + 15 + sendDataHeight + 8 + 15 + receiveDataHeight + 15 + 10;
    
        // 步骤框背景
        doc.rect(PDFReportGenerator.MARGIN, y, PDFReportGenerator.CONTENT_WIDTH, boxHeight)
            .fill('#f8f9fa');
    
        // 当前垂直位置
        let currentY = y;
    
        // 步骤标题
        currentY += 8; // 减少顶部边距
        doc.fontSize(12)
            .fillColor('#2c3e50')
            .text(`步骤 ${index + 1}: ${step.name}`, PDFReportGenerator.MARGIN + 10, currentY);
    
        // 发送数据
        currentY += 25; // 减少标题后的间距
        doc.fontSize(10)
            .fillColor('#34495e')
            .text('发送数据:', PDFReportGenerator.MARGIN + 10, currentY);
        
        currentY += 15; // 减少标签和数据之间的间距
        doc.font('Courier')
            .text(sendDataStr, PDFReportGenerator.MARGIN + 20, currentY, {
                width: PDFReportGenerator.CONTENT_WIDTH - 40,
                align: 'left'
            });
    
        // 接收数据
        currentY += sendDataHeight + 8; // 减少数据块之间的间距
        doc.font(path.resolve(__dirname, '../resources/fonts/SimSun.ttf'))
            .text('接收数据:', PDFReportGenerator.MARGIN + 10, currentY);
        
        currentY += 15; // 保持一致的标签和数据间距
        doc.font('Courier')
            .text(receiveDataStr, PDFReportGenerator.MARGIN + 20, currentY, {
                width: PDFReportGenerator.CONTENT_WIDTH - 40,
                align: 'left'
            });
    
        // 时间
        currentY += receiveDataHeight + 5; // 减少底部时间的间距
        doc.font(path.resolve(__dirname, '../resources/fonts/SimSun.ttf'))
            .fontSize(10)
            .fillColor('#34495e')
            .text(`时间: ${step.time}`, PDFReportGenerator.MARGIN + 10, currentY);
    
        // 状态标识 - 固定在右上角
        const statusColor = step.status === 'success' ? '#28a745' : '#dc3545';
        const statusText = step.status === 'success' ? '成功' : '失败';
        doc.rect(PDFReportGenerator.PAGE_WIDTH - 100, y + 8, 40, 20) // 调整状态标识的位置
            .fill(statusColor);
        doc.font(path.resolve(__dirname, '../resources/fonts/SimSun.ttf'))
            .fontSize(10)
            .fillColor('white')
            .text(statusText, PDFReportGenerator.PAGE_WIDTH - 95, y + 13);
        
        return boxHeight;
    }

    private drawPieChart(doc: PDFKit.PDFDocument, y: number, data: { passed: number; failed: number }): void {
        const centerX = PDFReportGenerator.PAGE_WIDTH / 2;
        const radius = 80;
        const total = data.passed + data.failed;
        const passedAngle = (data.passed / total) * Math.PI * 2;

        // 成功部分
        doc.circle(centerX, y, radius)
            .fill('#28a745');

        // 失败部分
        if (data.failed > 0) {
            const endX = centerX + radius * Math.cos(passedAngle);
            const endY = y + radius * Math.sin(passedAngle);

            doc.path(`M ${centerX} ${y}
                    A ${radius} ${radius} 0 0 0 ${endX} ${endY}
                    L ${centerX} ${y}`)
                .fill('#dc3545');
        }

        // 图例
        doc.fontSize(10)
            .fillColor('#28a745')
            .text('通过', centerX + radius + 20, y - 20)
            .fillColor('#dc3545')
            .text('失败', centerX + radius + 20, y);
    }

    private drawInfoTable(doc: PDFKit.PDFDocument, y: number, data: Array<{ label: string; value: string }>): void {
        const rowHeight = 30;
        const colWidth = PDFReportGenerator.CONTENT_WIDTH / 2;

        data.forEach((item, index) => {
            const currentY = y + index * rowHeight;

            // 背景色交替
            if (index % 2 === 0) {
                doc.rect(PDFReportGenerator.MARGIN, currentY, PDFReportGenerator.CONTENT_WIDTH, rowHeight)
                    .fill('#f8f9fa');
            }

            // 标签
            doc.fontSize(12)
                .fillColor('#2c3e50')
                .text(item.label, PDFReportGenerator.MARGIN + 10, currentY + 8);

            // 值
            doc.fontSize(12)
                .fillColor('#34495e')
                .text(item.value, PDFReportGenerator.MARGIN + colWidth, currentY + 8);
        });
    }

    private drawStatsTable(doc: PDFKit.PDFDocument, y: number, data: Array<{ label: string; value: any }>): void {
        const rowHeight = 30;
        const colWidth = PDFReportGenerator.CONTENT_WIDTH / 2;

        data.forEach((item, index) => {
            const currentY = y + index * rowHeight;

            // 背景色交替
            if (index % 2 === 0) {
                doc.rect(PDFReportGenerator.MARGIN, currentY, PDFReportGenerator.CONTENT_WIDTH, rowHeight)
                    .fill('#f8f9fa');
            }

            // 标签
            doc.fontSize(12)
                .fillColor('#2c3e50')
                .text(item.label, PDFReportGenerator.MARGIN + 10, currentY + 8);

            // 值
            doc.fontSize(12)
                .fillColor('#34495e')
                .text(String(item.value), PDFReportGenerator.MARGIN + colWidth, currentY + 8);
        });
    }

    private calculateDataHeight(doc: PDFKit.PDFDocument, sendDataStr: any, receiveDataStr: any): number {
        return doc.heightOfString(sendDataStr, { width: 460 }) +
            doc.heightOfString(receiveDataStr, { width: 460 }) + 60;
    }

    private addPageNumbers(doc: PDFKit.PDFDocument): void {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);

            // 页脚
            doc.fontSize(10)
                .fillColor('#666')
                .text(
                    `第 ${i + 1} 页，共 ${pages.count} 页`,
                    0,
                    doc.page.height - 30,
                    { align: 'center' }
                );
        }
    }
}