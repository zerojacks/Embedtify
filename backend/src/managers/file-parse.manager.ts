import path from "path";
import { Content, DefaultConfig, Result, TestScheme, TestStep, TestUseCase } from "../models/test-scheme.model";
import { XMLParser } from 'fast-xml-parser';

export class FileParseManager {

    detectEncoding(uint8Array: Uint8Array): string {
        const xmlDeclaration = new TextDecoder('utf-8').decode(uint8Array.slice(0, 100));
        const match = xmlDeclaration.match(/encoding="(.+?)"/);
        return match ? match[1].toLowerCase() : 'utf-8';
    };

    async parseFile(filePath: string, index: number): Promise<TestScheme> {
        console.log("filePath", filePath);
        return new Promise((resolve, reject) => {
            const fileId = `${index}`;
            const fs = require('fs');

            fs.readFile(filePath, (err: NodeJS.ErrnoException | null, data: Buffer)  => {
                if (err) {
                    reject(err);
                    return;
                }

                const uint8Array = new Uint8Array(data);
                const encoding = this.detectEncoding(uint8Array);
                const decoder = new TextDecoder(encoding);
                const content = decoder.decode(uint8Array);

                const [usecases, defaultObj] = this.parseTSLFile(content, fileId);
                const scheme: TestScheme = {
                    id: fileId,
                    name: path.basename(filePath),
                    filepath: filePath,
                    usecases: usecases,
                    default: defaultObj || {
                        timeout: 0,
                        sloop: 0,
                        uloop: 0,
                        format: '',
                        type: '',
                        port: '',
                        relation: '',
                        check: ''
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'unknown'
                };
                resolve(scheme);
            });
        });
    }


    parseTSLFile(content: string, fileId: string): [TestUseCase[], DefaultConfig | undefined] {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });
        const xmlDoc = parser.parse(content);
        let defaultObj: DefaultConfig | undefined = undefined;
        const useCases: TestUseCase[] = [];
        const usecaseElements = Array.isArray(xmlDoc.scheme?.usecase) ? xmlDoc.scheme?.usecase : [xmlDoc.scheme?.usecase];
        const defaultElement = xmlDoc.scheme?.default || undefined;

        if(defaultElement) {
            const timeout = defaultElement.timeout || 0;
            const sloop = defaultElement.sloop || 0;
            const uloop = defaultElement.uloop || 0;
            const format = defaultElement.format || '';
            const type = defaultElement.type || '';
            const port = defaultElement.port || '';
            const check = defaultElement.check || '';
            const relation = defaultElement.relation || '';
            defaultObj = {
                timeout,
                sloop,
                uloop,
                format,
                type,
                port,
                relation,
                check
            };
        }

        usecaseElements.forEach((usecaseElement: any, i: number) => {
            const useCaseName = usecaseElement['@_name'] || `UseCase ${i + 1}`;
    
            const steps: TestStep[] = [];
            const stepElements = Array.isArray(usecaseElement.step) ? usecaseElement.step : [usecaseElement.step];
    
            stepElements.forEach((stepElement: any, j: number) => {
                const stepName = stepElement['@_name'] || `Step ${j + 1}`;
                const stepType = stepElement['@_type'] || undefined;
                const stepPort = stepElement['@_port'] || undefined;
                const stepId = stepElement['@_id'] || undefined;
                const stepDependencies = stepElement['@_dependencies'] || undefined;
                const stepDestination = stepElement['@_destination'] || undefined;
                const stepTimeout = stepElement['@_timeout'] || 0;
                const contentel = stepElement.content || '';
                const resultel = stepElement.result || '';
                let contentport: string | undefined = undefined;
                let contenttype: string | undefined = undefined;
                let content: string | undefined = contentel;
                if(contentel) { 
                    contentport = contentel['@_port'] || undefined;
                    contenttype = contentel['@_type'] || undefined;
                    content = contentel["#text"] || contentel;
                }

                let resultport: string | undefined = undefined;
                let resulttype: string | undefined = undefined;
                let result: string | undefined = resultel;
                if(resultel) {
                    resultport = resultel['@_port'] || undefined;
                    resulttype = resultel['@_type'] || undefined;
                    result = resultel["#text"] || resultel;
                }

                const contentObj: Content = {
                    type: contenttype || '',
                    port: contentport || '',
                    content: content || ''
                };
                const resultObj: Result = {
                    type: resulttype || '',
                    port: resultport || '',
                    result: result || ''
                };
                const dependencies = stepDependencies ? stepDependencies.split(',') : [];
                steps.push({
                    id: `${fileId}-${i}-${j}`,
                    stepid: stepId,
                    dependencies: dependencies,
                    name: stepName,
                    content: contentObj,
                    result: resultObj,
                    type: stepType,
                    port: stepPort,
                    destination: stepDestination,
                    selected: true,
                    timeout: stepTimeout,
                    status: "unknown"
                });
            });
    
            useCases.push({
                id: `${fileId}-${i}`,
                name: useCaseName,
                steps,
                selected: true,
                status: "unknown"
            });
        });
    
        return [useCases, defaultObj];
    }   
}
